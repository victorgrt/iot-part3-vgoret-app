import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { BASIC_SETUP, VISUAL_CONFIG, shaderColor } from './config.js';

export function createScene() {
    // --- SETUP ---
    const container = document.getElementById('canvas-container');

    if (!container) {
        throw new Error('Missing #canvas-container element');
    }

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        BASIC_SETUP.camera.fieldOfView,
        window.innerWidth / window.innerHeight,
        BASIC_SETUP.camera.near,
        BASIC_SETUP.camera.far
    );

    camera.position.set(...BASIC_SETUP.camera.position);

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, BASIC_SETUP.renderer.maxPixelRatio)
    );

    renderer.setClearColor(VISUAL_CONFIG.background.clearColor, 1);

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = VISUAL_CONFIG.renderer.exposure;

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = BASIC_SETUP.controls.dampingFactor;
    controls.minDistance = BASIC_SETUP.controls.minDistance;
    controls.maxDistance = BASIC_SETUP.controls.maxDistance;
    controls.enablePan = false;
    controls.autoRotate = BASIC_SETUP.controls.autoRotate;
    controls.autoRotateSpeed = BASIC_SETUP.controls.autoRotateSpeed;

    // --- POST PROCESSING ---

    // Layer low-frequency blue noise with sparse, sharper points of light.
    const backgroundPass = new ShaderPass({
        uniforms: {
            deepBlue: { value: shaderColor(VISUAL_CONFIG.background.deepBlue) },
            blueAccent: { value: shaderColor(VISUAL_CONFIG.background.blueAccent) },
            sparkleColor: { value: shaderColor(VISUAL_CONFIG.background.sparkleColor) },
            noiseIntensity: { value: VISUAL_CONFIG.background.noiseIntensity },
            sparkleIntensity: { value: VISUAL_CONFIG.background.sparkleIntensity },
            resolution: {
                value: new THREE.Vector2(window.innerWidth, window.innerHeight)
            }
        },
        vertexShader: `
            varying vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = vec4(position.xy, 0.0, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 deepBlue;
            uniform vec3 blueAccent;
            uniform vec3 sparkleColor;
            uniform float noiseIntensity;
            uniform float sparkleIntensity;
            uniform vec2 resolution;

            varying vec2 vUv;

            float hash(vec2 point) {
                return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
            }

            float noise(vec2 point) {
                vec2 cell = floor(point);
                vec2 fraction = fract(point);
                vec2 blend = fraction * fraction * (3.0 - 2.0 * fraction);

                float lower = mix(
                    hash(cell),
                    hash(cell + vec2(1.0, 0.0)),
                    blend.x
                );
                float upper = mix(
                    hash(cell + vec2(0.0, 1.0)),
                    hash(cell + vec2(1.0, 1.0)),
                    blend.x
                );

                return mix(lower, upper, blend.y);
            }

            void main() {
                float aspect = resolution.x / resolution.y;
                vec2 backgroundUv = vec2(vUv.x * aspect, vUv.y);

                float broadNoise = noise(backgroundUv * 5.0);
                float detailNoise = noise(backgroundUv * 17.0);
                float nebula = smoothstep(
                    0.42,
                    0.88,
                    broadNoise * 0.8 + detailNoise * 0.2
                );

                vec2 sparkleGrid = vec2(180.0 * aspect, 180.0);
                vec2 sparkleCell = floor(vUv * sparkleGrid);
                vec2 sparkleCenter = (
                    sparkleCell + vec2(
                        hash(sparkleCell),
                        hash(sparkleCell + 17.0)
                    )
                ) / sparkleGrid;
                float sparkleDistance = length(
                    (vUv - sparkleCenter) * resolution
                );
                float sparkleRadius = mix(
                    0.45,
                    1.5,
                    hash(sparkleCell + 31.0)
                );
                float sparkle = (1.0 - smoothstep(
                    0.0,
                    sparkleRadius,
                    sparkleDistance
                )) * step(0.9995, hash(sparkleCell + 53.0));

                vec3 color = deepBlue + blueAccent * nebula * noiseIntensity;
                color += sparkleColor * sparkle * sparkleIntensity;

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
        VISUAL_CONFIG.bloom.strength,
        VISUAL_CONFIG.bloom.radius,
        VISUAL_CONFIG.bloom.threshold
    );

    const composer = new EffectComposer(renderer);

    composer.addPass(backgroundPass);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(
        VISUAL_CONFIG.lighting.ambient.color,
        VISUAL_CONFIG.lighting.ambient.intensity
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(
        VISUAL_CONFIG.lighting.sun.color,
        VISUAL_CONFIG.lighting.sun.intensity
    );
    sunLight.position.set(...VISUAL_CONFIG.lighting.sun.position);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(
        VISUAL_CONFIG.lighting.rim.color,
        VISUAL_CONFIG.lighting.rim.intensity
    );
    rimLight.position.set(...VISUAL_CONFIG.lighting.rim.position);
    scene.add(rimLight);

    const purpleLight = new THREE.PointLight(
        VISUAL_CONFIG.lighting.purple.color,
        VISUAL_CONFIG.lighting.purple.intensity,
        VISUAL_CONFIG.lighting.purple.distance
    );
    purpleLight.position.set(...VISUAL_CONFIG.lighting.purple.position);
    scene.add(purpleLight);


    return { scene, camera, renderer, controls, composer, backgroundPass };
}
