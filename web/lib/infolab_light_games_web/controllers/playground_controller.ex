defmodule InfolabLightGamesWeb.PlaygroundController do
  use InfolabLightGamesWeb, :controller

  def index(conn, _params) do
    {width, height} = Screen.dims()

    conn =
      conn
      |> assign(:width, width)
      |> assign(:height, height)
      |> assign(:scripts, [
        Routes.static_path(conn, "/assets/app-nonlive.js"),
        Routes.static_path(conn, "/assets/playground.js")
      ])

    render(conn, "index.html")
  end
end
