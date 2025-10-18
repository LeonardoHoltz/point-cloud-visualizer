import * as THREE from 'three';
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { camera } from './cameraControls.js';

let scene, renderer, pcd_loader, pc_points;

init();
render();

function PCDLoaded(points) {
  pc_points = points;
  scene.add(points);

  const gui = new GUI();
	gui.add( points.material, 'size', 0.001, 0.01 ).onChange( render );

  render();
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
      '../data/test.pcd',
      // called when the resource is loaded
      PCDLoaded,
      // called when loading is in progress
      function ( xhr ) {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      function ( error ) {
          console.log(error);
      }
  );
}

// Render when camera changes
window.addEventListener('cameraChanged', () => {
  //let p = pc_points.geometry.getAttribute('position');
  //for (let i = 0; i < p.count; i++) {
  //  let x = p.getX(i) + 0.001;
  //  let y = p.getY(i) + 0.001;
  //  let z = p.getZ(i) + 0.001;
  //  p.setXYZ(i, x, y, z);
  //  p.needsUpdate = true
  //}
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
