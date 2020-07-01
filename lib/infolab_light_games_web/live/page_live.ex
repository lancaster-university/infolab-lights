defmodule InfolabLightGamesWeb.PageLive do
  use InfolabLightGamesWeb, :live_view

  @dims Application.get_env(:infolab_light_games, Screen)[:dims]

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket), do: Phoenix.PubSub.subscribe(InfolabLightGames.PubSub, "screen:full")
    {width, height} = @dims
    {:ok, assign(socket, screen: Screen.latest, width: width, height: height)}
  end

  @impl true
  def handle_info({:screen_full, frame}, socket) do
    {:noreply, assign(socket, screen: frame)}
  end
end
