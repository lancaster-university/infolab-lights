defmodule GameStatus do
  use TypedStruct

  typedstruct enforce: true do
    field :name, String.t()
    field :players, non_neg_integer()
    field :max_players, non_neg_integer()
  end
end
