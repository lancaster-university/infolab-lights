defmodule InfolabLightGamesWeb.ScreenChannel do
  use InfolabLightGamesWeb, :channel

  @impl true
  def join("screen_diff", _payload, socket) do
    Screen.push_full_as_diff()

    {:ok, socket}
  end
end
