defmodule MatrixPow do
  use Agent

  def start_link(_opts) do
    Agent.start_link(fn -> 1.0 end, name: __MODULE__)
  end

  def get, do: Agent.get(__MODULE__, & &1)

  def set(value), do: Agent.update(__MODULE__, fn _v -> value end)
end
