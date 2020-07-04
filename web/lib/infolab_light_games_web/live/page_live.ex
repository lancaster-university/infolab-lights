defmodule InfolabLightGamesWeb.PageLive do
  use InfolabLightGamesWeb, :live_view

  @dims Application.get_env(:infolab_light_games, Screen)[:dims]

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(InfolabLightGames.PubSub, "coordinator:status")

    end
    {width, height} = @dims
    coordinator_status = Coordinator.status()

    socket = socket
      |> assign(game_id: nil, screen: Screen.latest, width: width, height: height)
      |> assign(coordinator_status: coordinator_status)

    {:ok, socket, temporary_assigns: [screen: nil]}
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
    {:noreply, assign(socket, game_id: nil)}
  end

  @impl true
  def handle_info({:game_terminate, _id}, socket) do
    {:noreply, socket}
  end

  @impl true
  def handle_event("queue", %{"game-name" => game_name}, %{assigns: %{game_id: nil}} = socket) do
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
  def handle_event("queue", _params, socket) do
    # already in a game
    {:noreply, put_flash(socket, :error, "You're already in a game")}
  end

  @impl true
  def handle_event("join", %{"game-id" => id}, %{assigns: %{game_id: nil}} = socket) do
    Coordinator.join_game(id, self())

    socket = socket
      |> assign(game_id: id)
      |> put_flash(:info, "Joined game: #{id}")

    {:noreply, socket}
  end

  @impl true
  def handle_event("join", _params, socket) do
    # already in a game
    {:noreply, put_flash(socket, :error, "You're already in a game")}
  end

  @impl true
  def handle_event("leave", %{"game-id" => id}, %{assigns: %{game_id: id}} = socket) do
    Coordinator.leave_game(id, self())

    socket = socket
      |> assign(game_id: nil)
      |> put_flash(:info, "Left game: #{id}")

    {:noreply, socket}
  end

  @impl true
  def handle_event("leave", _params, socket) do
    {:noreply, socket}
  end

  @impl true
  def terminate(_reason, socket) do
    unless is_nil(socket.assigns.game_id) do
      Coordinator.leave_game(socket.assigns.game_id, self())
    end
  end
end
