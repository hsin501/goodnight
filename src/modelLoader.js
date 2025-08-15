import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';

//導出一個函數來載入模型
export function loadMyModel(scene, config) {
  return new Promise((resolve, reject) => {
    const modelData = {
      modelScene: null,
      containerMesh: null,
      labelMesh: null,
      config: config,
    };
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/libs/draco/gltf/'
    );
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load(
      config.modelPath,
      (gltf) => {
        console.log('模型載入成功:', config.modelPath);
        // 獲取模型場景
        modelData.modelScene = gltf.scene;
        //設定模型的初始大小和位置
        modelData.modelScene.scale.set(
          config.scale.x,
          config.scale.y,
          config.scale.z
        );
        modelData.modelScene.position.set(
          config.position.x,
          config.position.y,
          config.position.z
        );
        modelData.modelScene.visible = false;

        // 遍歷模型中的所有子物件，找到我們需要的「瓶子」和「標籤」
        modelData.modelScene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            console.log(
              'Mesh:',
              child.name,
              'world pos:',
              child.getWorldPosition(new THREE.Vector3())
            );

            if (child.name === config.containerName) {
              modelData.containerMesh = child;
              console.log('找到瓶子:', child.name);

              //為了能改變顏色 複製一份材質 並設定初始顏色
              if (child.material) {
                const newMaterial = child.material.clone();
                newMaterial.color.set(new THREE.Color(0xffffff));
                newMaterial.roughness = 0.35;
                newMaterial.metalness = 0.0;
                newMaterial.clearcoat = 0.8;
                newMaterial.clearcoatRoughness = 0.2;
                modelData.containerMesh.material = newMaterial;

                console.log(
                  `瓶子網格 "${child.name}" 發現原始材質:`,
                  child.material
                );
              } else {
                console.warn(
                  `瓶子網格 "${child.name}" 沒有原始材質，已創建預設材質。`
                );
              }
            } else if (child.name === config.labelName) {
              modelData.labelMesh = child;
              console.log('找到標籤:', child.name);
              if (child.material) {
                child.material = child.material.clone();
                child.material.roughness = 0.2;
              }
            }
          }
        });
        if (!modelData.containerMesh) {
          console.warn(
            `警告：在模型 ${config.modelPath} 中沒有找到名為 "${config.containerName}" 的瓶子網格！顏色更改功能可能無法運作。`
          );
        }
        scene.add(modelData.modelScene);
        console.log('模型已加入 scene', modelData.modelScene);
        resolve(modelData); // 告訴主程式模型載入好了，並把模型資訊傳回去
      },
      (xhr) => {
        console.log(`載入進度：${(xhr.loaded / xhr.total) * 100}%`);
      },
      (error) => {
        console.error('模型載入失敗:', error);
        reject(error); // 如果載入失敗，告訴主程式
      }
    );
  });
}
