//存放所有需要執行的動畫任務
const updateQueue = [];

//儲存位置狀態
const animationState = {
  mouseX: 0,
  mouseY: 0,
  scrollY: 0,
  needsUpdate: false,
};

//主動畫迴圈
function tick(lenis, threeApp, time) {
  if (lenis) {
    lenis.raf(time);
  }
  //執行2d動畫任務
  if (animationState.needsUpdate) {
    updateQueue.forEach((task) => task(animationState));
    animationState.needsUpdate = false;
  }

  //3d
  if (threeApp && threeApp.renderer) {
    const { renderer, scene, camera, scenesToRender, animationLoopCallbacks } =
      threeApp;
    animationLoopCallbacks.forEach((cb) => cb.update && cb.update());
    // 開始渲染流程
    renderer.setScissorTest(false);
    renderer.clear();
    renderer.setScissorTest(true);

    //確保渲染前不可見
    scenesToRender.forEach((s) => {
      if (s.modelData && s.modelData.modelScene) {
        s.modelData.modelScene.visible = false;
      }
    });
    renderer.render(scene, camera);

    //便利每個模型，只渲染真正可見的
    scenesToRender.forEach((sceneData) => {
      const { rect, modelData } = sceneData;
      if (!rect) return;

      // 檢查placeholder 是否在視窗範圍內
      const isCurrentlyVisible =
        rect.bottom > 0 && rect.top < renderer.domElement.clientHeight;

      if (isCurrentlyVisible) {
        modelData.modelScene.visible = true;

        //設定剪裁區域
        const bottom = renderer.domElement.clientHeight - rect.bottom;
        renderer.setScissor(rect.left, bottom, rect.width, rect.height);
        renderer.setViewport(rect.left, bottom, rect.width, rect.height);

        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();

        scenesToRender.forEach((otherSceneData) => {
          if (otherSceneData !== sceneData) {
            otherSceneData.modelData.modelScene.visible = false;
          }
        });

        //渲染場景
        renderer.render(scene, camera);
        modelData.modelScene.visible = false; // 渲染後隱藏
      }
    });
  }
  requestAnimationFrame((t) => tick(lenis, threeApp, t));
}

//監聽事件
function setEventListeners(lenis) {
  window.addEventListener('mousemove', (event) => {
    const isOnThreejs = event.target.closest('.threejs-placeholder');
    if (isOnThreejs) return;

    animationState.mouseX = event.clientX;
    animationState.mouseY = event.clientY;
    animationState.needsUpdate = true;
  });
  if (lenis) {
    lenis.on('scroll', (e) => {
      animationState.scrollY = e.animatedScroll;
      animationState.needsUpdate = true;
    });
  } else {
    window.addEventListener(
      'scroll',
      () => {
        animationState.scrollY = window.scrollY;
        animationState.needsUpdate = true;
      },
      { passive: true }
    );
  }
}

//提供一個方法，讓其他檔案可以把自己的動畫任務加進來
export function addAnimationTask(task) {
  if (typeof task === 'function') {
    updateQueue.push(task);
  }
}

//啟動函式
export function startAnimationManager(lenis, threeApp) {
  setEventListeners(lenis);
  requestAnimationFrame((t) => tick(lenis, threeApp, t));
  console.log('Animation manager started');
}
