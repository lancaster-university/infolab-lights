defmodule Screen do
  import ExclusiveRange
  use GenServer

  alias Phoenix.PubSub

  def dims do
    Application.get_env(:infolab_light_games, Screen)[:dims]
  end

  def centre_pos do
    {x, y} = dims()

    {Integer.floor_div(x, 2), Integer.floor_div(y, 2)}
  end

  def blank do
    NativeMatrix.of_dims(elem(dims(), 0), elem(dims(), 1), Pixel.empty())
  end

  @impl true
  def init(_opts) do
    {:ok, {blank()}}
  end

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, dims(), name: __MODULE__)
  end

  @impl true
  def handle_call(:latest_native, _from, {frame} = state) do
    {:reply, frame, state}
  end

  @impl true
  def handle_cast({:update_frame, frame}, _) do
    img = NativeMatrix.to_png(frame)

    # this is where we push out screen updates to the rest of the application
    PubSub.broadcast!(InfolabLightGames.PubSub, "screen:update", {:screen_update, img})

    {:noreply, {frame}}
  end

  def update_frame(new_frame) do
    GenServer.cast(__MODULE__, {:update_frame, new_frame})
  end

  def latest_native do
    GenServer.call(__MODULE__, :latest_native)
  end

  def in_range({x, y}), do: in_range(x, y)

  def in_range(x, y) do
    {screen_x, screen_y} = dims()

    x in erange(0..screen_x) and y in erange(0..screen_y)
  end
end
