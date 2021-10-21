defmodule InfolabLightGamesWeb.AdminLive do
  use InfolabLightGamesWeb, :live_view
  alias Phoenix.Socket.Broadcast

  @impl Phoenix.LiveView
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
      |> assign(uploaded_files: [])
      |> allow_upload(:static_image, accept: ~w(.png .jpg .jpeg), max_entries: 1)

    {:ok, socket}
  end

  @impl Phoenix.LiveView
  def handle_info({:coordinator_update, status}, socket) do
    {:noreply, assign(socket, coordinator_status: status)}
  end

  @impl Phoenix.LiveView
  def handle_info(%Broadcast{topic: "user_presence"}, socket) do
    socket =
      socket
      |> assign(presences: format_presences())

    {:noreply, socket}
  end

  @impl Phoenix.LiveView
  def handle_info(_msg, socket) do
    {:noreply, socket}
  end

  @impl Phoenix.LiveView
  def handle_event("validate", _, socket) do
    {:noreply, socket}
  end

  @impl Phoenix.LiveView
  def handle_event("cancel-upload", %{"ref" => ref}, socket) do
    {:noreply, cancel_upload(socket, :avatar, ref)}
  end

  @impl Phoenix.LiveView
  def handle_event("terminate", %{"game-id" => id}, socket) do
    Coordinator.terminate_game(id)

    {:noreply, socket}
  end

  @impl Phoenix.LiveView
  def handle_event("set-static-image", _params, socket) do
    {width, height} = Screen.dims()

    [image] =
      consume_uploaded_entries(socket, :static_image, fn %{path: path}, _entry ->
        img = File.read!(path)
        NativeMatrix.load_from_image(img, width, height)
      end)

    # a bit of a hack to have zero player games, but w/e
    id = Coordinator.queue_game(Games.Static, nil, [image: image])

    socket =
      socket
      |> put_flash(:info, "Started static image: #{id}")

    {:noreply, socket}
  end

  @impl Phoenix.LiveView
  def handle_event("terminate-idle-animation", _, socket) do
    Coordinator.terminate_idle_animation()

    {:noreply, socket}
  end

  @impl Phoenix.LiveView
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
