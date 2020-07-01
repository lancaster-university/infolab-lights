defmodule Matrix do
  def of_dims(x, y, init) do
    row = Enum.map(0..x, fn i -> {i, init} end) |> Map.new()
    Enum.map(0..y, fn i -> {i, row} end) |> Map.new()
  end

  def diff(a, b) do
    Enum.reduce(a, [], fn {i, row}, acc -> diff_inner(i, row, b[i], acc) end)
  end

  defp diff_inner(x, a, b, acc) do
    Enum.reduce(a, acc, fn {y, val}, acc ->
      val2 = b[y]
      if val != val2, do: [%{x: x, y: y, old: val, new: val2} | acc], else: acc
    end)
  end
end
