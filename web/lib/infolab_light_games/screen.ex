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
  def handle_call(:full_as_diff, _from, {frame} = state) do
    v = NativeMatrix.full_as_diff(frame)
    d = b64_msgpack(v)

    {:reply, d, state}
  end

  @impl true
  def handle_cast({:update_frame, frame}, {old_frame}) do
    diff = NativeMatrix.diff(old_frame, frame)

    if not Enum.empty?(diff) do
      d = b64_msgpack(diff)
      PubSub.broadcast!(InfolabLightGames.PubSub, "screen:diff", {:screen_diff, d})
    end

    {:noreply, {frame}}
  end

  defp b64_msgpack(val) do
    Msgpax.pack!(val) |> IO.iodata_to_binary() |> Base.encode64()
  end

  def update_frame(new_frame) do
    GenServer.cast(__MODULE__, {:update_frame, new_frame})
  end

  def full_as_diff do
    GenServer.call(__MODULE__, :full_as_diff)
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
