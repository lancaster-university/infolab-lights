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

| Author                                                     | Effect                                                            | Description                                                                                                                  |
|------------------------------------------------------------|-------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| [@simmsb](https://github.com/simmsb)                       | [Rainbow](web/priv/js_effects/rainbow.js)                         | Just a simple rainbow effect to demo things                                                                                  |
| [@JohnVidler](https://github.com/JohnVidler)               | [Conway](web/priv/js_effects/conway.js)                           | The classic Conway's Game of Life sim                                                                                        |
| [@JohnVidler](https://github.com/JohnVidler)               | [Colorway](web/priv/js_effects/colorway.js)                       | Another Conway's Game of Life sim, with trails!                                                                              |
| [@simmsb](https://github.com/simmsb)                       | [Fireworks](web/priv/js_effects/fireworks.js.disabled)            | A fireworks simulation.                                                                                                      |
| [@JohnVidler](https://github.com/JohnVidler)               | [Cheerworks](web/priv/js_effects/cheerworks.js)                   | A web-connected fireworks simulation (cheerlights)                                                                           |
| [@simmsb](https://github.com/simmsb)                       | [Snowman](web/priv/js_effects/snow.ts.disabled)                   | A nice snowman                                                                                                               |
| [@LukesterWad](https://github.com/LukesterWad)             | [Sine Wave](web/priv/js_effects/sine.js)                          | A moving sine wave that changes amplitude and spins.                                                                         |
| [@NinjaMandalorian](https://github.com/NinjaMandalorian)   | [Gradients](web/priv/js_effects/gradients.js)                     | Uses current time values to generate gradients over blue diagonal strips, using trigonometric functions and the date object. |
| [@SuitYourselfGames](https://github.com/SuitYourselfGames) | [A* Visualizer](web/priv/js_effects/A*_Pathfinding_Visualiser.js) | A* algorithm path finding Visualizer                                                                                         |
| [@Eric-zhang-1111](https://github.com/Eric-zhang-1111)     | [Shift](web/priv/js_effects/shift.js)                             | Shift between two colours over time                                                                                          |
| [@mrgwbland](https://github.com/mrgwbland)                 | [Colour changing spiral](web/priv/js_effects/colour_changing_spiral.js) | Spiral works inwards changing colour, when it reaches the end (near centre) it goes back to the start.                 |                                                                                                                                                                        |
| [@james1236](https://github.com/james1236)                 | [Matrix rain](web/priv/js_effects/matrix.js)                      | Matrix style falling rain that gets longer and more frequent with time                                                       |
| [@SuitYourselfGames](https://github.com/SuitYourselfGames) | [Blobs](web/priv/js_effects/Blobs.js) | Some colourful blobs!                                                                                         |
