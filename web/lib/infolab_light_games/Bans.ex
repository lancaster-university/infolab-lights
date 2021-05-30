defmodule Bans do
  use Agent

  def start_link(_opts) do
    Agent.start_link(fn -> MapSet.new() end, name: __MODULE__)
  end

  @doc """
  Get the set of banned IPs
  """
  @spec bans :: MapSet.t(:inet.ip_address())
  def bans do
    Agent.get(__MODULE__, & &1)
  end

  @doc """
  Is an IP banned?
  """
  @spec is_banned?(:inet.ip_address()) :: boolean()
  def is_banned?(ip) do
    Agent.get(__MODULE__, & MapSet.member?(&1, ip))
  end

  @doc """
  Ban an IP
  """
  @spec add_ban(:inet.ip_address()) :: :ok
  def add_ban(ip) do
    Phoenix.PubSub.broadcast!(InfolabLightGames.PubSub, "bans", {:banned, ip})
    Agent.update(__MODULE__, & MapSet.put(&1, ip))
  end
end
