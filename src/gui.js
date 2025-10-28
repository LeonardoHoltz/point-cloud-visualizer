import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { render } from "./rendering.js"

import '../styles/gui.css';

/**
 * Inicializa a GUI para um cloud e opções fornecidas
 * @param {THREE.Points} cloud - nuvem de pontos
 * @param {object} options - { colorBy, colormap, pointSize, labelsVisibility }
 */
export function initGUI(cloud, options) {
    const gui = new GUI(
        {
            title: "Point Cloud",
            width: 900
        }
    );
    gui.domElement.classList.add('pc-gui');

    // --- Section: Visualization ---
    const visFolder = gui.addFolder('Visualization options');
    visFolder.open();

    // How the Point Cloud should be colored
    visFolder.add(options, 'colorBy', ['rgb', 'semantic_gt', 'semantic_pred', 'confidences'])
        .name('Color by')
        .onChange(() => {
            cloud.recolor(options.colorBy, options.colormap);
            render();
        });
    
    // When not using rgb, which type of colormap to use
    visFolder.add(options, 'colormap', ['Category10', 'Set3', 'Paired', 'viridis', 'plasma'])
        .name('Colormap')
        .onChange(() => {
            cloud.recolor(options.colorBy, options.colormap);
            render();
        });

    // Size of the points
    visFolder.add(options, 'pointSize', 0.005, 0.05, 0.005)
        .name('Point Size')
        .onChange(() => {
            cloud.material.size = options.pointSize;
            render();
        });

    // --- Section: Labels visibility ---
    if (cloud.geometry.userData.labelToColor) {
        const labelsFolder = gui.addFolder('Labels');
        labelsFolder.open();
        const labels = [...cloud.geometry.userData.labelToColor.keys()];
        labels.forEach(label => {
            options.labelsVisibility[label] = true;
            labelsFolder.add(options.labelsVisibility, label.toString())
                .name(`Label ${label}`)
                .onChange(() => {
                    cloud.updateLabelVisibility(options.labelsVisibility);
                    render();
                });
        });
    }

    return gui;
}