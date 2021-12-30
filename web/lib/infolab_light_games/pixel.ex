defmodule Pixel do
  use TypedStruct

  @derive Jason.Encoder
  @derive [{Msgpax.Packer, fields: [:r, :g, :b]}]

  typedstruct do
    field :r, non_neg_integer(), default: 0
    field :g, non_neg_integer(), default: 0
    field :b, non_neg_integer(), default: 0
  end

  def empty do
    %Pixel{}
  end

  def white do
    %Pixel{r: 255, g: 255, b: 255}
  end

  def red do
    %Pixel{r: 255, g: 0, b: 0}
  end

  def blue do
    %Pixel{r: 0, g: 0, b: 255}
  end

  def green do
    %Pixel{r: 0, g: 255, b: 0}
  end

  def magenta do
    %Pixel{r: 255, g: 0, b: 255}
  end

  def cyan do
    %Pixel{r: 0, g: 255, b: 255}
  end

  def scale(%Pixel{r: r, g: g, b: b}, pct) do
    %Pixel{r: floor(r * pct), g: floor(g * pct), b: floor(b * pct)}
  end

  def render_rgb(%Pixel{r: r, g: g, b: b}) do
    "rgb(#{r}, #{g}, #{b})"
  end

  def from_hex(hex) do
    {:ok, col} = Tint.RGB.from_hex(hex)
    %Pixel{r: col.red, g: col.green, b: col.blue}
  end

  def as_tuple(%Pixel{r: r, g: g, b: b}), do: {r, g, b}
end
