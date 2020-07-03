defmodule GameStatus do
  use TypedStruct

  typedstruct enforce: true do
    field :id, String.t()
    field :name, String.t()
    field :players, non_neg_integer()
    field :max_players, non_neg_integer()
    field :ready, boolean()
  end
end
