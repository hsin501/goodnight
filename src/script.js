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
  startResettingAnimation,
  updateOrbitControls,
  controlState,
} from './orbitControlsManager.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import { initCustomCursor } from './customCursor.js';
import { changeModelColor } from './modelColorChanger.js';
import { startAnimationManager } from './animationManager.js';
import { initShoppingCart } from './cart.js';

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
    modelPath: './static/model/facewash.glb',
    containerName: 'FaceWash_Jar', // 瓶身名稱
    labelName: 'FaceWash_Label', // 標籤名稱
    capName: 'FaceWash_Cap', // 蓋子名稱
    scale: { x: 2.5, y: 2.5, z: 2.5 }, // 模型的縮放大小
    position: { x: 0, y: -0.8, z: 0 }, // 模型的位置
  },
  {
    sectionId: 'section2',
    modelPath: './static/model/bodywash.glb',
    containerName: 'BodyWash_Bottle', // 瓶身名稱
    labelName: 'BodyWash_Label', //標籤名稱
    capName: 'BodyWash_Cap', // 蓋子名稱
    scale: { x: 1.8, y: 1.8, z: 1.8 }, // 模型的縮放大小
    position: { x: 0, y: -2, z: 0 }, // 模型的位置
  },
  {
    sectionId: 'section3',
    modelPath: './static/model/cream.glb',
    containerName: 'FaceCream_Jar', // 瓶身名稱
    labelName: 'FaceCream_Label', //標籤名稱
    capName: 'FaceCream_Cap', // 蓋子名稱
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
export let lenis;

document.addEventListener('DOMContentLoaded', async () => {
  initParallaxClouds();
  initStarParallax();
  initCustomCursor();

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

  startAnimationManager(lenis);

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
        changeModelColor(sectionId, colorValue);

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

  //Intersection Observer 畫面到幾趴時呼叫載入模型
  const observerOptions = {
    root: null,
    threshold: 0.25, // 幾% 可見時觸發
  };

  //發現placeholder 進入或離開，就會觸發這個函式
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      //entry.target回報狀況的那個 placeholder DOM 元素
      const placeholderElement = entry.target;

      //從threeApp.scenesToRender中找到模型資料
      const sceneData = threeInstance.scenesToRender.find(
        (data) => data.placeholder === placeholderElement
      );
      if (sceneData) {
        //報告是否進入畫面
        sceneData.isVisible = entry.isIntersecting;
      }
    });
  }, observerOptions);

  //指派任務 : 遍歷所有模型設定，載入模型並指派事件監聽器
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
      //
      const sceneData = {
        placeholder: placeholderElement,
        modelData: modelData,
        isVisible: false,
      };
      addSceneToRender(sceneData);
      observer.observe(placeholderElement);
      placeholderElement.addEventListener('mouseenter', () => {
        if (!sceneData.isVisible) return;
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
  initShoppingCart(lenis);
});
