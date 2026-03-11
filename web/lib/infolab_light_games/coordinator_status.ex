defmodule CoordinatorStatus do
  use TypedStruct

  typedstruct enforce: true do
    field :current_game, GameStatus.t() | none()
    field :current_idle_animation, binary() | none()
    field :queued_idle_animation, {module(), any(), binary()} | none()
    field :queue, [GameStatus.t()]
  end
end
