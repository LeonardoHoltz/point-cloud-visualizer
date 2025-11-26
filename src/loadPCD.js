import * as THREE from "three";
import { parsePCD } from "./parsePCD.js";
import { applyColorMode } from "./applyColorMode.js";
import { applyOffsetVariation } from "./offsetManipulation.js";
import { applySemanticVisibility } from "./updateLabelVisibility.js";

// Shaders
import vertexShader from "./shaders/vertex.glsl?raw" with { type: "text" };
import fragmentShader from "./shaders/fragment.glsl?raw" with { type: "text" };

export async function loadPCD(url, options = {}) {
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

    const material = new THREE.ShaderMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            uSize: { value: options.pointSize }
        }
    });

    const cloud = new THREE.Points(geometry, material);
    console.log(cloud)
    console.log("Point Cloud object created")

    // Update methods
    cloud.recolor = (colorByNew, colormapNew) => {
        applyColorMode(cloud.geometry, colorByNew, colormapNew);
    };

    cloud.changeSize = (newSize) => {
        cloud.material.uniforms.uSize.value = newSize;
    };

    return cloud;
}

export async function loadPCDOffset(url, main_reference, options = {}) {
    const {
        colorBy = "rgb",
        colormap = "Category10",
        pointSize = 0.02,
        offset_pred_slider = 1,
    } = options;

    console.log("Parsing %s", url)
    const geometry = await parsePCD(url);
    const offset_reference = geometry.getAttribute("position").clone();
    console.log("Parsing complete")
    applyColorMode(geometry, colorBy, colormap);
    console.log("Colors applied")

    const material = new THREE.ShaderMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            uSize: { value: options.pointSize }
        }
    });

    const cloud = new THREE.Points(geometry, material);
    console.log("Point Cloud object created")

    // Update methods
    cloud.recolor = (colorByNew, colormapNew) => {
        applyColorMode(cloud.geometry, colorByNew, colormapNew);
    };

    cloud.changeSize = (newSize) => {
        cloud.material.uniforms.uSize.value = newSize;
    };

    cloud.applyOffset = (offset_pred_slider) => {
        applyOffsetVariation(cloud.geometry.getAttribute("position"), offset_pred_slider, main_reference, offset_reference);
    };

    cloud.updateLabelVisibility = (labelsVisibility) => {
        applySemanticVisibility(cloud.geometry, cloud.material, labelsVisibility);
    }

    return cloud;
}