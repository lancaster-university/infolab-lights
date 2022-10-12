defmodule IdleAnimations.IdleAnimation do
  @doc """
  Get a list of animations
  """
  @callback possible_modes :: [{any(), binary()}]
end
