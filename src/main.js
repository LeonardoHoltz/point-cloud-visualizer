import { scene, render, initRenderingContext } from "./rendering.js"
import { loadPCD, loadPCDOffset } from "./loadPCD.js";
import { initGUI } from "./gui.js"

import configData from '../config/conf.json' assert { type: 'json' };

const options = {
    // Main Point Cloud options
    show_main_pc: true,
    colorBy: 'rgb',
    colormap: 'Category10',
    pointSize: 0.01,

    // Offset Point Cloud options
    show_offset_pc: true,
    offset_pred_slider: 1,

    // Other options
    hide_labels: false,
};

let main_cloud, offset_cloud;

async function init() {

    initRenderingContext();

    console.log("Load main Point Cloud:", configData.main_pc);
    console.log("Load centroid Point Cloud:", configData.centroid_pc);

    main_cloud = await loadPCD(configData.main_pc, options);
    offset_cloud = await loadPCDOffset(configData.centroid_pc, main_cloud.geometry.getAttribute("position"), options);
    scene.add(main_cloud);
    scene.add(offset_cloud);

    // inicializa a GUI separada
    const gui = initGUI(main_cloud, offset_cloud, options);

    render();
}

init();
