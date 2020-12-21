defmodule Fader do
  use TypedStruct

  typedstruct enforce: true do
    field :total_steps, non_neg_integer()
    field :recip, float()
    field :steps, non_neg_integer(), default: 0
    field :direction, :inc | :dec, default: :inc
  end

  def new(total_steps) do
    %Fader{total_steps: total_steps, recip: 1 / total_steps}
  end

  def step(state) do
    if done(state) do
      state
    else
      %Fader{state | steps: state.steps + delta(state.direction)}
    end
  end

  def percentage(state) do
    state.recip * state.steps
  end

  def apply(pixel, state) do
    Pixel.scale(pixel, percentage(state))
  end

  def done(%Fader{direction: :inc} = state) do
    state.steps == state.total_steps
  end

  def done(%Fader{direction: :dec} = state) do
    state.steps == 0
  end

  @spec delta(:inc | :dec) :: integer()
  defp delta(dir) do
    case dir do
      :inc -> 1
      :dec -> -1
    end
  end
end
