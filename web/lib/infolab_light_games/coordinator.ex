defmodule Coordinator do
  use GenServer

  @type via_tuple() :: {:via, atom(), {atom(), String.t()}}

  defmodule State do
    use TypedStruct

    typedstruct enforce: true do
      field :current_idle_animation, Coordinator.via_tuple() | none()
      field :current_game, Coordinator.via_tuple() | none()
      field :queue, Qex.t(Coordinator.via_tuple())
    end
  end

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, %State{current_idle_animation: nil,
                                            current_game: nil,
                                            queue: Qex.new()}, name: __MODULE__)
  end

  @impl true
  def init(state) do
    {:ok, state, {:continue, :tick}}
  end

  @impl true
  def handle_cast({:terminate, id}, state) do
    GenServer.stop(via_tuple(id))

    state = handle_terminated_game(id, state)

    {:noreply, state}
  end

  @impl true
  def handle_cast(:terminate_idle_animation, state) do
    GenServer.stop(via_tuple("idle_anim"))

    {:noreply, state}
  end

  def handle_cast({:terminated, id}, state) do
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
  def handle_cast({:terminated_idle_animation, _id}, state) do
    state = %State{state | current_idle_animation: nil}

    {:noreply, state, {:continue, :tick}}
  end

  @impl true
  def handle_cast({:route_input, player, input}, state) do
    if state.current_game do
      GenServer.cast(state.current_game, {:handle_input, player, input})
    end

    {:noreply, state}
  end

  @impl true
  def handle_call({:queue_game, game, initial_player}, _from, state) do
    id =
      ?a..?z
      |> Enum.take_random(6)
      |> List.to_string()

    {:ok, _pid} =
      DynamicSupervisor.start_child(GameManager, {game, game_id: id, name: via_tuple(id)})

    :ok = GenServer.call(via_tuple(id), {:add_player, initial_player})

    state = update_in(state.queue, &Qex.push(&1, via_tuple(id)))

    {:reply, id, state, {:continue, :tick}}
  end

  @impl true
  def handle_call({:join_game, id, player}, _from, state) do
    :ok = GenServer.call(via_tuple(id), {:add_player, player})

    {:reply, id, state, {:continue, :tick}}
  end

  @impl true
  def handle_call({:leave_game, id, player}, _from, state) do
    :ok = GenServer.call(via_tuple(id), {:remove_player, player})

    {:reply, id, state, {:continue, :tick}}
  end

  @impl true
  def handle_call(:get_status, _from, state) do
    {:reply, get_status(state), state}
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
      if state.current_idle_animation,
        do: GenServer.cast(state.current_idle_animation, :terminate),
        else: GenServer.call(state.current_game, :start_if_ready)
    end

    push_status(state)

    {:noreply, state}
  end

  defp maybe_start_idle_animation(state) do
    if is_nil(state.current_idle_animation) do
      if GenServer.whereis(via_tuple("idle_anim")) do
        # saw this once
        GenServer.stop(via_tuple("idle_anim"))
      end

      animation = Enum.random([IdleAnimations.GOL, IdleAnimations.Ant, IdleAnimations.Ant])

      {:ok, _pid} =
        DynamicSupervisor.start_child(GameManager, {animation, game_id: "idle_anim", name: via_tuple("idle_anim")})

      %State{state | current_idle_animation: via_tuple("idle_anim")}
    else
      state
    end
  end

  defp is_game_ready?(game) do
    GenServer.call(game, :get_status).ready
  end

  defp remove_first_ready(queue) do
    case Enum.find_index(queue, &is_game_ready?/1) do
      nil -> {:empty, queue}
      idx ->
        s = Enum.take(queue, idx)
        [e | t] = Enum.drop(queue, idx)
        {{:value, e}, Qex.join(Qex.new(s), Qex.new(t))}
    end
  end

  defp push_status(state) do
    Phoenix.PubSub.broadcast!(
      InfolabLightGames.PubSub,
      "coordinator:status",
      {:coordinator_update, get_status(state)}
    )
  end

  defp get_status(state) do
    current =
      if state.current_game,
        do: GenServer.call(state.current_game, :get_status)

    queue = Enum.map(state.queue, &GenServer.call(&1, :get_status))

    %CoordinatorStatus{current_game: current, queue: queue}
  end

  defp handle_terminated_game(id, state) do
      if state.current_game == via_tuple(id) do
        %State{state | current_game: nil}
      else
        %State{state | queue: Qex.new(Enum.filter(state.queue, fn x -> x != via_tuple(id) end))}
      end
  end

  defp via_tuple(id) do
    {:via, Registry, {GameRegistry, id}}
  end

  def terminate_game(id) do
    GenServer.cast(__MODULE__, {:terminate, id})
  end

  def terminate_idle_animation() do
    GenServer.cast(__MODULE__, :terminate_idle_animation)
  end

  def notify_game_terminated(id) do
    GenServer.cast(__MODULE__, {:terminated, id})
  end

  def notify_idle_animation_terminated(id) do
    GenServer.cast(__MODULE__, {:terminated_idle_animation, id})
  end

  def route_input(player, input) do
    GenServer.cast(__MODULE__, {:route_input, player, input})
  end

  def queue_game(game, initial_player) do
    GenServer.call(__MODULE__, {:queue_game, game, initial_player})
  end

  def join_game(id, player) do
    GenServer.call(__MODULE__, {:join_game, id, player})
  end

  def leave_game(id, player) do
    GenServer.call(__MODULE__, {:leave_game, id, player})
  end

  def status do
    GenServer.call(__MODULE__, :get_status)
  end
end
