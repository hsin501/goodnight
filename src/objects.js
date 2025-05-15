import * as THREE from 'three';
import { textureLoader } from './utils.js';
import { INITIAL_MESH_COLOR, OBJECT_DISTANCE } from './constants.js';
import { GLTFLoader as ThreeGLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader as ThreeDRACOLoader } from 'three/examples/jsm/Addons.js';

/**
 * 加載應用所需的紋理
 * @returns {{gradientTexture: THREE.Texture, particlesTexture: THREE.Texture}} 包含已加載紋理的對象
 */

export function loadTextures() {
  //加載漸變紋理
  const gradientTexture = textureLoader.load('static/3.jpg');
  gradientTexture.magFilter = THREE.NearestFilter; //漸變濾鏡

  //加載粒子紋理
  const cloudTextureUrls = [
    'static/cloud39.png',
    'static/cloud40.png',
    'static/cloud41.png',
    'static/cloud42.png',
    'static/cloud43.png',
    'static/cloud55.png',
    'static/cloud56.png',
    'static/cloud58.png',
    'static/cloud67.png',
    'static/cloud79.png',
  ];
  const cloudTextures = cloudTextureUrls.map((url) => {
    return textureLoader.load(url);
  });
  console.log('紋理已加載');
  return { gradientTexture, cloudTextures };
}

/**
 * 創建應用所需的材質
 * @param {object} textures - 包含 loadTextures 返回的紋理對象
 * @returns {{material: THREE.MeshStandardMaterial}} 包含模型材質的對象
 */

export function createMaterials(textures) {
  //創建模型材質
  const material = new THREE.MeshStandardMaterial({
    color: INITIAL_MESH_COLOR,
    roughness: 0.4,
    metalness: 0.2,
  });
  return { material };
}

/**
 * 創建場景中的主要模型對象
 * @param {THREE.MeshStandardMaterial} material - 用於所有模型的共享材質
 * @returns {THREE.Mesh[]} 包含所有創建的模型 (mesh1, mesh2, mesh3) 的數組
 */

const gltfLoaderInstance = new ThreeGLTFLoader();
const dracoLoaderInstance = new ThreeDRACOLoader();
dracoLoaderInstance.setDecoderPath(
  'https://www.gstatic.com/draco/v1/decoders/'
);
gltfLoaderInstance.setDRACOLoader(dracoLoaderInstance);

/**
 * 異步加載產品模型
 * @returns {Promise<THREE.Group[]>} 一個 Promise，解析後為包含已加載和處理過的模型 (Group) 的數組
 */
export async function loadProductModels(initaMaterial) {
  const modelPath = [
    'static/model/facewash.glb',
    'static/model/bodywash.glb',
    'static/model/cream.glb',
    'static/model/waterspray.glb',
  ];
  const modelSettings = {
    facewash: { scale: [1.8, 1.8, 1.8], positionX: 1, positionY: 0.5 },
    bodywash: { scale: [1.2, 1.2, 1.2], positionX: -1, positionY: 1.2 },
    cream: { scale: [1.2, 1.2, 1.2], positionX: 1, positionY: 0.6 },
    waterspray: { scale: [1.5, 1.5, 1.5], positionX: -1, positionY: 1 },
  };
  const loadedModels = [];
  try {
    for (let i = 0; i < modelPath.length; i++) {
      const path = modelPath[i];
      const gltf = await gltfLoaderInstance.loadAsync(path);
      const model = gltf.scene;

      // 取得模型設定
      const defaultScale = [1, 1, 1];
      const defaultPositionX = [0, 0, 0];
      const settings = Object.keys(modelSettings).find((key) =>
        path.includes(key)
      )
        ? modelSettings[
            Object.keys(modelSettings).find((key) => path.includes(key))
          ]
        : { scale: defaultScale, positionX: defaultPositionX };

      // 設置模型縮放
      model.scale.set(...settings.scale);
      //設置模型位置
      model.position.y =
        -OBJECT_DISTANCE * i - OBJECT_DISTANCE - settings.positionY;
      model.position.x = settings.positionX;
      loadedModels.push(model);
      console.log(`模型 ${path} 已加載並處理`);
    }
    return loadedModels;
  } catch (error) {
    console.error('加載模型錯誤', error);
    return [];
  }
}

// /**
//  * 創建雲朵
//  * @param {THREE.Texture[]} cloudTextures - 包含多個雲朵紋理的數組
//  * @returns {THREE.Mesh[]} 一個包含所有雲朵 Mesh 的數組
//  */

// export function createCloudMeshes(cloudTextures) {
//   const clouds = [];
//   for (let i = 0; i < NUM_CLOUDS; i++) {
//     //隨機雲紋理
//     const texture =
//       cloudTextures[Math.floor(Math.random() * cloudTextures.length)];
//     //隨機雲材質
//     const cloudMaterial = new THREE.MeshBasicMaterial({
//       map: texture,
//       transparent: true,
//       opacity: Math.random() * 0.5 + 0.05, // 隨機不透明度
//       depthWrite: false, // 禁用深度寫入
//       side: THREE.DoubleSide, // 雙面渲染
//     });
//     //隨機雲幾何體
//     const planeSize = Math.random() * 5 + 3; // 隨機平面大小
//     const planeWidth = planeSize;
//     const planeHeight = planeSize * Math.random() * 0.5 + 1.2;
//     const cloudGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
//     const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
//     //隨機雲位置
//     cloudMesh.position.x = (Math.random() - 0.5) * CLOUD_SPREAD_X; // 隨機 x 軸位置
//     cloudMesh.position.y =
//       Math.random() * (CLOUD_SPREAD_Y_MAX - CLOUD_SPREAD_Y_MIN) +
//       CLOUD_SPREAD_Y_MIN;
//     cloudMesh.position.z = (Math.random() - 0.5) * CLOUD_SPREAD_Z; // 隨機 z 軸位置

//     // 隨機雲旋轉
//     cloudMesh.rotation.y = Math.random() * Math.PI * 2;

//     //自訂義數據
//     cloudMesh.userData.initialX = cloudMesh.position.x;
//     cloudMesh.userData.initialY = cloudMesh.position.y;
//     cloudMesh.userData.initialZ = cloudMesh.position.z;
//     // 添加漂移速度
//     cloudMesh.userData.driftSpeedX = (Math.random() - 0.5) * 0.008 + 0.001; // 示例值
//     cloudMesh.userData.driftSpeedZ = (Math.random() - 0.5) * 0.003; // 示例值
//     clouds.push(cloudMesh);
//   }
//   console.log('雲朵已加載');
//   return clouds;
// }

/**
 * 根據提供的配置創建一個或多個具有特定屬性的雲朵 Mesh。
 * @param {THREE.Texture[]} allCloudTextures - 包含所有可用雲朵紋理的數組。
 * @param {Array<Object>} cloudConfigs - 包含每個雲朵配置的數組。
 *
 * @returns {THREE.Mesh[]} 一個包含所有創建的雲朵 Mesh 的數組。
 */

export function createCloud1(allCloudTextures, cloudConfigs) {
  if (!allCloudTextures || allCloudTextures.length === 0) {
    console.error('無效的 allCloudTextures 或 cloudConfigs');
    return [];
  }
  if (!cloudConfigs || cloudConfigs.length === 0) {
    console.error('無效的 cloudConfigs');
    return [];
  }

  const createdCloudsArray = [];
  for (const config of cloudConfigs) {
    // 從紋理數組中選擇一個紋理
    const texture = allCloudTextures[config.textureIndex];

    //雲材質
    const cloudMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: config.opacity, // 隨機不透明度
      depthWrite: false, // 禁用深度寫入
      side: THREE.DoubleSide, // 雙面渲染
    });

    //雲幾何體

    const planeWidth = config.width;
    const planeHeight =
      config.height || planeWidth * (Math.random() * 0.2 + 0.9);
    const cloudGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);

    //雲位置
    cloudMesh.position.copy(config.position);

    cloudMesh.rotation.y = config.rotationY || Math.random() * Math.PI * 2;

    //自訂義數據
    cloudMesh.userData.isInteractive = config.isInteractive || false;
    // 添加漂移
    cloudMesh.userData.driftSpeedX =
      config.driftSpeedX !== undefined
        ? config.driftSpeedX
        : (Math.random() - 0.5) * 0.003;
    cloudMesh.userData.driftSpeedZ =
      config.driftSpeedZ !== undefined
        ? config.driftSpeedZ
        : (Math.random() - 0.5) * 0.0015;
    cloudMesh.userData.config = config; // 存儲原始配置
    cloudMesh.userData.initialWorldPosition = cloudMesh.position.clone(); // 存儲初始位置

    createdCloudsArray.push(cloudMesh);
  }
  console.log('雲朵已加載');
  return createdCloudsArray;
}
