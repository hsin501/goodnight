import * as THREE from 'three';
import { initParallaxClouds } from './parallaxClouds.js';
import { setupThreeScene, addAnimationLoopCallback } from './sceneSetup.js';
import { loadMyModel } from './modelLoader.js';
import {
  initOrbitControls,
  controlModelBySection,
} from './orbitControlsManager.js';

document.addEventListener('DOMContentLoaded', async () => {
  initParallaxClouds();

  const threeInstance = setupThreeScene('.webgl');
  if (
    !threeInstance ||
    !threeInstance.camera ||
    !threeInstance.canvas ||
    !threeInstance.scene
  ) {
    console.error('Three.js 場景初始化失敗。');
    return;
  }

  //初始化orbit
  const orbitControlsUpdater = initOrbitControls(
    threeInstance.camera,
    threeInstance.canvas
  );
  if (orbitControlsUpdater) {
    addAnimationLoopCallback(orbitControlsUpdater);
  } else {
    console.error('orbitControlsUpdater初始化失敗。');
  }

  const models = {
    section1: null,
  };

  try {
    const modelPathForSection1 = './static/model/waterspray.glb';
    const bottleMeshForSection1 = 'WaterSpray_Bottle';
    const labelMeshForSection1 = 'WaterSpray_Label';
    models.section1 = await loadMyModel(
      threeInstance.scene,
      modelPathForSection1,
      bottleMeshForSection1,
      labelMeshForSection1
    );
    console.log('S1已載入');
  } catch (error) {
    console.error('S1載入失敗');
  }

  // --- 滾動監測 (Intersection Observer) ---
  const sectionDiv = document.getElementById('section1');
  console.log('Section 1 Div:', sectionDiv);
  if (sectionDiv && models.section1 && models.section1.modelScene) {
    controlModelBySection(sectionDiv, models.section1.modelScene);
  } else {
    controlModelBySection(null, null);
    if (!sectionDiv) {
      console.warn('找不到 Section: section1');
    }
    if (!models.section1.modelScene) {
      console.warn('Section 1 模型數據已載入，但 modelScene 無效。');
    }
  }
});
