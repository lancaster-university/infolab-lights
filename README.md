# Infolab-Lights

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

## Current effects

| Author                                                     | Effect                                                                  | Description                                                                                                                  |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| [@simmsb](https://github.com/simmsb)                       | [Rainbow](web/priv/js_effects/rainbow.js)                               | Just a simple rainbow effect to demo things                                                                                  |
| [@JohnVidler](https://github.com/JohnVidler)               | [Conway](web/priv/js_effects/conway.js)                                 | The classic Conway's Game of Life sim                                                                                        |
| [@JohnVidler](https://github.com/JohnVidler)               | [Colorway](web/priv/js_effects/colorway.js)                             | Another Conway's Game of Life sim, with trails!                                                                              |
| [@simmsb](https://github.com/simmsb)                       | [Fireworks](web/priv/js_effects/fireworks.js.disabled)                  | A fireworks simulation.                                                                                                      |
| [@JohnVidler](https://github.com/JohnVidler)               | [Cheerworks](web/priv/js_effects/cheerworks.js)                         | A web-connected fireworks simulation (cheerlights)                                                                           |
| [@simmsb](https://github.com/simmsb)                       | [Snowman](web/priv/js_effects/snow.ts.disabled)                         | A nice snowman                                                                                                               |
| [@LukesterWad](https://github.com/LukesterWad)             | [Sine Wave](web/priv/js_effects/sine.js)                                | A moving sine wave that changes amplitude and spins.                                                                         |
| [@NinjaMandalorian](https://github.com/NinjaMandalorian)   | [Gradients](web/priv/js_effects/gradients.js)                           | Uses current time values to generate gradients over blue diagonal strips, using trigonometric functions and the date object. |
| [@SuitYourselfGames](https://github.com/SuitYourselfGames) | [A\* Visualizer](web/priv/js_effects/A*_Pathfinding_Visualiser.js)      | A\* algorithm path finding Visualizer                                                                                        |
| [@Eric-zhang-1111](https://github.com/Eric-zhang-1111)     | [Shift](web/priv/js_effects/shift.js)                                   | Shift between two colours over time                                                                                          |
| [@mrgwbland](https://github.com/mrgwbland)                 | [Colour changing spiral](web/priv/js_effects/colour_changing_spiral.js) | Spiral works inwards changing colour, when it reaches the end (near centre) it goes back to the start.                       | 
| [@james1236](https://github.com/james1236)                 | [Matrix rain](web/priv/js_effects/matrix.js)                            | Matrix style falling rain that gets longer and more frequent with time                                                       |
| [@SuitYourselfGames](https://github.com/SuitYourselfGames) | [Blobs](web/priv/js_effects/Blobs.js)                                   | Some colourful blobs!                                                                                                        |
| [@lcjb360](https://github.com/lcjb360)                     | [Bad Chess](web/priv/js_effects/bad_chess.js)                           | Google en passant                                                                                                            |
| [@james1236](https://github.com/james1236)                 | [Word Game](web/priv/js_effects/word_game.js)                           | Word game animation                                                                                                          |
| [@DOmBuRnAdOwl](https://github.com/DOmBuRnAdOwl)           | [Cellular Automata](web/priv/js_effects/cellularAutomata.js)            | Wolframs rule 30 feeding into Conways Game of Life                                                                           |
| [@moolordking](https://github.com/moolordking)             | [Trigonometric Sinusoidal](web/priv/js_effects/TheStrings.js)           | Trigonometric sinusoidal strings changing colour across the screen.                                                          |
| [@PeanutbutterWarrior](https://github.com/PeanutbutterWarrior) | [DVD Logo Screensaver](web/priv/js_effects/dvd_logo.js)             | The classic DVD Logo Screensaver!                                                                                            |
| [@tomaustn](https://github.com/tomaustn) | [Walkies](web/priv/js_effects/walkies.js)             | A labrador going for a walk, in honour of Coco :)                                                                                            |




## Image Overrides 

Open a pull request with an edit to [web/config/config.exs](https://github.com/lancaster-university/infolab-lights/blob/master/web/config/config.exs) to add an override for your needs, and place the image in `.png` format (or animated `.gif`) in `/web/priv/`. 

Can't code? No problem, open an [issue](https://github.com/lancaster-university/infolab-lights/issues) and a maintainer will help you. 

### Current Override Schedule:

| Override          |  Schedule   |
| ----------------- | ----------- |
| Pride Month       | June Yearly        |
| Halloween         | 31st October Yearly        |
| Bonfire Night     | 5th November Yearly        |
| LU LGBT+ Society  | Monday Evening    17:00 - 20:00 |
| LU Hack Society   | Friday Evening    17:00 - 19:00 |
| Baby Loss Awareness Week (dates varies yearly) | Week 09/10/23 - 15/10/23 |
| St Andrews Day    | 30th November Yearly |
| St Davids Day     | 1st March Yearly     |
| Europe Day        | 9th May Yearly     |
| Holocaust Awareness Week (dates vary yearly) | Week 23/01/24 - 28/01/24 |
| Ukraine Flag      | 23 - 24 Feb |
