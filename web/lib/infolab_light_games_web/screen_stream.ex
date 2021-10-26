defmodule InfolabLightGamesWeb.ScreenStream do
  @behaviour Phoenix.Socket.Transport

  @moduledoc """
  This is the socket that sends data to the display, and anyone else interested
  over a plain websocket.
  """

  def child_spec(_opts) do
    # We won't spawn any process, so let's return a dummy task
    %{id: Task, start: {Task, :start_link, [fn -> :ok end]}, restart: :transient}
  end

  def connect(state) do
    # Callback to retrieve relevant data from the connection.
    # The map contains options, params, transport and endpoint keys.
    IO.inspect("starting up")
    {:ok, state}
  end

  def init(state) do
    # Now we are effectively inside the process that maintains the socket.
    :ok = Phoenix.PubSub.subscribe(InfolabLightGames.PubSub, "screen:update")
    {:ok, state}
  end

  def handle_in(_msg, state) do
    {:ok, state}
  end

  def handle_info({:screen_update, update}, state) do
    {:push, {:binary, update}, state}
  end

  def handle_info(_msg, state) do
    {:ok, state}
  end

  def terminate(_reason, _state) do
    :ok = Phoenix.PubSub.unsubscribe(InfolabLightGames.PubSub, "screen:update")
    :ok
  end
end
