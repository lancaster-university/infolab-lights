defmodule Games.Snake do
  require OK
  import ExclusiveRange
  use GenServer, restart: :transient

  defmodule State do
    use TypedStruct

    typedstruct enforce: true do
      field :id, String.t()

      field :player, pid() | none(), default: nil

      field :running, boolean(), default: false
      field :won, boolean(), default: false

      field :keypress_state, %{up: boolean(), down: boolean(), left: boolean(), right: boolean()},
        default: %{up: false, down: false, left: false, right: false}

      field :snake_direction, :up | :down | :left | :right, default: :right
      field :snake_desired_direction, :up | :down | :left | :right, default: :right
      field :snake_head_pos, {non_neg_integer(), non_neg_integer()}, default: Screen.centre_pos()
      field :snake_pieces, Qex.t({non_neg_integer(), non_neg_integer()}), default: Qex.new()
      field :snake_length, non_neg_integer(), default: 3

      field :food_location, {non_neg_integer(), non_neg_integer()} | none(), default: nil

      field :fader, Fader.t(), default: Fader.new(8)
    end
  end

  @tick_ms Integer.floor_div(1000, 8)
  @snake_colour Pixel.blue()
  @food_colour Pixel.green()

  def start_link(options) do
    state = %State{
      id: Keyword.get(options, :game_id)
    }

    GenServer.start_link(__MODULE__, state, options)
  end

  @impl true
  def init(state) do
    {:ok, state}
  end

  @impl true
  def handle_cast({:handle_input, _player, _input}, %State{running: false} = state) do
    {:noreply, state}
  end

  @impl true
  def handle_cast({:handle_input, player, {pressed_state, key}}, state) do
    state =
      OK.try do
        _ <-
          cond do
            player == state.player ->
              {:ok, nil}

            true ->
              {:error, :not_a_player}
          end

        key_name <-
          case key do
            "ArrowUp" -> {:ok, :up}
            "ArrowDown" -> {:ok, :down}
            "ArrowLeft" -> {:ok, :left}
            "ArrowRight" -> {:ok, :right}
            _ -> {:error, :unknown_key}
          end
      after
        put_in(state, [Access.key!(:keypress_state), key_name], pressed_state)
      rescue
        _ -> state
      end

    state = if pressed_state do
      update_direction(state)
    else
      state
    end

    {:noreply, state}
  end

  @impl true
  def handle_call({:add_player, player}, _from, state) do
    {:ok, state} =
      if is_nil(state.player) do
        {:ok, %State{state | player: player}}
      else
        {:error, :players_already_full}
      end

    {:reply, :ok, state}
  end

  @impl true
  def handle_call({:remove_player, player}, _from, %State{player: p} = state) do
    state =
      if player == p do
        Coordinator.terminate_game(state.id)

        %State{state | player: nil}
      else
        state
      end

    {:reply, :ok, state}
  end

  @impl true
  def handle_call(:get_status, _from, state) do
    player_count = Enum.count([state.player], &(not is_nil(&1)))

    {:reply,
     %GameStatus{
       id: state.id,
       name: "Snake",
       players: player_count,
       max_players: 1,
       ready: player_count == 1
     }, state}
  end

  @impl true
  def handle_call(:start_if_ready, _from, state) do
    cond do
      state.running ->
        {:reply, :running, state}

      is_nil(state.player) ->
        {:reply, :not_ready, state}

      true ->
        {:ok, _timer} = :timer.send_interval(@tick_ms, :tick)
        {:reply, :started, %State{state | running: true}}
    end
  end

  @impl true
  def handle_info(:tick, state) do
    if state.running do
      {:noreply, tick(state)}
    else
      fade_tick(state)
    end
  end

  @impl true
  def terminate(_reason, state) do
    Coordinator.notify_game_terminated(state.id)
  end

  defp tick(%State{} = state) do
    state =
      state
      |> update_in([Access.key!(:fader)], &Fader.step/1)
      |> update_position()
      |> update_tail()
      |> check_if_dead()
      |> update_food()

    render(state)

    if state.won && state.player do
      Phoenix.PubSub.broadcast!(
        InfolabLightGames.PubSub,
        "coordinator:status",
        {:game_win, state.id, state.player}
      )
    end

    state =
      if state.running do
        state
      else
        put_in(state.fader.direction, :dec)
      end

    state
  end

  defp update_direction(%State{keypress_state: kp, snake_direction: dir} = state) do
    new_dir =
      cond do
        kp.up and dir != :down -> :up
        kp.down and dir != :up -> :down
        kp.left and dir != :right -> :left
        kp.right and dir != :left -> :right
        true -> dir
      end

    %State{state | snake_desired_direction: new_dir}
  end

  defp update_position(%State{snake_desired_direction: dir, snake_head_pos: {x, y}} = state) do
    state = update_in(state.snake_pieces, &Qex.push(&1, {x, y}))

    {dx, dy} =
      case dir do
        :up -> {0, -1}
        :down -> {0, 1}
        :left -> {-1, 0}
        :right -> {1, 0}
      end

    %State{state | snake_head_pos: {x + dx, y + dy}, snake_direction: dir}
  end

  defp update_tail(%State{} = state) do
    if Enum.count(state.snake_pieces) > state.snake_length do
      update_in(state.snake_pieces, &(Qex.pop(&1) |> elem(1)))
    else
      state
    end
  end

  defp check_if_dead(%State{} = state) do
    # we are dead if the head collides with a tail piece, or at the edge of the
    # screen

    {screen_x, screen_y} = Screen.dims()

    {x, y} = state.snake_head_pos

    is_dead =
      Enum.member?(state.snake_pieces, state.snake_head_pos) or
        x not in erange(0..screen_x) or
        y not in erange(0..screen_y)

    if is_dead do
      won = state.snake_length >= screen_x * screen_y

      %State{state | won: won, running: false}
    else
      state
    end
  end

  defp update_food(%State{} = state) do
    cond do
      state.food_location == state.snake_head_pos ->
        state
        |> add_new_food()
        |> update_in([Access.key!(:snake_length)], &(&1 + 1))

      is_nil(state.food_location) ->
        add_new_food(state)

      true ->
        state
    end
  end

  defmodule FoodPositions do
    @spec generate_initial_food_positions() :: MapSet.t({non_neg_integer(), non_neg_integer()})
    def generate_initial_food_positions do
      {screen_x, screen_y} = Screen.dims()

      for x <- erange(0..screen_x),
          y <- erange(0..screen_y),
          reduce: MapSet.new() do
        positions -> MapSet.put(positions, {x, y})
      end
    end
  end

  @initial_food_positions FoodPositions.generate_initial_food_positions()

  defp add_new_food(%State{} = state) do
    invalid_food_positions =
      state.snake_pieces
      |> Enum.into(MapSet.new())
      |> MapSet.put(state.snake_head_pos)

    valid_positions = MapSet.difference(@initial_food_positions, invalid_food_positions)

    new_pos =
      if Enum.empty?(valid_positions) do
        nil
      else
        Enum.random(valid_positions)
      end

    %State{state | food_location: new_pos}
  end

  defp fade_tick(state) do
    if Fader.done(state.fader) do
      {:stop, :normal, state}
    else
      state = %State{state | fader: Fader.step(state.fader)}

      render(state)
      {:noreply, state}
    end
  end

  defp draw_snake(screen, %State{} = state) do
    colour = Fader.apply(@snake_colour, state.fader)
    screen = Enum.reduce(state.snake_pieces, screen, &Matrix.draw_at(&2, &1, colour))

    if Screen.in_range(state.snake_head_pos) do
      Matrix.draw_at(screen, state.snake_head_pos, colour)
    else
      screen
    end
  end

  defp draw_food(screen, %State{} = state) do
    colour = Fader.apply(@food_colour, state.fader)

    if state.food_location do
      Matrix.draw_at(screen, state.food_location, colour)
    else
      screen
    end
  end

  defp render(state) do
    frame =
      Screen.blank()
      |> draw_snake(state)
      |> draw_food(state)

    Screen.update_frame(frame)
  end
end
