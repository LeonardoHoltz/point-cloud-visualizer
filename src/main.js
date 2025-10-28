import { scene, render, initRenderingContext} from "./rendering.js"
import { loadPCD } from "./loadPCD.js";
import { initGUI } from "./gui.js"

const options = {
  colorBy: 'rgb',
  colormap: 'Category10',
  pointSize: 0.01,
  labelsVisibility: {}
};

let main_cloud, offset_cloud;

async function init() {

    initRenderingContext();

    main_cloud = await loadPCD("../data/scene.pcd", options);
    scene.add(main_cloud);

    // inicializa a GUI separada
    const gui = initGUI(main_cloud, options);

    render();
}

init();
