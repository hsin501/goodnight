import * as THREE from 'three';

export const modelMaterials = {};
export function changeModelColor(sectionId, colorString) {
  const materials = modelMaterials[sectionId];
  if (materials) {
    const newColor = new THREE.Color(colorString);
    if (materials.containerMaterial) {
      materials.containerMaterial.color.set(newColor);
      console.log(`已將 ${sectionId} 的容器顏色更改為: ${colorString}`);
    }
    if (materials.capMaterial) {
      materials.capMaterial.color.set(newColor);
      console.log(`已將 ${sectionId} 的蓋子顏色更改為: ${colorString}`);
    }
  } else {
    console.warn(`沒有找到 ${sectionId} 的材質，無法更改顏色。`);
  }
}
