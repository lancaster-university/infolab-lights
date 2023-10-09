defmodule Games.Static do
  require OK
  use GenServer, restart: :transient

  defmodule State do
    use TypedStruct

    typedstruct enforce: true do
      field :id, String.t()

      field :running, boolean(), default: false

      field :images, Qex.t({integer(), NativeMatrix.t()})
    end
  end

  # how often we push an image, not the same as frame delays
  @tick_ms Integer.floor_div(1000, 4)

  def start_link(options) do
    state = %State{
      id: Keyword.fetch!(options, :game_id),
      images: Keyword.fetch!(options, :images) |> Qex.new()
    }

    GenServer.start_link(__MODULE__, state, options)
  end

  @impl true
  def init(state) do
    {:ok, state}
  end

  @impl true
  def handle_cast({:handle_input, _, _}, state) do
    {:noreply, state}
  end

  @impl true
  def handle_cast(:terminate, state) do
    state = %State{state | running: false}

    {:noreply, state}
  end

  @impl true
  def handle_call({:add_player, _player}, _from, state) do
    {:reply, :ok, state}
  end

  @impl true
  def handle_call(:get_status, _from, state) do
    {:reply,
     %GameStatus{
       id: state.id,
       name: "Static override",
       players: 0,
       max_players: 0,
       ready: true
     }, state}
  end

  @impl true
  def handle_call(:start_if_ready, _from, state) do
    cond do
      state.running ->
        {:reply, :running, state}

      true ->
        state = next_frame(state)
        {:ok, _timer} = :timer.send_interval(@tick_ms, :tick)
        {:reply, :started, %State{state | running: true}}
    end
  end

  @impl true
  def handle_info(:tick, state) do
    if state.running do
      {:noreply, tick(state)}
    else
      {:stop, :normal, state}
    end
  end

  @impl true
  def handle_info(:next_frame, state) do
    state = next_frame(state)

    {:noreply, state}
  end

  defp next_frame(%State{} = state) do
    {{delay, _} = image, images} = Qex.pop!(state.images)
    state = %State{state | images: Qex.push(images, image)}
    render(state)

    Process.send_after(self(), :next_frame, trunc(delay))

    state
  end

  defp tick(%State{} = state) do
    render(state)
    state
  end

  defp render(%State{images: images}) do
    {{_, image}, _} = Qex.pop!(images)

    Screen.update_frame(image)
  end
end
