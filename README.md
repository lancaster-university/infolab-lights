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
| [@Brumus14](https://github.com/Brumus14) | [Mandelbrot](web/priv/js_effects/Mandelbrot.js)             | Mandelbrot set effect                                                                                            |
| [@Brumus14](https://github.com/Brumus14) | [Falling Sand](web/priv/js_effects/Sand.js)             | Falling sand set effect                                                                                            |
| [@IMB11](https://github.com/IMB11) | [Patches](web/priv/js_effects/patches.js)             |  Patches effect - kinda like the bubbles screensaver on windows vista!                                                                                            |
| [@Orlando-PB](https://github.com/Orlando-PB) | [Planets](web/priv/js_effects/planets.js)             |  Planets Effect - uses known orbital periods and locations to estimate and display planet positions over a 100 year period, pausing on the positions from the current date.                                                                                            |
| [@Orlando-PB](https://github.com/Orlando-PB) | [Sorting](web/priv/js_effects/sorting.js)             |  Displays several sorting algorithms ~~with a 1/100 chance of bogoSort~~ |
| [@Tom0267](https://github.com/Tom0267) | [Flowers](web/priv/js_effects/flowers.js)             |  The Lancashire red rose!   |
| [@mavi0](https://github.com/mavi0) | [Binary Clock](web/priv/js_effects/binaryClock.js)             |  The time but harder to read ⏰    |
| [@Tom0267](https://github.com/Tom0267) | [Shapes](web/priv/js_effects/Shapes.js)             |  Randomly generated shapes.   |
| [@pengzxD](https://github.com/pengzxD) | [Rainbow Donut](web/priv/js_effects/RainbowDonut.js)             |  A classic donut animation with added 🏳️‍🌈✨   |
| [@etmuzzr](https://github.com/etmuzzr) | [boids](web/priv/js_effects/boids.js)             |  Sparkley colourful boids!   |
| [@moolordking](https://github.com/moolordking) | [LavaLamp](web/priv/js_effects/LavaLamp.js)             |  Gentle moving shapes, akin to a Lava Lamp.   |
| [@calmKyle](https://github.com/calmKyle)                   | [Heap Sort Visualiser](web/priv/js_effects/heapSortVisualiser.js)          |  Heap sort algorithms visualiser                                                                                             |
| [@calmKyle](https://github.com/calmKyle)                   | [Gossip Distribution Visualiser](web/priv/js_effects/gossipNetworkVisualiser.js)          |  Gossip Distribution visualiser                                                                                             |

## Image Overrides 

Open a pull request with an edit to [web/config/config.exs](https://github.com/lancaster-university/infolab-lights/blob/master/web/config/config.exs) to add an override for your needs, and place the image in `.png` format (or animated `.gif`) in `/web/priv/`. 

Can't code? No problem, open an [issue](https://github.com/lancaster-university/infolab-lights/issues) and a maintainer will help you. 

### Current Override Schedule:

| Override          |  Schedule   |
| ----------------- | ----------- |
| Pride Month       | June Yearly        |
| Halloween         | 31st October Yearly        |
| Bonfire Night     | 5th November Yearly        |
| LU LGBT+ Society  | Tuesday Evening    17:00 - 20:00 |
| LU Hack Society   | Friday Evening    17:00 - 19:00 |
| Baby Loss Awareness Week (dates varies yearly) | Week 09/10/24 - 15/10/24 |
| St Andrews Day    | 30th November Yearly |
| St Davids Day     | 1st March Yearly     |
| Europe Day        | 9th May Yearly     |
| Holocaust Awareness Week (dates vary yearly) | Week 23/01/24 - 28/01/24 |
| Ukraine Flag      | 23 - 24 Feb |
