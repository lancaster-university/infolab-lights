defmodule Pixel do
  use TypedStruct

  @derive Jason.Encoder

  typedstruct do
    field :r, non_neg_integer(), default: 0
    field :g, non_neg_integer(), default: 0
    field :b, non_neg_integer(), default: 0
  end

  def empty do
    %Pixel{}
  end
end
