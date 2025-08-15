export function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');

  if (!cursor) {
    console.warn('自訂亦屬標：找不到 .custom-cursor 元素。');
    return;
  }

  window.addEventListener('mousemove', (event) => {
    cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  });

  const hoverElements = document.querySelectorAll(
    'a, button, .threejs-placeholder'
  );

  hoverElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
    });

    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
    });
  });
}
