//存放所有需要執行的動畫任務
const updateQueue = [];

//儲存位置狀態
const animationState = {
  mouseX: 0,
  mouseY: 0,
  scrollY: 0,
};

//主動畫迴圈
function tick() {
  updateQueue.forEach((task) => task(animationState));
  requestAnimationFrame(tick);
}

//監聽事件
function setEventListeners(lenis) {
  window.addEventListener('mousemove', (event) => {
    const isOnThreejs = event.target.closest('.threejs-placeholder');
    if (isOnThreejs) return;

    animationState.mouseX = event.clientX;
    animationState.mouseY = event.clientY;
  });
  if (lenis) {
    lenis.on('scroll', (e) => {
      animationState.scrollY = e.animatedScroll;
    });
  } else {
    window.addEventListener(
      'scroll',
      () => {
        animationState.scrollY = window.scrollY;
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
export function startAnimationManager(lenis) {
  setEventListeners(lenis);
  tick();
  console.log('Animation manager started');
}
