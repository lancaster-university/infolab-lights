defmodule Games.Pong do
  require OK
  use GenServer, restart: :transient

  defmodule State do
    use TypedStruct

    typedstruct enforce: true do
      field :id, String.t()

      field :running, boolean(), default: false
      field :winner, :red | :blue | none(), default: nil

      field :fader, Fader.t(), default: Fader.new(8)

      field :left_player, pid() | none(), default: nil
      field :right_player, pid() | none(), default: nil

      field :left_paddle_pos, non_neg_integer(), default: 0
      field :right_paddle_pos, non_neg_integer(), default: 0

      field :left_keypress_state, %{up: boolean(), down: boolean()},
        default: %{up: false, down: false}

      field :right_keypress_state, %{up: boolean(), down: boolean()},
        default: %{up: false, down: false}

      field :ball_pos, {float(), float()}, default: Screen.centre_pos()
      field :ball_vel, {float(), float()}, default: {0.6, 0}
    end
  end

  @paddle_size 20
  @paddle_move_amount 3
  @x_vel_mult_on_hit 1.01
  @max_ball_x_vel 10
  @max_ball_y_vel 4
  @initial_x_vel 0.6
  @initial_y_vel_range -5..5
  @tick_ms Integer.floor_div(1000, 30)

  def start_link(options) do
    state = %State{
      id: Keyword.fetch!(options, :game_id),
      ball_vel: {@initial_x_vel, 0.1 * Enum.random(@initial_y_vel_range)}
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
        player_state_key <-
          cond do
            player == state.left_player ->
              {:ok, :left_keypress_state}

            player == state.right_player ->
              {:ok, :right_keypress_state}

            true ->
              {:error, :not_a_player}
          end

        key_name <-
          case key do
            "ArrowUp" -> {:ok, :up}
            "ArrowDown" -> {:ok, :down}
            _ -> {:error, :unknown_key}
          end
      after
        put_in(state, [Access.key!(player_state_key), key_name], pressed_state)
      rescue
        _ -> state
      end

    {:noreply, state}
  end

  @impl true
  def handle_cast(:terminate, state) do
    state = %State{state | running: false}

    {:noreply, state}
  end

  @impl true
  def handle_call({:add_player, player}, _from, state) do
    {:ok, state} =
      case {state.left_player, state.right_player} do
        {nil, _} ->
          {:ok, %State{state | left_player: player}}

        {_, nil} ->
          {:ok, %State{state | right_player: player}}

        _ ->
          {:error, :players_already_full}
      end

    {:reply, :ok, state}
  end

  @impl true
  def handle_call(
        {:remove_player, player},
        _from,
        %State{left_player: lp, right_player: rp} = state
      )
      when player in [lp, rp] do
    state =
      cond do
        state.left_player == player ->
          %State{state | left_player: nil}

        state.right_player == player ->
          %State{state | right_player: nil}

        true ->
          state
      end

    if state.running or Enum.all?([state.left_player, state.right_player], &is_nil/1) do
      Coordinator.terminate_game(state.id)
    end

    {:reply, :ok, state}
  end

  @impl true
  def handle_call({:remove_player, _player}, _from, state) do
    {:reply, :ok, state}
  end

  @impl true
  def handle_call(:get_status, _from, state) do
    player_count = Enum.count([state.left_player, state.right_player], &(not is_nil(&1)))

    {:reply,
     %GameStatus{
       id: state.id,
       name: "Pong",
       players: player_count,
       max_players: 2,
       ready: player_count == 2
     }, state}
  end

  @impl true
  def handle_call(:start_if_ready, _from, state) do
    cond do
      state.running ->
        {:reply, :running, state}

      Enum.any?([state.left_player, state.right_player], &is_nil/1) ->
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

  defp tick(state) do
    {dx, dy} = state.ball_vel

    state =
      state
      |> update_in([Access.key!(:ball_pos)], fn {x, y} -> {x + dx, y + dy} end)
      |> update_in([Access.key!(:fader)], &Fader.step/1)
      |> handle_bounces()
      |> handle_paddle_move()

    render(state)

    if state.winner do
      Phoenix.PubSub.broadcast!(
        InfolabLightGames.PubSub,
        "coordinator:status",
        {:game_win, state.id, state.winner}
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

  defp fade_tick(state) do
    if Fader.done(state.fader) do
      {:stop, :normal, state}
    else
      state = %State{state | fader: Fader.step(state.fader)}

      render(state)
      {:noreply, state}
    end
  end

  defp within_paddle(paddle_pos, ball_pos) do
    half_paddle_size = @paddle_size / 2
    ball_pos < paddle_pos + half_paddle_size and ball_pos > paddle_pos - half_paddle_size
  end

  defp handle_bounces(%State{ball_pos: {x, y}, ball_vel: {dx, dy}} = state) do
    {screen_x, screen_y} = Screen.dims()

    state =
      if (y < 0 and dy < 0) or (y > screen_y and dy > 0) do
        update_in(state.ball_vel, fn {dx, dy} -> {dx, -dy} end)
      else
        state
      end

    state =
      case {x < 4 and dx < 0, within_paddle(state.left_paddle_pos, y),
            x > screen_x - 3 and dx > 0, within_paddle(state.right_paddle_pos, y)} do
        {true, true, _, _} ->
          left_movement = paddle_vel(state.left_keypress_state, state.left_paddle_pos)

          update_in(state.ball_vel, fn {dx, dy} ->
            {clamp(-dx * @x_vel_mult_on_hit, -@max_ball_x_vel, @max_ball_x_vel),
             clamp(dy + left_movement * 0.5, -@max_ball_y_vel, @max_ball_y_vel)}
          end)

        {true, false, _, _} ->
          %State{state | running: false, winner: :red}

        {_, _, true, true} ->
          right_movement = paddle_vel(state.right_keypress_state, state.right_paddle_pos)

          update_in(state.ball_vel, fn {dx, dy} ->
            {clamp(-dx * @x_vel_mult_on_hit, -@max_ball_x_vel, @max_ball_x_vel),
             clamp(dy + right_movement * 0.5, -@max_ball_y_vel, @max_ball_y_vel)}
          end)

        {_, _, true, false} ->
          %State{state | running: false, winner: :blue}

        _ ->
          state
      end

    state
  end

  defp paddle_vel(keypress_state, paddle_pos) do
    {_screen_x, screen_y} = Screen.dims()

    case {keypress_state, paddle_pos < 0, paddle_pos > screen_y} do
      {%{up: true, down: false}, false, _} -> -@paddle_move_amount
      {%{up: false, down: true}, _, false} -> @paddle_move_amount
      _ -> 0
    end
  end

  defp handle_paddle_move(state) do
    left_movement = paddle_vel(state.left_keypress_state, state.left_paddle_pos)
    right_movement = paddle_vel(state.right_keypress_state, state.right_paddle_pos)

    state
    |> update_in([Access.key!(:left_paddle_pos)], fn p -> p + left_movement end)
    |> update_in([Access.key!(:right_paddle_pos)], fn p -> p + right_movement end)
  end

  defp clamp(val, mn, mx) do
    val
    |> min(mx)
    |> max(mn)
    |> floor()
  end

  defp clamp_xy({x, y}) do
    {screen_x, screen_y} = Screen.dims()
    x = clamp(x, 0, screen_x)
    y = clamp(y, 0, screen_y)
    {x, y}
  end

  defp draw_ball(screen, %State{ball_pos: {x, y}} = state) do
    pix = Fader.apply(Pixel.white(), state.fader)
    NativeMatrix.draw_rect_at(screen, clamp_xy({x - 1, y - 1}), clamp_xy({x + 1, y + 1}), pix)
  end

  defp draw_paddles(screen, %State{left_paddle_pos: lp, right_paddle_pos: rp} = state) do
    {screen_x, _screen_y} = Screen.dims()
    half_paddle_size = @paddle_size / 2

    screen
    |> NativeMatrix.draw_rect_at(
      clamp_xy({0, lp - half_paddle_size}),
      clamp_xy({2, lp + half_paddle_size}),
      Fader.apply(Pixel.blue(), state.fader)
    )
    |> NativeMatrix.draw_rect_at(
      clamp_xy({screen_x - 2, rp - half_paddle_size}),
      clamp_xy({screen_x, rp + half_paddle_size}),
      Fader.apply(Pixel.red(), state.fader)
    )
  end

  defp render(state) do
    frame =
      Screen.blank()
      |> draw_paddles(state)
      |> draw_ball(state)

    Screen.update_frame(frame)
  end
end
