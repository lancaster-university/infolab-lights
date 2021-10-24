defmodule IdleAnimations.Ant do
  use GenServer, restart: :transient

  @moduledoc "A langton's ant idle animation"

  @fps 20
  @max_steps 10_000
  @min_changed_between_interesting_inspection 5
  @steps_between_interesting_inspection 16

  defmodule State do
    use TypedStruct

    typedstruct enforce: true do
      field(:id, String.t())

      field(:ant_direction, :up | :down | :left | :right, default: :up)
      field(:ant_position, {non_neg_integer(), non_neg_integer()}, default: Screen.centre_pos())

      field(:state_matrix, Matrix.t(Pixel.t()))
      field(:last_state_matrix, Matrix.t(Pixel.t()))

      field(:ruleset, Ant.RuleSet.t())

      field(:fading_out, boolean(), default: false)
      field(:fader, Fader.t(), default: Fader.new(20))

      field(:steps, non_neg_integer(), default: 0)
    end
  end

  defmodule RuleSet do
    use TypedStruct

    typedstruct enforce: true do
      field(:rule_map, %{required(Pixel.t()) => (Ant.State.t() -> Ant.State.t())})
      field(:default_state, Pixel.t())
    end
  end

  def start_link(options) do
    {screen_x, screen_y} = Screen.dims()
    ruleset = get_ruleset()
    state_matrix = Matrix.of_dims(screen_x, screen_y, ruleset.default_state)

    state = %State{
      id: Keyword.get(options, :game_id),
      state_matrix: state_matrix,
      last_state_matrix: state_matrix,
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
      |> is_interesting()

    if state.steps < @max_steps and not (state.fading_out and Fader.done(state.fader)) do
      tick_request()

      {:noreply, state}
    else
      {:stop, :normal, state}
    end
  end

  @impl true
  def handle_cast(:terminate, state) do
    {:noreply, start_fading_out(state)}
  end

  @impl true
  def terminate(_reason, state) do
    Coordinator.notify_idle_animation_terminated(state.id)
  end

  defp start_fading_out(%State{} = state) do
    %State{state | fading_out: true, fader: %Fader{state.fader | direction: :dec}}
  end

  defp get_ruleset do
    pattern = Enum.random([:random, :original, :random, :random, :random, :random])

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

      #       :square_thing_0 ->
      #         %RuleSet{
      #           default_state: Pixel.empty(),
      #           rule_map: %{
      #             Pixel.empty() => fn s ->
      #               s |> rotate(:right) |> rotate(:right) |> set_colour(Pixel.white()) |> step(3)
      #             end,
      #             Pixel.white() => fn s -> s |> rotate(:right) |> set_colour(Pixel.red()) |> step(2) end,
      #             Pixel.red() => fn s ->
      #               s |> rotate(:right) |> rotate(:right) |> set_colour(Pixel.blue()) |> step(3)
      #             end,
      #             Pixel.blue() => fn s -> s |> rotate(:left) |> set_colour(Pixel.empty()) |> step(1) end
      #           }
      #         }

      :random ->
        random_ruleset()
    end
  end

  defp is_interesting(%State{} = state) do
    if rem(state.steps, @steps_between_interesting_inspection) == 0 do
      number_changed = Matrix.diff(state.last_state_matrix, state.state_matrix) |> length()

      state = %State{state | last_state_matrix: state.state_matrix}

      if number_changed < @min_changed_between_interesting_inspection,
        do: start_fading_out(state),
        else: state
    else
      state
    end
  end

  @possible_random_colours [
    Pixel.white(),
    Pixel.red(),
    Pixel.blue(),
    Pixel.green(),
    Pixel.magenta(),
    Pixel.cyan()
  ]

  @possible_colour_presets [
    Enum.map(
      [
        "#55CDFC",
        "#FFFFFF",
        "#F7A8B8"
      ],
      &Pixel.from_hex/1
    ),
    Enum.map(
      [
        "#D60270",
        "#9B4F96",
        "#0038A8"
      ],
      &Pixel.from_hex/1
    ),
    Enum.map(
      [
        "#FF1C8D",
        "#FFD700",
        "#1AB3FF"
      ],
      &Pixel.from_hex/1
    ),
    Enum.map(
      [
        "#FCF431",
        "#FCFCFC",
        "#9D59D2",
        "#282828"
      ],
      &Pixel.from_hex/1
    ),
    Enum.map(
      [
        "#ff0018",
        "#ffa52c",
        "#ffff41",
        "#008018",
        "#86007d"
      ],
      &Pixel.from_hex/1
    ),
    Enum.map(
      [
        "#D62900",
        "#FF9B55",
        "#FFFFFF",
        "#D461A6",
        "#A50062"
      ],
      &Pixel.from_hex/1
    ),
    Enum.map(
      [
        "#22639B",
        "#06CDE0",
        "#0DB3CF",
        "#1498BE",
        "#1B7EAC"
      ],
      &Pixel.from_hex/1
    )
  ]

  defp generate_rotate() do
    n = Enum.random(0..3)

    ExclusiveRange.erange(0..n)
    |> Enum.map(fn _ -> fn s -> rotate(s, :right) end end)
    |> Enum.reduce(
      fn s -> s end,
      fn f, r ->
        fn s -> s |> f.() |> r.() end
      end
    )
  end

  defp generate_rule(states) do
    states
    |> Enum.map(fn col ->
      rotate_f = generate_rotate()
      # col = Enum.random(states)
      steps = Enum.random(0..2)
      fn s -> s |> rotate_f.() |> set_colour(col) |> step(steps) end
    end)
    |> Enum.reduce(fn f, r -> fn s -> s |> f.() |> r.() end end)
  end

  defp random_ruleset do
    preset_or_random = Enum.random([:preset, :preset, :random])
    # preset_or_random = :preset

    states =
      case preset_or_random do
        :preset ->
          [Pixel.empty() | Enum.random(@possible_colour_presets)]

        :random ->
          num_rules = Enum.random(2..length(@possible_random_colours))
          [Pixel.empty() | Enum.take_random(@possible_random_colours, num_rules)]
      end

    rules =
      states
      |> Enum.map(&{&1, generate_rule(states)})
      |> Enum.into(%{})

    %RuleSet{
      default_state: Pixel.empty(),
      rule_map: rules
    }
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

    {dx, dy} =
      case state.ant_direction do
        :up -> {0, -1 * amount}
        :down -> {0, 1 * amount}
        :left -> {-1 * amount, 0}
        :right -> {1 * amount, 0}
      end

    {x, y} = state.ant_position
    new_pos = {Integer.mod(x + dx, screen_x), Integer.mod(y + dy, screen_y)}

    %State{state | ant_position: new_pos}
  end

  defp tick_request do
    Process.send_after(self(), :tick, Integer.floor_div(1000, @fps))
  end

  defp render(state) do
    frame_vals =
      Matrix.reduce(state.state_matrix, [], fn x, y, s, acc ->
        [{x, y, {s.r, s.g, s.b}} | acc]
      end)

    frame =
      Screen.blank()
      |> NativeMatrix.set_from_list(frame_vals)
      |> NativeMatrix.mul(Fader.percentage(state.fader))

    Screen.update_frame(frame)
  end
end
