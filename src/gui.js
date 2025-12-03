import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { render } from "./rendering.js";

import './styles/gui.css';

/**
 * Inicializa a GUI para um cloud e opções fornecidas
 * @param {THREE.Points} cloud - nuvem de pontos
 * @param {object} options - { colorBy, colormap, pointSize, labelsVisibility }
 */
export function initGUI(pointCloud, options) {
    const gui = new GUI(
        {
            title: "Point Cloud",
            width: 900
        }
    );
    gui.domElement.classList.add('pc-gui'); // Uses gui.css
    
    // --- Section: Cloud common visualization options ---
    const cloudGeneral = gui.addFolder('Offset options');
    cloudGeneral.open();
    
    // Show/Hide Offset Point Cloud
    cloudGeneral.add(options, 'show_pc').name('Show Point Cloud').onChange((value) => {
        pointCloud.visible = value;
        render();
    });

    // How the Point Cloud should be colored
    cloudGeneral.add(options, 'colorBy', ['rgb', 'semantic_gt', 'semantic_pred', 'confidences'])
        .name('Color by')
        .onChange(() => {
            pointCloud.recolor(options.colorBy, options.colormap);
            render();
        });
    
    // When not using rgb, which type of colormap to use
    cloudGeneral.add(options, 'colormap', ['Category10', 'Set3', 'Paired', 'viridis', 'plasma'])
        .name('Colormap')
        .onChange(() => {
            pointCloud.recolor(options.colorBy, options.colormap);
            render();
        });

    // Size of the points
    cloudGeneral.add(options, 'pointSize', 1, 10, 0.1)
        .name('Point Size')
        .onChange(() => {
            pointCloud.changeSize(options.pointSize);
            render();
        });

    // Slider to check offset progression compared with main PC
    cloudGeneral.add(options, 'offset_pred_slider', 0, 1).name('Offset progression').onChange((value) => {
        pointCloud.applyOffset(value);
        render();
    });

    // Unimportant Labels visibility
    cloudGeneral.add(options, 'hide_labels').name('Hide non-clustered labels').onChange((value) => {
        pointCloud.updateLabelVisibility(value);
        render();
    });

    // --- Section: Clustering Mode ---
    cloudGeneral.add(options, 'clustering_mode').name('Clustering mode').onChange((value) => {
        pointCloud.prepareClustering(value, options.label_select);
        render();
    });
    cloudGeneral.add(options, 'label_select', [0, 1, 2, 3, 4, 5]).name('Select label');
    cloudGeneral.add(options, 'algorithm', ['DBSCAN', 'Ball-Query']).name('Clustering Algorithm');
    cloudGeneral.add(options, 'apply_clustering').name('Apply Clustering');


    return gui;
}