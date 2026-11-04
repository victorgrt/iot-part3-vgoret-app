
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- CONFIGURATION ---
const FULL_ROTATION = Math.PI * 2;
const QUARTER_ROTATION = FULL_ROTATION / 4;

const CONFIG = {
    colors: {
        background: 0x000510,
        ambientLight: 0x404060,
        sunLight: 0xffffff,
        rimLight: 0x00ffff,
        nebula: 0x4466aa,
        purpleLight: 0x8800ff
    },
    camera: {
        fieldOfView: 60,
        near: 0.1,
        far: 1000,
        position: [75, 75, 100]
    },
    renderer: {
        maxPixelRatio: 2,
        exposure: 1.2
    },
    controls: {
        dampingFactor: 0.05,
        minDistance: 10,
        maxDistance: 100,
        autoRotateSpeed: 0.6
    },
    bloom: {
        strength: 1.5,
        radius: 0.5,
        threshold: 0.1
    },
    lighting: {
        ambientIntensity: 1,
        sunIntensity: 2,
        sunPosition: [50, 30, 30],
        rimIntensity: 1,
        rimPosition: [-30, 20, -30],
        purpleIntensity: 0.5,
        purpleDistance: 80,
        purplePosition: [-20, -10, 20]
    },
    stars: {
        count: 2000,
        minRadius: 50,
        radiusRange: 100,
        minSize: 0.5,
        sizeRange: 2,
        materialSize: 0.3,
        opacity: 0.8,
        rotationSpeed: 0.00005
    },
    shootingStars: {
        count: 4,
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
    nebula: {
        count: 800,
        minRadius: 60,
        radiusRange: 50,
        pointSize: 4,
        opacity: 0.25,
        rotationSpeed: 0.00002
    },
    planet: {
        radius: 6,
        segments: 128,
        rotationSpeed: 0.0001,
        atmosphereScale: 1.12,
        atmosphereSegments: 64
    },
    markers: {
        ringRadius: 2.5,
        ringTube: 0.08,
        ringOpacity: 0.8,
        coreRadius: 0.4,
        glowRadius: 0.8,
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

// --- SETUP ---
const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(CONFIG.colors.background);

const camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fieldOfView,
    window.innerWidth / window.innerHeight,
    CONFIG.camera.near,
    CONFIG.camera.far
);

camera.position.set(...CONFIG.camera.position);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, CONFIG.renderer.maxPixelRatio)
);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = CONFIG.renderer.exposure;

container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = CONFIG.controls.dampingFactor;
controls.minDistance = CONFIG.controls.minDistance;
controls.maxDistance = CONFIG.controls.maxDistance;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = CONFIG.controls.autoRotateSpeed;

// --- POST PROCESSING (BLOOM) ---
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    CONFIG.bloom.strength,
    CONFIG.bloom.radius,
    CONFIG.bloom.threshold
);

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(
    CONFIG.colors.ambientLight,
    CONFIG.lighting.ambientIntensity
);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(
    CONFIG.colors.sunLight,
    CONFIG.lighting.sunIntensity
);
sunLight.position.set(...CONFIG.lighting.sunPosition);
scene.add(sunLight);

const rimLight = new THREE.DirectionalLight(
    CONFIG.colors.rimLight,
    CONFIG.lighting.rimIntensity
);
rimLight.position.set(...CONFIG.lighting.rimPosition);
scene.add(rimLight);

const purpleLight = new THREE.PointLight(
    CONFIG.colors.purpleLight,
    CONFIG.lighting.purpleIntensity,
    CONFIG.lighting.purpleDistance
);
purpleLight.position.set(...CONFIG.lighting.purplePosition);
scene.add(purpleLight);

// --- BACKGROUND STARS ---
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = CONFIG.stars.count;

    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        const radius = CONFIG.stars.minRadius + Math.random() * CONFIG.stars.radiusRange;
        const theta = Math.random() * FULL_ROTATION;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        const colorChoice = Math.random();

        if (colorChoice > 0.9) {
            colors[i3] = 1;
            colors[i3 + 1] = 0.7;
            colors[i3 + 2] = 0.4;
        } else if (colorChoice > 0.7) {
            colors[i3] = 0.4;
            colors[i3 + 1] = 0.8;
            colors[i3 + 2] = 1;
        } else {
            colors[i3] = 1;
            colors[i3 + 1] = 1;
            colors[i3 + 2] = 1;
        }

        sizes[i] = Math.random() * CONFIG.stars.sizeRange + CONFIG.stars.minSize;
    }

    starsGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    );
    starsGeometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
    );
    starsGeometry.setAttribute(
        'size',
        new THREE.BufferAttribute(sizes, 1)
    );

    const starsMaterial = new THREE.PointsMaterial({
        size: CONFIG.stars.materialSize,
        vertexColors: true,
        transparent: true,
        opacity: CONFIG.stars.opacity,
        sizeAttenuation: true
    });

    return new THREE.Points(starsGeometry, starsMaterial);
}

const starfield = createStarfield();
scene.add(starfield);

// --- SHOOTING STARS ---
class ShootingStar {
    constructor() {
        this.mesh = new THREE.Group();
        this.createMesh();
        this.reset();
        scene.add(this.mesh);
    }

    createMesh() {
        const starGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const star = new THREE.Mesh(starGeo, starMat);
        this.mesh.add(star);

        const trailGeo = new THREE.ConeGeometry(0.2, 4, 8);
        trailGeo.rotateX(QUARTER_ROTATION);
        trailGeo.translate(0, 0, 2);

        const trailMat = new THREE.MeshBasicMaterial({
            color: 0xaaddff,
            transparent: true,
            opacity: 0.5
        });

        const trail = new THREE.Mesh(trailGeo, trailMat);
        this.mesh.add(trail);
    }

    reset() {
        this.mesh.position.set(
            CONFIG.shootingStars.spawnX[0] +
                Math.random() * (
                    CONFIG.shootingStars.spawnX[1] -
                    CONFIG.shootingStars.spawnX[0]
                ),
            CONFIG.shootingStars.spawnY[0] +
                Math.random() * (
                    CONFIG.shootingStars.spawnY[1] -
                    CONFIG.shootingStars.spawnY[0]
                ),
            CONFIG.shootingStars.spawnZ[0] +
                Math.random() * (
                    CONFIG.shootingStars.spawnZ[1] -
                    CONFIG.shootingStars.spawnZ[0]
                )
        );

        this.mesh.rotation.z = CONFIG.shootingStars.rotationZ;
        this.speed =
            CONFIG.shootingStars.minSpeed +
            Math.random() * CONFIG.shootingStars.speedRange;

        this.mesh.visible = false;
        this.mesh.scale.setScalar(0);
    }

    update() {
        if (!this.mesh.visible) {
            if (Math.random() < CONFIG.shootingStars.spawnChance) {
                this.mesh.visible = true;
                this.mesh.scale.setScalar(1);
            }
            return;
        }

        this.mesh.position.x -= this.speed;
        this.mesh.position.y -= this.speed * 0.5;

        if (
            this.mesh.position.x < CONFIG.shootingStars.resetX ||
            this.mesh.position.y < CONFIG.shootingStars.resetY
        ) {
            this.reset();
        }
    }
}

const shootingStars = Array.from(
    { length: CONFIG.shootingStars.count },
    () => new ShootingStar()
);

// --- NEBULA CLOUDS ---
function createNebula() {
    const nebulaGeometry = new THREE.BufferGeometry();
    const nebulaCount = CONFIG.nebula.count;
    const positions = new Float32Array(nebulaCount * 3);

    for (let i = 0; i < nebulaCount; i++) {
        const i3 = i * 3;
        const radius = CONFIG.nebula.minRadius + Math.random() * CONFIG.nebula.radiusRange;
        const theta = Math.random() * FULL_ROTATION;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
    }

    nebulaGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    );

    const nebulaMaterial = new THREE.PointsMaterial({
        size: CONFIG.nebula.pointSize,
        color: CONFIG.colors.nebula,
        transparent: true,
        opacity: CONFIG.nebula.opacity,
        blending: THREE.AdditiveBlending
    });

    return new THREE.Points(nebulaGeometry, nebulaMaterial);
}

const nebula = createNebula();
scene.add(nebula);

// --- NEPTUNE SHADER MATERIAL ---
const neptuneVertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;

        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const neptuneFragmentShader = `
    uniform float time;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 permute(vec4 x) {
        return mod289(((x * 34.0) + 1.0) * x);
    }

    vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
    }

    float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;

        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod289(i);

        vec4 p = permute(
            permute(
                permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0)
            )
            + i.x + vec4(0.0, i1.x, i2.x, 1.0)
        );

        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;

        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;

        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(
            dot(p0, p0),
            dot(p1, p1),
            dot(p2, p2),
            dot(p3, p3)
        ));

        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(
            0.6 - vec4(
                dot(x0, x0),
                dot(x1, x1),
                dot(x2, x2),
                dot(x3, x3)
            ),
            0.0
        );

        m = m * m;

        return 42.0 * dot(
            m * m,
            vec4(
                dot(p0, x0),
                dot(p1, x1),
                dot(p2, x2),
                dot(p3, x3)
            )
        );
    }

    float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;

        for (int i = 0; i < 5; i++) {
            value += amplitude * snoise(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
        }

        return value;
    }

    void main() {
        vec3 deepBlue = vec3(0.05, 0.1, 0.35);
        vec3 oceanBlue = vec3(0.1, 0.25, 0.6);
        vec3 lightBlue = vec3(0.3, 0.5, 0.85);
        vec3 white = vec3(0.9, 0.95, 1.0);
        vec3 darkSpot = vec3(0.02, 0.02, 0.12);

        vec3 noisePos = vec3(
            vPosition.x * 0.25,
            vPosition.y * 0.12,
            vPosition.z * 0.25 + time * 0.015
        );

        float n1 = fbm(noisePos);
        float n2 = fbm(noisePos * 2.0 + vec3(time * 0.01));

        float band = sin(vPosition.y * 0.6 + n1 * 2.0);

        vec3 color = mix(
            deepBlue,
            oceanBlue,
            smoothstep(-0.5, 0.5, band)
        );

        color = mix(color, lightBlue, n1 * 0.5);

        if (n2 > 0.25) {
            color = mix(color, white, 0.35);
        }

        float spotNoise = snoise(vec3(
            vPosition.x * 1.2,
            vPosition.y * 1.2 + time * 0.04,
            vPosition.z * 1.2
        ));

        float spot = smoothstep(0.5, 0.65, spotNoise);
        color = mix(color, darkSpot, spot * 0.9);

        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float fresnel = pow(
            1.0 - max(0.0, dot(vNormal, viewDir)),
            2.5
        );

        vec3 atmosphere = vec3(0.2, 0.5, 1.0);
        color += atmosphere * fresnel * 0.9;

        vec3 lightDir = normalize(vec3(50.0, 30.0, 30.0));
        vec3 halfDir = normalize(lightDir + viewDir);

        float spec = pow(
            max(0.0, dot(vNormal, halfDir)),
            32.0
        );

        color += vec3(0.5, 0.7, 1.0) * spec * 0.6;

        gl_FragColor = vec4(color, 1.0);
    }
`;

// --- NEPTUNE MESH ---
const neptuneGeo = new THREE.SphereGeometry(
    CONFIG.planet.radius,
    CONFIG.planet.segments,
    CONFIG.planet.segments
);

const neptuneMat = new THREE.ShaderMaterial({
    vertexShader: neptuneVertexShader,
    fragmentShader: neptuneFragmentShader,
    uniforms: {
        time: { value: 0 }
    }
});

const neptune = new THREE.Mesh(neptuneGeo, neptuneMat);
scene.add(neptune);

// --- ATMOSPHERE GLOW ---
const atmosphereGeo = new THREE.SphereGeometry(
    CONFIG.planet.radius * CONFIG.planet.atmosphereScale,
    CONFIG.planet.atmosphereSegments,
    CONFIG.planet.atmosphereSegments
);

const atmosphereMat = new THREE.ShaderMaterial({
    vertexShader: `
        varying vec3 vNormal;

        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;

        void main() {
            float intensity = pow(
                0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)),
                0.0
            );

            gl_FragColor = vec4(0.2, 0.4, 1.0, 1.0) * intensity;
        }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true
});

const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
scene.add(atmosphere);

// --- INTERACTION ZONES ON NEPTUNE ---
const zones = [
    { position: new THREE.Vector3(0, 10, 3) },
    { position: new THREE.Vector3(-5, 0, -10) },
    { position: new THREE.Vector3(-3, -10, 4) }
];

const markers = [];

zones.forEach((zone) => {
    const marker = new THREE.Group();
    marker.position.copy(zone.position);

    // Large glowing outer ring
    const outerRingGeo = new THREE.TorusGeometry(
        CONFIG.markers.ringRadius,
        CONFIG.markers.ringTube,
        8,
        64
    );

    const outerRingMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: CONFIG.markers.ringOpacity
    });

    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    marker.add(outerRing);

    // Inner pulsing core
    const coreGeo = new THREE.SphereGeometry(
        CONFIG.markers.coreRadius,
        16,
        16
    );

    const coreMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 1
    });

    const core = new THREE.Mesh(coreGeo, coreMat);
    marker.add(core);

    // Core glow
    const coreGlowGeo = new THREE.SphereGeometry(
        CONFIG.markers.glowRadius,
        16,
        16
    );

    const coreGlowMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3
    });

    const coreGlow = new THREE.Mesh(coreGlowGeo, coreGlowMat);
    marker.add(coreGlow);

    scene.add(marker);

    markers.push({
        marker,
        outerRing,
        coreGlow
    });
});

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Update Neptune shader
    neptuneMat.uniforms.time.value = time;
    neptune.rotation.y += CONFIG.planet.rotationSpeed;

    // Rotate background
    starfield.rotation.y += CONFIG.stars.rotationSpeed;
    nebula.rotation.y += CONFIG.nebula.rotationSpeed;

    // Animate markers
    markers.forEach(({ marker, outerRing, coreGlow }, i) => {
        const phase = i;

        // Make rings face camera and pulse
        outerRing.lookAt(camera.position);

        const ringPulse =
            1 + Math.sin(
                time * CONFIG.markers.ringPulseSpeed + phase
            ) * CONFIG.markers.ringPulseAmplitude;

        outerRing.scale.setScalar(ringPulse);

        outerRing.material.opacity =
            CONFIG.markers.ringBaseOpacity +
            Math.sin(
                time * CONFIG.markers.ringOpacitySpeed + phase
            ) * CONFIG.markers.ringOpacityAmplitude;

        // Animate core glow
        const glowPulse =
            1 + Math.sin(
                time * CONFIG.markers.glowPulseSpeed + phase
            ) * CONFIG.markers.glowPulseAmplitude;

        coreGlow.scale.setScalar(glowPulse);

        coreGlow.material.opacity =
            CONFIG.markers.glowBaseOpacity +
            Math.sin(
                time * CONFIG.markers.glowOpacitySpeed + phase
            ) * CONFIG.markers.glowOpacityAmplitude;

        // Float animation
        marker.position.y =
            zones[i].position.y +
            Math.sin(
                time * CONFIG.markers.floatSpeed + phase
            ) * CONFIG.markers.floatAmplitude;
    });

    // Update shooting stars
    shootingStars.forEach(star => star.update());

    // Update controls
    controls.update();

    // Render with bloom
    composer.render();
}

// --- RESIZE ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// --- START ---
animate();
