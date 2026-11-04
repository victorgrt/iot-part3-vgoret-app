
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// --- CONFIGURATION ---
const FULL_ROTATION = Math.PI * 2;
const QUARTER_ROTATION = FULL_ROTATION / 4;

const CONFIG = {
    camera: {
        fieldOfView: 60,
        near: 0.1,
        far: 3500,
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
        autoRotateSpeed: 0.6
    },
    bloom: {
        strength: 1.5,
        radius: 0.6,
        threshold: 0.05
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
        count: 2200,
        minRadius: 60,
        radiusRange: 1000,
        minSize: 1.8,
        sizeRange: 2.5,
        minOpacity: 0.3,
        opacityRange: 0.55,
        rotationSpeed: 0.00005,
        atlasSize: 1024,
        atlasGrid: 8,
        atlasPadding: 12
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

if (!container) {
    throw new Error('Missing #canvas-container element');
}

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fieldOfView,
    window.innerWidth / window.innerHeight,
    CONFIG.camera.near,
    CONFIG.camera.far
);

camera.position.set(...CONFIG.camera.position);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, CONFIG.renderer.maxPixelRatio)
);

renderer.setClearColor(0x080d25, 1);

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

// --- POST PROCESSING ---

// Full-screen background gradient.
// Broad diagonal colour transitions, without radial gradient patches.
const backgroundPass = new ShaderPass({
    uniforms: {},
    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;

        void main() {
            vec3 deepBlue = vec3(0.025, 0.045, 0.12);
            vec3 navy = vec3(0.045, 0.075, 0.18);
            vec3 purple = vec3(0.12, 0.045, 0.16);
            vec3 red = vec3(0.19, 0.055, 0.12);

            float diagonal = vUv.x * 0.65 + vUv.y * 0.35;

            vec3 color = mix(
                deepBlue,
                navy,
                smoothstep(0.0, 0.7, diagonal)
            );

            float blueSweep = smoothstep(
                0.1,
                0.8,
                vUv.x * 0.4 + vUv.y * 0.6
            );

            color = mix(
                color,
                vec3(0.035, 0.09, 0.23),
                blueSweep * 0.55
            );

            float purpleSweep = smoothstep(
                0.35,
                1.0,
                vUv.x * 0.75 + (1.0 - vUv.y) * 0.25
            );

            color = mix(
                color,
                purple,
                purpleSweep * 0.75
            );

            float redSweep = smoothstep(
                0.65,
                1.0,
                vUv.x * 0.5 + (1.0 - vUv.y) * 0.5
            );

            color = mix(
                color,
                red,
                redSweep * 0.45
            );

            gl_FragColor = vec4(color, 1.0);
        }
    `
});

const renderScene = new RenderPass(scene, camera);

// Keep the background colour from the previous pass.
// Clear depth so 3D objects render correctly over it.
renderScene.clear = false;
renderScene.clearDepth = true;

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    CONFIG.bloom.strength,
    CONFIG.bloom.radius,
    CONFIG.bloom.threshold
);

const composer = new EffectComposer(renderer);

composer.addPass(backgroundPass);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(
    0x404060,
    CONFIG.lighting.ambientIntensity
);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(
    0xffffff,
    CONFIG.lighting.sunIntensity
);
sunLight.position.set(...CONFIG.lighting.sunPosition);
scene.add(sunLight);

const rimLight = new THREE.DirectionalLight(
    0x00ffff,
    CONFIG.lighting.rimIntensity
);
rimLight.position.set(...CONFIG.lighting.rimPosition);
scene.add(rimLight);

const purpleLight = new THREE.PointLight(
    0x8800ff,
    CONFIG.lighting.purpleIntensity,
    CONFIG.lighting.purpleDistance
);
purpleLight.position.set(...CONFIG.lighting.purplePosition);
scene.add(purpleLight);

// --- HIRAGANA STARFIELD ---
const HIRAGANA = [
    'あ', 'い', 'う', 'え', 'お',
    'か', 'き', 'く', 'け', 'こ',
    'さ', 'し', 'す', 'せ', 'そ',
    'た', 'ち', 'つ', 'て', 'と',
    'な', 'に', 'ぬ', 'ね', 'の',
    'は', 'ひ', 'ふ', 'へ', 'ほ',
    'ま', 'み', 'む', 'め', 'も',
    'や', 'ゆ', 'よ',
    'ら', 'り', 'る', 'れ', 'ろ',
    'わ', 'を', 'ん'
];

function loadHiraganaFont() {
    return new Promise((resolve) => {
        const fontLink = document.createElement('link');

        fontLink.rel = 'stylesheet';
        fontLink.href =
            'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap';

        fontLink.onload = async () => {
            try {
                await document.fonts.load('700 76px "Noto Sans JP"', 'あ');
                await document.fonts.ready;

                if (!document.fonts.check('700 76px "Noto Sans JP"', 'あ')) {
                    console.warn('Noto Sans JP is not available.');
                }
            } catch (error) {
                console.warn('Japanese font loading failed:', error);
            }

            resolve();
        };

        fontLink.onerror = () => {
            console.warn('Could not load Google Fonts.');
            resolve();
        };

        document.head.appendChild(fontLink);
    });
}

function createGlyphAtlas() {
    const canvas = document.createElement('canvas');
    canvas.width = CONFIG.stars.atlasSize;
    canvas.height = CONFIG.stars.atlasSize;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not create the Hiragana atlas canvas.');
    }

    const grid = CONFIG.stars.atlasGrid;
    const cellSize = canvas.width / grid;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 76px "Noto Sans JP", sans-serif';
    ctx.fillStyle = '#ffffff';

    HIRAGANA.forEach((glyph, index) => {
        const column = index % grid;
        const row = Math.floor(index / grid);

        ctx.fillText(
            glyph,
            column * cellSize + cellSize / 2,
            row * cellSize + cellSize / 2
        );
    });

    const texture = new THREE.CanvasTexture(canvas);

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;

    return texture;
}

function createStarfield() {
    const count = CONFIG.stars.count;
    const geometry = new THREE.PlaneGeometry(1, 1);

    const glyphIndices = new Float32Array(count);
    const opacities = new Float32Array(count);
    const tints = new Float32Array(count * 3);

    const colors = [
        new THREE.Color(0x75caff),
        new THREE.Color(0x9b83ff),
        new THREE.Color(0xd18aff),
        new THREE.Color(0xff8ba8),
        new THREE.Color(0xb7dfff)
    ];

    geometry.setAttribute(
        'aGlyph',
        new THREE.InstancedBufferAttribute(glyphIndices, 1)
    );

    geometry.setAttribute(
        'aOpacity',
        new THREE.InstancedBufferAttribute(opacities, 1)
    );

    geometry.setAttribute(
        'aTint',
        new THREE.InstancedBufferAttribute(tints, 3)
    );

    const material = new THREE.ShaderMaterial({
        uniforms: {
            glyphAtlas: { value: createGlyphAtlas() },
            atlasGrid: { value: CONFIG.stars.atlasGrid }
        },

        vertexShader: `
            // instanceMatrix is automatically provided by Three.js.
            attribute float aGlyph;
            attribute float aOpacity;
            attribute vec3 aTint;

            varying vec2 vUv;
            varying float vGlyph;
            varying float vOpacity;
            varying vec3 vTint;

            void main() {
                vec4 center = modelViewMatrix *
                    instanceMatrix *
                    vec4(0.0, 0.0, 0.0, 1.0);

                vec2 instanceScale = vec2(
                    length(instanceMatrix[0].xyz),
                    length(instanceMatrix[1].xyz)
                );

                // Camera-facing billboard.
                center.xy += position.xy * instanceScale;

                gl_Position = projectionMatrix * center;

                vUv = uv;
                vGlyph = aGlyph;
                vOpacity = aOpacity;
                vTint = aTint;
            }
        `,

        fragmentShader: `
            uniform sampler2D glyphAtlas;
            uniform float atlasGrid;

            varying vec2 vUv;
            varying float vGlyph;
            varying float vOpacity;
            varying vec3 vTint;

            void main() {
                float column = mod(vGlyph, atlasGrid);
                float row = floor(vGlyph / atlasGrid);

                float cellSize = 1.0 / atlasGrid;

                // Keep sampling away from adjacent glyph cells.
                float padding = 0.012;
                vec2 localUv = mix(
                    vec2(padding),
                    vec2(1.0 - padding),
                    vUv
                );

                vec2 atlasUv = vec2(
                    (column + localUv.x) * cellSize,
                    (atlasGrid - 1.0 - row + localUv.y) * cellSize
                );

                vec4 glyph = texture2D(glyphAtlas, atlasUv);

                float alpha = glyph.a * vOpacity;

                if (alpha < 0.015) {
                    discard;
                }

                vec3 color = vTint * glyph.rgb * 2.0;

                gl_FragColor = vec4(color, alpha);
            }
        `,

        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        toneMapped: false
    });

    const starfield = new THREE.InstancedMesh(
        geometry,
        material,
        count
    );

    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        const radius =
            CONFIG.stars.minRadius +
            Math.random() * CONFIG.stars.radiusRange;

        const theta = Math.random() * FULL_ROTATION;
        const phi = Math.acos(2 * Math.random() - 1);

        const position = new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );

        const size =
            CONFIG.stars.minSize +
            Math.random() * CONFIG.stars.sizeRange;

        // Slightly increase glyph size with distance.
        const distanceScale = 0.8 + radius / 1000;
        const finalSize = size * distanceScale;

        dummy.position.copy(position);
        dummy.scale.set(finalSize, finalSize, 1);
        dummy.updateMatrix();

        starfield.setMatrixAt(i, dummy.matrix);

        glyphIndices[i] = Math.floor(Math.random() * HIRAGANA.length);

        opacities[i] =
            CONFIG.stars.minOpacity +
            Math.random() * CONFIG.stars.opacityRange;

        const tint = colors[Math.floor(Math.random() * colors.length)];

        tints[i3] = tint.r;
        tints[i3 + 1] = tint.g;
        tints[i3 + 2] = tint.b;
    }

    starfield.instanceMatrix.needsUpdate = true;

    geometry.attributes.aGlyph.needsUpdate = true;
    geometry.attributes.aOpacity.needsUpdate = true;
    geometry.attributes.aTint.needsUpdate = true;

    starfield.frustumCulled = false;

    return starfield;
}

// --- SHOOTING STARS ---
class ShootingStar {
    constructor() {
        this.mesh = new THREE.Group();
        this.createMesh();
        this.reset();
        scene.add(this.mesh);
    }

    createMesh() {
        const star = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );

        this.mesh.add(star);

        const trailGeometry = new THREE.ConeGeometry(0.2, 4, 8);
        trailGeometry.rotateX(QUARTER_ROTATION);
        trailGeometry.translate(0, 0, 2);

        const trail = new THREE.Mesh(
            trailGeometry,
            new THREE.MeshBasicMaterial({
                color: 0xaaddff,
                transparent: true,
                opacity: 0.5
            })
        );

        this.mesh.add(trail);
    }

    reset() {
        const config = CONFIG.shootingStars;

        this.mesh.position.set(
            config.spawnX[0] +
                Math.random() * (config.spawnX[1] - config.spawnX[0]),
            config.spawnY[0] +
                Math.random() * (config.spawnY[1] - config.spawnY[0]),
            config.spawnZ[0] +
                Math.random() * (config.spawnZ[1] - config.spawnZ[0])
        );

        this.mesh.rotation.z = config.rotationZ;
        this.speed = config.minSpeed + Math.random() * config.speedRange;

        this.mesh.visible = false;
        this.mesh.scale.setScalar(0);
    }

    update() {
        const config = CONFIG.shootingStars;

        if (!this.mesh.visible) {
            if (Math.random() < config.spawnChance) {
                this.mesh.visible = true;
                this.mesh.scale.setScalar(1);
            }

            return;
        }

        this.mesh.position.x -= this.speed;
        this.mesh.position.y -= this.speed * 0.5;

        if (
            this.mesh.position.x < config.resetX ||
            this.mesh.position.y < config.resetY
        ) {
            this.reset();
        }
    }
}

const shootingStars = Array.from(
    { length: CONFIG.shootingStars.count },
    () => new ShootingStar()
);

// --- NEPTUNE SHADER MATERIAL ---
const neptuneVertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;

        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const neptuneFragmentShader = `
    uniform float time;

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

        color += vec3(0.2, 0.5, 1.0) * fresnel * 0.9;

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
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        void main() {
            gl_FragColor = vec4(0.2, 0.4, 1.0, 1.0);
        }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false
});

const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
scene.add(atmosphere);

// --- INTERACTION ZONES ---
const zones = [
    { position: new THREE.Vector3(0, 10, 3) },
    { position: new THREE.Vector3(-5, 0, -10) },
    { position: new THREE.Vector3(-3, -10, 4) }
];

const markers = [];

zones.forEach((zone) => {
    const marker = new THREE.Group();
    marker.position.copy(zone.position);

    const outerRing = new THREE.Mesh(
        new THREE.TorusGeometry(
            CONFIG.markers.ringRadius,
            CONFIG.markers.ringTube,
            8,
            64
        ),
        new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: CONFIG.markers.ringBaseOpacity
        })
    );

    marker.add(outerRing);

    const core = new THREE.Mesh(
        new THREE.SphereGeometry(CONFIG.markers.coreRadius, 16, 16),
        new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 1
        })
    );

    marker.add(core);

    const coreGlow = new THREE.Mesh(
        new THREE.SphereGeometry(CONFIG.markers.glowRadius, 16, 16),
        new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: CONFIG.markers.glowBaseOpacity
        })
    );

    marker.add(coreGlow);
    scene.add(marker);

    markers.push({ marker, outerRing, coreGlow });
});

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate(starfield) {
    requestAnimationFrame(() => animate(starfield));

    const time = clock.getElapsedTime();

    neptuneMat.uniforms.time.value = time;
    neptune.rotation.y += CONFIG.planet.rotationSpeed;

    starfield.rotation.y += CONFIG.stars.rotationSpeed;

    markers.forEach(({ marker, outerRing, coreGlow }, i) => {
        const phase = i;

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

        marker.position.y =
            zones[i].position.y +
            Math.sin(
                time * CONFIG.markers.floatSpeed + phase
            ) * CONFIG.markers.floatAmplitude;
    });

    shootingStars.forEach(star => star.update());

    controls.update();
    composer.render();
}

// --- RESIZE ---
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);
});

// --- START ---
async function start() {
    await loadHiraganaFont();

    const starfield = createStarfield();
    scene.add(starfield);

    animate(starfield);
}

start();
