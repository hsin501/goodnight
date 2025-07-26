import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let controls;

// 這是初始化函數，負責建立控制器和設定每一幀的更新邏輯
export function initOrbitControls(camera, canvas) {
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enabled = false;
  // 設定縮放的最近和最遠距離
  controls.minDistance = 3; // 可以根據你的模型大小微調
  controls.maxDistance = 8; // 可以根據你的模型大小微調
  controls.enableZoom = true; // 禁用縮放
  controls.enablePan = true; // 禁用平移

  console.log('OrbitControls初始化成功，並已設定縮放範圍。');

  // 這個 update 函數會被加到主動畫循環中，每一幀都會執行
  return {
    update: function () {
      // 如果遙控器是啟用的，就更新它
      if (controls.enabled) {
        controls.update();
      }
    },
  };
}

// 這個函數現在只負責「切換狀態」，不再做任何設定
export function controlModelBySection(sectionDiv, modelToShow, isVisible) {
  modelToShow.modelScene.visible = isVisible;
  controls.enabled = isVisible;
  if (isVisible) {
    console.log(`進入 Section: ${sectionDiv.id}，已啟用模型和控制器。`);
    // 你仍然可以在這裡設定目標點
    controls.target.set(-0.5, 0.5, 0);
  } else {
    console.log(`離開 Section: ${sectionDiv.id}，已禁用模型和控制器。`);
  }
}
