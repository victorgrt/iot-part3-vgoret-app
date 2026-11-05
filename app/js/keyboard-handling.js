import * as THREE from 'three';

const ROTATION_SPEED = 1.5;
const ZOOM_SPEED = 1.2;

export function createKeyboardHandling(camera, controls) {
    const pressedKeys = new Set();
    const spherical = new THREE.Spherical();
    const offset = new THREE.Vector3();
    const rotateEnabled = controls.enableRotate;
    const autoRotateEnabled = controls.autoRotate;
    let rotationsPaused = false;

    function isEditableTarget(target) {
        return target instanceof HTMLElement && (
            target.isContentEditable ||
            target.closest('input, textarea, select, button, a, [contenteditable="true"]')
        );
    }

    function onKeyDown(event) {
        if (isEditableTarget(event.target)) {
            return;
        }

        if (event.code === 'Space') {
            event.preventDefault();

            if (!event.repeat) {
                rotationsPaused = !rotationsPaused;
                controls.enableRotate = rotationsPaused ? false : rotateEnabled;
                controls.autoRotate = rotationsPaused ? false : autoRotateEnabled;
            }

            return;
        }

        if (event.code.startsWith('Arrow')) {
            event.preventDefault();
            pressedKeys.add(event.code);
        }
    }

    function onKeyUp(event) {
        pressedKeys.delete(event.code);
    }

    function clearPressedKeys() {
        pressedKeys.clear();
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearPressedKeys);

    function update(deltaTime) {
        if (pressedKeys.size === 0) {
            return;
        }

        offset.copy(camera.position).sub(controls.target);
        spherical.setFromVector3(offset);

        if (pressedKeys.has('ArrowUp')) {
            spherical.radius *= Math.exp(-ZOOM_SPEED * deltaTime);
        }
        if (pressedKeys.has('ArrowDown')) {
            spherical.radius *= Math.exp(ZOOM_SPEED * deltaTime);
        }

        if (!rotationsPaused && pressedKeys.has('ArrowLeft')) {
            spherical.theta += ROTATION_SPEED * deltaTime;
        }
        if (!rotationsPaused && pressedKeys.has('ArrowRight')) {
            spherical.theta -= ROTATION_SPEED * deltaTime;
        }

        spherical.radius = THREE.MathUtils.clamp(
            spherical.radius,
            controls.minDistance,
            controls.maxDistance
        );

        camera.position.copy(offset.setFromSpherical(spherical).add(controls.target));
    }

    return {
        update,
        get rotationsPaused() {
            return rotationsPaused;
        },
        dispose() {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('blur', clearPressedKeys);
            controls.enableRotate = rotateEnabled;
            controls.autoRotate = autoRotateEnabled;
        }
    };
}
