defmodule InfolabLightGamesWeb.ScreenChannel do
  use InfolabLightGamesWeb, :channel

  @impl true
  def join("screen", _payload, socket) do
    :ok = Phoenix.PubSub.subscribe(InfolabLightGames.PubSub, "screen:diff")

    {:ok, socket}
  end

  @impl true
  def handle_info({:screen_diff, d}, socket) do
    broadcast!(socket, "diff", %{data: d})

    {:noreply, socket}
  end

  @impl true
  def handle_in("request_full", _payload, socket) do
    full = Screen.full_as_diff()

    broadcast!(socket, "diff", %{data: full})

    {:noreply, socket}
  end
end
