To have access to the app:

python3 -m http.server 8000

The browser app is organized into ES modules under `app/js/`:

- `main.js` connects the scene, objects, and animation loop.
- `config.js` contains setup and visual settings.
- `scene.js` creates the renderer, camera, controls, background, and lights.
- `hiraganaField.js` renders the Hiragana readings in ASCII romaji.
- `planet.js`, `shootingStars.js`, and `interactionMarkers.js` create and animate their respective scene objects.
