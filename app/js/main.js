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
let moons = createPlanetMoons(scene, camera, planet);
const keyboard = createKeyboardHandling(camera, controls);
const clock = new THREE.Clock();
const hiraganaField = createHiraganaField();
scene.add(hiraganaField);

const controlHint = document.querySelector('.control-hint');
const hideControlHintButton = controlHint?.querySelector('.control-hint__button');
const expandControlHintButton = document.querySelector('.control-hint-expand');
const scenePanel = document.querySelector('.scene-panel');
const hideScenePanelButton = scenePanel?.querySelector('.scene-panel__toggle');
const showScenePanelButton = document.querySelector('.scene-panel-expand');

if (
    !controlHint ||
    !hideControlHintButton ||
    !expandControlHintButton ||
    !scenePanel ||
    !hideScenePanelButton ||
    !showScenePanelButton
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

function bindColorControl(name, initialValue, onChange) {
    const input = scenePanel.querySelector(`[data-scene-control="${name}"]`);

    if (!(input instanceof HTMLInputElement)) {
        throw new Error(`Missing scene color control: ${name}`);
    }

    input.value = `#${initialValue.toString(16).padStart(6, '0')}`;
    input.addEventListener('input', () => {
        onChange(Number.parseInt(input.value.slice(1), 16));
    });
}

function bindRangeControl(name, initialValue, onChange, formatValue = value => value.toFixed(2)) {
    const input = scenePanel.querySelector(`[data-scene-control="${name}"]`);
    const output = scenePanel.querySelector(`[data-scene-output="${name}"]`);

    if (!(input instanceof HTMLInputElement) || !(output instanceof HTMLOutputElement)) {
        throw new Error(`Missing scene range control: ${name}`);
    }

    const update = () => {
        const value = Number(input.value);
        output.value = formatValue(value);
        onChange(value);
    };

    input.value = String(initialValue);
    update();
    input.addEventListener('input', update);
}

bindColorControl('planet-color', VISUAL_CONTROLS.planet.surface.color, color => {
    planetMaterial.uniforms.planetColor.value.set(
        ((color >> 16) & 0xff) / 255,
        ((color >> 8) & 0xff) / 255,
        (color & 0xff) / 255
    );
});
bindColorControl('moon-color', VISUAL_CONTROLS.moons.color, color => {
    moons.setColor(color);
});
bindColorControl('field-color', VISUAL_CONTROLS.hiragana.appearance.color, color => {
    hiraganaField.material.uniforms.hiraganaColor.value.set(
        ((color >> 16) & 0xff) / 255,
        ((color >> 8) & 0xff) / 255,
        (color & 0xff) / 255
    );
});
bindColorControl(
    'shooting-star-color',
    VISUAL_CONTROLS.shootingStars.head.color,
    color => shootingStars.setColor(color)
);

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

function start() {
    bindRangeControl('planet-light', VISUAL_CONTROLS.planet.light.intensity, value => {
        VISUAL_CONTROLS.planet.light.intensity = value;
        planetMaterial.uniforms.lightIntensity.value = value;
    });
    bindRangeControl('moon-light', VISUAL_CONTROLS.moons.light.intensity, value => {
        moons.setLightIntensity(value);
    });
    bindRangeControl('moon-count', VISUAL_CONTROLS.moons.count, value => {
        if (value === VISUAL_CONTROLS.moons.count && moons.moons.length === value) {
            return;
        }

        VISUAL_CONTROLS.moons.count = value;
        moons.dispose();
        moons = createPlanetMoons(scene, camera, planet);
    }, value => String(value));
    bindRangeControl('motion-speed', VISUAL_CONTROLS.motion.speed, value => {
        VISUAL_CONTROLS.motion.speed = value;
    }, value => `${value.toFixed(2)}×`);
    animate(hiraganaField);
}

start();


console.log("App started with version:", document.documentElement.getAttribute("data-app-version"));
