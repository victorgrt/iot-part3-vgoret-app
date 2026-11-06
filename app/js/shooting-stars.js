import * as THREE from 'three';
import {
    BASIC_SETUP,
    VISUAL_CONTROLS,
    QUARTER_ROTATION,
    colorWithIntensity
} from './config.js';

export function createShootingStars(scene) {
    const group = new THREE.Group();

    class ShootingStar {
        constructor() {
            this.mesh = new THREE.Group();
            this.createMesh();
            this.reset();
            group.add(this.mesh);
        }

        createMesh() {
            const config = VISUAL_CONTROLS.shootingStars;
            const head = config.head;
            const trailConfig = config.trail;
            this.headMaterial = new THREE.MeshBasicMaterial({
                color: colorWithIntensity(
                    head.color,
                    head.intensity + head.glowIntensity
                ),
                toneMapped: false
            });
            const star = new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.15,
                    BASIC_SETUP.geometry.shootingStarSegments,
                    BASIC_SETUP.geometry.shootingStarSegments
                ),
                this.headMaterial
            );

            this.mesh.add(star);

            this.trailGeometry = new THREE.ConeGeometry(
                trailConfig.width,
                trailConfig.length,
                BASIC_SETUP.geometry.shootingStarSegments
            );
            this.trailGeometry.rotateX(QUARTER_ROTATION);
            this.trailGeometry.translate(0, 0, trailConfig.length / 2);

            this.trailMaterial = new THREE.MeshBasicMaterial({
                color: colorWithIntensity(
                    trailConfig.color,
                    trailConfig.intensity + head.glowIntensity
                ),
                transparent: true,
                opacity: trailConfig.opacity,
                toneMapped: false
            });
            this.trail = new THREE.Mesh(this.trailGeometry, this.trailMaterial);

            this.mesh.add(this.trail);
        }

        reset() {
            const config = VISUAL_CONTROLS.shootingStars;
            const motion = BASIC_SETUP.shootingStars;
            const { center, spread } = config.placement;

            this.mesh.position.set(
                center[0] + (Math.random() * 2 - 1) * spread[0],
                center[1] + (Math.random() * 2 - 1) * spread[1],
                center[2] + (Math.random() * 2 - 1) * spread[2]
            );

            this.mesh.rotation.z = motion.rotationZ;
            this.speed = motion.minSpeed + Math.random() * motion.speedRange;

            this.mesh.visible = false;
            this.mesh.scale.setScalar(0);
        }

        update() {
            const config = VISUAL_CONTROLS.shootingStars;
            const motion = BASIC_SETUP.shootingStars;

            if (!this.mesh.visible) {
                if (Math.random() < motion.spawnChance) {
                    this.mesh.visible = true;
                    this.mesh.scale.setScalar(config.head.size);
                }

                return;
            }

            this.mesh.position.x -= this.speed * VISUAL_CONTROLS.motion.speed;
            this.mesh.position.y -= this.speed * 0.5 * VISUAL_CONTROLS.motion.speed;

            if (
                this.mesh.position.x < motion.resetX ||
                this.mesh.position.y < motion.resetY
            ) {
                this.reset();
            }
        }
    }

    const stars = [];
    scene.add(group);

    function resize(count) {
        while (stars.length > count) {
            const star = stars.pop();
            group.remove(star.mesh);
            star.mesh.traverse(object => {
                object.geometry?.dispose();
                if (object.material) {
                    object.material.dispose();
                }
            });
        }

        while (stars.length < count) {
            stars.push(new ShootingStar());
        }
    }

    function updateSettings(control) {
        const { head, trail } = VISUAL_CONTROLS.shootingStars;
        resize(VISUAL_CONTROLS.shootingStars.count);

        stars.forEach(star => {
            star.headMaterial.color.copy(colorWithIntensity(
                head.color,
                head.intensity + head.glowIntensity
            ));
            star.trailMaterial.color.copy(colorWithIntensity(
                trail.color,
                trail.intensity + head.glowIntensity
            ));
            star.trailMaterial.opacity = trail.opacity;
            star.mesh.scale.setScalar(head.size);
            star.mesh.rotation.z = BASIC_SETUP.shootingStars.rotationZ;
            star.speed =
                BASIC_SETUP.shootingStars.minSpeed +
                Math.random() * BASIC_SETUP.shootingStars.speedRange;

            if (control?.target === VISUAL_CONTROLS.shootingStars.placement) {
                star.reset();
            }

            const geometryParameters = star.trailGeometry.parameters;
            if (
                geometryParameters.radius !== trail.width ||
                geometryParameters.height !== trail.length
            ) {
                star.trail.geometry.dispose();
                star.trailGeometry = new THREE.ConeGeometry(
                    trail.width,
                    trail.length,
                    BASIC_SETUP.geometry.shootingStarSegments
                );
                star.trailGeometry.rotateX(QUARTER_ROTATION);
                star.trailGeometry.translate(0, 0, trail.length / 2);
                star.trail.geometry = star.trailGeometry;
            }
        });
    }

    return {
        update() {
            stars.forEach(star => star.update());
        },
        updateSettings,
        setVisible(visible) {
            group.visible = visible;
        },
        dispose() {
            resize(0);
            scene.remove(group);
        }
    };
}
