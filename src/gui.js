import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { render } from "./rendering.js";

import './styles/gui.css';

/**
 * Inicializa a GUI para um cloud e opções fornecidas
 * @param {THREE.Points} cloud - nuvem de pontos
 * @param {object} options - { colorBy, colormap, pointSize, labelsVisibility }
 */
export function initGUI(main_cloud, offset_cloud, options) {
    const gui = new GUI(
        {
            title: "Point Cloud",
            width: 900
        }
    );
    gui.domElement.classList.add('pc-gui'); // Uses gui.css

    // --- Section: Visualization ---
    const visFolder = gui.addFolder('Visualization options');
    visFolder.open();

    // Show/Hide Point Cloud
    visFolder.add(options, 'show_main_pc').name('Show Main Point Cloud').onChange((value) => {
        main_cloud.visible = value;
        render();
    });

    // How the Point Cloud should be colored
    visFolder.add(options, 'colorBy', ['rgb', 'semantic_gt', 'semantic_pred', 'confidences'])
        .name('Color by')
        .onChange(() => {
            main_cloud.recolor(options.colorBy, options.colormap);
            render();
        });
    
    // When not using rgb, which type of colormap to use
    visFolder.add(options, 'colormap', ['Category10', 'Set3', 'Paired', 'viridis', 'plasma'])
        .name('Colormap')
        .onChange(() => {
            main_cloud.recolor(options.colorBy, options.colormap);
            render();
        });

    // Size of the points
    visFolder.add(options, 'pointSize', 0.001, 0.05, 0.001)
        .name('Point Size')
        .onChange(() => {
            main_cloud.changeSize(options.pointSize);
            render();
        });
    
    // --- Section: Offset Manipulation ---
    const offsetFolder = gui.addFolder('Offset options');
    offsetFolder.open();
    
    // Show/Hide Offset Point Cloud
    offsetFolder.add(options, 'show_offset_pc').name('Show Offset Point Cloud').onChange((value) => {
        offset_cloud.visible = value;
        render();
    });

    // How the Point Cloud should be colored
    offsetFolder.add(options, 'colorBy', ['rgb', 'semantic_gt', 'semantic_pred', 'confidences'])
        .name('Color by')
        .onChange(() => {
            offset_cloud.recolor(options.colorBy, options.colormap);
            render();
        });
    
    // When not using rgb, which type of colormap to use
    offsetFolder.add(options, 'colormap', ['Category10', 'Set3', 'Paired', 'viridis', 'plasma'])
        .name('Colormap')
        .onChange(() => {
            offset_cloud.recolor(options.colorBy, options.colormap);
            render();
        });

    // Size of the points
    offsetFolder.add(options, 'pointSize', 0.001, 0.05, 0.001)
        .name('Point Size')
        .onChange(() => {
            offset_cloud.changeSize(options.pointSize);
            render();
        });

    // Slider to check offset progression compared with main PC
    offsetFolder.add(options, 'offset_pred_slider', 0, 1).name('Offset progression').onChange((value) => {
        offset_cloud.applyOffset(value);
        render();
    });

    // Unimportant Labels visibility
    offsetFolder.add(options, 'hide_labels').name('Hide uninstantiable labels').onChange((value) => {
        offset_cloud.updateLabelVisibility(value);
        render();
    });

    return gui;
}