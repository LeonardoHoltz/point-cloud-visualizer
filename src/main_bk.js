import * as THREE from 'three';
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';

// PCD LOADER
import { parsePCD } from './parsePCD.js'

// CAMERA
import { camera } from './cameraControls.js';

// GUI
import { gui, gui_params } from './gui_bk.js'

// THREE
let scene, renderer

// Point Cloud objects
let main_cloud, offset_cloud;
let pc_points, pc_offset_gt, pc_offset_pred;
let pc_offset_pred_const_pos;

init();
render();

function log_loading(xhr) {
  console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
}

function log_error_load(error) {
  console.log(error);
}

function apply_offset(value) {
  let p_orig = pc_points.geometry.getAttribute('position');
  let p_off_pred = pc_offset_pred.geometry.getAttribute('position');
  
  for (let i = 0; i < pc_offset_pred_const_pos.count; i++) {
    // interpolate original positions and offset
    let x = value * pc_offset_pred_const_pos.getX(i) + (1 - value) * p_orig.getX(i);
    let y = value * pc_offset_pred_const_pos.getY(i) + (1 - value) * p_orig.getY(i);
    let z = value * pc_offset_pred_const_pos.getZ(i) + (1 - value) * p_orig.getZ(i);
    p_off_pred.setXYZ(i, x, y, z);
    p_off_pred.needsUpdate = true
  }
  render();
}

function PCDOrigLoaded(points, aaaa) {
  console.log(points)
  console.log(aaaa)
  pc_points = points;
  scene.add(points);
  gui.add(gui_params, 'show_pc_orig').name('Show Original').onChange((value) => {
    pc_points.visible = value;
    render();
  });
  render();
}

function PCDOffsetPredLoaded(points) {
  pc_offset_pred = points;
  pc_offset_pred_const_pos = pc_offset_pred.geometry.getAttribute('position').clone();
  
  scene.add(points);
  gui.add(gui_params, 'show_pc_off_pred').name('Show Centroid Pred').onChange((value) => {
    pc_offset_pred.visible = value;
    render();
  });
	gui.add(gui_params, 'offset_pred_slider', 0, 1).onChange(apply_offset);
  //gui.addColor( points.material, 'color' ).onChange( render );

  render();
}

async function loadPCD(name, options) {
  let cloud = await parsePCD(name, options);
  let material = new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.02,
  });
  let points = new THREE.Points(cloud.geometry, material);
  scene.add(points);
}

function init() {
  // Set up the scene, camera, and renderer as global variables.
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();

  renderer.setSize( window.innerWidth, window.innerHeight );
  // set background to white
  //renderer.setClearColor(0xffffff, 1);

  // Add the renderer to the HTML document
  document.body.appendChild( renderer.domElement );

  // instantiate a loader
  pcd_loader = new PCDLoader();

  // load a resource
  pcd_loader.load(
      // resource URL
      '../data/ascii_Scene_23_sample.pcd',
      // called when the resource is loaded
      PCDOrigLoaded,
      // called when loading is in progress
      log_loading,
      // called when loading has errors
      log_error_load,
  );

  pcd_loader.load(
      '../data/ascii_Scene_23_sample_offset_preds.pcd',
      PCDOffsetPredLoaded,
      log_loading,
      log_error_load,
  );
}




// Render when camera changes
window.addEventListener('cameraChanged', () => {
  render();
});

// Keep renderer size in sync with the window
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
});

// Initial render
function render() {
  renderer.render(scene, camera);
}
