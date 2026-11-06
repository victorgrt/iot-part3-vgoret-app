import * as THREE from 'three';
import {
    BASIC_SETUP,
    VISUAL_CONTROLS,
    QUARTER_ROTATION,
    colorWithIntensity
} from './config.js';

export function createShootingStars(scene) {
    class ShootingStar {
        constructor() {
            this.mesh = new THREE.Group();
            this.createMesh();
            this.reset();
            scene.add(this.mesh);
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

            const trailGeometry = new THREE.ConeGeometry(
                trailConfig.width,
                trailConfig.length,
                BASIC_SETUP.geometry.shootingStarSegments
            );
            trailGeometry.rotateX(QUARTER_ROTATION);
            trailGeometry.translate(0, 0, trailConfig.length / 2);

            this.trailMaterial = new THREE.MeshBasicMaterial({
                color: colorWithIntensity(
                    trailConfig.color,
                    trailConfig.intensity + head.glowIntensity
                ),
                transparent: true,
                opacity: 0.5,
                toneMapped: false
            });
            const trail = new THREE.Mesh(
                trailGeometry,
                this.trailMaterial
            );

            this.mesh.add(trail);
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

    const stars = Array.from(
        { length: VISUAL_CONTROLS.shootingStars.count },
        () => new ShootingStar()
    );

    return {
        update() {
            stars.forEach(star => star.update());
        },
        setColor(color) {
            const { head, trail } = VISUAL_CONTROLS.shootingStars;

            stars.forEach(star => {
                star.headMaterial.color.copy(colorWithIntensity(
                    color,
                    head.intensity + head.glowIntensity
                ));
                star.trailMaterial.color.copy(colorWithIntensity(
                    color,
                    trail.intensity + head.glowIntensity
                ));
            });
        }
    };
}
