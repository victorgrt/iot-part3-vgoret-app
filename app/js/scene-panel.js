import { BASIC_SETUP, VISUAL_CONTROLS } from './config.js';

const controls = [];

function add(group, label, target, key, options = {}) {
    controls.push({ group, label, target, key, ...options });
}

function addVector(group, label, target, key, options = {}) {
    ['X', 'Y', 'Z'].forEach((axis, index) => {
        add(group, `${label} ${axis}`, target, key, {
            ...options,
            index
        });
    });
}

add('Planet', 'Surface color', VISUAL_CONTROLS.planet.surface, 'color', { type: 'color' });
add('Planet', 'Surface brightness · minimum', VISUAL_CONTROLS.planet.surface.intensity, 'min', { min: 0, max: 2, step: 0.01 });
add('Planet', 'Surface brightness · maximum', VISUAL_CONTROLS.planet.surface.intensity, 'max', { min: 0, max: 2, step: 0.01 });
add('Planet', 'Brightness cycle duration', VISUAL_CONTROLS.planet.surface.intensity, 'cycleDuration', { min: 0.2, max: 60, step: 0.1, unit: 's' });
add('Planet', 'Size', VISUAL_CONTROLS.planet.surface, 'size', { min: 1, max: 20, step: 0.1 });
addVector('Planet', 'Position', VISUAL_CONTROLS.planet.surface, 'position', { min: -100, max: 100, step: 0.5 });
add('Planet', 'Light color', VISUAL_CONTROLS.planet.light, 'color', { type: 'color' });
add('Planet', 'Light intensity', VISUAL_CONTROLS.planet.light, 'intensity', { min: 0, max: 4, step: 0.05 });
add('Planet', 'Border color', VISUAL_CONTROLS.planet.border, 'color', { type: 'color' });
add('Planet', 'Border intensity', VISUAL_CONTROLS.planet.border, 'intensity', { min: 0, max: 4, step: 0.05 });
add('Planet', 'Border thickness', VISUAL_CONTROLS.planet.border, 'thickness', { min: 0.01, max: 1, step: 0.01 });
add('Planet', 'Glow color', VISUAL_CONTROLS.planet.glow, 'color', { type: 'color' });
add('Planet', 'Glow intensity', VISUAL_CONTROLS.planet.glow, 'intensity', { min: 0, max: 4, step: 0.05 });
add('Planet', 'Glow size', VISUAL_CONTROLS.planet.glow, 'size', { min: 1, max: 2, step: 0.005 });
add('Planet', 'Rotation speed', BASIC_SETUP.planet, 'rotationSpeed', { min: 0, max: 0.005, step: 0.00001 });
add('Planet', 'Specular intensity', BASIC_SETUP.planet, 'specularIntensity', { min: 0, max: 4, step: 0.05 });

add('Moons', 'Moon count', VISUAL_CONTROLS.moons, 'count', { min: 0, max: 40, step: 1 });
add('Moons', 'Orbit radius', VISUAL_CONTROLS.moons, 'orbitRadius', { min: 1, max: 100, step: 0.5 });
add('Moons', 'Orbit radius variation', VISUAL_CONTROLS.moons, 'orbitRadiusVariation', { min: 0, max: 30, step: 0.1 });
add('Moons', 'Minimum separation', VISUAL_CONTROLS.moons, 'minimumDistance', { min: 0, max: 50, step: 0.5 });
add('Moons', 'Orbit height', VISUAL_CONTROLS.moons, 'orbitHeight', { min: -50, max: 50, step: 0.5 });
add('Moons', 'Size', VISUAL_CONTROLS.moons, 'size', { min: 0.1, max: 5, step: 0.05 });
add('Moons', 'Surface color', VISUAL_CONTROLS.moons, 'color', { type: 'color' });
add('Moons', 'Surface intensity', VISUAL_CONTROLS.moons, 'intensity', { min: 0, max: 4, step: 0.05 });
add('Moons', 'Surface noise scale', VISUAL_CONTROLS.moons.surfaceNoise, 'scale', { min: 0, max: 20, step: 0.1 });
add('Moons', 'Surface noise intensity', VISUAL_CONTROLS.moons.surfaceNoise, 'intensity', { min: 0, max: 3, step: 0.05 });
add('Moons', 'Light color', VISUAL_CONTROLS.moons.light, 'color', { type: 'color' });
add('Moons', 'Light intensity', VISUAL_CONTROLS.moons.light, 'intensity', { min: 0, max: 4, step: 0.05 });
add('Moons', 'Light distance', VISUAL_CONTROLS.moons.light, 'distance', { min: 0, max: 100, step: 0.5 });
add('Moons', 'Rim color', VISUAL_CONTROLS.moons.rim, 'color', { type: 'color' });
add('Moons', 'Rim intensity', VISUAL_CONTROLS.moons.rim, 'intensity', { min: 0, max: 4, step: 0.05 });
add('Moons', 'Rim thickness', VISUAL_CONTROLS.moons.rim, 'thickness', { min: 0.005, max: 0.5, step: 0.005 });
add('Moons', 'Rim opacity', VISUAL_CONTROLS.moons.rim, 'baseOpacity', { min: 0, max: 1, step: 0.01 });
add('Moons', 'Rim pulse speed', VISUAL_CONTROLS.moons.rim, 'pulseSpeed', { min: 0, max: 10, step: 0.05 });
add('Moons', 'Rim pulse amount', VISUAL_CONTROLS.moons.rim, 'pulseAmount', { min: 0, max: 1, step: 0.01 });
add('Moons', 'Glow color', VISUAL_CONTROLS.moons.glow, 'color', { type: 'color' });
add('Moons', 'Glow intensity', VISUAL_CONTROLS.moons.glow, 'intensity', { min: 0, max: 4, step: 0.05 });
add('Moons', 'Glow size', VISUAL_CONTROLS.moons.glow, 'size', { min: 1, max: 3, step: 0.01 });
add('Moons', 'Glow opacity', VISUAL_CONTROLS.moons.glow, 'baseOpacity', { min: 0, max: 1, step: 0.01 });
add('Moons', 'Glow pulse speed', VISUAL_CONTROLS.moons.glow, 'pulseSpeed', { min: 0, max: 10, step: 0.05 });
add('Moons', 'Glow pulse amount', VISUAL_CONTROLS.moons.glow, 'pulseAmount', { min: 0, max: 1, step: 0.01 });
add('Moons', 'Float height', VISUAL_CONTROLS.moons, 'floatHeight', { min: 0, max: 5, step: 0.05 });
add('Moons', 'Float speed', VISUAL_CONTROLS.moons, 'floatSpeed', { min: 0, max: 10, step: 0.05 });

add('Shooting stars', 'Star count', VISUAL_CONTROLS.shootingStars, 'count', { min: 0, max: 40, step: 1 });
add('Shooting stars', 'Head color', VISUAL_CONTROLS.shootingStars.head, 'color', { type: 'color' });
add('Shooting stars', 'Head intensity', VISUAL_CONTROLS.shootingStars.head, 'intensity', { min: 0, max: 4, step: 0.05 });
add('Shooting stars', 'Head size', VISUAL_CONTROLS.shootingStars.head, 'size', { min: 0.1, max: 4, step: 0.05 });
add('Shooting stars', 'Head glow intensity', VISUAL_CONTROLS.shootingStars.head, 'glowIntensity', { min: 0, max: 4, step: 0.05 });
add('Shooting stars', 'Trail color', VISUAL_CONTROLS.shootingStars.trail, 'color', { type: 'color' });
add('Shooting stars', 'Trail intensity', VISUAL_CONTROLS.shootingStars.trail, 'intensity', { min: 0, max: 4, step: 0.05 });
add('Shooting stars', 'Trail length', VISUAL_CONTROLS.shootingStars.trail, 'length', { min: 0.1, max: 20, step: 0.1 });
add('Shooting stars', 'Trail width', VISUAL_CONTROLS.shootingStars.trail, 'width', { min: 0.01, max: 2, step: 0.01 });
add('Shooting stars', 'Trail opacity', VISUAL_CONTROLS.shootingStars.trail, 'opacity', { min: 0, max: 1, step: 0.01 });
addVector('Shooting stars', 'Spawn center', VISUAL_CONTROLS.shootingStars.placement, 'center', { min: -500, max: 500, step: 1 });
addVector('Shooting stars', 'Spawn spread', VISUAL_CONTROLS.shootingStars.placement, 'spread', { min: 0, max: 200, step: 1 });
add('Shooting stars', 'Minimum speed', BASIC_SETUP.shootingStars, 'minSpeed', { min: 0, max: 20, step: 0.1 });
add('Shooting stars', 'Speed variation', BASIC_SETUP.shootingStars, 'speedRange', { min: 0, max: 20, step: 0.1 });
add('Shooting stars', 'Spawn chance', BASIC_SETUP.shootingStars, 'spawnChance', { min: 0, max: 0.05, step: 0.0005 });
add('Shooting stars', 'Travel angle', BASIC_SETUP.shootingStars, 'rotationZ', { min: -6.28, max: 6.28, step: 0.01 });
add('Shooting stars', 'Reset X position', BASIC_SETUP.shootingStars, 'resetX', { min: -500, max: 100, step: 1 });
add('Shooting stars', 'Reset Y position', BASIC_SETUP.shootingStars, 'resetY', { min: -500, max: 100, step: 1 });

add('Hiragana', 'Character count', VISUAL_CONTROLS.hiragana, 'count', { min: 0, max: 15000, step: 100 });
add('Hiragana', 'Color', VISUAL_CONTROLS.hiragana.appearance, 'color', { type: 'color' });
add('Hiragana', 'Intensity', VISUAL_CONTROLS.hiragana.appearance, 'intensity', { min: 0, max: 5, step: 0.05 });
add('Hiragana', 'Glow intensity', VISUAL_CONTROLS.hiragana.appearance, 'glowIntensity', { min: 0, max: 5, step: 0.05 });
add('Hiragana', 'Character size', VISUAL_CONTROLS.hiragana.appearance, 'size', { min: 0.1, max: 20, step: 0.1 });
add('Hiragana', 'Size variation', VISUAL_CONTROLS.hiragana.appearance, 'sizeVariation', { min: 0, max: 20, step: 0.1 });
addVector('Hiragana', 'Field position', VISUAL_CONTROLS.hiragana.placement, 'position', { min: -500, max: 500, step: 1 });
add('Hiragana', 'Inner radius', VISUAL_CONTROLS.hiragana.placement, 'innerRadius', { min: 0, max: 1000, step: 1 });
add('Hiragana', 'Field spread', VISUAL_CONTROLS.hiragana.placement, 'spread', { min: 0, max: 2000, step: 1 });
add('Hiragana', 'Minimum opacity', BASIC_SETUP.hiragana, 'minOpacity', { min: 0, max: 1, step: 0.01 });
add('Hiragana', 'Opacity variation', BASIC_SETUP.hiragana, 'opacityRange', { min: 0, max: 1, step: 0.01 });
add('Hiragana', 'Rotation speed', BASIC_SETUP.hiragana, 'rotationSpeed', { min: 0, max: 0.005, step: 0.00001 });

add('World motion', 'Overall movement speed', VISUAL_CONTROLS.motion, 'speed', { min: 0, max: 5, step: 0.05 });

function hexColor(value) {
    return `#${value.toString(16).padStart(6, '0')}`;
}

export function createScenePanel(container, onChange, onVisibilityChange) {
    const groups = [
        { name: 'Planet', key: 'planet' },
        { name: 'Moons', key: 'moons' },
        { name: 'Shooting stars', key: 'shootingStars' },
        { name: 'Hiragana', key: 'hiragana' },
        { name: 'World motion', key: 'motion', toggle: false }
    ];

    groups.forEach((group, groupIndex) => {
        const details = document.createElement('details');
        details.className = 'scene-panel__object';
        details.open = groupIndex === 0;

        const summary = document.createElement('summary');
        summary.className = 'scene-panel__summary';
        summary.textContent = group.name;
        details.append(summary);

        if (group.toggle !== false) {
            const enabled = document.createElement('label');
            enabled.className = 'scene-panel__enabled';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.setAttribute('aria-label', `Show ${group.name.toLowerCase()}`);
            checkbox.addEventListener('change', () => onVisibilityChange(group.key, checkbox.checked));
            enabled.append(checkbox, document.createTextNode('Visible'));
            details.append(enabled);
        }

        const section = document.createElement('div');
        section.className = 'scene-panel__section';

        controls
            .filter(control => control.group === group.name)
            .forEach(control => {
                const row = document.createElement('label');
                row.className = control.type === 'color'
                    ? 'scene-panel__color'
                    : 'scene-panel__range';
                const text = document.createElement('span');
                text.textContent = control.label;
                const input = document.createElement('input');
                input.type = control.type ?? 'range';
                input.setAttribute('aria-label', control.label);

                if (control.type === 'color') {
                    input.value = hexColor(control.target[control.key]);
                    input.addEventListener('input', () => {
                        const value = Number.parseInt(input.value.slice(1), 16);
                        setControlValue(control, value);
                        onChange(group.key, control);
                    });
                } else {
                    input.min = String(control.min);
                    input.max = String(control.max);
                    input.step = String(control.step);
                    input.value = String(control.index === undefined
                        ? control.target[control.key]
                        : control.target[control.key][control.index]);
                    const output = document.createElement('output');
                    output.value = formatValue(Number(input.value), control);
                    row.append(text, output);
                    input.addEventListener('input', () => {
                        const value = Number(input.value);
                        setControlValue(control, value);
                        output.value = formatValue(value, control);
                        onChange(group.key, control);
                    });
                }

                if (control.type === 'color') {
                    row.append(text, input);
                } else {
                    row.append(input);
                }
                section.append(row);
            });

        details.append(section);
        container.append(details);
    });
}

function setControlValue(control, value) {
    if (control.index === undefined) {
        control.target[control.key] = value;
    } else {
        control.target[control.key][control.index] = value;
    }
}

function formatValue(value, control) {
    if (control.unit === 's') {
        return `${value.toFixed(1)} s`;
    }
    if (control.step < 0.001) {
        return value.toFixed(5);
    }
    if (control.step < 0.05) {
        return value.toFixed(2);
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
