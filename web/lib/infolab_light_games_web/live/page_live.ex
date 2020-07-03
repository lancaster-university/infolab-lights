defmodule InfolabLightGamesWeb.PageLive do
  use InfolabLightGamesWeb, :live_view

  @dims Application.get_env(:infolab_light_games, Screen)[:dims]

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(InfolabLightGames.PubSub, "screen:full")
      Phoenix.PubSub.subscribe(InfolabLightGames.PubSub, "coordinator:status")

    end
    {width, height} = @dims
    coordinator_status = Coordinator.status()

    socket = socket
      |> assign(screen: Screen.latest, width: width, height: height)
      |> assign(coordinator_status: coordinator_status)

    {:ok, socket}
  end


  @impl true
  def handle_info({:screen_full, frame}, socket) do
    {:noreply, assign(socket, screen: frame)}
  end

  @impl true
  def handle_info({:coordinator_update, status}, socket) do
    {:noreply, assign(socket, coordinator_status: status)}
  end

  @impl true
  def handle_info({:game_win, id, winner}, socket) do
    {:noreply, put_flash(socket, :info, "Player '#{winner}' won the game: #{id}")}
  end

  @impl true
  def handle_info({:game_terminate, id}, %{assigns: %{game_id: id}} = socket) do
    {:noreply, unassigns(socket, :game_id)}
  end

  @impl true
  def handle_info({:game_terminate, _id}, socket) do
    {:noreply, socket}
  end

  @impl true
  def handle_event("queue", _params, %{assigns: %{game_id: _id}} = socket) do
    # already in a game
    {:noreply, put_flash(socket, :error, "You're already in a game")}
  end

  @impl true
  def handle_event("queue", %{"game-name" => game_name}, socket) do
    {:ok, game} =
      case game_name do
        "pong" -> {:ok, Games.Pong}
        _      -> {:error, :unknown_game}
      end

    id = Coordinator.queue_game(game, self())

    socket = socket
      |> assign(game_id: id)
      |> put_flash(:info, "Joined game: #{id}")

    {:noreply, socket}
  end

  @impl true
  def handle_event("join", _params, %{assigns: %{game_id: _id}} = socket) do
    # already in a game
    {:noreply, put_flash(socket, :error, "You're already in a game")}
  end

  @impl true
  def handle_event("join", %{"game-id" => id}, socket) do
    Coordinator.join_game(id, self())

    socket = socket
      |> assign(game_id: id)
      |> put_flash(:info, "Joined game: #{id}")

    {:noreply, socket}
  end

  @impl true
  def terminate(_reason, socket) do
    case socket do
      %{assigns: %{name_id: id}} ->
        Coordinator.terminate_game(id)
      _ -> :ok
    end
  end

  defp unassigns(socket, key) do
    %{socket |
      assigns: Map.delete(socket.assigns, key),
      changed: Map.put_new(socket.changed, key, true)
    }
  end
end
