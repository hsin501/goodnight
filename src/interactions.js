import gsap from 'gsap';
import { sizes } from './utils';
import { MOBILE_BREAKPOINT } from './constants';

export const cursor = { x: 0, y: 0 };
let currentSection = 0;

/**
 * 設置滾動事件監聽器，觸發模型進入視圖時的動畫
 * @param {THREE.Mesh[]} sectionMeshes - 需要動畫的模型數組
 */
export function setupScrollListener(sectionMeshes) {
  if (!Array.isArray(sectionMeshes) || sectionMeshes.length === 0) return; // 確保 sectionMeshes 是有效的數組

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY; // 獲取當前滾動位置

    //// 計算當前滾動到哪個區域
    const newSection = Math.round(scrollY / sizes.height);
    // console.log(newSection);

    // 如果當前區域與新區域不同，則觸發動畫
    // if (newSection != currentSection) {
    //   currentSection = newSection;
    //   // console.log('change', currentSection);
    //   gsap.to(sectionMeshes[currentSection].rotation, {
    //     duration: 1.5,
    //     ease: 'power2.inOut',
    //     x: '+=6',
    //     y: '+=3',
    //     z: '+=1.5',
    //   });
    // }
  });
  console.log('滾動事件監聽器已設置');
}

/**
 * 設置鼠標移動事件監聽器，更新共享的 cursor 對象
 */
export function setupCursorListener() {
  window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5;
    cursor.y = event.clientY / sizes.height - 0.5;
  });
  console.log('鼠標移動事件監聽器已設置');
}

/**
 * 根據屏幕寬度更新模型位置 (響應式)
 * @param {THREE.Mesh[]} sectionMeshes - 需要調整位置的模型數組
 */

function updateMeshPositionsForResponsiveness(sectionMeshes) {
  if (!sectionMeshes || sectionMeshes.length < 3) return;
  const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
  sectionMeshes[0].position.x = isMobile ? 0 : 2;
  sectionMeshes[1].position.x = isMobile ? 0 : -2;
  sectionMeshes[2].position.x = isMobile ? 0 : 2;
}

/**
 * 設置窗口大小調整的監聽器，處理響應式佈局
 * @param {THREE.PerspectiveCamera} camera - 場景相機
 * @param {THREE.WebGLRenderer} renderer - WebGL 渲染器
 * @param {THREE.Mesh[]} sectionMeshes - 需要響應式調整的模型數組
 */

export function setupResizeListener(camera, renderer, sectionMeshes) {
  window.addEventListener('resize', () => {
    // 更新共享的 sizes 對象
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    //  更新相機的長寬比和投影矩陣
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // 更新渲染器的大小和像素比
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 調用函數更新模型位置
    updateMeshPositionsForResponsiveness(sectionMeshes);
    console.log('窗口尺寸已更新');
  });
  updateMeshPositionsForResponsiveness();
  console.log('響應式監聽器已設置');
}

/**
 * 設置所有與 HTML DOM 元素的交互
 * @param {THREE.Material} material - 模型材質 (用於顏色選擇器更新)
 * @param {THREE.PointsMaterial} particlesMaterial - 粒子材質 (用於顏色選擇器更新)
 */

export function setupDOMInteractions(material, particlesMaterial) {
  // ===== 顏色選擇器 =====
  const meshColorPicker = document.getElementById('meshColorPicker');
  const particleColorPicker = document.getElementById('particleColorPicker');

  if (meshColorPicker && particleColorPicker) {
    // 設置初始顏色值 (從材質獲取，確保同步)
    // 注意：要確保 material 和 particlesMaterial 已經創建
    if (material) meshColorPicker.value = '#' + material.color.getHexString();
    if (particlesMaterial)
      particleColorPicker.value = '#' + particlesMaterial.color.getHexString();

    // 監聽模型顏色選擇器的變化
    meshColorPicker.addEventListener('input', (event) => {
      const newColor = event.target.value;
      material.color.set(newColor); // 更新共用的 material 顏色
    });
    // 監聽粒子顏色選擇器的變化
    particleColorPicker.addEventListener('input', (event) => {
      const newColor = event.target.value;
      particlesMaterial.color.set(newColor); // 更新粒子 material 顏色
    });
    console.log('顏色選擇器已設置');
  } else {
    console.error('顏色選擇器未找到');
  }

  //===== 顯示/隱藏顏色選擇器面板 =====
  const toggleButton = document.getElementById('toggleColorButton');
  const colorPanel = document.querySelector('.color-controls');

  if (toggleButton && colorPanel) {
    // 確保元素存在
    toggleButton.addEventListener('click', (event) => {
      event.stopPropagation(); // 停止事件冒泡
      colorPanel.classList.toggle('is-open');
    });
    // 點擊顏色選擇器外部時關閉面板
    document.addEventListener('click', (event) => {
      if (
        colorPanel.classList.contains('is-open') &&
        !colorPanel.contains(event.target) &&
        !toggleButton.contains(event.target)
      ) {
        colorPanel.classList.remove('is-open');
      }
    });
    console.log('顏色選擇器面板已設置');
  } else {
    console.error('顏色選擇器面板或按鈕未找到');
  }

  //=====修復觸控裝置的 hover 效果=====
  const navItems = document.querySelectorAll('.glass-container ul li');
  if (navItems.length > 0) {
    // 先移除所有的 touch-hover class
    const removeAllTouchHover = () => {
      navItems.forEach((item) => {
        item.classList.remove('touch-hover');
      });
    };

    navItems.forEach((item) => {
      // --- 觸控開始 ---
      item.addEventListener(
        'touchstart',
        function (event) {
          // 先移除其他項目的高亮，確保只有當前觸控的項目高亮
          removeAllTouchHover();
          // 為當前觸控的項目添加高亮
          // console.log('觸控開始，正在為此元素添加 touch-hover:', this);
          this.classList.add('touch-hover');
        },
        { passive: true }
      );
      const removeHover = () => item.classList.remove('touch-hover');
      // --- 觸控結束 ---
      item.addEventListener('touchend', removeHover, { passive: true });
      // --- 觸控取消 ---
      item.addEventListener('touchcancel', removeHover, { passive: true });
    });
    // --- 保險措施：滾動時清除所有高亮 ---
    window.addEventListener('scroll', removeAllTouchHover, { passive: true });
    console.log('觸控裝置的 hover 效果已應用');
  } else {
    console.error('觸控裝置的 hover 效果未應用，未找到導航欄項目');
  }
  console.log('所有 DOM 交互已設置');
}
console.log('interactions.js 載入完成');
