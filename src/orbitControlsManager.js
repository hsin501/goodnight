import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let controls; // OrbitControls 實例
let mainCamera; // 對 sceneSetup 中主相機的引用
let canvasElement; // 對渲染器 DOM 元素的引用 (canvas)
let currentModelToControl; // 當前在 placeholder 中顯示的模型場
let currentPlaceholderDiv; // 當前活動的 .threejs-placeholder 元素

//初始化
export function initOrbitControls(camerFromScene, canvasFromScene) {
  mainCamera = camerFromScene;
  canvasElement = canvasFromScene;

  controls = new OrbitControls(mainCamera, canvasElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enabled = false;
  console.log('OrbitControls初始化成功');

  return {
    update: function () {
      if (controls.enabled) {
        controls.update();
      }
    },
  };
}

export function controlModelBySection(sectionDiv, modelToShow) {
  console.log('controlModelBySection called with:', sectionDiv, modelToShow);
  //先把上一個模型的顯示關掉
  if (currentModelToControl && currentModelToControl !== modelToShow) {
    currentModelToControl.visible = false;
  }
  if (currentPlaceholderDiv) {
    mainCamera.clearViewOffset();
    if (canvasElement) {
      mainCamera.aspect =
        canvasElement.clientWidth / canvasElement.clientHeight;
      mainCamera.updateProjectionMatrix();
      console.log('Cleared view offset, reset camera aspect.');
    }
  }
  controls.enabled = false;
  currentModelToControl = null;
  currentPlaceholderDiv = null;

  if (sectionDiv && modelToShow) {
    const placeholder = sectionDiv.querySelector('.threejs-placeholder');
    console.log('Found placeholder in section:', sectionDiv.id, placeholder); // <--- 打印 placeholder
    if (placeholder) {
      currentPlaceholderDiv = placeholder;
      currentModelToControl = modelToShow;
      currentModelToControl.visible = true;
      console.log('TEMPORARY: Model forced visible:', currentModelToControl);
      controls.enabled = true;
      controls.target.set(0, 0.5, 0);

      if (canvasElement) {
        // 確保相機看整個畫布
        mainCamera.aspect =
          canvasElement.clientWidth / canvasElement.clientHeight;
      }
      mainCamera.updateProjectionMatrix();
      controls.update();
      console.log(
        `TEMPORARY: Controls enabled for WHOLE screen, targeting origin.`
      );

      // 獲取 placeholder 在螢幕上的位置和大小
      const rect = placeholder.getBoundingClientRect();
      mainCamera.setViewOffset(
        canvasElement.clientWidth,
        canvasElement.clientHeight,
        rect.left,
        rect.top,
        rect.width,
        rect.height
      );
      // console.log('Placeholder Rect:', rect);
      // 更新相機的長寬比，讓它匹配框框的長寬比，這樣模型才不會變形
      mainCamera.aspect = rect.width / rect.height;
      mainCamera.updateProjectionMatrix();

      // 設定遙控器的「目標點」(相機圍繞哪個點轉)
      controls.target.set(
        modelToShow.position.x,
        modelToShow.position.y + 0.5,
        modelToShow.position.z
      );
      controls.update();
      console.log(`遙控器現在控制 Section: ${sectionDiv.id} 中的模型`);
    } else {
      console.warn(
        `找不到 Section: ${sectionDiv.id} 中的 .threejs-placeholder 元素`
      );
    }
  } else {
    console.log('沒有指定 section 或模型，遙控器已關閉，並清除特殊視圖。');
    if (modelToShow) modelToShow.visible = false;
  }
}
