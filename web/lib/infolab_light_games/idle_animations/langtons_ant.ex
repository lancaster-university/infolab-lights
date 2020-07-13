defmodule IdleAnimations.Ant do
  use GenServer, restart: :transient

  @moduledoc "A langton's ant idle animation"

  @max_steps 10_000

  defmodule State do
    use TypedStruct

    typedstruct enforce: true do
      field :id, String.t()

      field :ant_direction, :up | :down | :left | :right, default: :up
      field :ant_position, {non_neg_integer(), non_neg_integer()}, default: Screen.centre_pos()

      field :state_matrix, Matrix.t(Pixel.t())

      field :ruleset, Ant.RuleSet.t()

      field :fading_out, boolean(), default: false
      field :fader, Fader.t(), default: Fader.new(8)

      field :steps, non_neg_integer(), default: 0
    end
  end

  defmodule RuleSet do
    use TypedStruct

    typedstruct enforce: true do
      field :rule_map, %{required(Pixel.t()) => (Ant.State.t() -> Ant.State.t())}
      field :default_state, Pixel.t()
    end
  end

  def start_link(options) do
    {screen_x, screen_y} = Screen.dims()
    ruleset = get_ruleset()

    state = %State{
      id: Keyword.get(options, :game_id),
      state_matrix: Matrix.of_dims(screen_x, screen_y, ruleset.default_state),
      ruleset: ruleset
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

    update_fn = state.ruleset.rule_map[Matrix.at(state.state_matrix, state.ant_position)]

    state =
      %State{state | steps: state.steps + 1, fader: Fader.step(state.fader)}
      |> update_fn.()

    if state.steps < @max_steps and not (state.fading_out and Fader.done(state.fader)) do
      tick_request()

      {:noreply, state}
    else
      {:stop, :normal, state}
    end
  end

  @impl true
  def handle_cast(:terminate, state) do
    {:noreply, %State{state | fading_out: true, fader: %Fader{state.fader | direction: :dec}}}
  end

  @impl true
  def terminate(_reason, state) do
    Coordinator.notify_idle_animation_terminated(state.id)
  end

  defp get_ruleset do
    pattern = Enum.random([:original, :square_thing_0])

    case pattern do
      :original ->
        %RuleSet{
          default_state: Pixel.empty(),
          rule_map: %{
            Pixel.empty() => fn s ->
              s |> rotate(:left) |> set_colour(Pixel.white()) |> step(1)
            end,
            Pixel.white() => fn s ->
              s |> rotate(:right) |> set_colour(Pixel.empty()) |> step(1)
            end
          }
    }
      :square_thing_0 ->
        %RuleSet{
          default_state: Pixel.empty(),
          rule_map: %{
            Pixel.empty() => fn s -> s |> rotate(:right) |> rotate(:right) |> set_colour(Pixel.white()) |> step(3) end,
            Pixel.white() => fn s -> s |> rotate(:right) |> set_colour(Pixel.red()) |> step(2) end,
            Pixel.red()   => fn s -> s |> rotate(:right) |> rotate(:right) |> set_colour(Pixel.blue()) |> step(3) end,
            Pixel.blue()  => fn s -> s |> rotate(:left) |> set_colour(Pixel.empty()) |> step(1) end,
          }
    }
    end
  end

  defp rotate(state, dir) do
    dir =
      case {dir, state.ant_direction} do
        {:left, :up} -> :left
        {:left, :right} -> :up
        {:left, :down} -> :right
        {:left, :left} -> :down
        {:right, :up} -> :right
        {:right, :right} -> :down
        {:right, :down} -> :left
        {:right, :left} -> :up
      end

    %State{state | ant_direction: dir}
  end

  defp set_colour(state, colour) do
    %State{state | state_matrix: Matrix.draw_at(state.state_matrix, state.ant_position, colour)}
  end

  defp step(state, amount) do
    {screen_x, screen_y} = Screen.dims()

    {dy, dx} =
      case state.ant_direction do
        :up -> {0, -1 * amount}
        :down -> {0, 1 * amount}
        :left -> {-1 * amount, 0}
        :right -> {1 * amount, 0}
      end

    {x, y} = state.ant_position
    new_pos = {rem(x + dx, screen_x), rem(y + dy, screen_y)}

    %State{state | ant_position: new_pos}
  end

  defp tick_request do
    Process.send_after(self(), :tick, Integer.floor_div(1000, 20))
  end

  defp render(state) do
    frame = Matrix.map(state.state_matrix, fn _x, _y, s -> Fader.apply(s, state.fader) end)

    Screen.update_frame(frame)
  end
end
