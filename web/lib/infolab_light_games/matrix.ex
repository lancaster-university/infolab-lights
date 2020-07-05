defmodule Matrix do
  import ExclusiveRange

  def of_dims(x, y, init) do
    col = Enum.map(erange(0..y), fn i -> {i, init} end) |> Map.new()
    Enum.map(erange(0..x), fn i -> {i, col} end) |> Map.new()
  end

  def diff(a, b) do
    Enum.reduce(a, [], fn {x, col}, acc -> diff_inner(x, col, b[x], acc) end)
  end

  def draw_at(screen, x, y, col) do
    put_in(screen[x][y], col)
  end

  def draw_rect(screen, {x0, y0} = _top_left, {x1, y1} = _bottom_right, col) do
    for x <- erange(x0..x1),
        y <- erange(y0..y1),
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
