import * as THREE from 'three';
import { BASIC_SETUP, VISUAL_CONFIG, FULL_ROTATION } from './config.js';

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

function createHiraganaAtlas() {
    const canvas = document.createElement('canvas');
    canvas.width = BASIC_SETUP.geometry.hiraganaAtlasSize;
    canvas.height = BASIC_SETUP.geometry.hiraganaAtlasSize;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not create the Hiragana atlas canvas.');
    }

    const grid = BASIC_SETUP.geometry.hiraganaAtlasGrid;
    const cellSize = canvas.width / grid;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '76px sans-serif';
    ctx.fillStyle = '#ffffff';

    HIRAGANA.forEach((syllable, index) => {
        const column = index % grid;
        const row = Math.floor(index / grid);

        ctx.fillText(
            syllable,
            column * cellSize + cellSize / 2,
            row * cellSize + cellSize / 2
        );
    });

    const texture = new THREE.CanvasTexture(canvas);

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
}

export function createHiraganaField() {
    const count = VISUAL_CONFIG.hiragana.count;
    const geometry = new THREE.PlaneGeometry(1, 1);

    const syllableIndices = new Float32Array(count);
    const opacities = new Float32Array(count);
    const tints = new Float32Array(count * 3);

    const colors = VISUAL_CONFIG.hiragana.colors.map(color => new THREE.Color(color));

    geometry.setAttribute(
        'aSyllable',
        new THREE.InstancedBufferAttribute(syllableIndices, 1)
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
            hiraganaAtlas: { value: createHiraganaAtlas() },
            atlasGrid: { value: BASIC_SETUP.geometry.hiraganaAtlasGrid },
            intensity: { value: VISUAL_CONFIG.hiragana.intensity }
        },

        vertexShader: `
            // instanceMatrix is automatically provided by Three.js.
            attribute float aSyllable;
            attribute float aOpacity;
            attribute vec3 aTint;

            varying vec2 vUv;
            varying float vSyllable;
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
                vSyllable = aSyllable;
                vOpacity = aOpacity;
                vTint = aTint;
            }
        `,

        fragmentShader: `
            uniform sampler2D hiraganaAtlas;
            uniform float atlasGrid;
            uniform float intensity;

            varying vec2 vUv;
            varying float vSyllable;
            varying float vOpacity;
            varying vec3 vTint;

            void main() {
                float column = mod(vSyllable, atlasGrid);
                float row = floor(vSyllable / atlasGrid);

                float cellSize = 1.0 / atlasGrid;

                // Keep sampling away from adjacent syllable cells.
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

                vec4 syllable = texture2D(hiraganaAtlas, atlasUv);

                float alpha = syllable.a * vOpacity;

                if (alpha < 0.015) {
                    discard;
                }

                vec3 color = vTint * syllable.rgb * intensity;

                gl_FragColor = vec4(color, alpha);
            }
        `,

        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        toneMapped: false
    });

    const hiraganaField = new THREE.InstancedMesh(
        geometry,
        material,
        count
    );

    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        const radius =
            VISUAL_CONFIG.hiragana.minRadius +
            Math.random() * VISUAL_CONFIG.hiragana.radiusRange;

        const theta = Math.random() * FULL_ROTATION;
        const phi = Math.acos(2 * Math.random() - 1);

        const position = new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );

        const size =
            VISUAL_CONFIG.hiragana.minSize +
            Math.random() * VISUAL_CONFIG.hiragana.sizeRange;

        // Slightly increase syllable size with distance.
        const distanceScale = 0.8 + radius / 1000;
        const finalSize = size * distanceScale;

        dummy.position.copy(position);
        dummy.scale.set(finalSize, finalSize, 1);
        dummy.updateMatrix();

        hiraganaField.setMatrixAt(i, dummy.matrix);

        syllableIndices[i] = Math.floor(Math.random() * HIRAGANA.length);

        opacities[i] =
            VISUAL_CONFIG.hiragana.minOpacity +
            Math.random() * VISUAL_CONFIG.hiragana.opacityRange;

        const tint = colors[Math.floor(Math.random() * colors.length)];

        tints[i3] = tint.r;
        tints[i3 + 1] = tint.g;
        tints[i3 + 2] = tint.b;
    }

    hiraganaField.instanceMatrix.needsUpdate = true;

    geometry.attributes.aSyllable.needsUpdate = true;
    geometry.attributes.aOpacity.needsUpdate = true;
    geometry.attributes.aTint.needsUpdate = true;

    hiraganaField.frustumCulled = false;

    return hiraganaField;
}
