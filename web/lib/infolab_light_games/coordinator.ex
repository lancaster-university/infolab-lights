defmodule Coordinator do
  use GenServer, restart: :transient
  require Logger

  @type via_tuple() :: {:via, atom(), {atom(), String.t()}}

  defmodule State do
    use TypedStruct

    typedstruct enforce: true do
      field(:current_idle_animation, Coordinator.via_tuple() | none())
      field(:queued_idle_animation, {module(), any(), binary()} | none())
      field(:current_game, Coordinator.via_tuple() | none())
      field(:queue, Qex.t(Coordinator.via_tuple()))
    end
  end

  def start_link(_opts) do
    GenServer.start_link(
      __MODULE__,
      %State{
        current_idle_animation: nil,
        queued_idle_animation: nil,
        current_game: nil,
        queue: Qex.new()
      },
      name: __MODULE__
    )
  end

  @impl true
  def init(state) do
    {:ok, state, {:continue, :tick}}
  end

  @impl true
  def handle_info({:force_kill_game, id}, %State{} = state) do
    try_stop(via_tuple(id))

    {:noreply, handle_terminated_game(id, state)}
  end

  @impl true
  def handle_info({:force_kill_idle_animation, pid}, %State{} = state) do
    try_stop(pid)

    {:noreply, state}
  end

  @impl true
  def handle_cast({:idle_animation_terminated, id}, %State{} = state) do
    state =
      if state.current_idle_animation == via_tuple(id) do
        %State{state | current_idle_animation: nil}
      else
        state
      end

    {:noreply, state, {:continue, :tick}}
  end

  @impl true
  def handle_cast({:game_terminated, id}, %State{} = state) do
    state = handle_terminated_game(id, state)

    Phoenix.PubSub.broadcast!(
      InfolabLightGames.PubSub,
      "coordinator:status",
      {:game_terminated, id}
    )

    push_status(state)

    {:noreply, state, {:continue, :tick}}
  end

  @impl true
  def handle_cast({:terminate, id}, state) do
    try do
      pid = via_tuple(id)
      GenServer.cast(pid, :terminate)

      Process.send_after(self(), {:force_kill_game, id}, 5_000)
    catch
      _ -> :ok
    end

    {:noreply, state}
  end

  @impl true
  def handle_cast(:terminate_idle_animation, %State{} = state) do
    if !is_nil(state.current_idle_animation) do
      try do
        pid = state.current_idle_animation
        GenServer.cast(pid, :terminate)

        Process.send_after(self(), {:force_kill_idle_animation, pid}, 5_000)
      catch
        _ -> :ok
      end
    end

    {:noreply, state}
  end

  @impl true
  def handle_cast({:route_input, player, input}, state) do
    if state.current_game do
      GenServer.cast(state.current_game, {:handle_input, player, input})
    end

    {:noreply, state}
  end

  @impl true
  def handle_call({:queue_game, game, initial_player, meta}, _from, state) do
    id = random_id()

    opts = meta ++ [game_id: id, name: via_tuple(id)]

    {:ok, pid} = DynamicSupervisor.start_child(GameManager, {game, opts})

    Task.start_link(fn ->
      ref = Process.monitor(pid)

      receive do
        {:DOWN, ^ref, :process, ^pid, _reason} ->
          GenServer.cast(__MODULE__, {:game_terminated, id})
      end
    end)

    :ok = GenServer.call(via_tuple(id), {:add_player, initial_player})

    state = update_in(state.queue, &Qex.push(&1, via_tuple(id)))

    {:reply, id, state, {:continue, :tick}}
  end

  @impl true
  def handle_call(
        {:queue_idle_animation, module, mode, name},
        _from,
        %State{queued_idle_animation: nil} = state
      ) do
    state = %State{state | queued_idle_animation: {module, mode, name}}

    {:reply, :ok, state, {:continue, :tick}}
  end

  @impl true
  def handle_call(
        {:queue_idle_animation, _module, _mode, _name},
        _from,
        state
      ) do
    {:reply, {:error, :queue_full}, state}
  end

  @impl true
  def handle_call({:join_game, id, player}, _from, state) do
    try do
      :ok = GenServer.call(via_tuple(id), {:add_player, player})
    catch
      :exit, e -> Logger.warning("Couldn't join_game: #{inspect(e)}")
    end

    {:reply, id, state, {:continue, :tick}}
  end

  @impl true
  def handle_call({:leave_game, id, player}, _from, state) do
    try do
      :ok = GenServer.call(via_tuple(id), {:remove_player, player})
    catch
      :exit, e -> Logger.warning("Couldn't leave_game: #{inspect(e)}")
    end

    {:reply, id, state, {:continue, :tick}}
  end

  @impl true
  def handle_call(:get_status, _from, state) do
    {:reply, get_status(state), state}
  end

  @impl true
  def handle_call({:push_idle_animation, module, mode}, _from, state) do
    if is_nil(state.current_game) do
      {state, pid} = start_idle_animation(state, module, mode)

      {:reply, {:ok, pid}, state, {:continue, :tick}}
    else
      {:reply, {:error, :active_game}, state}
    end
  end

  @impl true
  def handle_continue(:tick, state) do
    # if there's no active game, we can try to ready one
    state =
      if is_nil(state.current_game) do
        case remove_first_ready(state.queue) do
          {{:value, game}, q} ->
            %State{state | current_game: game, queue: q}

          {:empty, q} ->
            # if there's no idle animation, and no current game: start an idle animation
            %State{state | queue: q}
            |> maybe_start_idle_animation()
        end
      else
        state
      end

    if state.current_game do
      # if there's a current game ready and an idle anim, tell the idle anim to
      # stop, otherwise if there's no idle animation we can start the game
      if state.current_idle_animation do
        Logger.info("Requesting idle animation quits")
        terminate_idle_animation()
      else
        GenServer.call(state.current_game, :start_if_ready)
      end
    end

    push_status(state)

    {:noreply, state}
  end

  defp modes_for_modules(modules) do
    modules
    |> Enum.flat_map(fn mod ->
      Enum.map(apply(mod, :possible_modes, []), &{mod, &1})
    end)
  end

  defp start_idle_animation(%State{} = state, module, mode) do
    Logger.info("Starting idle animation #{module}:#{inspect(mode)}")
    # stop the idle animation if it exists
    if !is_nil(state.current_idle_animation) do
      # we need the idle animation to stop immediately so it doesn't try to draw over us
      try_stop(state.current_idle_animation)
    end

    id = random_id()

    {:ok, pid} =
      DynamicSupervisor.start_child(
        GameManager,
        {module, game_id: id, name: via_tuple(id), mode: mode}
      )

    Task.start_link(fn ->
      ref = Process.monitor(pid)

      receive do
        {:DOWN, ^ref, :process, ^pid, _reason} ->
          GenServer.cast(__MODULE__, {:idle_animation_terminated, id})
      end
    end)

    {%State{state | current_idle_animation: via_tuple(id)}, pid}
  end

  defp maybe_start_idle_animation(state) do
    if is_nil(state.current_idle_animation) do
      {state, module, mode} =
        case state.queued_idle_animation do
          {module, mode, _} ->
            state = %State{state | queued_idle_animation: nil}
            {state, module, mode}

          _ ->
            {module, {mode, _}} =
              modes_for_modules([IdleAnimations.Ant, IdleAnimations.GOL, IdleAnimations.JSImpl])
              |> Enum.random()

            {state, module, mode}
        end

      {state, _pid} = start_idle_animation(state, module, mode)
      state
    else
      state
    end
  end

  defp is_game_ready?(game) do
    GenServer.call(game, :get_status).ready
  end

  defp remove_first_ready(queue) do
    case Enum.find_index(queue, &is_game_ready?/1) do
      nil ->
        {:empty, queue}

      idx ->
        s = Enum.take(queue, idx)
        [e | t] = Enum.drop(queue, idx)
        {{:value, e}, Qex.join(Qex.new(s), Qex.new(t))}
    end
  end

  defp push_status(%State{} = state) do
    Phoenix.PubSub.broadcast!(
      InfolabLightGames.PubSub,
      "coordinator:status",
      {:coordinator_update, get_status(state)}
    )
  end

  defp get_status(%State{} = state) do
    current =
      if state.current_game,
        do: GenServer.call(state.current_game, :get_status)

    queue = Enum.map(state.queue, &GenServer.call(&1, :get_status))

    %CoordinatorStatus{
      current_game: current,
      queue: queue,
      queued_idle_animation: state.queued_idle_animation
    }
  end

  defp handle_terminated_game(id, state) do
    if state.current_game == via_tuple(id) do
      %State{state | current_game: nil}
    else
      %State{state | queue: Qex.new(Enum.filter(state.queue, fn x -> x != via_tuple(id) end))}
    end
  end

  defp random_id() do
    ?a..?z
    |> Enum.take_random(6)
    |> List.to_string()
  end

  defp via_tuple(id) do
    {:via, Registry, {GameRegistry, id}}
  end

  defp try_stop(pid) do
    if GenServer.whereis(pid) do
      GenServer.stop(pid)
    end
  end

  def terminate_game(id) do
    Logger.info("terminating game #{id}")
    GenServer.cast(__MODULE__, {:terminate, id})
  end

  def terminate_idle_animation() do
    GenServer.cast(__MODULE__, :terminate_idle_animation)
  end

  def route_input(player, input) do
    GenServer.cast(__MODULE__, {:route_input, player, input})
  end

  def queue_game(game, initial_player) do
    Logger.info("#{inspect(initial_player)} initializing game #{game}")
    GenServer.call(__MODULE__, {:queue_game, game, initial_player, []})
  end

  def queue_game(game, initial_player, meta) do
    Logger.info("#{inspect(initial_player)} initializing game #{game}")
    GenServer.call(__MODULE__, {:queue_game, game, initial_player, meta})
  end

  def queue_idle_animation(module, mode, name) do
    GenServer.call(__MODULE__, {:queue_idle_animation, module, mode, name})
  end

  def join_game(id, player) do
    Logger.info("#{inspect(player)} joining game #{id}")
    GenServer.call(__MODULE__, {:join_game, id, player})
  end

  def leave_game(id, player) do
    Logger.info("#{inspect(player)} leaving game #{id}")
    GenServer.call(__MODULE__, {:leave_game, id, player})
  end

  def status do
    GenServer.call(__MODULE__, :get_status)
  end

  def possible_idle_animations do
    modes_for_modules([IdleAnimations.Ant, IdleAnimations.GOL, IdleAnimations.JSImpl])
    |> Enum.map(fn {_, {_, name}} -> name end)
  end

  def idle_animation_for_name(name) do
    modes_for_modules([IdleAnimations.Ant, IdleAnimations.GOL, IdleAnimations.JSImpl])
    |> Enum.find(fn {_, {_, n}} -> name == n end)
  end

  def push_idle_animation(module, mode) do
    GenServer.call(__MODULE__, {:push_idle_animation, module, mode})
  end
end
