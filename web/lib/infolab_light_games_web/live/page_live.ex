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
  def handle_event("queue", _game_name, %{assigns: %{name: _name}} = socket) do
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

    name = Coordinator.queue_game(game, self())

    socket = socket
      |> assign(name: name)
      |> put_flash(:info, "Joined game: #{game_name}")

    {:noreply, socket}
  end

  @impl true
  def terminate(_reason, socket) do
    case socket do
      %{assigns: %{name: name}} ->
        Coordinator.terminate_game(name)
      _ -> :ok
    end
  end
end
