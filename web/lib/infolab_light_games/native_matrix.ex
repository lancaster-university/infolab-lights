defmodule NativeMatrix do
  defmodule NifBridge do
    use Rustler,
      otp_app: :infolab_light_games,
      crate: :matrix

    def of_dims(_width, _height, {_r, _g, _b} = _of), do: :erlang.nif_error(:nif_not_loaded)
    def set_at(_mat, _x, _y, {_r, _g, _b} = _val), do: :erlang.nif_error(:nif_not_loaded)
    def set_from_list(_mat, _vals), do: :erlang.nif_error(:nif_not_loaded)
    def get_at(_mat, _x, _y), do: :erlang.nif_error(:nif_not_loaded)

    def draw_rect_at(_mat, {_x0, _y0} = _top_left, {_x1, _y1} = _bottom_right, _val),
      do: :erlang.nif_error(:nif_not_loaded)

    def diff(_mat, _mat2), do: :erlang.nif_error(:nif_not_loaded)
    def as_pairs(_mat), do: :erlang.nif_error(:nif_not_loaded)
    def mul(_mat, _by), do: :erlang.nif_error(:nif_not_loaded)
    def load_from_image(_binary, _width, _height), do: :erlang.nif_error(:nif_not_loaded)
  end

  @opaque t() :: reference()

  def of_dims(width, height, {_r, _g, _b} = of),
    do: NifBridge.of_dims(width, height, of)

  def of_dims(width, height, %Pixel{r: r, g: g, b: b}),
    do: of_dims(width, height, {r, g, b})

  def set_at(mat, {x, y}, val),
    do: set_at(mat, x, y, val)

  def set_at(mat, x, y, {_r, _g, _b} = val),
    do: NifBridge.set_at(mat, x, y, val)

  def set_at(mat, x, y, %Pixel{r: r, g: g, b: b}),
    do: set_at(mat, x, y, {r, g, b})

  @spec set_from_list(t(), [
          {non_neg_integer(), non_neg_integer(),
           {non_neg_integer(), non_neg_integer(), non_neg_integer()}}
        ]) :: t()
  def set_from_list(mat, vals), do: NifBridge.set_from_list(mat, vals)

  def get_at(mat, x, y) do
    {r, g, b} = NifBridge.get_at(mat, x, y)

    %Pixel{r: r, g: g, b: b}
  end

  def draw_rect_at(mat, {_x0, _y0} = top_left, {_x1, _y1} = bottom_right, {_r, _g, _b} = of),
    do: NifBridge.draw_rect_at(mat, top_left, bottom_right, of)

  def draw_rect_at(mat, {_x0, _y0} = top_left, {_x1, _y1} = bottom_right, %Pixel{r: r, g: g, b: b}),
      do: draw_rect_at(mat, top_left, bottom_right, {r, g, b})

  def diff(mat, mat2) do
    NifBridge.diff(mat, mat2)
    |> Enum.map(fn {x, y, {r, g, b}} ->
      %{x: x, y: y, new: %Pixel{r: r, g: g, b: b}}
    end)
  end

  def full_as_diff(mat) do
    NifBridge.as_pairs(mat)
    |> Enum.map(fn {x, y, {r, g, b}} ->
      %{x: x, y: y, new: %Pixel{r: r, g: g, b: b}}
    end)
  end

  def mul(mat, by), do: NifBridge.mul(mat, by)

  def load_from_image(binary, width, height), do: NifBridge.load_from_image(binary, width, height)
end
