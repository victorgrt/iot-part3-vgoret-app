import * as THREE from 'three';
import { BASIC_SETUP, VISUAL_CONFIG, shaderColor } from './config.js';

export function createPlanet(scene) {
    const planetVertexShader = `
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

    const planetFragmentShader = `
        uniform float time;
        uniform float planetIntensity;
        uniform float fresnelIntensity;
        uniform float specularIntensity;
        uniform vec3 deepBlueColor;
        uniform vec3 oceanBlueColor;
        uniform vec3 lightBlueColor;
        uniform vec3 whiteColor;
        uniform vec3 darkSpotColor;
        uniform vec3 fresnelColor;
        uniform vec3 specularColor;
        uniform vec3 lightDirection;

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
            vec3 noisePos = vec3(
                vPosition.x * 0.25,
                vPosition.y * 0.12,
                vPosition.z * 0.25 + time * 0.015
            );

            float n1 = fbm(noisePos);
            float n2 = fbm(noisePos * 2.0 + vec3(time * 0.01));

            float band = sin(vPosition.y * 0.6 + n1 * 2.0);

            vec3 color = mix(
                deepBlueColor,
                oceanBlueColor,
                smoothstep(-0.5, 0.5, band)
            );

            color = mix(color, lightBlueColor, n1 * 0.5);

            if (n2 > 0.25) {
                color = mix(color, whiteColor, 0.35);
            }

            float spotNoise = snoise(vec3(
                vPosition.x * 1.2,
                vPosition.y * 1.2 + time * 0.04,
                vPosition.z * 1.2
            ));

            float spot = smoothstep(0.5, 0.65, spotNoise);
            color = mix(color, darkSpotColor, spot * 0.9);

            vec3 viewDir = normalize(cameraPosition - vWorldPosition);

            float fresnel = pow(
                1.0 - max(0.0, dot(vNormal, viewDir)),
                2.5
            );

            color += fresnelColor * fresnel * fresnelIntensity;

            vec3 lightDir = normalize(lightDirection);
            vec3 halfDir = normalize(lightDir + viewDir);

            float spec = pow(
                max(0.0, dot(vNormal, halfDir)),
                32.0
            );

            color += specularColor * spec * specularIntensity;

            gl_FragColor = vec4(color * planetIntensity, 1.0);
        }
    `;

    // --- NEPTUNE MESH ---
    const planetGeometry = new THREE.SphereGeometry(
        VISUAL_CONFIG.planet.radius,
        BASIC_SETUP.geometry.planetSegments,
        BASIC_SETUP.geometry.planetSegments
    );

    const planetMaterial = new THREE.ShaderMaterial({
        vertexShader: planetVertexShader,
        fragmentShader: planetFragmentShader,
        uniforms: {
            time: { value: 0 },
            planetIntensity: { value: VISUAL_CONFIG.planet.intensity },
            fresnelIntensity: { value: VISUAL_CONFIG.planet.fresnelIntensity },
            specularIntensity: { value: VISUAL_CONFIG.planet.specularIntensity },
            deepBlueColor: { value: shaderColor(VISUAL_CONFIG.planet.deepBlue) },
            oceanBlueColor: { value: shaderColor(VISUAL_CONFIG.planet.oceanBlue) },
            lightBlueColor: { value: shaderColor(VISUAL_CONFIG.planet.lightBlue) },
            whiteColor: { value: shaderColor(VISUAL_CONFIG.planet.white) },
            darkSpotColor: { value: shaderColor(VISUAL_CONFIG.planet.darkSpot) },
            fresnelColor: { value: shaderColor(VISUAL_CONFIG.planet.fresnelColor) },
            specularColor: { value: shaderColor(VISUAL_CONFIG.planet.specularColor) },
            lightDirection: {
                value: new THREE.Vector3(...VISUAL_CONFIG.lighting.sun.position)
            }
        }
    });

    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    scene.add(planet);

    // --- ATMOSPHERE GLOW ---
    const atmosphereGeo = new THREE.SphereGeometry(
        VISUAL_CONFIG.planet.radius * VISUAL_CONFIG.planet.atmosphereScale,
        BASIC_SETUP.geometry.atmosphereSegments,
        BASIC_SETUP.geometry.atmosphereSegments
    );

    const atmosphereMat = new THREE.ShaderMaterial({
        vertexShader: `
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 atmosphereColor;
            uniform float atmosphereIntensity;

            void main() {
                gl_FragColor = vec4(atmosphereColor * atmosphereIntensity, 1.0);
            }
        `,
        uniforms: {
            atmosphereColor: { value: shaderColor(VISUAL_CONFIG.atmosphere.color) },
            atmosphereIntensity: { value: VISUAL_CONFIG.atmosphere.intensity }
        },
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false
    });

    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphere);


    return { planet, material: planetMaterial };
}
