import * as THREE from 'three';
import { cursor } from './interactions';
import { sizes } from './utils';
import { OBJECT_DISTANCE } from './constants';

// ====動畫相關內部變量 ====
const clock = new THREE.Clock();
let previousTime = 0;

/**
 * (導出函數) 啟動並運行 Three.js 動畫循環
 * @param {THREE.Scene} scene - 需要渲染的場景
 * @param {THREE.PerspectiveCamera} camera - 用於觀察場景的相機
 * @param {THREE.Group} cameraGroup - 控制相機視差效果的組
 * @param {THREE.WebGLRenderer} renderer - WebGL 渲染器實例
 * @param {THREE.Mesh[]} sectionMeshes - 場景中的模型數組，用於持續旋轉動畫
 */

export function startAnimation(scene, camera, cameraGroup, renderer) {
  const tick = () => {
    // 時間計算
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // 獲取實時滾動位置
    const scrollY = window.scrollY;

    //相機動畫 - 垂直移動
    camera.position.y = (-scrollY / sizes.height) * OBJECT_DISTANCE;

    //相機動畫 - 視差效果
    const parallaxX = cursor.x * 0.5;
    const parallaxY = -cursor.y * 0.5;

    // 平滑的把 cameraGroup 移動到目標視差位置
    // (目標位置 - 當前位置) * 平滑因子 * 時間差
    // deltaTime 確保在不同刷新率下動畫速度一致
    cameraGroup.position.x +=
      (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
    cameraGroup.position.y +=
      (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

    // 渲染;
    renderer.render(scene, camera);

    // 請求下一幀
    window.requestAnimationFrame(tick);
  };
  tick();
  console.log('動畫循環已啟動');
}
console.log('動畫模組已加載');
