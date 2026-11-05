import * as THREE from 'three';
import {
    BASIC_SETUP,
    VISUAL_CONFIG,
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
            const config = VISUAL_CONFIG.shootingStars;
            const star = new THREE.Mesh(
                new THREE.SphereGeometry(
                    config.headRadius,
                    BASIC_SETUP.geometry.shootingStarSegments,
                    BASIC_SETUP.geometry.shootingStarSegments
                ),
                new THREE.MeshBasicMaterial({
                    color: colorWithIntensity(config.headColor, config.headIntensity)
                })
            );

            this.mesh.add(star);

            const trailGeometry = new THREE.ConeGeometry(
                config.trailRadius,
                config.trailLength,
                BASIC_SETUP.geometry.shootingStarSegments
            );
            trailGeometry.rotateX(QUARTER_ROTATION);
            trailGeometry.translate(0, 0, config.trailLength / 2);

            const trail = new THREE.Mesh(
                trailGeometry,
                new THREE.MeshBasicMaterial({
                    color: colorWithIntensity(config.trailColor, config.trailIntensity),
                    transparent: true,
                    opacity: config.trailOpacity
                })
            );

            this.mesh.add(trail);
        }

        reset() {
            const config = VISUAL_CONFIG.shootingStars;

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
            const config = VISUAL_CONFIG.shootingStars;

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

    return Array.from(
        { length: VISUAL_CONFIG.shootingStars.count },
        () => new ShootingStar()
    );
}
