import * as THREE from 'three';
import { initParallaxClouds } from './parallaxClouds.js';
import { initStarParallax } from './starParallax.js';
import {
  setupThreeScene,
  addAnimationLoopCallback,
  addSceneToRender,
} from './sceneSetup.js';
import { loadMyModel } from './modelLoader.js';
import {
  initOrbitControls,
  // controlModelBySection,
  startResettingAnimation,
  updateOrbitControls,
  controlState,
} from './orbitControlsManager.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import { initCustomCursor } from './customCursor.js';
import { color } from 'three/tsl';

// ---- Loading Screen ----
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
    }, 200);
  }
});

const modelsConfig = [
  {
    sectionId: 'section1',
    modelPath: './static/model/waterspray.glb',
    containerName: 'WaterSpray_Bottle', // 瓶身名稱
    labelName: 'WaterSpray_Label', // 標籤名稱
    scale: { x: 2.2, y: 2.2, z: 2.2 }, // 模型的縮放大小
    position: { x: 0, y: -1.5, z: 0 }, // 模型的位置
  },
  {
    sectionId: 'section2',
    modelPath: './static/model/bodywash.glb',
    containerName: 'BodyWash_Bottle', // 瓶身名稱
    labelName: 'BodyWash_Label', //標籤名稱
    scale: { x: 1.8, y: 1.8, z: 1.8 }, // 模型的縮放大小
    position: { x: 0, y: -2, z: 0 }, // 模型的位置
  },
  {
    sectionId: 'section3',
    modelPath: './static/model/cream.glb',
    containerName: 'FaceCream_Jar', // 瓶身名稱
    labelName: 'FaceCream_Label', //標籤名稱
    scale: { x: 2, y: 2, z: 2 }, // 模型的縮放大小
    position: { x: 0, y: -1.5, z: 0 }, // 模型的位置
  },
  {
    sectionId: 'section4',
    modelPath: './static/model/waterspray.glb',
    containerName: 'WaterSpray_Bottle', // 瓶身名稱
    labelName: 'WaterSpray_Label', //標籤名稱
    scale: { x: 2.5, y: 2.5, z: 2.5 }, // 模型的縮放大小
    position: { x: 0, y: -1.8, z: 0 }, // 模型的位置
  },
];

document.addEventListener('DOMContentLoaded', async () => {
  initParallaxClouds();
  initStarParallax();
  initCustomCursor();

  //首頁底下scroll平滑滾動至s1
  // const scrollPrompt = document.querySelector('.scroll-prompt');
  // if (scrollPrompt) {
  //   scrollPrompt.addEventListener('click', (e) => {
  //     e.preventDefault();
  //     scrollToSection(1);
  //   });
  // }

  const lenis = new Lenis({
    duration: 1.8,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: true,
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  // 監聽點擊滾動提示
  const scrollPrompt = document.querySelector('.scroll-prompt');
  if (scrollPrompt) {
    scrollPrompt.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSection = document.querySelector(
        scrollPrompt.getAttribute('href')
      );
      if (targetSection) {
        // 使用 Lenis 內建的 scrollTo 方法
        lenis.scrollTo(targetSection);
      }
    });
  }
  // 顏色面板
  const customizeButtons = document.querySelectorAll('.customize-btn');
  const colorPalettes = document.querySelectorAll('.color-palette');

  // 為每個「客製化顏色」按鈕添加點擊事件
  customizeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const sectionId = button.dataset.section;
      const targetPalette = document.querySelector(
        `.color-palette[data-palette-for="${sectionId}"]`
      );

      if (targetPalette) {
        // 切換當前點擊按鈕對應的面板的顯示狀態
        targetPalette.classList.toggle('is-visible');

        // 關閉所有其他的面板
        colorPalettes.forEach((palette) => {
          if (palette !== targetPalette) {
            palette.classList.remove('is-visible');
          }
        });
      }
    });
  });

  // 為每個顏色圓點添加點擊事件
  colorPalettes.forEach((palette) => {
    const swatches = palette.querySelectorAll('.color-option');
    const sectionId = palette.dataset.paletteFor;

    swatches.forEach((option) => {
      option.addEventListener('click', () => {
        const colorValue = option.dataset.color;
        console.log(`在 ${sectionId} 中選擇了顏色: ${colorValue}`);

        // 在這裡呼叫您改變 3D 模型顏色的函式
        // changeModelColor(sectionId, colorValue);

        // 選擇顏色後，自動關閉所有面板
        colorPalettes.forEach((p) => p.classList.remove('is-visible'));
      });
    });
  });

  // 點擊頁面其他地方時，關閉所有面板
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.product-controls')) {
      colorPalettes.forEach((palette) => {
        palette.classList.remove('is-visible');
      });
    }
  });
  // 滾動時關閉所有面板
  if (lenis) {
    lenis.on('scroll', (e) => {
      if (Math.abs(e.velocity) > 0.2) {
        colorPalettes.forEach((palette) => {
          palette.classList.remove('is-visible');
        });
      }
    });
  }
  //three.js
  const threeInstance = setupThreeScene();
  if (!threeInstance) {
    console.error('Three.js 場景初始化失敗。');
    return;
  }
  const cameraHomePosition = new THREE.Vector3(0, 0, 5);
  threeInstance.camera.position.copy(cameraHomePosition);
  // three.js 初始化 OrbitControls
  const controls = initOrbitControls(threeInstance.camera, document.body);
  if (controls) {
    addAnimationLoopCallback({
      update: () =>
        updateOrbitControls(controls, threeInstance.camera, cameraHomePosition),
    });
  }

  //three.js HDR環境貼圖
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

  for (const config of modelsConfig) {
    try {
      const sectionElement = document.getElementById(config.sectionId);
      const placeholderElement = sectionElement.querySelector(
        '.threejs-placeholder'
      );

      if (!placeholderElement) {
        console.error(
          `致命錯誤：找不到 ${config.sectionId} 的 placeholder！模型無法載入。`
        );
        continue;
      }

      const modelData = await loadMyModel(threeInstance.scene, config);
      addSceneToRender({
        modelData: modelData,
        placeholder: placeholderElement,
      });

      placeholderElement.addEventListener('mouseenter', () => {
        controlState.isResetting = false;
        controls.enabled = true;
        controls.enableZoom = true; // 啟用縮放
        controls.enablePan = true; // 啟用平移
        controls.domElement = placeholderElement;
        const box = new THREE.Box3().setFromObject(modelData.modelScene);
        const center = box.getCenter(new THREE.Vector3());
        controls.target.copy(center);
        lenis.stop(); // 停止 Lenis 滾動
      });
      placeholderElement.addEventListener('mouseleave', () => {
        controls.enabled = false;
        controls.enableZoom = false; // 禁用縮放
        controls.enablePan = false; // 禁用平移
        startResettingAnimation(controls);
        controls.domElement = document.body;
        lenis.start(); // 恢復 Lenis 滾動

        console.log(`Left ${config.sectionId}, state reset.`);
      });
    } catch (error) {
      console.error(`為 Section ${config.sectionId} 載入或設定時失敗:`, error);
    }
  }
});
