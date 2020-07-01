defmodule InfolabLightGamesWeb.ScreenStream do
  @behaviour Phoenix.Socket.Transport

  def child_spec(_opts) do
    # We won't spawn any process, so let's return a dummy task
    %{id: Task, start: {Task, :start_link, [fn -> :ok end]}, restart: :transient}
  end

  def connect(state) do
    # Callback to retrieve relevant data from the connection.
    # The map contains options, params, transport and endpoint keys.
    {:ok, state}
  end

  def init(state) do
    # Now we are effectively inside the process that maintains the socket.
    send(self(), {:screen_full, Screen.latest()})
    :ok = Phoenix.PubSub.subscribe(InfolabLightGames.PubSub, "screen:diff")
    {:ok, state}
  end

  def handle_in({text, _opts}, state) do
    {:reply, :ok, {:text, text}, state}
  end

  def handle_info({:screen_full, screen}, state) do
    msg = Jason.encode!(%{type: :full, screen: screen})
    {:push, {:text, msg}, state}
  end

  def handle_info({:screen_diff, diff}, state) do
    msg = Jason.encode!(%{type: :diff, diff: diff})
    {:push, {:text, msg}, state}
  end

  def handle_info(_msg, state) do
    {:ok, state}
  end

  def terminate(_reason, _state) do
    :ok = Phoenix.PubSub.unsubscribe(InfolabLightGames.PubSub, "screen:diff")
    :ok
  end
end
