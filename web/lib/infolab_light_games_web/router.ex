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
    plug :auth_web
  end

  pipeline :requires_api_auth do
    plug :auth_api
  end

  scope "/", InfolabLightGamesWeb do
    pipe_through :browser

    live "/", PageLive, :index
    get "/playground", PlaygroundController, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", InfolabLightGamesWeb do
  #   pipe_through :api
  # end

  scope "/" do
    pipe_through [:browser, :admins_only]

    live "/admin", InfolabLightGamesWeb.AdminLive, :index

    live_dashboard "/dashboard",
      metrics: InfolabLightGamesWeb.Telemetry,
      metrics_history: {InfolabLightGamesWeb.MetricStorage, :metrics_history, []}
  end

  scope "/api" do
    pipe_through [:api, :requires_api_auth]

    post "/set_js_animation", Api.AnimationController, :post
  end

  scope "/api/swagger" do
    forward "/", PhoenixSwagger.Plug.SwaggerUI,
      otp_app: :infolab_light_games,
      swagger_file: "swagger.json"
  end

  def swagger_info do
    %{
      schemes: ["https"],
      info: %{
        version: "1.0",
        title: "infolab lights"
      },
      securityDefinitions: %{
        apiKeyAuth: %{
          type: "apiKey",
          name: "Authorization",
          description: "API Token must be provided via `Authorization: ` header",
          in: "header"
        }
      }
    }
  end

  defp auth_api(conn, _opts) do
    api_token = Application.get_env(:infolab_light_games, InfolabLightGamesWeb.Router)[:api_token]

    with [provided_token_encoded] <- get_req_header(conn, "authorization"),
         {:ok, provided_token} <- Base.decode64(provided_token_encoded),
         true <- Plug.Crypto.secure_compare(provided_token, api_token) do
      conn
    else
      _ ->
        conn
        |> put_status(401)
        |> json(%{status: "fail", data: %{message: "Not authenticated"}})
    end
  end

  defp auth_web(conn, _opts) do
    admin_pass =
      Application.get_env(:infolab_light_games, InfolabLightGamesWeb.Router)[:admin_pass]

    with {"admin", provided_pass} <- Plug.BasicAuth.parse_basic_auth(conn),
         true <- Plug.Crypto.secure_compare(provided_pass, admin_pass) do
      conn
    else
      _ -> conn |> Plug.BasicAuth.request_basic_auth() |> halt()
    end
  end

  defp put_remote_ip(conn, _),
    do:
      conn
      |> put_session(:remote_ip, conn.remote_ip)
      |> put_session(:live_socket_id, "user_socket:#{inspect(conn.remote_ip)}")
end
