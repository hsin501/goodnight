import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let isResetting = false;
let targetCameraPosition = new THREE.Vector3(); // 目標相機位置
let targetControlsTarget = new THREE.Vector3(); // 目標視線中心

// 這是初始化函數，負責建立控制器和設定每一幀的更新邏輯
export function initOrbitControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enabled = false;
  // 設定縮放的最近和最遠距離
  controls.minDistance = 3; // 可以根據你的模型大小微調
  controls.maxDistance = 8; // 可以根據你的模型大小微調
  controls.enableZoom = false; // 縮放
  controls.enablePan = false; // 平移
  return controls;
}

export function updateOrbitControls(controls, camera, homePosition) {
  if (!controls) return;
  if (controlState.isResetting) {
    camera.position.lerp(homePosition, 0.1);
    controls.target.lerp(targetControlsTarget, 0.1);

    //檢查是ˇ否到終點
    const distanceTarget = camera.position.distanceTo(targetCameraPosition);
    if (distanceTarget < 0.01) {
      camera.position.copy(homePosition);
      controls.target.set(0, 0, 0);
      controlState.isResetting = false;
    }
  }
  controls.update();
}
export function startResettingAnimation(controls, camera) {
  if (!controls) return;

  controlState.isResetting = true;
  controls.enabled = false;
}
export const controlState = {
  isResetting: false,
};
