import * as THREE from 'three';
const threeApp = {
  canvas: null,
  scene: null,
  camera: null,
  renderer: null,
  animationLoopCallbacks: [],
};
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
  threeApp.camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  //創建渲染器 (Renderer)
  threeApp.renderer = new THREE.WebGLRenderer({
    canvas: threeApp.canvas,
    antialias: true,
    alpha: true,
  });
  threeApp.renderer.setSize(window.innerWidth, window.innerHeight);
  threeApp.renderer.outputColorSpace = THREE.SRGBColorSpace;

  //啟用剪裁
  threeApp.renderer.setScissorTest(true);

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
  const placeholder = document.querySelector('#section1 .threejs-placeholder');
  if (!placeholder) {
    console.error('找不到 #section1 裡面的 .threejs-placeholder！');
    // 如果找不到，就執行一個空的迴圈
    requestAnimationFrame(startAnimationLoop);
    return;
  }

  requestAnimationFrame(startAnimationLoop);
  threeApp.renderer.clear();

  const rect = placeholder.getBoundingClientRect();

  if (rect.width <= 0 || rect.height <= 0) {
    return; // 如果沒尺寸，就不用畫
  }
  // 無論模型是否可見，都設定剪裁區
  const bottom = threeApp.renderer.domElement.clientHeight - rect.bottom;
  threeApp.renderer.setScissor(rect.left, bottom, rect.width, rect.height);
  threeApp.renderer.setViewport(rect.left, bottom, rect.width, rect.height);
  threeApp.camera.aspect = rect.width / rect.height;
  threeApp.camera.updateProjectionMatrix();

  threeApp.animationLoopCallbacks.forEach((callbackItem) => {
    if (typeof callbackItem.update === 'function') {
      callbackItem.update();
    }
  });
  ///渲染場景
  threeApp.renderer.render(threeApp.scene, threeApp.camera);
}

export function addAnimationLoopCallback(callbackObject) {
  if (callbackObject && typeof callbackObject.update === 'function') {
    threeApp.animationLoopCallbacks.push(callbackObject);
  } else {
    console.warn('無效的動畫循環回調對象。請確保它包含 update 方法。');
  }
}
