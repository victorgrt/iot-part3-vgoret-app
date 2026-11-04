import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
        import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
        import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
        
        // --- CONFIGURATION ---
        // Adjust the visual experience here instead of hunting values throughout the scene.
        // Angles are expressed in radians; FULL_ROTATION is one complete revolution.
        const FULL_ROTATION = Math.PI * 2;
        const HALF_ROTATION = FULL_ROTATION / 2;
        const QUARTER_ROTATION = FULL_ROTATION / 4;

        const CONFIG = {
            colors: {
                background: 0x000510,
                accent: 0x00ffff,
                accentGreen: 0x00ff88,
                neptune: 0x4b70dd,
                ambientLight: 0x404060,
                sunLight: 0xffffff,
                rimLight: 0x00ffff,
                nebula: 0x4466aa,
                purpleLight: 0x8800ff
            },
            matrix: {
                fontSize: 14,
                frameIntervalMs: 50,
                fadeFill: 'rgba(0, 5, 16, 0.04)',
                textColor: '#00ffff',
                opacityMin: 0.3,
                opacityRange: 0.5,
                resetThreshold: 0.975
            },
            loading: {
                incrementRange: 20,
                tickIntervalMs: 100,
                fadeDelayMs: 300,
                fadeDurationMs: 500
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
                threshold: 0.1,
                kernelSize: 0.4,
                luminanceThreshold: 0.85
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
            ship: {
                position: [25, 75, 25],
                initialRotationY: HALF_ROTATION,
                bodyLength: 8,
                bodySegments: 20,
                floatBaseY: 16,
                floatAmplitude: 0.3,
                floatSpeed: 0.5,
                rotationZAmplitude: 0.02,
                rotationZSpeed: 0.2,
                rotationXAmplitude: 0.01,
                rotationXSpeed: 0.3,
                cockpitIdleEmissive: 0.8,
                cockpitHoverEmissive: 1.5
            },
            markers: {
                ringRadius: 2.5,
                ringTube: 0.08,
                ringOpacity: 0.8,
                coreRadius: 0.4,
                glowRadius: 0.8,
                hitRadius: 3,
                orbitAngleStep: FULL_ROTATION / 3,
                orbitSpeed: 0.3,
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
                glowBaseOpacity: 0.2,
                hoverCoreScale: 1.3
            },
            animation: {
                markerPulsePhaseStep: 1,
                cursorDefault: 'default',
                cursorInteractive: 'pointer',
                zoneLabelOffsetY: 40,
                shipLabelOffsetY: 60
            }
        };

        // Compatibility alias retained for the existing scene code.
        const sceneConfig = {
            neptuneRadius: CONFIG.planet.radius,
            colorBg: CONFIG.colors.background,
            colorNeptune: CONFIG.colors.neptune,
            accentColor: CONFIG.colors.accent
        };
        

        // --- MATRIX RAIN EFFECT ---
        const matrixCanvas = document.getElementById('matrix-canvas');
        const ctx = matrixCanvas.getContext('2d');
        
        function resizeMatrix() {
            matrixCanvas.width = window.innerWidth;
            matrixCanvas.height = window.innerHeight;
        }
        resizeMatrix();
        window.addEventListener('resize', resizeMatrix);
        
        const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
        const fontSize = CONFIG.matrix.fontSize;
        let columns = Math.floor(matrixCanvas.width / fontSize);
        const drops = [];
        
        for(let i = 0; i < columns; i++) {
            drops[i] = 1;
        }
        
        function drawMatrix() {
            ctx.fillStyle = CONFIG.matrix.fadeFill;
            ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
            
            ctx.fillStyle = CONFIG.matrix.textColor;
            ctx.font = fontSize + 'px Courier New';
            
            for(let i = 0; i < drops.length; i++) {
                const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                const opacity = Math.random() * CONFIG.matrix.opacityRange + CONFIG.matrix.opacityMin;
                ctx.globalAlpha = opacity;
                ctx.fillText(char, i * fontSize, drops[i] * fontSize);
                
                if(drops[i] * fontSize > matrixCanvas.height && Math.random() > CONFIG.matrix.resetThreshold) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            ctx.globalAlpha = 1;
        }
        
        setInterval(drawMatrix, CONFIG.matrix.frameIntervalMs);
        
        // --- SETUP ---
        const container = document.getElementById('canvas-container');
        const modalOverlay = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal-content');
        const modalBody = document.getElementById('modal-body');
        const loadingScreen = document.getElementById('loading');
        const loadingProgress = document.getElementById('loading-progress');
        const clickIndicator = document.getElementById('click-indicator');
        
        // Simulate loading
        let loadProgress = 0;
        const loadInterval = setInterval(() => {
            loadProgress += Math.random() * CONFIG.loading.incrementRange;
            if (loadProgress >= 100) {
                loadProgress = 100;
                loadingProgress.style.width = '100%';
                clearInterval(loadInterval);
                setTimeout(() => {
                    loadingScreen.style.opacity = '0';
                    loadingScreen.style.transition = `opacity ${CONFIG.loading.fadeDurationMs / 1000}s ease`;
                    setTimeout(() => loadingScreen.remove(), CONFIG.loading.fadeDurationMs);
                }, CONFIG.loading.fadeDelayMs);
            } else {
                loadingProgress.style.width = loadProgress + '%';
            }
        }, CONFIG.loading.tickIntervalMs);
        
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(sceneConfig.colorBg);
        const camera = new THREE.PerspectiveCamera(CONFIG.camera.fieldOfView, window.innerWidth / window.innerHeight, CONFIG.camera.near, CONFIG.camera.far);
        camera.position.set(...CONFIG.camera.position);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.renderer.maxPixelRatio));
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
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), CONFIG.bloom.strength, CONFIG.bloom.kernelSize, CONFIG.bloom.luminanceThreshold);
        bloomPass.threshold = CONFIG.bloom.threshold;
        bloomPass.strength = CONFIG.bloom.strength;
        bloomPass.radius = CONFIG.bloom.radius;
        const composer = new EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);
        
        // --- LIGHTING ---
        const ambientLight = new THREE.AmbientLight(CONFIG.colors.ambientLight, CONFIG.lighting.ambientIntensity);
        scene.add(ambientLight);
        const sunLight = new THREE.DirectionalLight(CONFIG.colors.sunLight, CONFIG.lighting.sunIntensity);
        sunLight.position.set(...CONFIG.lighting.sunPosition);
        scene.add(sunLight);
        
        const rimLight = new THREE.DirectionalLight(CONFIG.colors.rimLight, CONFIG.lighting.rimIntensity);
        rimLight.position.set(...CONFIG.lighting.rimPosition);
        scene.add(rimLight);
        const purpleLight = new THREE.PointLight(CONFIG.colors.purpleLight, CONFIG.lighting.purpleIntensity, CONFIG.lighting.purpleDistance);
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
                    colors[i3] = 1; colors[i3 + 1] = 0.7; colors[i3 + 2] = 0.4;
                } else if (colorChoice > 0.7) {
                    colors[i3] = 0.4; colors[i3 + 1] = 0.8; colors[i3 + 2] = 1;
                } else {
                    colors[i3] = 1; colors[i3 + 1] = 1; colors[i3 + 2] = 1;
                }
                
                sizes[i] = Math.random() * CONFIG.stars.sizeRange + CONFIG.stars.minSize;
            }
            starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
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
                    CONFIG.shootingStars.spawnX[0] + Math.random() * (CONFIG.shootingStars.spawnX[1] - CONFIG.shootingStars.spawnX[0]),
                    CONFIG.shootingStars.spawnY[0] + Math.random() * (CONFIG.shootingStars.spawnY[1] - CONFIG.shootingStars.spawnY[0]),
                    CONFIG.shootingStars.spawnZ[0] + Math.random() * (CONFIG.shootingStars.spawnZ[1] - CONFIG.shootingStars.spawnZ[0])
                );
                this.mesh.rotation.z = CONFIG.shootingStars.rotationZ;
                this.speed = CONFIG.shootingStars.minSpeed + Math.random() * CONFIG.shootingStars.speedRange;
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
                
                if (this.mesh.position.x < CONFIG.shootingStars.resetX || this.mesh.position.y < CONFIG.shootingStars.resetY) {
                    this.reset();
                }
            }
        }
        const shootingStars = Array.from({ length: CONFIG.shootingStars.count }, () => new ShootingStar());
        
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
            nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
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
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
            
            float snoise(vec3 v) {
                const vec2  C = vec2(1.0/6.0, 1.0/3.0);
                const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
                vec3 i  = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;
                i = mod289(i);
                vec4 p = permute(permute(permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                float n_ = 0.142857142857;
                vec3  ns = n_ * D.wyz - D.xzx;
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);
                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
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
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }
            float fbm(vec3 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                for(int i = 0; i < 5; i++) {
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
                vec3 noisePos = vec3(vPosition.x * 0.25, vPosition.y * 0.12, vPosition.z * 0.25 + time * 0.015);
                float n1 = fbm(noisePos);
                float n2 = fbm(noisePos * 2.0 + vec3(time * 0.01));
                
                float band = sin(vPosition.y * 0.6 + n1 * 2.0);
                
                vec3 color = mix(deepBlue, oceanBlue, smoothstep(-0.5, 0.5, band));
                color = mix(color, lightBlue, n1 * 0.5);
                
                if (n2 > 0.25) {
                    color = mix(color, white, 0.35);
                }
                
                float spotNoise = snoise(vec3(vPosition.x * 1.2, vPosition.y * 1.2 + time * 0.04, vPosition.z * 1.2));
                float spot = smoothstep(0.5, 0.65, spotNoise);
                color = mix(color, darkSpot, spot * 0.9);
                vec3 viewDir = normalize(cameraPosition - vWorldPosition);
                float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 2.5);
                
                vec3 atmosphere = vec3(0.2, 0.5, 1.0);
                color += atmosphere * fresnel * 0.9;
                
                vec3 lightDir = normalize(vec3(50.0, 30.0, 30.0));
                vec3 halfDir = normalize(lightDir + viewDir);
                float spec = pow(max(0.0, dot(vNormal, halfDir)), 32.0);
                color += vec3(0.5, 0.7, 1.0) * spec * 0.6;
                gl_FragColor = vec4(color, 1.0);
            }
        `;
        
        // --- NEPTUNE MESH ---
        const neptuneGeo = new THREE.SphereGeometry(sceneConfig.neptuneRadius, CONFIG.planet.segments, CONFIG.planet.segments);
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
        const atmosphereGeo = new THREE.SphereGeometry(sceneConfig.neptuneRadius * CONFIG.planet.atmosphereScale, CONFIG.planet.atmosphereSegments, CONFIG.planet.atmosphereSegments);
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
                    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0);
                    gl_FragColor = vec4(0.2, 0.4, 1.0, 1.0) * intensity;
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });
        const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
        scene.add(atmosphere);
        
        // --- SPACESHIP AS HEADER ---
        const shipGroup = new THREE.Group();
        shipGroup.name = 'spaceship';
        
        // Position as header - top center area
        shipGroup.position.set(...CONFIG.ship.position);
        shipGroup.rotation.y = CONFIG.ship.initialRotationY;
        
        // Main Body (Fuselage) - larger and more visible
        const bodyLength = CONFIG.ship.bodyLength;
        const bodyGeo = new THREE.CylinderGeometry(0.6, 1.5, bodyLength, CONFIG.ship.bodySegments);
        bodyGeo.rotateX(QUARTER_ROTATION);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0x505060, 
            metalness: 0.95, 
            roughness: 0.15 
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        shipGroup.add(body);
        
        // Nose cone
        const noseGeo = new THREE.ConeGeometry(0.6, 3, CONFIG.ship.bodySegments);
        noseGeo.rotateX(-QUARTER_ROTATION);
        noseGeo.translate(0, 0, -bodyLength / 2 - 1.5);
        const noseMat = new THREE.MeshStandardMaterial({ 
            color: 0x707080, 
            metalness: 0.85, 
            roughness: 0.2 
        });
        const nose = new THREE.Mesh(noseGeo, noseMat);
        shipGroup.add(nose);
        
        // Wings - larger delta wings
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(-5, 3);
        wingShape.lineTo(-1.5, 0);
        wingShape.lineTo(-5, -3);
        wingShape.lineTo(0, 0);
        
        const wingExtrudeSettings = { depth: 0.15, bevelEnabled: false };
        const wingGeo = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings);
        wingGeo.rotateX(QUARTER_ROTATION);
        wingGeo.translate(1, 0, 0);
        const wingMat = new THREE.MeshStandardMaterial({ 
            color: 0xcc0000, 
            metalness: 0.7, 
            roughness: 0.35 
        });
        
        const leftWing = new THREE.Mesh(wingGeo, wingMat);
        leftWing.scale.set(0.9, 0.9, 0.9);
        shipGroup.add(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeo, wingMat);
        rightWing.scale.set(-0.9, 0.9, 0.9);
        shipGroup.add(rightWing);
        
        // Cockpit canopy - larger
        const cockpitGeo = new THREE.SphereGeometry(1, 24, 24);
        cockpitGeo.scale(1, 0.6, 2.5);
        cockpitGeo.translate(0, 0.6, -0.5);
        const cockpitMat = new THREE.MeshStandardMaterial({ 
            color: 0x00ffff, 
            metalness: 0.1, 
            roughness: 0.05,
            emissive: 0x006666,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.95
        });
        const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
        shipGroup.add(cockpit);
        
        // Engines - dual
        const engineGeo = new THREE.CylinderGeometry(0.4, 0.7, 2, 20);
        engineGeo.rotateX(QUARTER_ROTATION);
        const engineMat = new THREE.MeshStandardMaterial({ color: 0x303030, metalness: 0.9 });
        
        const engineL = new THREE.Mesh(engineGeo, engineMat);
        engineL.position.set(-2, 0, bodyLength / 2 + 0.8);
        shipGroup.add(engineL);
        
        const engineR = new THREE.Mesh(engineGeo, engineMat);
        engineR.position.set(2, 0, bodyLength / 2 + 0.8);
        shipGroup.add(engineR);
        
        // Engine glows
        const glowGeo = new THREE.SphereGeometry(0.5, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        
        const glowL = new THREE.Mesh(glowGeo, glowMat);
        glowL.position.set(-2, 0, bodyLength / 2 + 2);
        glowL.scale.set(1, 1, 2.5);
        shipGroup.add(glowL);
        
        const glowR = glowL.clone();
        glowR.position.set(2, 0, bodyLength / 2 + 2);
        shipGroup.add(glowR);
        
        // Engine lights
        const engineLightL = new THREE.PointLight(0x00ffff, 2, 15);
        engineLightL.position.set(-2, 0, bodyLength / 2 + 2.5);
        shipGroup.add(engineLightL);
        
        const engineLightR = new THREE.PointLight(0x00ffff, 2, 15);
        engineLightR.position.set(2, 0, bodyLength / 2 + 2.5);
        shipGroup.add(engineLightR);
        
        // Detail lines with glow
        const lineMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.7 });
        for(let i = 0; i < 7; i++) {
            const lineGeo = new THREE.BoxGeometry(0.08, 0.08, bodyLength * 0.85);
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.position.set(-0.9 + i * 0.3, 0, 0);
            shipGroup.add(line);
        }
        
        // Header indicator line
        const headerLineGeo = new THREE.BoxGeometry(bodyLength * 1.2, 0.05, 0.05);
        const headerLineMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.6 });
        const headerLine = new THREE.Mesh(headerLineGeo, headerLineMat);
        headerLine.position.set(0, -2, 0);
        shipGroup.add(headerLine);
        
        scene.add(shipGroup);
        
        // --- INTERACTION ZONES ON NEPTUNE (CLEARLY VISIBLE) ---
        const zones = [
            {
                name: 'projects',
                position: new THREE.Vector3(0, 10, 3),
                title: '🚀 PROJECTS',
                icon: '🛠️',
                labelElement: document.getElementById('zone-label-projects'),
                content: `
                    <div class="modal-section">
                        <p style="font-size: 16px;">Innovative full-stack applications crafted with passion and precision.</p>
                    </div>
                    <div class="modal-section">
                        <h3 style="color: #00ffff; font-size: 14px; margin-bottom: 12px;">◆ FEATURED WORK</h3>
                        <p>• 3D Interactive Portfolio (this!)<br>• E-Commerce Platform<br>• Real-time Chat App<br>• AI-Powered Dashboard</p>
                    </div>
                    <div style="margin-top: 18px;">
                        <span class="skill-tag">React</span>
                        <span class="skill-tag">Three.js</span>
                        <span class="skill-tag">Node.js</span>
                        <span class="skill-tag">PostgreSQL</span>
                    </div>
                `
            },
            {
                name: 'about',
                position: new THREE.Vector3(-5, 0, -10),
                title: '👨‍🚀 ABOUT ME',
                icon: '👨‍💻',
                labelElement: document.getElementById('zone-label-about'),
                content: `
                    <div class="modal-section">
                        <p style="font-size: 16px;">Creative developer obsessed with the cosmos and cutting-edge technology.</p>
                    </div>
                    <div class="modal-section">
                        <h3 style="color: #00ffff; font-size: 14px; margin-bottom: 12px;">◆ EXPERTISE</h3>
                        <p>• 5+ Years Development<br>• UI/UX Design<br>• 3D Graphics/WebGL<br>• Cloud Architecture</p>
                    </div>
                    <div style="margin-top: 18px;">
                        <span class="skill-tag">JavaScript</span>
                        <span class="skill-tag">TypeScript</span>
                        <span class="skill-tag">Python</span>
                        <span class="skill-tag">AWS</span>
                    </div>
                `
            },
            {
                name: 'contact',
                position: new THREE.Vector3(-3, -10, 4),
                title: '📡 CONTACT',
                icon: '📧',
                labelElement: document.getElementById('zone-label-contact'),
                content: `
                    <div class="modal-section">
                        <p style="font-size: 16px;">Ready to launch your next project? Let's connect across the digital cosmos.</p>
                    </div>
                    <div class="modal-section">
                        <h3 style="color: #00ffff; font-size: 14px; margin-bottom: 12px;">◆ REACH OUT</h3>
                        <p>• <strong>Email:</strong> dev@portfolio.com<br>• <strong>GitHub:</strong> github.com/dev<br>• <strong>LinkedIn:</strong> linkedin.com/in/dev</p>
                    </div>
                    <div style="margin-top: 18px;">
                        <span class="skill-tag">Open for Work</span>
                        <span class="skill-tag">Freelance</span>
                    </div>
                `
            }
        ];
        
        // Create highly visible zone markers
        const markers = [];
        const zoneClickables = [];
        zones.forEach((zone, index) => {
            // Large glowing outer ring
            const outerRingGeo = new THREE.TorusGeometry(CONFIG.markers.ringRadius, CONFIG.markers.ringTube, 8, 64);
            const outerRingMat = new THREE.MeshBasicMaterial({ 
                color: 0x00ffff, 
                transparent: true, 
                opacity: CONFIG.markers.ringOpacity 
            });
            const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
            outerRing.position.copy(zone.position);
            scene.add(outerRing);
            
            // Inner pulsing core
            const coreGeo = new THREE.SphereGeometry(CONFIG.markers.coreRadius, 16, 16);
            const coreMat = new THREE.MeshBasicMaterial({ 
                color: 0x00ffff, 
                transparent: true, 
                opacity: 1 
            });
            const core = new THREE.Mesh(coreGeo, coreMat);
            core.position.copy(zone.position);
            scene.add(core);
            
            // Core glow
            const coreGlowGeo = new THREE.SphereGeometry(CONFIG.markers.glowRadius, 16, 16);
            const coreGlowMat = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.3
            });
            const coreGlow = new THREE.Mesh(coreGlowGeo, coreGlowMat);
            coreGlow.position.copy(zone.position);
            scene.add(coreGlow);
            
            // Clickable sphere (invisible but larger hit area)
            const clickGeo = new THREE.SphereGeometry(CONFIG.markers.hitRadius, 16, 16);
            const clickMat = new THREE.MeshBasicMaterial({ visible: false });
            const clickMesh = new THREE.Mesh(clickGeo, clickMat);
            clickMesh.position.copy(zone.position);
            clickMesh.userData = { ...zone, type: 'zone' };
            scene.add(clickMesh);
            markers.push(clickMesh);
            zoneClickables.push(clickMesh);
            
            // Store animation data
            clickMesh.userData.outerRing = outerRing;
            clickMesh.userData.core = core;
            clickMesh.userData.coreGlow = coreGlow;
            clickMesh.userData.baseScale = 1;
            clickMesh.userData.angle = index * CONFIG.markers.orbitAngleStep;
        });
        
        // Add spaceship to interactive objects
        shipGroup.userData = {
            type: 'spaceship',
            title: '🛸 SPACESHIP',
            icon: '🚀',
            labelElement: document.getElementById('spaceship-label'),
            content: `
                <div class="modal-section">
                    <p style="font-size: 16px;">Welcome aboard the development vessel. This portfolio was crafted with precision and cosmic inspiration.</p>
                </div>
                <div class="modal-section">
                    <h3 style="color: #00ffff; font-size: 14px; margin-bottom: 12px;">◆ TECHNOLOGIES</h3>
                    <p>• Three.js for 3D rendering<br>• Custom GLSL shaders<br>• Post-processing bloom effects<br>• Matrix digital rain background</p>
                </div>
                <div style="margin-top: 18px;">
                    <span class="skill-tag">WebGL</span>
                    <span class="skill-tag">Tailwind</span>
                    <span class="skill-tag">ES6+</span>
                    <span class="skill-tag">GLSL</span>
                </div>
            `
        };
        markers.push(shipGroup);
        
        // --- MODAL FUNCTIONS ---
        window.closeModal = function() {
            modalOverlay.classList.remove('active');
            modalContent.style.display = 'none';
            controls.target.set(0, 0, 0);
            controls.autoRotate = true;
        };
        
        function showModal(data) {
            modalBody.innerHTML = `
                <div class="modal-icon" style="font-size: 50px;">${data.icon || '🌐'}</div>
                <h2 style="font-size: 1.6rem;">${data.title}</h2>
                ${data.content}
            `;
            modalContent.style.display = 'block';
            modalOverlay.classList.add('active');
            
            if (data.position) {
                const targetPos = data.position.clone();
                controls.target.lerp(targetPos, 1);
            }
            controls.autoRotate = false;
        }
        
        // --- RAYCASTER SETUP ---
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        // Handle mouse move
        window.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Update zone labels position
            zones.forEach(zone => {
                const screenPos = zone.position.clone().project(camera);
                const labelX = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
                const labelY = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;
                zone.labelElement.style.left = labelX + 'px';
                zone.labelElement.style.top = (labelY - CONFIG.animation.zoneLabelOffsetY) + 'px';
            });
            
            // Update spaceship label
            const shipScreenPos = shipGroup.position.clone().project(camera);
            const shipLabelX = (shipScreenPos.x * 0.5 + 0.5) * window.innerWidth;
            const shipLabelY = (-(shipScreenPos.y * 0.5) + 0.5) * window.innerHeight;
            const shipLabel = document.getElementById('spaceship-label');
            shipLabel.style.left = shipLabelX + 'px';
            shipLabel.style.top = (shipLabelY - CONFIG.animation.shipLabelOffsetY) + 'px';
        });
        
        // Handle click
        window.addEventListener('click', (event) => {
            if (modalOverlay.classList.contains('active')) return;
            
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects([...markers, ...zoneClickables], true);
            
            if (intersects.length > 0) {
                let target = intersects[0].object;
                
                // Handle spaceship children
                if (target.parent && target.parent.userData && target.parent.userData.type === 'spaceship') {
                    target = target.parent;
                }
                
                if (target.userData && target.userData.type) {
                    showModal(target.userData);
                }
            }
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
            
            // Animate zones with visible effects
            zoneClickables.forEach((marker, i) => {
                const data = marker.userData;
                
                // Make rings face camera and pulse
                if (data.outerRing) {
                    data.outerRing.lookAt(camera.position);
                    const pulse = 1 + Math.sin(time * CONFIG.markers.ringPulseSpeed + i * CONFIG.animation.markerPulsePhaseStep) * CONFIG.markers.ringPulseAmplitude;
                    data.outerRing.scale.setScalar(pulse);
                    data.outerRing.material.opacity = CONFIG.markers.ringBaseOpacity + Math.sin(time * CONFIG.markers.ringOpacitySpeed + i * CONFIG.animation.markerPulsePhaseStep) * CONFIG.markers.ringOpacityAmplitude;
                }
                
                // Animate core glow
                if (data.coreGlow) {
                    const glowPulse = 1 + Math.sin(time * CONFIG.markers.glowPulseSpeed + i * CONFIG.animation.markerPulsePhaseStep) * CONFIG.markers.glowPulseAmplitude;
                    data.coreGlow.scale.setScalar(glowPulse);
                    data.coreGlow.material.opacity = CONFIG.markers.glowBaseOpacity + Math.sin(time * CONFIG.markers.glowOpacitySpeed + i * CONFIG.animation.markerPulsePhaseStep) * CONFIG.markers.glowOpacityAmplitude;
                }
                
                // Float animation
                marker.position.y = data.position.y + Math.sin(time * CONFIG.markers.floatSpeed + i * CONFIG.animation.markerPulsePhaseStep) * CONFIG.markers.floatAmplitude;
                
                // Show/hide label based on hover
                const screenPos = marker.position.clone().project(camera);
                const isInFront = screenPos.z < 1;
                
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObject(marker);
                
                if (intersects.length > 0 && isInFront) {
                    data.labelElement.classList.add('visible');
                    document.body.style.cursor = CONFIG.animation.cursorInteractive;
                    
                    // Show click indicator
                    const labelX = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
                    const labelY = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;
                    clickIndicator.style.left = labelX + 'px';
                    clickIndicator.style.top = labelY + 'px';
                    clickIndicator.classList.add('active');
                    
                    // Highlight effect
                    if (data.core) {
                        data.core.material.color.setHex(0x00ff88);
                        data.core.scale.setScalar(CONFIG.markers.hoverCoreScale);
                    }
                } else {
                    data.labelElement.classList.remove('visible');
                    if (data.core) {
                        data.core.material.color.setHex(0x00ffff);
                        data.core.scale.setScalar(1);
                    }
                }
            });
            
            // Animate spaceship (header)
            shipGroup.position.y = CONFIG.ship.floatBaseY + Math.sin(time * CONFIG.ship.floatSpeed) * CONFIG.ship.floatAmplitude;
            shipGroup.rotation.z = Math.sin(time * CONFIG.ship.rotationZSpeed) * CONFIG.ship.rotationZAmplitude;
            shipGroup.rotation.x = Math.sin(time * CONFIG.ship.rotationXSpeed) * CONFIG.ship.rotationXAmplitude;
            
            // Check spaceship hover
            raycaster.setFromCamera(mouse, camera);
            const shipIntersects = raycaster.intersectObjects(shipGroup.children);
            
            const shipLabel = document.getElementById('spaceship-label');
            if (shipIntersects.length > 0) {
                shipLabel.classList.add('visible');
                document.body.style.cursor = CONFIG.animation.cursorInteractive;
                
                const shipScreenPos = shipGroup.position.clone().project(camera);
                const labelX = (shipScreenPos.x * 0.5 + 0.5) * window.innerWidth;
                const labelY = (-(shipScreenPos.y * 0.5) + 0.5) * window.innerHeight;
                clickIndicator.style.left = labelX + 'px';
                clickIndicator.style.top = labelY + 'px';
                clickIndicator.classList.add('active');
                
                // Highlight cockpit
                cockpit.material.emissiveIntensity = CONFIG.ship.cockpitHoverEmissive;
            } else {
                shipLabel.classList.remove('visible');
                cockpit.material.emissiveIntensity = CONFIG.ship.cockpitIdleEmissive;
            }
            
            if (!shipIntersects.length && !zoneClickables.some(m => {
                raycaster.setFromCamera(mouse, camera);
                return raycaster.intersectObject(m).length > 0;
            })) {
                document.body.style.cursor = CONFIG.animation.cursorDefault;
                clickIndicator.classList.remove('active');
            }
            
            // Update shooting stars
            shootingStars.forEach(star => star.update());
            
            // Update controls
            controls.update();
            
            // Render with bloom
            composer.render();
        }
        
        // Handle resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            composer.setSize(window.innerWidth, window.innerHeight);
            
            // Resize matrix canvas
            resizeMatrix();
            columns = Math.floor(matrixCanvas.width / fontSize);
            drops.length = 0;
            for(let i = 0; i < columns; i++) drops[i] = 1;
        });
        
        // Start animation
        animate();
