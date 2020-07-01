defmodule Screen do
  use GenServer

  alias Phoenix.PubSub

  @dims Application.get_env(:infolab_light_games, Screen)[:dims]
  @name :screen_server

  @impl true
  def init({x, y}) do
    {:ok, Matrix.of_dims(x, y, Pixel.empty)}
  end

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, @dims, name: @name)
  end

  def update_frame(new_frame) do
    GenServer.cast @name, {:update_frame, new_frame}
  end

  def latest do
    GenServer.call @name, :latest
  end

  @impl true
  def handle_call(:latest, _from, state) do
    {:reply, state, state}
  end

  @impl true
  def handle_cast({:update_frame, frame}, state) do
    diff = Matrix.diff(state, frame)
    PubSub.broadcast(InfolabLightGames.PubSub, "screen:diff", {:screen_diff, diff})
    PubSub.broadcast(InfolabLightGames.PubSub, "screen:full", {:screen_full, frame})
    {:noreply, frame}
  end
end
