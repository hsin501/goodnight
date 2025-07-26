import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';

let loadedModelData = {
  modelScene: null,
  bottleMesh: null,
  labelMesh: null,
};

//導出一個函數來載入模型
export function loadMyModel(
  scene,
  modelPath,
  bottleName,
  labelName = null,
  initColorHex = 0x81d4fa
) {
  return new Promise((resolve, reject) => {
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/libs/draco/gltf/'
    );
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load(
      modelPath,
      (gltf) => {
        console.log('模型載入成功:', modelPath);
        // 獲取模型場景
        loadedModelData.modelScene = gltf.scene;
        //設定模型的初始大小和位置
        loadedModelData.modelScene.scale.set(2.2, 2.2, 2.2);
        loadedModelData.modelScene.position.set(-0.5, -1, 0);
        loadedModelData.modelScene.visible = false;

        // 遍歷模型中的所有子物件，找到我們需要的「瓶子」和「標籤」
        loadedModelData.modelScene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            console.log(
              'Mesh:',
              child.name,
              'world pos:',
              child.getWorldPosition(new THREE.Vector3())
            );

            if (child.name === bottleName) {
              loadedModelData.bottleMesh = child;
              console.log('找到瓶子:', child.name);

              //為了能改變顏色 複製一份材質 並設定初始顏色
              if (child.material) {
                const newMaterial = child.material.clone();
                newMaterial.color.set(new THREE.Color(initColorHex));
                newMaterial.roughness = 0.35;
                newMaterial.metalness = 0.0;
                newMaterial.clearcoat = 0.8;
                newMaterial.clearcoatRoughness = 0.2;
                loadedModelData.bottleMesh.material = newMaterial;

                console.log(
                  `瓶子網格 "${child.name}" 發現原始材質:`,
                  child.material
                );
                loadedModelData.bottleMesh.material = child.material.clone();
                loadedModelData.bottleMesh.material.color.set(
                  new THREE.Color(initColorHex)
                );
              } else {
                console.warn(
                  `瓶子網格 "${child.name}" 沒有原始材質，已創建預設材質。`
                );
                loadedModelData.bottleMesh.material =
                  new THREE.MeshStandardMaterial({
                    color: new THREE.Color(initColorHex),
                  });
              }
            } else if (labelName && child.name === labelName) {
              loadedModelData.labelMesh = child;
              console.log('找到標籤:', child.name);
              if (child.material) {
                child.material = child.material.clone();
                child.material.roughness = 0.05;
              }
            }
          }
        });
        if (!loadedModelData.bottleMesh) {
          console.warn(
            `警告：在模型 ${modelPath} 中沒有找到名為 "${bottleName}" 的瓶子網格！顏色更改功能可能無法運作。`
          );
        }
        scene.add(loadedModelData.modelScene);
        console.log('模型已加入 scene', loadedModelData.modelScene);
        resolve(loadedModelData); // 告訴主程式模型載入好了，並把模型資訊傳回去
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
