import * as THREE from 'three';
import { VISUAL_CONFIG } from './config.js';
import { createScene } from './scene.js';
import { createHiraganaField } from './hiraganaField.js';
import { createShootingStars } from './shootingStars.js';
import { createPlanet } from './planet.js';
import { createInteractionMarkers } from './interactionMarkers.js';

const { scene, camera, renderer, controls, composer, backgroundPass } = createScene();

const shootingStars = createShootingStars(scene);
const { planet, material: planetMaterial } = createPlanet(scene);
const markers = createInteractionMarkers(scene, camera);
const clock = new THREE.Clock();

function animate(hiraganaField) {
    requestAnimationFrame(() => animate(hiraganaField));

    const time = clock.getElapsedTime();

    planetMaterial.uniforms.time.value = time;
    planet.rotation.y += VISUAL_CONFIG.planet.rotationSpeed;
    hiraganaField.rotation.y += VISUAL_CONFIG.hiragana.rotationSpeed;
    markers.update(time);

    shootingStars.forEach(star => star.update());

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
