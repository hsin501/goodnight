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

export function startAnimation(
  scene,
  camera,
  cameraGroup,
  renderer,
  sectionMeshes
) {
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

    //模型動畫 - 持續旋轉
    // if (sectionMeshes && sectionMeshes.length > 0) {
    //   for (const mesh of sectionMeshes) {
    //     mesh.rotation.x += deltaTime * 0.2;
    //     mesh.rotation.y += deltaTime * 0.12;
    //   }
    // }

    // //雲的動畫 - 隨機移動
    // if (dynamicClouds && dynamicClouds.length > 0) {
    //   dynamicClouds.forEach((cloud) => {
    //     if (cloud && cloud.position && cloud.userData) {
    //       // 添加檢查
    //       // 如果沒有 driftSpeed，給一個默認值，但理想情況下應該在 createCloudMeshes 中設置
    //       const driftX = cloud.userData.driftSpeedX || 0.002;
    //       const driftZ = cloud.userData.driftSpeedZ || 0.001;

    //       cloud.position.x += driftX * deltaTime * 15; // 調整速度乘數
    //       cloud.position.z += driftZ * deltaTime * 15;

    //       // 邊界環繞邏輯 (X軸)
    //       const spreadLimitX =
    //         CLOUD_SPREAD_X / 2 + (cloud.geometry.parameters.width || 5); // 基於雲的寬度
    //       if (cloud.position.x > spreadLimitX) {
    //         cloud.position.x = -spreadLimitX;
    //         // 可以重新隨機化 Y 位置，增加變化
    //         cloud.position.y =
    //           CLOUD_SPREAD_Y_MIN +
    //           Math.random() * (CLOUD_SPREAD_Y_MAX - CLOUD_SPREAD_Y_MIN);
    //         if (cloud.material && cloud.material.opacity < 0.75) {
    //           // 避免突然出現完全不透明的雲
    //           cloud.material.opacity = Math.random() * 0.35 + 0.4;
    //         }
    //       } else if (cloud.position.x < -spreadLimitX) {
    //         cloud.position.x = spreadLimitX;
    //         cloud.position.y =
    //           CLOUD_SPREAD_Y_MIN +
    //           Math.random() * (CLOUD_SPREAD_Y_MAX - CLOUD_SPREAD_Y_MIN);
    //         if (cloud.material && cloud.material.opacity < 0.75) {
    //           cloud.material.opacity = Math.random() * 0.35 + 0.4;
    //         }
    //       }
    //     }
    //     // Billboard 效果: 讓雲朵始終面向相機的世界位置 (只在 XZ 平面上)
    //     const cameraWorldPosition = new THREE.Vector3(); // 在 tick 函數外部定義這個向量
    //     camera.getWorldPosition(cameraWorldPosition); // 每幀更新相機的世界位置

    //     let lookAtTarget = new THREE.Vector3(
    //       cameraWorldPosition.x, // 使用相機世界 X
    //       cloud.position.y, // 保持雲朵自身的 Y 軸位置，避免上下翻轉
    //       cameraWorldPosition.z // 使用相機世界 Z
    //     );
    //     cloud.lookAt(lookAtTarget);
    //   });
    // }
    // 渲染;
    renderer.render(scene, camera);

    // 請求下一幀
    window.requestAnimationFrame(tick);
  };
  tick();
  console.log('動畫循環已啟動');
}
console.log('動畫模組已加載');
