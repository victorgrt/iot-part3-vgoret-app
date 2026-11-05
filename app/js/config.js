import * as THREE from 'three';

// --- BASIC SETUP: camera, performance, and geometry detail ---
export const FULL_ROTATION = Math.PI * 2;
export const QUARTER_ROTATION = FULL_ROTATION / 4;

export const BASIC_SETUP = {
    camera: {
        fieldOfView: 60,
        near: 0.1,
        far: 4000,
        position: [75, 75, 100]
    },
    renderer: {
        maxPixelRatio: 2
    },
    controls: {
        dampingFactor: 0.05,
        minDistance: 10,
        maxDistance: 1800,
        autoRotate: true,
        autoRotateSpeed: 0.6
    },
    geometry: {
        hiraganaAtlasSize: 1024,
        hiraganaAtlasGrid: 8,
        planetSegments: 128,
        atmosphereSegments: 64,
        markerSegments: 64,
        markerSphereSegments: 16,
        shootingStarSegments: 8
    },
    interactionZones: [
        [0, 10, 3],
        [-5, 0, -10],
        [-3, -10, 4]
    ]
};

// --- VISUAL CONTROLS: change these values to restyle the scene ---
// Colors use 0xRRGGBB; intensity values brighten or dim each object.
export const VISUAL_CONFIG = {
    renderer: {
        exposure: 1.2
    },
    background: {
        clearColor: 0x080d25,
        deepBlue: 0x030a20,
        blueAccent: 0x071a3a,
        sparkleColor: 0x6da9e8,
        noiseIntensity: 0.05,
        sparkleIntensity: 0.14
    },
    bloom: {
        strength: 1.5,
        radius: 0.6,
        threshold: 0.05
    },
    lighting: {
        ambient: { color: 0x404060, intensity: 1 },
        sun: { color: 0xffffff, intensity: 2, position: [50, 30, 30] },
        rim: { color: 0x00ffff, intensity: 1, position: [-30, 20, -30] },
        purple: {
            color: 0x8800ff,
            intensity: 0.,
            distance: 80,
            position: [-20, -10, 20]
        }
    },
    hiragana: {
        count: 5000,
        minRadius: 60,
        radiusRange: 1000,
        minSize: 1.8,
        sizeRange: 2.5,
        minOpacity: 0.3,
        opacityRange: 0.55,
        intensity: 2,
        colors: [0x75caff, 0x9b83ff, 0xd18aff, 0xff8ba8, 0xb7dfff],
        rotationSpeed: 0.00005
    },
    shootingStars: {
        count: 4,
        headColor: 0xffffff,
        headIntensity: 1,
        headRadius: 0.15,
        trailColor: 0xaaddff,
        trailIntensity: 1,
        trailOpacity: 0.5,
        trailRadius: 0.2,
        trailLength: 4,
        spawnX: [40, 80],
        spawnY: [25, 55],
        spawnZ: [-55, -25],
        rotationZ: -QUARTER_ROTATION,
        minSpeed: 2.5,
        speedRange: 2,
        spawnChance: 0.003,
        resetX: -50,
        resetY: -20
    },
    planet: {
        radius: 6,
        rotationSpeed: 0.0001,
        intensity: 1,
        deepBlue: 0x0d1a59,
        oceanBlue: 0x1a4099,
        lightBlue: 0x4d80d9,
        white: 0xe6f2ff,
        darkSpot: 0x05051f,
        fresnelColor: 0x3380ff,
        fresnelIntensity: 0.9,
        specularColor: 0x80b3ff,
        specularIntensity: 0.6,
        atmosphereScale: 1.12
    },
    atmosphere: {
        color: 0x3366ff,
        intensity: 1
    },
    markers: {
        ringRadius: 2.5,
        ringTube: 0.08,
        coreRadius: 0.4,
        glowRadius: 0.8,
        color: 0x00ffff,
        ringIntensity: 1,
        coreIntensity: 1,
        glowIntensity: 1,
        floatAmplitude: 0.15,
        floatSpeed: 1.2,
        ringPulseSpeed: 4,
        ringPulseAmplitude: 0.1,
        ringOpacitySpeed: 3,
        ringOpacityAmplitude: 0.1,
        glowPulseSpeed: 5,
        glowPulseAmplitude: 0.2,
        glowOpacitySpeed: 4,
        glowOpacityAmplitude: 0.1,
        ringBaseOpacity: 0.5,
        glowBaseOpacity: 0.2
    }
};

export function shaderColor(hex) {
    return new THREE.Vector3(
        ((hex >> 16) & 0xff) / 255,
        ((hex >> 8) & 0xff) / 255,
        (hex & 0xff) / 255
    );
}

export function colorWithIntensity(hex, intensity) {
    return new THREE.Color(hex).multiplyScalar(intensity);
}
