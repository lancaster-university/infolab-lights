defmodule InfolabLightGamesWeb.AdminLive do
  use InfolabLightGamesWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(InfolabLightGames.PubSub, "coordinator:status")
    end

    coordinator_status = Coordinator.status()

    socket =
      socket
      |> assign(coordinator_status: coordinator_status)

    {:ok, socket}
  end

  @impl true
  def handle_info({:coordinator_update, status}, socket) do
    {:noreply, assign(socket, coordinator_status: status)}
  end

  @impl true
  def handle_info(_, socket) do
    {:noreply, socket}
  end

  @impl true
  def handle_event("terminate", %{"game-id" => id}, socket) do
    Coordinator.terminate_game(id)

    {:noreply, socket}
  end

  @impl true
  def handle_event("terminate-idle-animation", _, socket) do
    Coordinator.terminate_idle_animation()

    {:noreply, socket}
  end
end
