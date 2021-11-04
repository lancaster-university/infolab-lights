# InfolabLightGames

![Rust](https://github.com/lancaster-university/infolab-lights/workflows/Rust/badge.svg)
![Elixir CI](https://github.com/lancaster-university/infolab-lights/workflows/Elixir%20CI/badge.svg)

Welcome to the software that powers the LED light display on the front of the
Infolab.


If you're here to write an effect for the display, have a play around with [The
Playground](https://infolab21-lights.lancs.ac.uk/playground).

When you've written your effect, fork the repo and add the effect as a js file
alongside the others in [web/priv/js_effects/](web/priv/js_effects/), then
submit a PR!

## Rules

If you're submitting an effect, please make sure it follows these rules:

1. Effects must not display explicit/ offensive content.
2. Effects must not fetch external resources.

For obvious reasons, PRs containing effects that violate these restrictions will
be rejected.

# Current effects

| Author                                       | Effect                                      | Description                                     |
|----------------------------------------------|---------------------------------------------|-------------------------------------------------|
| [@simmsb](https://github.com/simmsb)         | [Rainbow](web/priv/js_effects/rainbow.js)   | Just a simple rainbow effect to demo things     |
| [@JohnVidler](https://github.com/JohnVidler) | [Conway](web/priv/js_effects/conway.js)     | The classic Conway's Game of Life sim           |
| [@JohnVidler](https://github.com/JohnVidler) | [Colorway](web/priv/js_effects/colorway.js) | Another Conway's Game of Life sim, with trails! |
