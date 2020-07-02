defmodule Games.Pong do
  use GenServer

  defmodule State do
    use TypedStruct

    typedstruct enforce: true do
      field :name, String.t()
      field :left_player, pid() | none(), default: nil
      field :right_player, pid() | none(), default: nil
      field :left_paddle_pos, non_neg_integer(), default: 0
      field :right_paddle_pos, non_neg_integer(), default: 0
      field :ball_pos, {float(), float()}, default: {5, 5}
      field :ball_vel, {float(), float()}, default: {5, 5}
    end
  end

  def start_link(options) do
    GenServer.start_link(__MODULE__, %State{name: Keyword.get(options, :game_name)}, options)
  end

  @impl true
  def init(state) do
    {:ok, state}
  end

  @impl true
  def handle_cast({:handle_input, player, input}, %State{left_player: lp, right_player: rp} = state) do
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

          _ -> state
      end

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
  def handle_call(:get_status, _from, state) do
    {:reply, %GameStatus{name: "Pong",
                         players: Enum.count([state.left_player, state.right_player], &not(is_nil(&1))),
                         max_players: 2
                        },
     state}
  end

  @impl true
  def handle_call(:start_if_ready, _from, state) do
    {:reply, :not_ready, state}
  end

  def render do
    blank = Screen.blank


  end
end
