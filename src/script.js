import './style.css';
// import * as GUI from 'lil-gui';
import * as THREE from 'three';
import {
  createScene,
  setupLights,
  setupCamera,
  setupRenderer,
} from './setup.js';
import {
  loadTextures,
  createMaterials,
  // createMeshes,
  // createCloudMeshes,
  loadProductModels,
  createCloud1,
} from './objects.js';
import {
  setupScrollListener,
  setupCursorListener,
  setupResizeListener,
  setupDOMInteractions,
} from './interactions.js';
import { startAnimation } from './animation.js';
import { OBJECT_DISTANCE } from './constants.js';

//獲取Canvas元素
const canvas = document.querySelector('canvas.webgl');

async function init() {
  if (!canvas) {
    throw new Error(
      '錯誤：無法在頁面中找到 canvas.webgl 元素。應用無法初始化。'
    );
  } else {
    //==== 基礎設置(調用setup.js) ====
    const scene = createScene();
    const { camera, cameraGroup } = setupCamera(scene);
    const renderer = setupRenderer(canvas);
    setupLights(scene);

    //==== 對象創建(調用objects.js) ====
    const textures = loadTextures();
    const materials = createMaterials(textures);
    // const sectionMeshes = createMeshes(materials.material);
    // scene.add(...sectionMeshes);

    //==== 載入產品模型 ====
    const productModelsArray = await loadProductModels(materials.material);
    let sectionMeshes = [];
    if (productModelsArray && productModelsArray.length > 0) {
      scene.add(...productModelsArray);
      sectionMeshes = productModelsArray;

      console.log('產品模型已加載');
    } else {
      console.log('產品模型加載失敗');
    }

    // //==== 雲的創建 ====
    const firstCloudConfig = [
      {
        position: new THREE.Vector3(-3, 0, -5),
        width: 10, // 可以直接指定寬度
        height: 5, // 和高度
        opacity: 0.6, // 透明度
        rotationY: Math.PI / 4, // 初始 Y 軸旋轉 (可選)
        driftSpeedX: 0.002,
        driftSpeedZ: 0.0005,
        isInteractive: true,
        name: 'CloudPlane1',
        textureIndex: 9, //指定使用 textures.cloudTextures[]
      },
      {
        position: new THREE.Vector3(3, -1, 0),
        width: 6,
        height: 3,
        opacity: 0.4,
        rotationY: Math.PI / 6,
        driftSpeedX: 0.002,
        driftSpeedZ: 0.0005,
        isInteractive: true,
        name: 'CloudPlane1',
        textureIndex: 5,
      },
    ];

    let interactiveClouds = [];
    if (textures.cloudTextures) {
      interactiveClouds = createCloud1(
        textures.cloudTextures,
        firstCloudConfig
      );
      scene.add(...interactiveClouds);
      console.log('雲朵1已加載');
    }

    //==== 交互邏輯(調用interactions.js) ====
    setupResizeListener(camera, renderer, sectionMeshes);
    setupScrollListener(sectionMeshes);
    setupCursorListener();
    setupDOMInteractions(materials.material, materials.particlesMaterial);

    //==== 動畫循環(調用animation.js) ====
    startAnimation(
      scene,
      camera,
      cameraGroup,
      renderer,
      sectionMeshes
      // dynamicClouds
    );
  }
  console.log('應用初始化完成！');
}

init().catch((error) => {
  console.error('初始化錯誤:', error);
  alert('應用初始化失敗，請檢查控制台以獲取詳細錯誤信息。');
});
