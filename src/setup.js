import * as THREE from 'three';
import { sizes } from './utils';

export function createScene() {
  //create scene
  const scene = new THREE.Scene();
  console.log('場景已創建');

  return scene;
}

export function setupLights(scene) {
  // 主光（模擬太陽）
  const keyLight = new THREE.DirectionalLight(0xfffde0, 0.8);
  keyLight.position.set(2, 4, 2);
  scene.add(keyLight);

  // 補光（減少陰影死角）
  const fillLight = new THREE.DirectionalLight(0xe0f0ff, 0.4);
  fillLight.position.set(-2, 2, 2);
  scene.add(fillLight);

  // 背光（提升輪廓）
  const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
  backLight.position.set(0, 3, -3);
  scene.add(backLight);

  // 環境光（淡淡均勻照明）
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  console.log('三點式燈光已加載');
  return [keyLight, fillLight, backLight, ambientLight];
}

export function setupCamera(scene) {
  const cameraGroup = new THREE.Group();
  scene.add(cameraGroup);
  const camera = new THREE.PerspectiveCamera(
    35,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.z = 6;
  cameraGroup.add(camera);
  console.log('相機已加載');
  return { camera, cameraGroup };
}

export function setupRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true, // 抗鋸齒
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  console.log('渲染器已加載');
  return renderer;
}
