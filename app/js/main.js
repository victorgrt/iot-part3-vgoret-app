import * as THREE from 'three';
import { BASIC_SETUP, VISUAL_CONTROLS } from './config.js';
import { createScene } from './scene.js';
import { createHiraganaField } from './hiragana-field.js';
import { createShootingStars } from './shooting-stars.js';
import { createPlanet } from './planet.js';
import { createPlanetMoons } from './planet-moons.js';
import { createKeyboardHandling } from './keyboard-handling.js';
import { createScenePanel } from './scene-panel.js';

const { scene, camera, renderer, controls, composer, backgroundPass } = createScene();

const shootingStars = createShootingStars(scene);
const planetController = createPlanet(scene);
const { planet, material: planetMaterial } = planetController;
let moons = createPlanetMoons(scene, camera, planet);
let moonsVisible = true;
const keyboard = createKeyboardHandling(camera, controls);
const clock = new THREE.Clock();
let hiraganaField = createHiraganaField();
scene.add(hiraganaField);
let hiraganaVisible = true;

const controlHint = document.querySelector('.control-hint');
const hideControlHintButton = controlHint?.querySelector('.control-hint__button');
const expandControlHintButton = document.querySelector('.control-hint-expand');
const scenePanel = document.querySelector('.scene-panel');
const hideScenePanelButton = scenePanel?.querySelector('.scene-panel__toggle');
const showScenePanelButton = document.querySelector('.scene-panel-expand');
const scenePanelControls = document.querySelector('#scene-panel-controls');

if (
    !controlHint ||
    !hideControlHintButton ||
    !expandControlHintButton ||
    !scenePanel ||
    !hideScenePanelButton ||
    !showScenePanelButton ||
    !scenePanelControls
) {
    throw new Error('Missing scene controls elements');
}

hideControlHintButton.addEventListener('click', () => {
    controlHint.hidden = true;
    expandControlHintButton.hidden = false;
    expandControlHintButton.focus();
});

expandControlHintButton.addEventListener('click', () => {
    controlHint.hidden = false;
    expandControlHintButton.hidden = true;
    hideControlHintButton.focus();
});

hideScenePanelButton.addEventListener('click', () => {
    scenePanel.hidden = true;
    showScenePanelButton.hidden = false;
    showScenePanelButton.focus();
});

showScenePanelButton.addEventListener('click', () => {
    scenePanel.hidden = false;
    showScenePanelButton.hidden = true;
    hideScenePanelButton.focus();
});

function replaceHiraganaField() {
    const previousField = hiraganaField;
    const previousRotation = previousField.rotation.clone();
    scene.remove(previousField);
    previousField.geometry.dispose();
    previousField.material.uniforms.hiraganaAtlas.value.dispose();
    previousField.material.dispose();

    hiraganaField = createHiraganaField();
    hiraganaField.rotation.copy(previousRotation);
    hiraganaField.visible = hiraganaVisible;
    scene.add(hiraganaField);
}

function replaceMoons() {
    moons.dispose();
    moons = createPlanetMoons(scene, camera, planet);
    moons.moons.forEach(({ moon }) => {
        moon.visible = moonsVisible;
    });
}

createScenePanel(
    scenePanelControls,
    (group, control) => {
        if (group === 'planet') {
            planetController.update();
            if (
                control.target === VISUAL_CONTROLS.planet.surface &&
                (control.key === 'size' || control.key === 'position')
            ) {
                replaceMoons();
            }
        } else if (group === 'moons') {
            if (
                control.target === VISUAL_CONTROLS.moons &&
                ['count', 'orbitRadius', 'orbitRadiusVariation', 'minimumDistance', 'orbitHeight'].includes(control.key)
            ) {
                replaceMoons();
            } else {
                moons.updateSettings();
            }
        } else if (group === 'shootingStars') {
            shootingStars.updateSettings(control);
        } else if (group === 'hiragana') {
            if (
                control.target === VISUAL_CONTROLS.hiragana.appearance &&
                ['color', 'intensity', 'glowIntensity'].includes(control.key)
            ) {
                if (control.key === 'color') {
                    const color = VISUAL_CONTROLS.hiragana.appearance.color;
                    hiraganaField.material.uniforms.hiraganaColor.value.set(
                        ((color >> 16) & 0xff) / 255,
                        ((color >> 8) & 0xff) / 255,
                        (color & 0xff) / 255
                    );
                } else {
                    hiraganaField.material.uniforms[control.key].value =
                        VISUAL_CONTROLS.hiragana.appearance[control.key];
                }
            } else if (!(control.target === BASIC_SETUP.hiragana && control.key === 'rotationSpeed')) {
                replaceHiraganaField();
            }
        }
    },
    (group, visible) => {
        if (group === 'planet') {
            planetController.setVisible(visible);
        } else if (group === 'moons') {
            moonsVisible = visible;
            moons.moons.forEach(({ moon }) => {
                moon.visible = visible;
            });
        } else if (group === 'shootingStars') {
            shootingStars.setVisible(visible);
        } else if (group === 'hiragana') {
            hiraganaVisible = visible;
            hiraganaField.visible = visible;
        }
    }
);

function animate() {
    requestAnimationFrame(animate);

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
    if (!keyboard.rotationsPaused) {
        const motionSpeed = VISUAL_CONTROLS.motion.speed;
        planet.rotation.y += BASIC_SETUP.planet.rotationSpeed * motionSpeed;
        hiraganaField.rotation.y += BASIC_SETUP.hiragana.rotationSpeed * motionSpeed;
    }
    moons.update(time * VISUAL_CONTROLS.motion.speed, keyboard.rotationsPaused);

    shootingStars.update();

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

animate();


console.log("App started with version:", document.documentElement.getAttribute("data-app-version"));
