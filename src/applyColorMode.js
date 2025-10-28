import * as THREE from "three";
import * as d3 from "d3-scale-chromatic";

/**
 * Atualiza o atributo 'color' da geometria com base em um campo e colormap.
 * Usa dados armazenados em geometry.userData.raw
 */
export function applyColorMode(geometry, colorBy = "rgb", colormap = "Category10") {
    const raw = geometry.userData.raw || {};
    const colors = [];

    const discreteSchemes = {
        Category10: d3.schemeCategory10,
        Set1: d3.schemeSet1,
        Set2: d3.schemeSet2,
        Set3: d3.schemeSet3,
        Paired: d3.schemePaired,
    };

    const continuousSchemes = {
        viridis: d3.interpolateViridis,
        plasma: d3.interpolatePlasma,
        inferno: d3.interpolateInferno,
        magma: d3.interpolateMagma,
        turbo: d3.interpolateTurbo,
    };

    // → RGB direto
    if (colorBy === "rgb" && raw.rgbs?.length) {
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(raw.rgbs, 3));
    }

    // → Label (semantic GT)
    else if (colorBy === "semantic_gt" && raw.semantic_gt?.length) {
        const colorSet = discreteSchemes[colormap] || d3.schemeCategory10;
        const uniqueLabels = [...new Set(raw.semantic_gt)];
        const labelToColor = new Map();

        uniqueLabels.forEach((l, i) => {
            const colorStr = colorSet[i % colorSet.length];
            const c = new THREE.Color(colorStr);
            labelToColor.set(l, c);
        });

        for (const l of raw.semantic_gt) {
            const c = labelToColor.get(l);
            colors.push(c.r, c.g, c.b);
        }

        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        geometry.userData.labelToColor = labelToColor;
    }

    // → Label (semantic prediction)
    else if (colorBy === "semantic_pred" && raw.semantic_pred?.length) {
        const colorSet = discreteSchemes[colormap] || d3.schemeCategory10;
        const uniqueLabels = [...new Set(raw.semantic_pred)];
        const labelToColor = new Map();

        uniqueLabels.forEach((l, i) => {
            const colorStr = colorSet[i % colorSet.length];
            const c = new THREE.Color(colorStr);
            labelToColor.set(l, c);
        });

        for (const l of raw.semantic_pred) {
            const c = labelToColor.get(l);
            colors.push(c.r, c.g, c.b);
        }

        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        geometry.userData.labelToColor = labelToColor;
    }

    // → Confidences (continous)
    else if (colorBy === "confidences" && raw.confidences?.length) {
        const cmap = continuousSchemes[colormap] || d3.interpolateViridis;
        const minI = Math.min(...raw.confidences);
        const maxI = Math.max(...raw.confidences);

        for (const intensity of raw.confidences) {
            const norm = (intensity - minI) / (maxI - minI + 1e-8);
            const c = new THREE.Color(cmap(norm));
            colors.push(c.r, c.g, c.b);
        }

        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    }

    // → fallback (cinza)
    else {
        const neutral = new THREE.Color(0.7, 0.7, 0.7);
        const n = geometry.getAttribute("position").count;
        for (let i = 0; i < n; i++) colors.push(neutral.r, neutral.g, neutral.b);
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    }

    geometry.attributes.color.needsUpdate = true;
}
