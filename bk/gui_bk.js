// GUI
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import 'styles/gui.css';

const gui_params = {
	show_pc_orig: true,
    show_pc_off_gt: true,
    show_pc_off_pred: true,
    offset_pred_slider: 1
};

const options = { colorBy: "rgb", colormap: "Category10" };

const gui = new GUI(
  {
    title: "Point Cloud",
    width : 900
  }
);
gui.domElement.classList.add('pc-gui');

export { gui, gui_params };