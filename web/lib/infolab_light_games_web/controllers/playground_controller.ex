defmodule InfolabLightGamesWeb.PlaygroundController do
  use InfolabLightGamesWeb, :controller

  def index(conn, _params) do
    {width, height} = Screen.dims()

    conn =
      conn
      |> assign(:width, width)
      |> assign(:height, height)
      |> assign(:extra_scripts, [Routes.static_path(conn, "/assets/playground.js")])

    render(conn, "index.html")
  end
end
