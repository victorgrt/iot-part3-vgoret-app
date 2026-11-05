import * as THREE from 'three';
import { BASIC_SETUP, colorWithIntensity } from './config.js';

export function createInteractionMarkers(scene, camera) {
    const zones = BASIC_SETUP.interactionZones.map(position => ({
        position: new THREE.Vector3(...position)
    }));

    const markers = [];
    const ringGeometry = new THREE.TorusGeometry(
        BASIC_SETUP.markers.ringRadius,
        BASIC_SETUP.markers.ringTube,
        8,
        BASIC_SETUP.geometry.markerSegments
    );
    const coreGeometry = new THREE.SphereGeometry(
        BASIC_SETUP.markers.coreRadius,
        BASIC_SETUP.geometry.markerSphereSegments,
        BASIC_SETUP.geometry.markerSphereSegments
    );
    const glowGeometry = new THREE.SphereGeometry(
        BASIC_SETUP.markers.glowRadius,
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
                    BASIC_SETUP.markers.color,
                    BASIC_SETUP.markers.ringIntensity
                ),
                transparent: true,
                opacity: BASIC_SETUP.markers.ringBaseOpacity
            })
        );

        marker.add(outerRing);

        const core = new THREE.Mesh(
            coreGeometry,
            new THREE.MeshBasicMaterial({
                color: colorWithIntensity(
                    BASIC_SETUP.markers.color,
                    BASIC_SETUP.markers.coreIntensity
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
                    BASIC_SETUP.markers.color,
                    BASIC_SETUP.markers.glowIntensity
                ),
                transparent: true,
                opacity: BASIC_SETUP.markers.glowBaseOpacity
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
                    time * BASIC_SETUP.markers.ringPulseSpeed + phase
                ) * BASIC_SETUP.markers.ringPulseAmplitude;

            outerRing.scale.setScalar(ringPulse);

            outerRing.material.opacity =
                BASIC_SETUP.markers.ringBaseOpacity +
                Math.sin(
                    time * BASIC_SETUP.markers.ringOpacitySpeed + phase
                ) * BASIC_SETUP.markers.ringOpacityAmplitude;

            const glowPulse =
                1 + Math.sin(
                    time * BASIC_SETUP.markers.glowPulseSpeed + phase
                ) * BASIC_SETUP.markers.glowPulseAmplitude;

            coreGlow.scale.setScalar(glowPulse);

            coreGlow.material.opacity =
                BASIC_SETUP.markers.glowBaseOpacity +
                Math.sin(
                    time * BASIC_SETUP.markers.glowOpacitySpeed + phase
                ) * BASIC_SETUP.markers.glowOpacityAmplitude;

            marker.position.y =
                zones[i].position.y +
                Math.sin(
                    time * BASIC_SETUP.markers.floatSpeed + phase
                ) * BASIC_SETUP.markers.floatAmplitude;
        });
    }

    return { update };
}
