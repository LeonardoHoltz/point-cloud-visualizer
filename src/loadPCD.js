import * as THREE from "three";
import { parsePCD } from "./parsePCD.js";
import { applyColorMode } from "./applyColorMode.js";
import { applyOffsetVariation } from "./offsetManipulation.js";

export async function loadPCD(url, options = {}, offset_reference) {
    const {
        colorBy = "rgb",
        colormap = "Category10",
        pointSize = 0.02,
    } = options;

    console.log("Parsing %s", url)
    const geometry = await parsePCD(url);
    console.log("Parsing complete")
    applyColorMode(geometry, colorBy, colormap);
    console.log("Colors applied")

    const material = new THREE.PointsMaterial({
        size: pointSize,
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
    });

    const cloud = new THREE.Points(geometry, material);
    console.log("Point Cloud object created")

    // Update methods
    cloud.recolor = (colorByNew, colormapNew) => {
        console.log("Cloud being recolored...")
        applyColorMode(cloud.geometry, colorByNew, colormapNew);
    };

    cloud.applyOffset = (offsetMultiplier) => {
        if (offset_reference)
            applyOffsetVariation(cloud.geometry);
    };

    return cloud;
}