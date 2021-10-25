defmodule InfolabLightGamesWeb.PlaygroundLive do
  use InfolabLightGamesWeb, :live_view
  require Logger

  @impl true
  def mount(_params, _session, socket) do
    {width, height} = Screen.dims()

    socket =
      socket
      |> assign(width: width, height: height)
      # |> assign(extra_styles: [Routes.static_path(socket, "/assets/playground.css")])
      |> assign(extra_scripts: [Routes.static_path(socket, "/assets/playground.js")])

    {:ok, socket}
  end
end
