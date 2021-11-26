defmodule Api.AnimationController do
  import Plug.Conn.Status, only: [code: 1]
  use InfolabLightGamesWeb, :controller
  use PhoenixSwagger

  @example_animation """
  return class MyEffect {
    constructor(display) {
      this.display = display;

      this.#clear();
    }

    #clear() {
      for (let x = 0; x < this.display.width; x++) {
        for (let y = 0; y < this.display.height; y++) {
          this.display.setPixel(x, y, [0, 0, 0]);
        }
      }

      this.display.flush();
    }

    update() {
    }
  }
  """

  swagger_path :post do
    description "Set the current idle animation"
    response code(:created), "Idle animation was set successfully"

    response code(:service_unavailable),
             "Display cannot display an idle animation at the current time"

    consumes "multipart/form-data"

    parameters do
      code(:formData, :file, "The js animation to display",
        required: true,
        example: @example_animation
      )
    end

    security [%{apiKeyAuth: []}]
  end

  def post(conn, %{"code" => %Plug.Upload{path: path} = upload}) do
    case Coordinator.push_idle_animation(IdleAnimations.JSImpl, path) do
      {:ok, pid} ->
        :ok = Plug.Upload.give_away(upload, pid)

        conn
        |> put_status(:created)
        |> render("success.json", message: "Set animation")

      {:error, :active_game} ->
        conn
        |> put_status(:service_unavailable)
        |> render("error.json", message: "Active Game")
    end
  end
end
