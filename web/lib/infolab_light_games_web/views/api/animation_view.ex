defmodule Api.AnimationView do
  use InfolabLightGamesWeb, :view

  def render("success.json", %{message: message}) do
    %{status: "success", data: %{message: message}}
  end

  def render("error.json", %{message: message}) do
    %{status: "error", message: message}
  end
end
