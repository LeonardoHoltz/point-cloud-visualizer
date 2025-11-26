import * as THREE from 'three';

export function applySemanticVisibility(geometry, material, hide) {
    const labelsToHideVisibility = geometry.getAttribute("labels_to_hide_visibility");
    const visibility = geometry.getAttribute("visibility");
    console.log("labelsToHide", labelsToHideVisibility);
    if (hide) {
        visibility.array = labelsToHideVisibility.array;
    }
    else {
        const n = labelsToHideVisibility.length;
        visibility.array.fill(1);
    }
    console.log(visibility);
    visibility.needsUpdate = true;
}