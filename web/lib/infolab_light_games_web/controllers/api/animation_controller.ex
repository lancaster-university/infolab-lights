defmodule Api.AnimationController do
  use InfolabLightGamesWeb, :controller

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
