import * as THREE from 'three';
import { initParallaxClouds } from './parallaxClouds.js';
import { setupThreeScene, addAnimationLoopCallback } from './sceneSetup.js';
import { loadMyModel } from './modelLoader.js';
import {
  initOrbitControls,
  controlModelBySection,
} from './orbitControlsManager.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';

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

  const section1Placeholder = document.querySelector(
    '#section1 .threejs-placeholder'
  );

  // 安全檢查，如果找不到 placeholder 就停止，防止後續出錯
  if (!section1Placeholder) {
    console.error(
      '致命錯誤：找不到 section1 的 placeholder！控制器無法初始化。'
    );
    return;
  }

  //HDR環境貼圖
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load(
    './static/studio_small_08_2k.hdr',
    (environmentMap) => {
      environmentMap.mapping = THREE.EquirectangularReflectionMapping;
      // 應用到場景背景和所有物體的反射上
      threeInstance.scene.background = null;
      threeInstance.scene.environment = environmentMap;
      console.log('環境貼圖載入成功');
    },
    undefined,
    (error) => {
      console.error('環境貼圖載入失敗:', error);
    }
  );

  //初始化orbit
  const orbitControlsUpdater = initOrbitControls(
    threeInstance.camera,
    section1Placeholder
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
    // models.section1.visible = true;
    threeInstance.camera.position.set(0, 0, 5);
    console.log('S1已載入');
  } catch (error) {
    console.error('S1載入失敗');
  }

  // --- 滾動監測 (Intersection Observer) ---
  const sectionDiv = document.getElementById('section1');
  console.log('Section 1 Div:', sectionDiv);
  if (sectionDiv && models.section1) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          controlModelBySection(
            sectionDiv,
            models.section1,
            entry.isIntersecting
          );
        });
      },
      {
        threshold: 0.1, // 當元素至少%可見時觸發
      }
    );
    observer.observe(sectionDiv);
  } else {
    console.log('無法找到Section 1或模型場景');
  }
});
