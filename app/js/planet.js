import * as THREE from 'three';
import { BASIC_SETUP, VISUAL_CONTROLS, shaderColor } from './config.js';

export function createPlanet(scene) {
    const config = VISUAL_CONTROLS.planet;
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
        uniform float specularIntensity;
        uniform float lightIntensity;
        uniform float borderIntensity;
        uniform float borderThickness;
        uniform vec3 planetColor;
        uniform vec3 lightColor;
        uniform vec3 borderColor;
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
                planetColor * 0.2,
                planetColor,
                smoothstep(-0.5, 0.5, band)
            );

            color += planetColor * n1 * 0.25;

            if (n2 > 0.25) {
                color = mix(color, vec3(1.0), 0.35);
            }

            float spotNoise = snoise(vec3(
                vPosition.x * 1.2,
                vPosition.y * 1.2 + time * 0.04,
                vPosition.z * 1.2
            ));

            float spot = smoothstep(0.5, 0.65, spotNoise);
            color = mix(color, planetColor * 0.05, spot * 0.9);

            vec3 viewDir = normalize(cameraPosition - vWorldPosition);

            float fresnel = pow(
                1.0 - max(0.0, dot(vNormal, viewDir)),
                borderThickness
            );

            color += borderColor * fresnel * borderIntensity;

            vec3 lightDir = normalize(lightDirection);
            vec3 halfDir = normalize(lightDir + viewDir);

            float spec = pow(
                max(0.0, dot(vNormal, halfDir)),
                32.0
            );

            color += lightColor * spec * specularIntensity * lightIntensity;

            gl_FragColor = vec4(color * planetIntensity, 1.0);
        }
    `;

    function createPlanetGeometry() {
        return new THREE.SphereGeometry(
            config.surface.size,
            BASIC_SETUP.geometry.planetSegments,
            BASIC_SETUP.geometry.planetSegments
        );
    }

    const planetGeometry = createPlanetGeometry();

    const planetMaterial = new THREE.ShaderMaterial({
        vertexShader: planetVertexShader,
        fragmentShader: planetFragmentShader,
        uniforms: {
            time: { value: 0 },
            planetIntensity: { value: config.surface.intensity.min },
            specularIntensity: { value: BASIC_SETUP.planet.specularIntensity },
            lightIntensity: { value: config.light.intensity },
            borderIntensity: { value: config.border.intensity },
            borderThickness: { value: config.border.thickness },
            planetColor: { value: shaderColor(config.surface.color) },
            lightColor: { value: shaderColor(config.light.color) },
            borderColor: { value: shaderColor(config.border.color) },
            lightDirection: {
                value: new THREE.Vector3(...BASIC_SETUP.lighting.sun.position)
            }
        }
    });

    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.set(...config.surface.position);
    scene.add(planet);

    function createAtmosphereGeometry() {
        return new THREE.SphereGeometry(
            config.surface.size * config.glow.size,
            BASIC_SETUP.geometry.atmosphereSegments,
            BASIC_SETUP.geometry.atmosphereSegments
        );
    }

    const atmosphereGeo = createAtmosphereGeometry();

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
            atmosphereColor: { value: shaderColor(config.glow.color) },
            atmosphereIntensity: { value: config.glow.intensity }
        },
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false
    });

    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    atmosphere.position.copy(planet.position);
    scene.add(atmosphere);

    let currentSurfaceSize = config.surface.size;
    let currentGlowSize = config.glow.size;

    function update() {
        planet.position.set(...config.surface.position);
        atmosphere.position.copy(planet.position);
        planetMaterial.uniforms.planetColor.value.copy(shaderColor(config.surface.color));
        planetMaterial.uniforms.lightColor.value.copy(shaderColor(config.light.color));
        planetMaterial.uniforms.lightIntensity.value = config.light.intensity;
        planetMaterial.uniforms.borderColor.value.copy(shaderColor(config.border.color));
        planetMaterial.uniforms.borderIntensity.value = config.border.intensity;
        planetMaterial.uniforms.borderThickness.value = config.border.thickness;
        planetMaterial.uniforms.specularIntensity.value = BASIC_SETUP.planet.specularIntensity;
        planetMaterial.uniforms.lightDirection.value.set(...BASIC_SETUP.lighting.sun.position);
        atmosphereMat.uniforms.atmosphereColor.value.copy(shaderColor(config.glow.color));
        atmosphereMat.uniforms.atmosphereIntensity.value = config.glow.intensity;

        const surfaceSizeChanged = currentSurfaceSize !== config.surface.size;
        if (surfaceSizeChanged) {
            planet.geometry.dispose();
            planet.geometry = createPlanetGeometry();
            currentSurfaceSize = config.surface.size;
        }

        if (
            surfaceSizeChanged ||
            currentGlowSize !== config.glow.size
        ) {
            atmosphere.geometry.dispose();
            atmosphere.geometry = createAtmosphereGeometry();
            currentGlowSize = config.glow.size;
        }
    }

    function setVisible(visible) {
        planet.visible = visible;
        atmosphere.visible = visible;
    }

    return { planet, atmosphere, material: planetMaterial, update, setVisible };
}
