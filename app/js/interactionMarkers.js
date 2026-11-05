import * as THREE from 'three';
import { BASIC_SETUP, VISUAL_CONFIG, colorWithIntensity } from './config.js';

export function createInteractionMarkers(scene, camera) {
    const zones = BASIC_SETUP.interactionZones.map(position => ({
        position: new THREE.Vector3(...position)
    }));

    const markers = [];
    const ringGeometry = new THREE.TorusGeometry(
        VISUAL_CONFIG.markers.ringRadius,
        VISUAL_CONFIG.markers.ringTube,
        8,
        BASIC_SETUP.geometry.markerSegments
    );
    const coreGeometry = new THREE.SphereGeometry(
        VISUAL_CONFIG.markers.coreRadius,
        BASIC_SETUP.geometry.markerSphereSegments,
        BASIC_SETUP.geometry.markerSphereSegments
    );
    const glowGeometry = new THREE.SphereGeometry(
        VISUAL_CONFIG.markers.glowRadius,
        BASIC_SETUP.geometry.markerSphereSegments,
        BASIC_SETUP.geometry.markerSphereSegments
    );

    zones.forEach((zone) => {
        const marker = new THREE.Group();
        marker.position.copy(zone.position);

        const outerRing = new THREE.Mesh(
            ringGeometry,
            new THREE.MeshBasicMaterial({
                color: colorWithIntensity(
                    VISUAL_CONFIG.markers.color,
                    VISUAL_CONFIG.markers.ringIntensity
                ),
                transparent: true,
                opacity: VISUAL_CONFIG.markers.ringBaseOpacity
            })
        );

        marker.add(outerRing);

        const core = new THREE.Mesh(
            coreGeometry,
            new THREE.MeshBasicMaterial({
                color: colorWithIntensity(
                    VISUAL_CONFIG.markers.color,
                    VISUAL_CONFIG.markers.coreIntensity
                ),
                transparent: true,
                opacity: 1
            })
        );

        marker.add(core);

        const coreGlow = new THREE.Mesh(
            glowGeometry,
            new THREE.MeshBasicMaterial({
                color: colorWithIntensity(
                    VISUAL_CONFIG.markers.color,
                    VISUAL_CONFIG.markers.glowIntensity
                ),
                transparent: true,
                opacity: VISUAL_CONFIG.markers.glowBaseOpacity
            })
        );

        marker.add(coreGlow);
        scene.add(marker);

        markers.push({ marker, outerRing, coreGlow });
    });


    function update(time) {
        markers.forEach(({ marker, outerRing, coreGlow }, i) => {
            const phase = i;

            outerRing.lookAt(camera.position);

            const ringPulse =
                1 + Math.sin(
                    time * VISUAL_CONFIG.markers.ringPulseSpeed + phase
                ) * VISUAL_CONFIG.markers.ringPulseAmplitude;

            outerRing.scale.setScalar(ringPulse);

            outerRing.material.opacity =
                VISUAL_CONFIG.markers.ringBaseOpacity +
                Math.sin(
                    time * VISUAL_CONFIG.markers.ringOpacitySpeed + phase
                ) * VISUAL_CONFIG.markers.ringOpacityAmplitude;

            const glowPulse =
                1 + Math.sin(
                    time * VISUAL_CONFIG.markers.glowPulseSpeed + phase
                ) * VISUAL_CONFIG.markers.glowPulseAmplitude;

            coreGlow.scale.setScalar(glowPulse);

            coreGlow.material.opacity =
                VISUAL_CONFIG.markers.glowBaseOpacity +
                Math.sin(
                    time * VISUAL_CONFIG.markers.glowOpacitySpeed + phase
                ) * VISUAL_CONFIG.markers.glowOpacityAmplitude;

            marker.position.y =
                zones[i].position.y +
                Math.sin(
                    time * VISUAL_CONFIG.markers.floatSpeed + phase
                ) * VISUAL_CONFIG.markers.floatAmplitude;
        });
    }

    return { update };
}
