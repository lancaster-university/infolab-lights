defmodule Presence do
  use Phoenix.Presence,
    otp_app: :infolab_light_games,
    pubsub_server: InfolabLightGames.PubSub
  require Logger

  @presence_topic "user_presence"

  def topic, do: @presence_topic

  @spec track_user(pid(), :inet.ip_address()) :: any()
  def track_user(pid, remote_ip) do
    Logger.info("tracking status of #{inspect(pid)}/#{inspect(remote_ip)}")
    track(pid, @presence_topic, inspect(remote_ip), %{
      online_at: NaiveDateTime.to_string(NaiveDateTime.utc_now()),
      remote_ip: remote_ip,
      status: "idle"
    })
  end

  @spec untrack_user(pid(), :inet.ip_address()) :: any()
  def untrack_user(pid, remote_ip) do
    Logger.info("untracking #{inspect(pid)}/#{inspect(remote_ip)}")
    untrack(pid, @presence_topic, inspect(remote_ip))
  end

  @spec update_user_status(pid(), :inet.ip_address(), String.t()) :: any()
  def update_user_status(pid, remote_ip, status) do
    Logger.info("setting status of #{inspect(pid)}/#{inspect(remote_ip)} to #{status}")
    update(pid, @presence_topic, inspect(remote_ip), &Map.put(&1, :status, status))
  end
end
