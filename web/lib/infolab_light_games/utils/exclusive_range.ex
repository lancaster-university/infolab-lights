defmodule ExclusiveRange do
  @moduledoc "End exclusive ranges"

  def erange(from..to), do: erange(from, to)

  def erange(n, n), do: []
  def erange(from, to) when to < 0, do: from..(to + 1)
  def erange(from, to) when to >= 0, do: from..(to - 1)
end
