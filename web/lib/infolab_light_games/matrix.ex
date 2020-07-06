defmodule Matrix do
  import ExclusiveRange

  @moduledoc "Matrix like things"

  @type t(of) :: %{required(non_neg_integer()) => %{required(non_neg_integer()) => of}}

  @spec of_dims(non_neg_integer(), non_neg_integer(), of) :: t(of) when of: var
  def of_dims(x, y, init) do
    col = Enum.map(erange(0..y), fn i -> {i, init} end) |> Map.new()
    Enum.map(erange(0..x), fn i -> {i, col} end) |> Map.new()
  end

  @spec of_dims_f(
          non_neg_integer(),
          non_neg_integer(),
          (non_neg_integer(), non_neg_integer() -> of)
        ) :: t(of)
        when of: var
  def of_dims_f(x, y, f) do
    Enum.map(erange(0..x), fn ix ->
      col = Enum.map(erange(0..y), fn iy -> {iy, f.(ix, iy)} end) |> Map.new()
      {ix, col}
    end)
    |> Map.new()
  end

  @spec map(t(of_in), (non_neg_integer(), non_neg_integer(), of_in -> of_out)) :: t(of_out)
        when of_in: var, of_out: var
  def map(m, f) do
    m
    |> Enum.map(fn {x, col} ->
      col = col |> Enum.map(fn {y, val} -> {y, f.(x, y, val)} end) |> Map.new()
      {x, col}
    end)
    |> Map.new()
  end

  @spec diff(t(of), t(of)) :: [%{x: non_neg_integer(), y: non_neg_integer(), new: of}]
        when of: var
  def diff(a, b) do
    Enum.reduce(a, [], fn {x, col}, acc -> diff_inner(x, col, b[x], acc) end)
  end

  @spec reduce(t(of), acc, (non_neg_integer(), non_neg_integer(), of, acc -> acc)) :: acc
        when of: var, acc: var
  def reduce(m, i, f) do
    for {x, col} <- m,
        {y, val} <- col,
        reduce: i do
      acc -> f.(x, y, val, acc)
    end
  end

  @spec draw_at(t(of), non_neg_integer(), non_neg_integer(), of) :: t(of) when of: var
  def draw_at(screen, x, y, val) do
    put_in(screen[x][y], val)
  end

  @spec draw_rect(
          t(of),
          {non_neg_integer(), non_neg_integer()},
          {non_neg_integer(), non_neg_integer()},
          of
        ) :: t(of)
        when of: var
  def draw_rect(screen, {x0, y0} = _top_left, {x1, y1} = _bottom_right, val) do
    for x <- erange(x0..x1),
        y <- erange(y0..y1),
        reduce: screen do
      screen -> draw_at(screen, x, y, val)
    end
  end

  defp diff_inner(x, a, b, acc) do
    Enum.reduce(a, acc, fn {y, val}, acc ->
      val2 = b[y]
      if val != val2, do: [%{x: x, y: y, new: val2} | acc], else: acc
    end)
  end
end
