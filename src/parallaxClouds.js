import * as THREE from 'three';
import { addAnimationTask } from './animationManager';
import { add } from 'three/tsl';
import { log } from 'three/src/nodes/TSL.js';

export function initParallaxClouds() {
  const section0 = document.getElementById('section0');
  const cloud1 = document.getElementById('parallax-cloud1');
  const cloud2 = document.getElementById('parallax-cloud2');
  if (!section0 || !cloud1 || !cloud2) {
    console.warn('雲朵視差效果：找不到必要的 HTML 元素。');
    return;
  }

  //定義雲朵更新任務,從animationManager拿到state後
  const updateCloudsTask = (state) => {
    const mouseX = state.mouseX;
    const mouseY = state.mouseY;

    const xOffset = (mouseX - window.innerWidth / 2) * 0.02;
    const yOffset = (mouseY - window.innerHeight / 2) * 0.02;
    cloud1.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    cloud2.style.transform = `translate(${xOffset * 1.5}px, ${
      yOffset * 1.5
    }px)`;
  };
  addAnimationTask(updateCloudsTask);
  log('Parallax clouds initialized');

  // const strength1 = 0.02;
  // const strength2 = 0.04;
  // section0.addEventListener('mousemove', function (event) {
  //   const rect = section0.getBoundingClientRect();
  //   const mouseX = event.clientX - (rect.left + rect.width / 2);
  //   const mouseY = event.clientY - (rect.top + rect.height / 2);
  //   cloud1.style.transform = `translate(${mouseX * strength1}px,${
  //     mouseY * strength1
  //   }px)`;
  //   cloud2.style.transform = `translate(${mouseX * strength2}px,${
  //     mouseY * strength2
  //   }px)`;
  // });
}
