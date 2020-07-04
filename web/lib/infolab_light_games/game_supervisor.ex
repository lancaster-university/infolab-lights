defmodule GameSupervisor do
  use Supervisor

  def start_link(init_args) do
    Supervisor.start_link(__MODULE__, init_args, name: __MODULE__)
  end

  @impl true
  def init(_init_args) do
    children = [
      {Registry, keys: :unique, name: GameRegistry},
      {DynamicSupervisor, strategy: :one_for_one, name: GameManager}
    ]

    Supervisor.init(children, strategy: :one_for_all)
  end
end
