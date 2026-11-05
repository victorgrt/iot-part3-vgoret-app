import * as THREE from 'three';
import { BASIC_SETUP, VISUAL_CONTROLS, colorWithIntensity } from './config.js';

export function createPlanetMoons(scene, camera, planet) {
    const config = VISUAL_CONTROLS.moons;
    const moons = [];
    const bodyMaterial = new THREE.ShaderMaterial({
        uniforms: {
            moonColor: {
                value: new THREE.Color(config.color).multiplyScalar(config.intensity)
            },
            noiseScale: { value: config.surfaceNoise.scale },
            noiseIntensity: { value: config.surfaceNoise.intensity },
            noiseOffset: { value: new THREE.Vector3() }
        },
        vertexShader: `
            varying vec3 vPosition;
            varying vec3 vNormal;

            void main() {
                vPosition = position;
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 moonColor;
            uniform float noiseScale;
            uniform float noiseIntensity;
            uniform vec3 noiseOffset;

            varying vec3 vPosition;
            varying vec3 vNormal;

            float hash(vec3 point) {
                return fract(
                    sin(dot(point, vec3(127.1, 311.7, 74.7))) * 43758.5453
                );
            }

            float noise(vec3 point) {
                vec3 cell = floor(point);
                vec3 fraction = fract(point);
                fraction = fraction * fraction * (3.0 - 2.0 * fraction);

                float lower = mix(
                    mix(hash(cell), hash(cell + vec3(1.0, 0.0, 0.0)), fraction.x),
                    mix(hash(cell + vec3(0.0, 1.0, 0.0)), hash(cell + vec3(1.0, 1.0, 0.0)), fraction.x),
                    fraction.y
                );
                float upper = mix(
                    mix(hash(cell + vec3(0.0, 0.0, 1.0)), hash(cell + vec3(1.0, 0.0, 1.0)), fraction.x),
                    mix(hash(cell + vec3(0.0, 1.0, 1.0)), hash(cell + vec3(1.0, 1.0, 1.0)), fraction.x),
                    fraction.y
                );

                return mix(lower, upper, fraction.z);
            }

            void main() {
                float surfaceNoise = noise(vPosition * noiseScale + noiseOffset);
                float textureAmount = mix(
                    1.0 - noiseIntensity,
                    1.0 + noiseIntensity,
                    surfaceNoise
                );
                float lighting = 0.35 + 0.65 * max(
                    dot(normalize(vNormal), normalize(vec3(0.4, 0.6, 1.0))),
                    0.0
                );

                gl_FragColor = vec4(moonColor * textureAmount * lighting, 1.0);
            }
        `,
        toneMapped: false
    });

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

    const normalY = Math.random() * 2 - 1;
    const normalAngle = Math.random() * Math.PI * 2;
    const normalRadius = Math.sqrt(1 - normalY * normalY);
    const formationNormal = new THREE.Vector3(
        normalRadius * Math.cos(normalAngle),
        normalY,
        normalRadius * Math.sin(normalAngle)
    );
    const formationRotation = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        formationNormal
    );
    const formationOffset = Math.random() * Math.PI * 2;
    const radialSpread = Math.max(
        config.orbitRadiusVariation * 2,
        0.001 * Math.max(config.count - 1, 1)
    );
    const innerRadius = Math.max(
        0.001,
        config.orbitRadius - config.orbitRadiusVariation
    );
    const radialDistances = Array.from(
        { length: config.count },
        (_, index) => innerRadius + (index / Math.max(config.count - 1, 1)) * radialSpread
    );

    for (let i = radialDistances.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [radialDistances[i], radialDistances[randomIndex]] = [
            radialDistances[randomIndex],
            radialDistances[i]
        ];
    }

    if (config.count > 1 && config.minimumDistance > 0) {
        let closestDistance = Infinity;

        for (let i = 0; i < config.count; i++) {
            for (let j = i + 1; j < config.count; j++) {
                const angleI = (i / config.count) * Math.PI * 2;
                const angleJ = (j / config.count) * Math.PI * 2;
                const xI = radialDistances[i] * Math.cos(angleI);
                const zI = radialDistances[i] * Math.sin(angleI);
                const xJ = radialDistances[j] * Math.cos(angleJ);
                const zJ = radialDistances[j] * Math.sin(angleJ);

                closestDistance = Math.min(
                    closestDistance,
                    Math.hypot(xI - xJ, zI - zJ)
                );
            }
        }

        if (closestDistance < config.minimumDistance) {
            const scale = config.minimumDistance / closestDistance;
            radialDistances.forEach((distance, index) => {
                radialDistances[index] = distance * scale;
            });
        }
    }

    for (let i = 0; i < config.count; i++) {
        const angle = formationOffset + (i / config.count) * Math.PI * 2;
        const direction = new THREE.Vector3(
            Math.cos(angle),
            0,
            Math.sin(angle)
        ).applyQuaternion(formationRotation);
        const moon = new THREE.Group();
        const moonBodyMaterial = bodyMaterial.clone();
        moonBodyMaterial.uniforms.noiseOffset.value.set(
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100
        );
        const body = new THREE.Mesh(bodyGeometry, moonBodyMaterial);
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
            planet.position.x + direction.x * radialDistances[i],
            planet.position.y + config.orbitHeight + direction.y * radialDistances[i],
            planet.position.z + direction.z * radialDistances[i]
        );
        scene.add(moon);

        moons.push({
            moon,
            rim,
            glow,
            basePosition: moon.position.clone(),
            phase: angle - formationOffset
        });
    }

    function update(time, rotationsPaused = false) {
        moons.forEach(({ moon, rim, glow, basePosition, phase }) => {
            if (!rotationsPaused) {
                rim.lookAt(camera.position);
            }

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
                basePosition.y + Math.sin(time * config.floatSpeed) * config.floatHeight;
        });
    }

    return { update, moons };
}
