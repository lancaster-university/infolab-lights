defmodule Matrix do
  def of_dims(x, y, init) do
    col = Enum.map(0..(y - 1), fn i -> {i, init} end) |> Map.new()
    Enum.map(0..(x - 1), fn i -> {i, col} end) |> Map.new()
  end

  def diff(a, b) do
    Enum.reduce(a, [], fn {x, col}, acc -> diff_inner(x, col, b[x], acc) end)
  end

  def draw_at(screen, x, y, col) do
    put_in(screen[x][y], col)
  end

  def draw_rect(screen, {x0, y0} = _top_left, {x1, y1} = _bottom_right, col) do
    for x <- x0..(x1 - 1),
        y <- y0..(y1 - 1),
        reduce: screen do
      screen -> draw_at(screen, x, y, col)
    end
  end

  defp diff_inner(x, a, b, acc) do
    Enum.reduce(a, acc, fn {y, val}, acc ->
      val2 = b[y]
      if val != val2, do: [%{x: x, y: y, old: val, new: val2} | acc], else: acc
    end)
  end
end
