defmodule Presence do
  use Phoenix.Presence,
    otp_app: :infolab_light_games,
    pubsub_server: InfolabLightGames.PubSub

  @presence_key "user_presence"

  def key, do: @presence_key

  def track_user(pid, remote_ip) do
    track(pid, @presence_key, inspect(remote_ip), %{
      online_at: NaiveDateTime.to_string(NaiveDateTime.utc_now()),
      remote_ip: remote_ip,
      status: "idle"
    })
  end

  def untrack_user(pid, remote_ip) do
    untrack(pid, @presence_key, remote_ip)
  end

  def update_user_status(pid, remote_ip, status) do
    update(pid, @presence_key, remote_ip, &Map.put(&1, :status, status))
  end
end
