import * as THREE from 'three';
export function initParallaxClouds() {
  const section0 = document.getElementById('section0');
  const cloud1 = document.getElementById('parallax-cloud1');
  const cloud2 = document.getElementById('parallax-cloud2');
  if (!section0 || !cloud1 || !cloud2) {
    console.warn('雲朵視差效果：找不到必要的 HTML 元素。');
    return;
  }

  const strength1 = 0.02;
  const strength2 = 0.04;
  section0.addEventListener('mousemove', function (event) {
    const rect = section0.getBoundingClientRect();
    const mouseX = event.clientX - (rect.left + rect.width / 2);
    const mouseY = event.clientY - (rect.top + rect.height / 2);
    cloud1.style.transform = `translate(${mouseX * strength1}px,${
      mouseY * strength1
    }px)`;
    cloud2.style.transform = `translate(${mouseX * strength2}px,${
      mouseY * strength2
    }px)`;
  });
}
