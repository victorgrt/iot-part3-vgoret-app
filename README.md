To have access to the app:

python3 -m http.server 8000

The browser app is organized into ES modules under `app/js/`:

- `main.js` connects the scene, objects, and animation loop.
- `config.js` contains setup and visual settings.
- `scene.js` creates the renderer, camera, controls, background, and lights.
- `hiragana-field.js` renders the Hiragana characters.
- `planet.js`, `shooting-stars.js`, and `planet-moons.js` create and animate their respective scene objects.
- `keyboard-handling.js` adds smooth arrow-key camera controls.

## Building and publishing a Docker image

Use `make release VERSION=2.3` (or a three-part version such as `2.3.0`) to
build and push `vgoret/webapp:v2.3`, then update `dev/deployment.yaml` to use
that image. The same version is injected into the built page's
`data-app-version` attribute, which `app/js/main.js` logs on startup.

To only build or push the image, use `make build VERSION=2.3` or
`make push VERSION=2.3`. Set `IMAGE=your-registry/your-image` to override the
default image name.
