import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);


const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const icosphereGeometry = new THREE.IcosahedronGeometry(1, 0);

const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true,
});

const cylinder = new THREE.Mesh(cylinderGeometry, material);
cylinder.name = "Cylinder";
const cube = new THREE.Mesh(cubeGeometry, material);
cube.name = "Cube";
const icosphere = new THREE.Mesh(icosphereGeometry, material);
icosphere.name = "IcoSphere";

cylinder.position.set(-3, 0, 0);
cube.position.set(0, 0, 0);
icosphere.position.set(3, 0, 0);


scene.add(cylinder);
scene.add(cube);
scene.add(icosphere);


const cubeParameters = document.getElementById("cube-parameters");
const cylinderParameters = document.getElementById("cylinder-parameters");
const icosphereParameters = document.getElementById("icosphere-parameters");

function createControls() {
  
  addSlider(
    cubeParameters,
    "Width",
    0.1,
    2,
    cube.geometry.parameters.width,
    (value) => {
      cube.geometry = new THREE.BoxGeometry(
        value,
        cube.geometry.parameters.height,
        cube.geometry.parameters.depth
      );
    }
  );
  addSlider(
    cubeParameters,
    "Height",
    0.1,
    2,
    cube.geometry.parameters.height,
    (value) => {
      cube.geometry = new THREE.BoxGeometry(
        cube.geometry.parameters.width,
        value,
        cube.geometry.parameters.depth
      );
    }
  );
  addSlider(
    cubeParameters,
    "Depth",
    0.1,
    2,
    cube.geometry.parameters.depth,
    (value) => {
      cube.geometry = new THREE.BoxGeometry(
        cube.geometry.parameters.width,
        cube.geometry.parameters.height,
        value
      );
    }
  );

  
  addSlider(
    cylinderParameters,
    "Diameter",
    0.1,
    2,
    cylinder.geometry.parameters.radiusTop * 2,
    (value) => {
      cylinder.geometry = new THREE.CylinderGeometry(
        value / 2,
        value / 2,
        cylinder.geometry.parameters.height,
        32
      );
    }
  );
  addSlider(
    cylinderParameters,
    "Height",
    0.1,
    2,
    cylinder.geometry.parameters.height,
    (value) => {
      cylinder.geometry = new THREE.CylinderGeometry(
        cylinder.geometry.parameters.radiusTop,
        cylinder.geometry.parameters.radiusBottom,
        value,
        32
      );
    }
  );

  
  addSlider(
    icosphereParameters,
    "Diameter",
    0.1,
    2,
    icosphere.geometry.parameters.radius * 2,
    (value) => {
      icosphere.geometry = new THREE.IcosahedronGeometry(
        value / 2,
        icosphere.geometry.parameters.detail
      );
    }
  );
  addSlider(
    icosphereParameters,
    "Subdivisions",
    1,
    10,
    icosphere.geometry.parameters.detail,
    (value) => {
      icosphere.geometry = new THREE.IcosahedronGeometry(
        icosphere.geometry.parameters.radius,
        value
      );
    }
  );
}

function addSlider(parent, name, min, max, value, onChange) {
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = min;
  slider.max = max;
  slider.step = 0.1;
  slider.value = value;
  slider.addEventListener("input", (e) => onChange(parseFloat(e.target.value)));

  const label = document.createElement("label");
  label.textContent = `${name}: `;
  label.appendChild(slider);

  const valueDisplay = document.createElement("span");
  valueDisplay.textContent = value.toFixed(1);
  slider.addEventListener(
    "input",
    (e) => (valueDisplay.textContent = parseFloat(e.target.value).toFixed(1))
  );

  const container = document.createElement("div");
  container.appendChild(label);
  container.appendChild(valueDisplay);

  parent.appendChild(container);
}

// Create controls
createControls();

camera.position.z = 10;

// Fade-in effect
scene.fog = new THREE.FogExp2(0x000000, 0.1);

// Animation 


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


function onMouseClick(event) {

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  
  raycaster.setFromCamera(mouse, camera);


  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    
    const selectedObject = intersects[0].object;
    
    
    animateCameraToObject(selectedObject);
  }
}


function animateCameraToObject(object) {
  
  const targetPosition = new THREE.Vector3();
  object.getWorldPosition(targetPosition);
  targetPosition.z += 5; 

  // Animate camera position
  gsap.to(camera.position, {
    duration: 1,
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    onUpdate: function() {
      camera.lookAt(object.position);
    }
  });

  
  gsap.to(camera, {
    duration: 1,
    zoom: 2, 
    onUpdate: function() {
      camera.updateProjectionMatrix();
    }
  });
}


window.addEventListener('click', onMouseClick);
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});