defmodule Matrix do
  def of_dims(x, y, init) do
    col = Enum.map(0..y-1, fn i -> {i, init} end) |> Map.new()
    Enum.map(0..x-1, fn i -> {i, col} end) |> Map.new()
  end

  def diff(a, b) do
    Enum.reduce(a, [], fn {x, col}, acc -> diff_inner(x, col, b[x], acc) end)
  end

  defp diff_inner(x, a, b, acc) do
    Enum.reduce(a, acc, fn {y, val}, acc ->
      val2 = b[y]
      if val != val2, do: [%{x: x, y: y, old: val, new: val2} | acc], else: acc
    end)
  end
end
