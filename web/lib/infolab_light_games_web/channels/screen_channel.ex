defmodule InfolabLightGamesWeb.ScreenChannel do
  use InfolabLightGamesWeb, :channel

  @impl true
  def join("screen_diff", _payload, socket) do
    {:ok, socket}
  end

  @impl true
  def handle_in(event, payload, socket) do
    IO.inspect(event)
    {:noreply, socket}
  end

  @impl true
  def handle_out(event, payload, socket) do
    IO.inspect(event)
    {:noreply, socket}
  end
end
