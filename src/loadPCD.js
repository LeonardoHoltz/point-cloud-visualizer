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
        pointSize = 1,
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

    cloud.applyOffset = (offsetPredSlider) => {
        applyOffsetVariation(cloud.geometry.getAttribute("position"), offsetPredSlider, main_reference, offset_reference);
    };

    cloud.updateLabelVisibility = (labelsVisibility) => {
        applySemanticVisibility(cloud.geometry, cloud.material, labelsVisibility);
    }

    cloud.prepare_clustering = (isClusteringMode, selectedLabel) => {
        // Highlight the points that will be subjected to clustering
        const labels = cloud.geometry.getAttribute("semantic_pred");
        const nPoints = labels.count;
        const colors = cloud.geometry.getAttribute("color");
        const rgb = cloud.geometry.getAttribute("rgb");
        
        // Add attribute to store colors before clustering mode
        if (isClusteringMode) {
            const colorsBeforeClustering = new Float32Array(colors.array);
            cloud.geometry.setAttribute("colors_before_clustering", new THREE.BufferAttribute(colorsBeforeClustering, 3));
            cloud.geometry.attributes.colors_before_clustering.needsUpdate = true;
        }

        if (isClusteringMode) {
            for (let i = 0; i < nPoints; i++) {
                const r = rgb.getX(i);
                const g = rgb.getY(i);
                const b = rgb.getZ(i);
                if (labels.getX(i) === selectedLabel) {
                    // Apply a blending between the rgb color and white
                    colors.setXYZ(i,
                        0.3 * r + 0.7 * 1.0,
                        0.3 * g + 0.7 * 1.0,
                        0.3 * b + 0.7 * 1.0
                    );
                }
                else {
                    // Keep the original color but darken it
                    colors.setXYZ(i,
                        0.2 * r,
                        0.2 * g,
                        0.2 * b
                    );
                }
            }
        }
        else {
            // Restore original colors
            const colorsBeforeClustering = cloud.geometry.getAttribute("colors_before_clustering");
            for (let i = 0; i < nPoints; i++) {
                const r = colorsBeforeClustering.getX(i);
                const g = colorsBeforeClustering.getY(i);
                const b = colorsBeforeClustering.getZ(i);
                colors.setXYZ(i, r, g, b);
            }
        }
        colors.needsUpdate = true;
    };

    return cloud;
}