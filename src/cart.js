import { modelMaterials } from './modelColorChanger.js';

export function initShoppingCart(lenis) {
  const buyButtons = document.querySelectorAll('.buy-btn');
  const cartIcon = document.getElementById('cart-icon');
  const cartCountBadge = document.getElementById('cart-count-badge');
  const toast = document.getElementById('toast-notification');

  //modal相關
  const cartModal = document.getElementById('cart-modal');
  const closeModalButton = document.querySelector('.close-button');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartTotalItems = document.getElementById('cart-total-items');
  const cartTotalPrice = document.getElementById('cart-total-price');

  let cart = JSON.parse(localStorage.getItem('myCart')) || [];
  const findItem = (productId, color) =>
    cart.findIndex((item) => item.id === productId && item.color === color);

  //加入購物車
  function addToCart(productId, productName) {
    const materials = modelMaterials[productId];
    const selectedColor = materials?.containerMaterial?.color.getHexString()
      ? `#${materials.containerMaterial.color.getHexString()}`
      : '#343434';

    //檢查購物車中是否已存在同款同色的商品
    const existingItemIndex = cart.findIndex(
      (item) => item.id === productId && item.color === selectedColor
    );
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({
        id: productId,
        name: productName,
        color: selectedColor,
        quantity: 1,
      });
    }
    localStorage.setItem('myCart', JSON.stringify(cart));
    saveAndUpdate();
    showToast(`${productName} 已加入購物車`);
  }

  //更新購物車UI
  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 0) {
      cartCountBadge.textContent = totalItems;
      cartCountBadge.classList.add('visible');
      cartIcon.classList.add('bounce');
    } else {
      cartCountBadge.classList.remove('visible');
    }
    renderCartItems();
    cartTotalItems.textContent = totalItems;
  }

  //顯示Toast通知
  let toastTimer;

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  //購物車清單渲染
  function renderCartItems() {
    cartItemsList.innerHTML = '';
    if (cart.length === 0) {
      cartItemsList.innerHTML =
        '<p class="empty-cart-message">您的購物車是空的。</p>';
    } else {
      cart.forEach((item) => {
        const itemQuantity = item.quantity || 0;
        const itemHTML = `
          <div class="cart-item" data-product-id="${item.id}" data-color="${item.color}">
            <div class="cart-item-info">
              <div class="cart-item-color-swatch" style="background-color: ${item.color};"></div>
              <span class="cart-item-name">${item.name}</span>
            </div>
            <div class="cart-item-controls">
              <div class="quantity-adjuster">
                <button class="quantity-btn minus-btn" aria-label="減少數量">-</button>
                <span class="cart-item-quantity">${item.quantity}</span>
                <button class="quantity-btn plus-btn" aria-label="增加數量">+</button>
              </div>
              <button class="remove-item-button" aria-label="移除商品">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        `;
        //將項目加入購物車列表
        //使用insertAdjacentHTML()，能解析一段 HTML 文字，並將生成的節點插入到 DOM 樹中的指定位置，不會像innerHTML替換已有的節點。
        cartItemsList.insertAdjacentHTML('beforeend', itemHTML);
      });
    }
  }

  //移除整個商品項目
  function removeFromCart(productId, color) {
    cart = cart.filter(
      (item) => !(item.id === productId && item.color === color)
    );
    saveAndUpdate();
  }
  function saveAndUpdate() {
    localStorage.setItem('myCart', JSON.stringify(cart));
    updateCartUI();
  }

  //打開購物車模態框
  function openCartModal() {
    cartModal.classList.add('is-open');
    document.body.classList.add('modal-open-body');
    if (lenis) {
      lenis.stop();
    }
  }
  //關閉購物車模態框
  function closeCartModal() {
    cartModal.classList.remove('is-open');
    document.body.classList.remove('modal-open-body');
    if (lenis) {
      lenis.start();
    }
  }
  //增加數ˋ輛
  function increaseQuantity(productId, color) {
    const itemIndex = findItem(productId, color);
    if (itemIndex > -1) {
      cart[itemIndex].quantity += 1;
      saveAndUpdate();
    }
  }

  //減少數量
  function decreaseQuantity(productId, color) {
    const itemIndex = findItem(productId, color);
    if (itemIndex > -1) {
      if (cart[itemIndex].quantity > 1) {
        cart[itemIndex].quantity -= 1;
      } else {
        // 如果數量只剩 1，再減少就等於移除
        removeFromCart(productId, color);
      }
      saveAndUpdate();
    }
  }

  //事件監聽
  buyButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();

      const currentSection = button.closest('.section');
      const productId = currentSection.id;
      const productName = currentSection
        .querySelector('h1')
        .innerText.replace('\n', ' ');

      addToCart(productId, productName);

      button.innerHTML = '已加入 ✓<br>Added!';
      button.disabled = true;

      setTimeout(() => {
        button.innerHTML = '加入購物車<br>Add to Cart';
        button.disabled = false;
      }, 2000);
    });
  });
  cartIcon.addEventListener('click', (e) => {
    e.preventDefault();
    openCartModal();
  });
  closeModalButton.addEventListener('click', closeCartModal);
  cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
      closeCartModal();
    }
  });
  cartItemsList.addEventListener('click', (e) => {
    const target = e.target;
    const itemElement = target.closest('.cart-item');
    if (!itemElement) return;

    const productId = itemElement.dataset.productId;
    const color = itemElement.dataset.color;

    if (target.classList.contains('plus-btn')) {
      increaseQuantity(productId, color);
    } else if (target.classList.contains('minus-btn')) {
      decreaseQuantity(productId, color);
    } else if (target.classList.contains('remove-item-button')) {
      removeFromCart(productId, color);
    }
  });
  updateCartUI();
  console.log('購物車功能已初始化');
}
