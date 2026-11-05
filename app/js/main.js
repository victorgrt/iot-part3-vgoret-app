import * as THREE from 'three';
import { BASIC_SETUP, VISUAL_CONTROLS } from './config.js';
import { createScene } from './scene.js';
import { createHiraganaField } from './hiragana-field.js';
import { createShootingStars } from './shooting-stars.js';
import { createPlanet } from './planet.js';
import { createPlanetMoons } from './planet-moons.js';
import { createKeyboardHandling } from './keyboard-handling.js';

const { scene, camera, renderer, controls, composer, backgroundPass } = createScene();

const shootingStars = createShootingStars(scene);
const { planet, material: planetMaterial } = createPlanet(scene);
const moons = createPlanetMoons(scene, camera, planet);
const keyboard = createKeyboardHandling(camera, controls);
const clock = new THREE.Clock();

function animate(hiraganaField) {
    requestAnimationFrame(() => animate(hiraganaField));

    const deltaTime = Math.min(clock.getDelta(), 0.05);
    const time = clock.elapsedTime;
    const intensityCycle = VISUAL_CONTROLS.planet.surface.intensity;
    const cycleProgress =
        (time % intensityCycle.cycleDuration) / intensityCycle.cycleDuration;
    const intensityProgress =
        cycleProgress <= 0.5
            ? cycleProgress * 2
            : (1 - cycleProgress) * 2;

    planetMaterial.uniforms.time.value = time;
    planetMaterial.uniforms.planetIntensity.value =
        intensityCycle.min +
        (intensityCycle.max - intensityCycle.min) * intensityProgress;
    planet.rotation.y += BASIC_SETUP.planet.rotationSpeed;
    hiraganaField.rotation.y += BASIC_SETUP.hiragana.rotationSpeed;
    moons.update(time);

    shootingStars.forEach(star => star.update());

    keyboard.update(deltaTime);
    controls.update();
    composer.render();
}

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);
    backgroundPass.uniforms.resolution.value.set(width, height);
});

function start() {
    const hiraganaField = createHiraganaField();
    scene.add(hiraganaField);
    animate(hiraganaField);
}

start();


console.log("App started with version:", document.documentElement.getAttribute("data-app-version"));
