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
  threeApp.camera.position.set(0, 1, 3); // 設定相機的初始位置
  threeApp.scene.add(threeApp.camera); // 把相機加入場景

  //創建渲染器 (Renderer)
  threeApp.renderer = new THREE.WebGLRenderer({
    canvas: threeApp.canvas,
    antialias: true,
    alpha: true,
  });
  threeApp.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  threeApp.renderer.setSize(window.innerWidth, window.innerHeight);
  threeApp.renderer.outputColorSpace = THREE.SRGBColorSpace;

  //添加光源 (Lights)
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
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  threeApp.scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(3, 5, 2);
  threeApp.scene.add(directionalLight);
}

// 處理瀏覽器視窗大小改變的事件
function setupResizeHandler() {
  window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
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

  //更新所有註冊的動畫回調
  threeApp.animationLoopCallbacks.forEach((callbackItem) => {
    if (typeof callbackItem.update === 'function') {
      callbackItem.update();
    }
  });

  ///渲染場景
  if (threeApp.scene && threeApp.camera && threeApp.renderer) {
    threeApp.renderer.render(threeApp.scene, threeApp.camera);
  }
}

export function addAnimationLoopCallback(callbackObject) {
  if (callbackObject && typeof callbackObject.update === 'function') {
    threeApp.animationLoopCallbacks.push(callbackObject);
  } else {
    console.warn('無效的動畫循環回調對象。請確保它包含 update 方法。');
  }
}
