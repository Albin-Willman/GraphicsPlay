# Graphics play

This is just a playground where I collect snippets of CSS and JS that I like.

It can be stuff that I have written or stuff that I have found on the internet and want to understand better. It might be compatible with all browsers or only compatible with future or past browsers.

## What's here

- **Animations** (`animations.html`): rotating icons and a flip card, in pure CSS.
- **3D** (`three-d.html`): a rotating CSS cube and a draggable sphere built from CSS-transformed panels.
- **Physics** (`physics.html`): a small 2D particle engine drawn with SVG, with live controls for the forces, the edge behaviour and the number of particles.

## Running it

It's plain HTML, CSS and JS with no build step. Serve the repo root with any static server, for example:

```sh
python3 -m http.server 8000
```

and open http://localhost:8000.

## Physics engine layout

`js/physics/`:

- `vector.js`: 2D vector maths.
- `force-computers.js`: each force is a direction computer plus a magnitude computer.
- `limits.js`: what happens at the edges (bounce, wrap, none).
- `particle.js`, `particle-factory.js`, `world.js`: the simulation and SVG drawing.
- `physics.js`: wires a world together from an options object (also runs the navbar logo).
- `controls.js`: the control panel on the physics page.

## Deploying

The site is static and lives at the repo root, so GitHub Pages can serve it directly
(Settings → Pages → Deploy from a branch → `master`, `/ (root)`).
