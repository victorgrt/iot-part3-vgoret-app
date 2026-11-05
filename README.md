To have access to the app:

python3 -m http.server 8000

The browser app is organized into ES modules under `app/js/`:

- `main.js` connects the scene, objects, and animation loop.
- `config.js` contains setup and visual settings.
- `scene.js` creates the renderer, camera, controls, background, and lights.
- `hiragana-field.js` renders the Hiragana characters.
- `planet.js`, `shooting-stars.js`, and `planet-moons.js` create and animate their respective scene objects.
- `keyboard-handling.js` adds smooth arrow-key camera controls.
