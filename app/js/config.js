import * as THREE from 'three';

export const FULL_ROTATION = Math.PI * 2;
export const QUARTER_ROTATION = FULL_ROTATION / 4;

// EDIT THESE FIRST. Colors use 0xRRGGBB; positions use [x, y, z].
// Intensities are brightness multipliers. Sizes and distances use scene units.
export const VISUAL_CONTROLS = {
    planet: {
        surface: {
            color: 0x1a4099,
            intensity: {
                min: 0.05,
                max: 0.35,
                cycleDuration: 8
            },
            size: 6,
            position: [0, 0, 0]
        },
        light: {
            color: 0x80b3ff,
            intensity: 0.6
        },
        border: {
            color: 0x3380ff,
            intensity: 0.5,
            thickness: 0.1 // Lower = wider rim; higher = thinner rim.
        },
        glow: {
            color: 0x3366ff,
            intensity: 1,
            size: 1.01
        }
    },
    shootingStars: {
        count: 4,
        head: {
            color: 0xffffff,
            intensity: 1,
            size: 1,
            glowIntensity: 1
        },
        trail: {
            color: 0xaaddff,
            intensity: 0.5,
            length: 4,
            width: 0.2
        },
        placement: {
            center: [60, 40, -40],
            spread: [20, 15, 15]
        }
    },
    hiragana: {
        count: 5000,
        appearance: {
            color: 0x75caff,
            intensity: 1.4,
            glowIntensity: 1,
            size: 2.5,
            sizeVariation: 1.8
        },
        placement: {
            position: [0, 0, 0],
            innerRadius: 60,
            spread: 1000
        }
    },
    moons: {
        count: 3,
        orbitRadius: 12,
        orbitRadiusVariation: 2,
        minimumDistance: 10,
        orbitHeight: 0,
        size: 0.8,
        color: 0x991a40,
        intensity: 0.3,
        surfaceNoise: {
            scale: 5,
            intensity: 1
        },
        light: {
            color: 0x991a40,
            intensity: 0.5,
            distance: 18
        },
        rim: {
            color: 0x991a40,
            intensity: 1,
            thickness: 0.08,
            baseOpacity: 1,
            pulseSpeed: 3,
            pulseAmount: 0.2
        },
        glow: {
            color: 0x991a40,
            intensity: 0.7,
            size: 1.5,
            baseOpacity: 0.5,
            pulseSpeed: 3,
            pulseAmount: 0.2
        },
        floatHeight: 0.15,
        floatSpeed: 1.2
    },
    background: {
        color: 0x030a20,
        intensity: 1,
        noise: {
            color: 0x1a9973,
            intensity: 0.5,
            scale: 0.5
        },
        sparkles: {
            color: 0x6da9e8,
            density: 1, // Higher values create a finer sparkle grid.
            intensity: 0.14
        }
    }
};

// Less frequently changed rendering and motion settings.
export const BASIC_SETUP = {
    camera: {
        fieldOfView: 60,
        near: 0.1,
        far: 4000,
        position: [75, 75, 100]
    },
    renderer: {
        maxPixelRatio: 2,
        exposure: 1.2
    },
    controls: {
        dampingFactor: 0.05,
        minDistance: 10,
        maxDistance: 1800,
        autoRotate: true,
        autoRotateSpeed: 0.3
    },
    geometry: {
        hiraganaAtlasSize: 1024,
        hiraganaAtlasGrid: 8,
        planetSegments: 128,
        atmosphereSegments: 64,
        torusSegments: 64,
        sphereSegments: 16,
        shootingStarSegments: 8
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
            intensity: 0,
            distance: 80,
            position: [-20, -10, 20]
        }
    },
    shootingStars: {
        rotationZ: -QUARTER_ROTATION,
        minSpeed: 2.5,
        speedRange: 2,
        spawnChance: 0.003,
        resetX: -50,
        resetY: -20
    },
    planet: {
        rotationSpeed: 0.0001,
        specularIntensity: 0.6
    },
    hiragana: {
        minOpacity: 0.3,
        opacityRange: 0.55,
        rotationSpeed: 0.00005
    },
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
