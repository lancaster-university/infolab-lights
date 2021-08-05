defmodule InfolabLightGamesWeb.AdminLive do
  use InfolabLightGamesWeb, :live_view
  alias Phoenix.Socket.Broadcast

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(InfolabLightGames.PubSub, "coordinator:status")
      Phoenix.PubSub.subscribe(InfolabLightGames.PubSub, Presence.topic())
    end

    coordinator_status = Coordinator.status()

    socket =
      socket
      |> assign(coordinator_status: coordinator_status)
      |> assign(presences: format_presences())

    {:ok, socket}
  end

  @impl true
  def handle_info({:coordinator_update, status}, socket) do
    {:noreply, assign(socket, coordinator_status: status)}
  end

  @impl true
  def handle_info(%Broadcast{topic: "user_presence"}, socket) do
    socket =
      socket
      |> assign(presences: format_presences())

    {:noreply, socket}
  end

  @impl true
  def handle_info(_msg, socket) do
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

  @impl true
  def handle_event("ban", %{"phx-ref" => ref}, socket) do
    to_ban =
      format_presences()
      |> Enum.filter(fn %{phx_ref: this_ref} -> this_ref == ref end)
      |> Enum.map(fn %{remote_ip: remote_ip} -> remote_ip end)
      |> Enum.uniq()

    for target <- to_ban do
      Bans.add_ban(target)
    end

    {:noreply, socket}
  end

  defp format_presences do
    for {_, %{metas: l}} <- Presence.list(Presence.topic()),
        m <- l do
      m
    end
  end
end
