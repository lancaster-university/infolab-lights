defmodule IdleAnimations.GOL do
  use GenServer, restart: :transient

  @moduledoc "A GOL idle animation"

  defmodule State do
    use TypedStruct

    typedstruct enforce: true do
      field :id, String.t()

      field :gol_state, Matrix.t(boolean())

      field :steps, non_neg_integer(), default: 0
      field :max_steps, non_neg_integer()
    end
  end

  def start_link(options) do
    {gol_state, max_steps} = get_initial_state()

    state = %State{
      id: Keyword.get(options, :game_id),
      gol_state: gol_state,
      max_steps: max_steps
    }

    GenServer.start_link(__MODULE__, state, options)
  end

  @impl true
  def init(state) do
    tick_request()

    {:ok, state}
  end

  @impl true
  def handle_info(:tick, state) do
    render(state)

    state = %State{
      state
      | gol_state:
          Matrix.map(state.gol_state, fn x, y, s -> update_cell(state.gol_state, x, y, s) end),
        steps: state.steps + 1
    }

    if state.steps < state.max_steps do
      tick_request()

      {:noreply, state}
    else
      {:stop, :normal, state}
    end
  end

  @impl true
  def terminate(_reason, state) do
    Coordinator.notify_idle_animation_terminated(state.id)
  end

  defp get_initial_state do
    {screen_x, screen_y} = Screen.dims()

    pattern = Enum.random([:random, :glider])

    case pattern do
      :random ->
        gol_state =
          Matrix.of_dims_f(screen_x, screen_y, fn _, _ -> Enum.random([true, false, false]) end)

        {gol_state, 500}

      :glider ->
        {make_glider_state(), 1000}
    end
  end

  defp make_glider_state do
    {screen_x, screen_y} = Screen.dims()

    m = Matrix.of_dims(screen_x, screen_y, false)

    positions = [
      {5, 1},
      {5, 2},
      {6, 1},
      {6, 2},
      {5, 11},
      {6, 11},
      {7, 11},
      {4, 12},
      {3, 13},
      {3, 14},
      {8, 12},
      {9, 13},
      {9, 14},
      {6, 15},
      {4, 16},
      {5, 17},
      {6, 17},
      {7, 17},
      {6, 18},
      {8, 16},
      {3, 21},
      {4, 21},
      {5, 21},
      {3, 22},
      {4, 22},
      {5, 22},
      {2, 23},
      {6, 23},
      {1, 25},
      {2, 25},
      {6, 25},
      {7, 25},
      {3, 35},
      {4, 35},
      {3, 36},
      {4, 36}
    ]

    Enum.reduce(positions, m, fn {y, x}, m -> Matrix.draw_at(m, x, y, true) end)
  end

  defp update_cell(gol_state, x, y, s) do
    {screen_x, screen_y} = Screen.dims()

    live_neighbors =
      for dx <- -1..1, dy <- -1..1, {dx, dy} != {0, 0}, reduce: 0 do
        c -> c + if gol_state[rem(x + dx, screen_x)][rem(y + dy, screen_y)], do: 1, else: 0
      end

    if s do
      live_neighbors in 2..3
    else
      live_neighbors == 3
    end
  end

  defp tick_request do
    Process.send_after(self(), :tick, Integer.floor_div(1000, 8))
  end

  defp render(state) do
    frame =
      Matrix.map(state.gol_state, fn _x, _y, s -> if s, do: Pixel.white(), else: Pixel.empty() end)

    Screen.update_frame(frame)
  end
end
