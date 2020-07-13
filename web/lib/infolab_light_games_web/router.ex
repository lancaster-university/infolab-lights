defmodule InfolabLightGamesWeb.Router do
  use InfolabLightGamesWeb, :router
  import Plug.BasicAuth
  import Phoenix.LiveDashboard.Router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, {InfolabLightGamesWeb.LayoutView, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :admins_only do
    plug :basic_auth, username: "admin", password: Application.get_env(:infolab_light_games, InfolabLightGamesWeb.Router)[:admin_pass]
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
end
