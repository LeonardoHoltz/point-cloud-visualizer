import { scene, render, initRenderingContext } from "./rendering.js"
import { loadPCD, loadPCDOffset } from "./loadPCD.js";
import { initGUI } from "./gui.js"
import { buildLegend } from "./legend.js";

import configData from '../config/conf.json' assert { type: 'json' };

let main_cloud, offset_cloud;

const options = {
    // Main Point Cloud options
    show_main_pc: true,
    colorBy: 'rgb',
    colormap: 'Category10',
    pointSize: 1,

    // Offset Point Cloud options
    show_offset_pc: true,
    offset_pred_slider: 1,

    // Other options
    hide_labels: false,

    // Clustering mode
    clustering_mode: false,
    label_select: 1,
    algorithm: 'DBSCAN',
    apply_clustering: async function() {
        await offset_cloud.applyClustering(this.clustering_mode, this.algorithm, this.label_select);
        console.log("acabou");
        render();
    }
};

async function init() {

    initRenderingContext();

    console.log("Load main Point Cloud:", configData.input.main_pc);
    console.log("Load centroid Point Cloud:", configData.input.centroid_pc);

    main_cloud = await loadPCD(configData.input.main_pc, options);
    offset_cloud = await loadPCDOffset(configData.input.centroid_pc, main_cloud.geometry.getAttribute("position"), options);
    scene.add(main_cloud);
    scene.add(offset_cloud);

    // inicializa a GUI separada
    const gui = initGUI(main_cloud, offset_cloud, options);

    buildLegend();
    render();
}

init();
