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

    // ==== 產品模型容器 (新的 Group) ====
    const productModelsContainer = new THREE.Group();
    scene.add(productModelsContainer); // 將容器添加到場景

    //==== 對象創建(調用objects.js) ====
    const textures = loadTextures();
    const materials = createMaterials(textures);

    //==== 載入產品模型 ====
    const productModelsArray = await loadProductModels(productModelsContainer);
    if (productModelsArray && productModelsArray.length > 0) {
      console.log('產品模型已加載');
    } else {
      console.log('產品模型加載失敗');
    }

    // //==== 雲的創建 ====
    const firstCloudConfig = [
      {
        position: new THREE.Vector3(-3, 0, -5),
        width: 10,
        height: 5,
        opacity: 0.6,
        rotationY: Math.PI / 4,
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
    setupResizeListener(camera, renderer);
    setupScrollListener();
    setupCursorListener();
    setupDOMInteractions(materials.material, materials.particlesMaterial);

    //==== 動畫循環(調用animation.js) ====
    startAnimation(
      scene,
      camera,
      cameraGroup,
      renderer,
      productModelsContainer, // 傳遞產品容器
      interactiveClouds // 傳遞雲朵數組
    );
  }
  console.log('應用初始化完成！');
}

init().catch((error) => {
  console.error('初始化錯誤:', error);
  alert('應用初始化失敗，請檢查控制台以獲取詳細錯誤信息。');
});
