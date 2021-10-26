defmodule InfolabLightGamesWeb.ScreenChannel do
  use InfolabLightGamesWeb, :channel
  require Logger

  @moduledoc """
  This is the phoenix channel used to send the screen updates to web clients
  """

  @impl true
  def join("screen", _payload, socket) do
    :ok = Phoenix.PubSub.subscribe(InfolabLightGames.PubSub, "screen:update")

    {:ok, socket}
  end

  @impl true
  def handle_info({:screen_update, update}, socket) do
    broadcast!(socket, "update", %{data: IO.iodata_to_binary(update) |> Base.encode64()})

    {:noreply, socket}
  end
end
