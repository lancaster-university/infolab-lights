defmodule InfolabLightGamesWeb.Router do
  use InfolabLightGamesWeb, :router
  import Phoenix.LiveDashboard.Router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, {InfolabLightGamesWeb.LayoutView, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug RemoteIp
    plug :put_remote_ip
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :admins_only do
    plug :auth
  end

  scope "/", InfolabLightGamesWeb do
    pipe_through :browser

    live "/", PageLive, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", InfolabLightGamesWeb do
  #   pipe_through :api
  # end

  scope "/" do
    pipe_through [:browser, :admins_only]

    live "/admin", InfolabLightGamesWeb.AdminLive, :index
    live_dashboard "/dashboard", metrics: InfolabLightGamesWeb.Telemetry
  end

  defp auth(conn, _opts) do
    admin_pass =
      Application.get_env(:infolab_light_games, InfolabLightGamesWeb.Router)[:admin_pass]

    with {"admin", pass} <- Plug.BasicAuth.parse_basic_auth(conn),
         true <- Plug.Crypto.secure_compare(pass, admin_pass) do
      conn
    else
      _ -> conn |> Plug.BasicAuth.request_basic_auth() |> halt()
    end
  end

  defp put_remote_ip(conn, _), do:
    conn
      |> put_session(:remote_ip, conn.remote_ip)
      |> put_session(:live_socket_id, "user_socket:#{inspect(conn.remote_ip)}")
end
