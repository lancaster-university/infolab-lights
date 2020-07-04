defmodule InfolabLightGamesWeb.ScreenChannel do
  use InfolabLightGamesWeb, :channel

  @impl true
  def join("screen_diff", _payload, socket) do
    {:ok, socket}
  end
end
