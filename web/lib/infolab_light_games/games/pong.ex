defmodule Games.Pong do
  use GenServer, restart: :transient

  defmodule State do
    use TypedStruct

    typedstruct enforce: true do
      field :id, String.t()
      field :running, boolean(), default: false
      field :winner, :left | :right | none(), default: nil
      field :left_player, pid() | none(), default: nil
      field :right_player, pid() | none(), default: nil
      field :left_paddle_pos, non_neg_integer(), default: 0
      field :right_paddle_pos, non_neg_integer(), default: 0
      field :ball_pos, {float(), float()}, default: Screen.centre_pos()
      field :ball_vel, {float(), float()}, default: {0.2, 0}
    end
  end

  @paddle_size 15

  def start_link(options) do
    GenServer.start_link(__MODULE__, %State{id: Keyword.get(options, :game_id)}, options)
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
  def handle_cast(
        {:handle_input, player, input},
        %State{left_player: lp, right_player: rp} = state
      ) do
    amount =
      case input do
        "up" -> 1
        "down" -> -1
        _ -> 0
      end

    state =
      case player do
        ^lp ->
          Map.update!(state, :left_player, &(&1 + amount))

        ^rp ->
          Map.update!(state, :right_player, &(&1 + amount))

        _ ->
          state
      end

    render(state)

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
        tick_request()
        {:reply, :started, %State{state | running: true}}
    end
  end

  @impl true
  def handle_info(:tick, state) do
    {dx, dy} = state.ball_vel
    state = update_in(state.ball_pos, fn {x, y} -> {x + dx, y + dy} end)
    state = handle_bounces(state)

    render(state)

    if not is_nil(state.winner) do
      Phoenix.PubSub.broadcast(
        InfolabLightGames.PubSub,
        "coordinator:status",
        {:game_win, state.id, state.winner}
      )
    end

    if state.running do
      tick_request()
    else
      Screen.update_frame(Screen.blank())
      Coordinator.terminate_game(state.id)
    end

    {:noreply, state}
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
      case {x < 1 and dx < 0, within_paddle(state.left_paddle_pos, y),
            x > screen_x - 1 and dx > 0, within_paddle(state.right_paddle_pos, y)} do
        {true, true, _, _} ->
          update_in(state.ball_vel, fn {dx, dy} -> {-dx, dy} end)

        {true, false, _, _} ->
          %State{state | running: false, winner: :right}

        {_, _, true, true} ->
          update_in(state.ball_vel, fn {dx, dy} -> {-dx, dy} end)

        {_, _, true, false} ->
          %State{state | running: false, winner: :left}

        _ ->
          state
      end

    state
  end

  defp tick_request do
    Process.send_after(self(), :tick, Integer.floor_div(1000, 30))
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

  defp draw_ball(screen, %State{ball_pos: {x, y}}) do
    Matrix.draw_rect(screen, clamp_xy({x - 1, y - 1}), clamp_xy({x + 1, y + 1}), Pixel.white())
  end

  defp draw_paddles(screen, %State{left_paddle_pos: lp, right_paddle_pos: rp}) do
    {screen_x, _screen_y} = Screen.dims()
    half_paddle_size = @paddle_size / 2

    screen
    |> Matrix.draw_rect(
      clamp_xy({0, lp - half_paddle_size}),
      clamp_xy({2, lp + half_paddle_size}),
      Pixel.blue()
    )
    |> Matrix.draw_rect(
      clamp_xy({screen_x - 2, rp - half_paddle_size}),
      clamp_xy({screen_x, rp + half_paddle_size}),
      Pixel.red()
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
