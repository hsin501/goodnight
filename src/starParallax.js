function random(min, max) {
  return Math.random() * (max - min) + min;
}

function generateStars(count, container, sizeRange, opacityRange) {
  const starImage = './static/star_01.png';
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.classList.add('star');

    const size = random(sizeRange[0], sizeRange[1]) + 'px';
    star.style.width = size;
    star.style.height = size;
    star.style.opacity = random(opacityRange[0], opacityRange[1]);

    star.style.top = `${random(0, 100)}%`;
    star.style.left = `${random(0, 100)}%`;
    star.style.animationDuration = random(3, 6) + 's';
    star.style.animationDelay = random(0, 5) + 's';
    star.style.backgroundImage = `url(${starImage})`;

    container.appendChild(star);
  }
}

function generateDots(count, container, sizeRange, opacityRange) {
  const dotImage = './static/circle_05.png';
  for (let i = 0; i < count; i++) {
    const circle = document.createElement('div');
    circle.classList.add('star'); // 使用相同的 class 以便套用

    const size = random(sizeRange[0], sizeRange[1]) + 'px';
    circle.style.width = size;
    circle.style.height = size;
    circle.style.opacity = random(opacityRange[0], opacityRange[1]);

    circle.style.top = `${random(0, 100)}%`;
    circle.style.left = `${random(0, 100)}%`;

    circle.style.animationDuration = random(4, 8) + 's';
    circle.style.animationDelay = random(0, 7) + 's';
    circle.style.backgroundImage = `url(${dotImage})`;

    container.appendChild(circle);
  }
}
export function initStarParallax() {
  const starsBackground = document.getElementById('stars-background');
  const stars1 = document.getElementById('stars1');
  const stars2 = document.getElementById('stars2');
  const stars3 = document.getElementById('stars3');
  const section0 = document.getElementById('section0');
  const section3 = document.getElementById('section3');
  const section4 = document.getElementById('section4');

  if (!stars1 || !stars2 || !stars3 || !section0) {
    console.warn('星星視差效果：找不到必要的 HTML 元素。');
    return;
  }
  // ---- 在不同圖層生成星星 ----
  // 第 1 層 (遠)
  generateStars(500, stars1, [5, 10], [0.2, 0.5]); //星星尺寸 -px, 透明度 -
  generateDots(500, stars1, [5, 10], [0.1, 0.3]); //圓點尺寸 -px, 透明度 -

  // 第 2 層 (中)
  generateStars(100, stars2, [10, 18], [0.2, 0.7]);
  generateDots(25, stars2, [20, 30], [0.2, 0.5]);

  // 第 3 層 (近)
  generateStars(50, stars3, [20, 50], [0.2, 0.6]);
  generateDots(20, stars3, [30, 50], [0.1, 0.5]);

  // 流星
  function createShootingStarManager(targetSection, starCount) {
    const shootingStars = []; // 儲存流星的陣列
    let starsCreated = false; // 標記是否已經創建過流星

    // 創建流星
    function createShootingStars() {
      if (starsCreated) return; // 如果已經創建過了，就不要再創建

      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('shooting-star');

        // 為每顆流星儲存一些隨機屬性
        const starProps = {
          element: star,
          startX: random(0, window.innerWidth * 1.5), // 起始 X 位置 (可以從螢幕外開始)
          startY: random(-window.innerHeight, window.innerHeight * 0.5), // 起始 Y 位置
          speed: random(1, 2), // 每顆流星有不同的速度
        };

        stars3.appendChild(star);
        shootingStars.push(starProps);
      }
      starsCreated = true;
    }
    function updateShootingStars() {
      const rect = targetSection.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.top < vh && rect.bottom > 0) {
        createShootingStars(); // 在目標區域內創建流星
        const progress = 1 - rect.bottom / (vh + rect.height);
        shootingStars.forEach((star) => {
          star.element.style.opacity = Math.sin(progress * Math.PI);
          const moveDistance = progress * 2500 * star.speed;
          const finalX = star.startX - moveDistance;
          const finalY = star.startY + moveDistance * 0.8;
          star.element.style.transform = `translate(${finalX}px, ${finalY}px) rotate(325deg)`;
        });
      } else {
        shootingStars.forEach((star) => {
          star.element.style.opacity = 0; // 離開區域時隱藏流星
        });
      }
    }
    return { updateShootingStars };
  }

  const managerForSection3 = createShootingStarManager(section3, 10);
  const managerForSection4 = createShootingStarManager(section4, 15);

  //滑鼠滾動監聽
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener('mousemove', (event) => {
    // 判斷是否在 threejs-placeholder 上
    const isOnThreejs = event.target.closest('.threejs-placeholder');
    if (isOnThreejs) return;

    // 計算滑鼠位置相對於視窗中心的偏移百分比 (-50% to +50%)
    mouseX = (event.clientX / window.innerWidth - 0.5) * 100;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 100;

    updateTransform();
  });

  window.addEventListener('scroll', () => {
    updateTransform();
  });

  function updateTransform() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    if (scrollY > vh * 0.9 && scrollY < vh * 4.5) {
      starsBackground.style.opacity = 1;
    } else {
      starsBackground.style.opacity = 0;
    }
    // 滾動和滑鼠視差
    stars1.style.transform = `translate(${mouseX * 0.1}px, ${
      scrollY * -0.05 + mouseY * 0.05
    }px)`;
    stars2.style.transform = `translate(${mouseX * 0.3}px, ${
      scrollY * -0.15 + mouseY * 0.15
    }px)`;
    stars3.style.transform = `translate(${mouseX * 0.6}px, ${
      scrollY * -0.25 + mouseY * 0.3
    }px)`;
    managerForSection3.updateShootingStars();
    managerForSection4.updateShootingStars();
  }
}
