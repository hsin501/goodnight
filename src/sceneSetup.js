import * as THREE from 'three';
const threeApp = {
  canvas: null,
  scene: null,
  camera: null,
  renderer: null,
  animationLoopCallbacks: [],
  scenesToRender: [],
};

export function addSceneToRender(sceneData) {
  threeApp.scenesToRender.push(sceneData);
}

export function setupThreeScene() {
  threeApp.canvas = document.querySelector('.webgl');
  if (!threeApp.canvas) {
    console.error('找不到 three-canvas 元素。');
    return null;
  }

  // 創建場景 (Scene)
  threeApp.scene = new THREE.Scene();
  threeApp.scene.background = null;

  // 創建相機 (Camera)
  const aspectRatio = window.innerWidth / window.innerHeight;
  threeApp.camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 100);

  //創建渲染器 (Renderer)
  threeApp.renderer = new THREE.WebGLRenderer({
    canvas: threeApp.canvas,
    antialias: true,
    alpha: true,
  });
  threeApp.renderer.setClearColor(0x000000, 0);
  threeApp.renderer.setSize(window.innerWidth, window.innerHeight);
  threeApp.renderer.outputColorSpace = THREE.SRGBColorSpace;

  //添加光源 (Lights)
  threeApp.renderer.shadowMap.enabled = true;
  threeApp.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 讓陰影邊緣更柔和
  threeApp.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  threeApp.renderer.toneMappingExposure = 0.58; // 曝光度
  addLightsToScene();

  //設置視窗大小改變時的處理
  setupResizeHandler();

  //啟動動畫循環
  startAnimationLoop();
  console.log('Three.js 場景已成功設置。');
  return threeApp;
}

// 添加光源到場景
function addLightsToScene() {
  const hemisphereLight = new THREE.HemisphereLight(
    0xffffff,
    0x444444,
    0.5 // 光的強度
  );
  threeApp.scene.add(hemisphereLight);
  // 添加主光源
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
  keyLight.position.set(5, 5, 5);
  keyLight.target.position.set(0, 0, 0); // 確保它照向場景中心
  threeApp.scene.add(keyLight);
  threeApp.scene.add(keyLight.target);
  keyLight.castShadow = true;

  keyLight.shadow.mapSize.width = 2048; // 陰影貼圖的解析度，越高越清晰
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.5; // 陰影攝影機的渲染範圍
  keyLight.shadow.camera.far = 50;

  threeApp.scene.add(keyLight);

  //
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
  rimLight.position.set(0, 3, -5);
  rimLight.target.position.set(0, 0, 0);
  threeApp.scene.add(rimLight);
  threeApp.scene.add(rimLight.target);
}
// 處理瀏覽器視窗大小改變的事件
function setupResizeHandler() {
  window.addEventListener('resize', () => {
    const newWidth = threeApp.canvas.clientWidth;
    const newHeight = threeApp.canvas.clientHeight;
    threeApp.renderer.setSize(newWidth, newHeight);
    threeApp.camera.aspect = newWidth / newHeight;
    threeApp.camera.updateProjectionMatrix();

    threeApp.animationLoopCallbacks.forEach((callbackItem) => {
      if (typeof callbackItem.onResize === 'function') {
        callbackItem.onResize({ width: newWidth, height: newHeight });
      }
    });
  });
}

//動畫循環
function startAnimationLoop() {
  requestAnimationFrame(startAnimationLoop);
  threeApp.renderer.clear();

  threeApp.animationLoopCallbacks.forEach((callbackItem) => {
    if (typeof callbackItem.update === 'function') {
      callbackItem.update();
    }
  });
  // --- 第一次渲染：渲染全螢幕背景 (粒子) ---
  // 1. 確保所有模型都不可見
  threeApp.scenesToRender.forEach((s) => {
    if (s.modelData && s.modelData.modelScene) {
      s.modelData.modelScene.visible = false;
    }
  });

  // 2. 關閉剪裁，使用全螢幕視口來渲染背景
  threeApp.renderer.setScissorTest(false);
  const { clientWidth, clientHeight } = threeApp.renderer.domElement;
  threeApp.renderer.setViewport(0, 0, clientWidth, clientHeight);
  threeApp.camera.aspect = clientWidth / clientHeight;
  threeApp.camera.updateProjectionMatrix();

  // 3. 渲染背景 (此時只有粒子是可見的)
  threeApp.renderer.render(threeApp.scene, threeApp.camera);

  //啟用剪裁
  threeApp.renderer.setScissorTest(true);

  threeApp.scenesToRender.forEach((sceneData) => {
    const placeholder = sceneData.placeholder;
    const rect = placeholder.getBoundingClientRect();

    if (
      rect.bottom < 0 ||
      rect.top > threeApp.renderer.domElement.clientHeight ||
      rect.right < 0 ||
      rect.left > threeApp.renderer.domElement.clientWidth
    ) {
      return;
    }

    threeApp.scenesToRender.forEach((s) => {
      s.modelData.modelScene.visible = false;
    });

    sceneData.modelData.modelScene.visible = true;

    // 設定剪裁區
    const bottom = threeApp.renderer.domElement.clientHeight - rect.bottom;
    threeApp.renderer.setScissor(rect.left, bottom, rect.width, rect.height);
    threeApp.renderer.setViewport(rect.left, bottom, rect.width, rect.height);

    threeApp.camera.aspect = rect.width / rect.height;
    threeApp.camera.updateProjectionMatrix();

    ///渲染場景
    threeApp.renderer.render(threeApp.scene, threeApp.camera);
  });

  // 關閉剪裁測試，以防影響其他可能的渲染
  threeApp.renderer.setScissorTest(false);
}

export function addAnimationLoopCallback(callbackObject) {
  if (callbackObject && typeof callbackObject.update === 'function') {
    threeApp.animationLoopCallbacks.push(callbackObject);
  } else {
    console.warn('無效的動畫循環回調對象。請確保它包含 update 方法。');
  }
}
