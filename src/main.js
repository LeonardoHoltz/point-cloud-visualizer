import { scene, render, initRenderingContext } from "./rendering.js"
import { loadPCD, loadPCDOffset } from "./loadPCD.js";
import { initGUI } from "./gui.js"

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
    labelsVisibility: {}
};

let main_cloud, offset_cloud;

async function init() {

    initRenderingContext();

    main_cloud = await loadPCD("../data/main_cloud.pcd", options);
    offset_cloud = await loadPCDOffset("../data/offset_cloud.pcd", main_cloud.geometry.getAttribute("position"), options);
    scene.add(main_cloud);
    scene.add(offset_cloud);

    // inicializa a GUI separada
    const gui = initGUI(main_cloud, offset_cloud, options);

    render();
}

init();
