import { scene, render, initRenderingContext } from "./rendering.js"
import { loadPCD } from "./loadPCD.js";
import { initGUI } from "./gui.js"
import { buildLegend } from "./legend.js";

import configData from '../config/conf.json' assert { type: 'json' };

let pointCloud;

const options = {
    // Main Point Cloud options
    show_main_pc: true,
    colorBy: 'rgb',
    colormap: 'Category10',
    pointSize: 1,

    // Offset Point Cloud options
    show_pc: true,
    offset_pred_slider: 0,

    // Other options
    hide_labels: false,

    // Clustering mode
    clustering_mode: false,
    label_select: 1,
    algorithm: 'DBSCAN',
    apply_clustering: async function() {
        await pointCloud.applyClustering(this.clustering_mode, this.algorithm, this.label_select);
        console.log("acabou");
        render();
    }
};

async function init() {

    initRenderingContext();

    console.log("Load main Point Cloud:", configData.input.main_pc);
    console.log("Load centroid Point Cloud:", configData.input.centroid_pc);

    pointCloud = await loadPCD(configData.input.main_pc, options);
    scene.add(pointCloud);

    // Interface options
    const gui = initGUI(pointCloud, options);

    buildLegend();
    render();
}

init();
