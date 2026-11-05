import * as THREE from 'three';
import { BASIC_SETUP, VISUAL_CONTROLS, colorWithIntensity } from './config.js';

export function createPlanetMoons(scene, camera, planet) {
    const config = VISUAL_CONTROLS.moons;
    const moons = [];

    const bodyGeometry = new THREE.SphereGeometry(
        config.size,
        BASIC_SETUP.geometry.sphereSegments,
        BASIC_SETUP.geometry.sphereSegments
    );
    const rimGeometry = new THREE.TorusGeometry(
        config.size * 2,
        config.rim.thickness,
        8,
        BASIC_SETUP.geometry.torusSegments
    );
    const glowGeometry = new THREE.SphereGeometry(
        config.size * config.glow.size,
        BASIC_SETUP.geometry.sphereSegments,
        BASIC_SETUP.geometry.sphereSegments
    );

    for (let i = 0; i < config.count; i++) {
        const angle = (i / config.count) * Math.PI * 2;
        const moon = new THREE.Group();
        const body = new THREE.Mesh(
            bodyGeometry,
            new THREE.MeshBasicMaterial({
                color: colorWithIntensity(config.color, config.intensity),
                toneMapped: false
            })
        );
        const rim = new THREE.Mesh(
            rimGeometry,
            new THREE.MeshBasicMaterial({
                color: colorWithIntensity(config.rim.color, config.rim.intensity),
                transparent: true,
                opacity: config.rim.baseOpacity,
                toneMapped: false
            })
        );
        const glow = new THREE.Mesh(
            glowGeometry,
            new THREE.MeshBasicMaterial({
                color: colorWithIntensity(config.glow.color, config.glow.intensity),
                transparent: true,
                opacity: config.glow.baseOpacity,
                depthWrite: false,
                toneMapped: false
            })
        );
        const light = new THREE.PointLight(
            config.light.color,
            config.light.intensity,
            config.light.distance
        );

        rim.rotation.x = Math.PI / 2;
        moon.add(body, rim, glow, light);
        moon.position.set(
            planet.position.x + Math.cos(angle) * config.orbitRadius,
            planet.position.y + config.orbitHeight,
            planet.position.z + Math.sin(angle) * config.orbitRadius
        );
        scene.add(moon);

        moons.push({
            moon,
            rim,
            glow,
            baseY: moon.position.y,
            phase: angle
        });
    }

    function update(time) {
        moons.forEach(({ moon, rim, glow, baseY, phase }) => {
            rim.lookAt(camera.position);

            const rimPulse = Math.sin(time * config.rim.pulseSpeed + phase);
            rim.scale.setScalar(1 + rimPulse * config.rim.pulseAmount);
            rim.material.opacity =
                config.rim.baseOpacity +
                rimPulse * config.rim.pulseAmount * config.rim.baseOpacity;

            const glowPulse = Math.sin(time * config.glow.pulseSpeed + phase);
            glow.scale.setScalar(1 + glowPulse * config.glow.pulseAmount);
            glow.material.opacity =
                config.glow.baseOpacity +
                glowPulse * config.glow.pulseAmount * config.glow.baseOpacity;

            moon.position.y =
                baseY + Math.sin(time * config.floatSpeed + phase) * config.floatHeight;
        });
    }

    return { update, moons };
}
