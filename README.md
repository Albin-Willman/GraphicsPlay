# Graphics play

This is just a playground where I collect snippets of CSS and JS that I like.

It can be stuff that I have written or stuff that I have found on the internet and want to understand better. It might be compatible with all browsers or only compatible with future or past browsers.

## What's here

- **Animations** (`animations.html`): rotating icons and a flip card, in pure CSS.
- **3D** (`three-d.html`): a rotating CSS cube and a draggable sphere built from CSS-transformed panels.
- **Physics** (`physics.html`): a small 2D particle engine drawn with SVG, with live controls for the forces, the world's shape and size, the edge behaviour, collisions, the ball colours and the number of particles. It works with a mouse or a touch screen (with on-screen arrow keys). Press and hold in the world to place a gravity point (hold longer for a stronger pull); they are listed in the panel, where each can be switched between gravity and a rubber band, have its strength changed (negative gravity repels), be hidden or be deleted.

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
- `shapes.js`: non-rectangular worlds (circle, ellipse): containment, distance to the wall and the outline.
- `collisions.js`: particle-particle collisions, with a grid so only nearby particles are tested.
- `colors.js`: ball colouring (random, solid, or blended by size, speed or height).
- `gravity-points.js`: gravity (or rubber band) points placed by pressing and holding in the world, and their list.
- `particle.js`, `particle-factory.js`, `world.js`: the simulation and SVG drawing.
- `physics.js`: wires a world together from an options object (also runs the navbar logo).
- `controls.js`: the control panel on the physics page.

## Deploying

The site is static and lives at the repo root, so GitHub Pages can serve it directly
(Settings → Pages → Deploy from a branch → `master`, `/ (root)`).
