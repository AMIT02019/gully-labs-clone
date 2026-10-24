/**
 * Gully Labs - Dedicated Cart Page Controller (cart.html)
 * Manages full shopping bag view, quantity modification, removals,
 * promo code validation, shipping threshold progress, and order notes.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCartPage();
});

function initCartPage() {
  const cartList = document.getElementById('cartPageItemsList');
  if (!cartList) return; // Not on cart page

  // Restore saved order notes if present
  const notesTextarea = document.getElementById('cartNotes');
  if (notesTextarea) {
    notesTextarea.value = localStorage.getItem('gully_order_notes') || '';
    notesTextarea.addEventListener('input', (e) => {
      localStorage.setItem('gully_order_notes', e.target.value);
    });
  }

  // Setup Promo Code button
  const applyPromoBtn = document.getElementById('cartPageApplyPromoBtn');
  const promoInput = document.getElementById('cartPagePromoInput');
  if (applyPromoBtn && promoInput) {
    applyPromoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (code === 'GULLY10') {
        AppState.promoDiscount = 0.10;
        showToast('Promo code GULLY10 applied! 10% discount added.', 'success');
      } else if (code === 'FREESHIP') {
        AppState.promoDiscount = 0.05;
        showToast('Promo code FREESHIP applied!', 'success');
      } else if (code) {
        showToast('Invalid promo code. Try GULLY10');
      }
      renderCartPage();
      renderCart(); // Sync drawer
    });

    promoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyPromoBtn.click();
      }
    });
  }

  // Render recommended products
  renderCartRecommendations();

  // Initial render
  renderCartPage();
}

function renderCartPage() {
  const cartList = document.getElementById('cartPageItemsList');
  const activeLayout = document.getElementById('cartActiveLayout');
  const emptyView = document.getElementById('cartEmptyView');
  const subtotalEl = document.getElementById('cartPageSubtotal');
  const totalEl = document.getElementById('cartPageTotal');
  const shippingText = document.getElementById('cartPageShippingText');
  const shippingBar = document.getElementById('cartPageShippingBar');
  const shippingCostEl = document.getElementById('cartPageShippingCost');
  const discountRow = document.getElementById('cartPageDiscountRow');
  const discountVal = document.getElementById('cartPageDiscountVal');

  if (!cartList) return;

  const cart = AppState.cart || [];

  if (cart.length === 0) {
    if (activeLayout) activeLayout.style.display = 'none';
    if (emptyView) emptyView.style.display = 'block';
    if (shippingBar) shippingBar.style.width = '0%';
    if (shippingText) {
      shippingText.innerHTML = `Add <strong>${formatPrice(AppState.freeShippingThreshold)}</strong> for Free Express Shipping Across India!`;
    }
    return;
  }

  if (activeLayout) activeLayout.style.display = 'grid';
  if (emptyView) emptyView.style.display = 'none';

  // Render rows
  cartList.innerHTML = cart.map((item, index) => `
    <div class="cart-table-row" data-index="${index}">
      <div class="cart-col-product">
        <img src="${item.image}" alt="${item.title}" class="cart-row-img" onerror="this.src='assets/images/img_001_d54b9d76.jpeg'">
        <div class="cart-row-meta">
          <a href="product.html?id=${item.id}" class="cart-row-title">${item.title}</a>
          <div class="cart-row-size">Size: <span class="cart-row-size-tag">${item.size}</span></div>
          <button type="button" class="cart-row-remove" onclick="removeCartPageItem(${index})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Remove
          </button>
        </div>
      </div>
      <div class="cart-col-price">
        ${formatPrice(item.price)}
      </div>
      <div class="cart-col-qty">
        <div class="cart-qty-stepper">
          <button type="button" aria-label="Decrease quantity" onclick="changeCartPageQty(${index}, -1)">-</button>
          <input type="text" readonly value="${item.quantity}" aria-label="Current quantity">
          <button type="button" aria-label="Increase quantity" onclick="changeCartPageQty(${index}, 1)">+</button>
        </div>
      </div>
      <div class="cart-col-total">
        ${formatPrice(item.price * item.quantity)}
      </div>
    </div>
  `).join('');

  // Calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = Math.round(rawSubtotal * (AppState.promoDiscount || 0));
  const finalSubtotal = rawSubtotal - discountAmount;

  // Free shipping check
  const isFreeShipping = rawSubtotal >= AppState.freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : 199;
  const grandTotal = finalSubtotal + shippingFee;

  if (subtotalEl) subtotalEl.textContent = formatPrice(rawSubtotal);

  if (discountRow && discountVal) {
    if (discountAmount > 0) {
      discountRow.style.display = 'flex';
      discountVal.textContent = `-${formatPrice(discountAmount)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  if (shippingCostEl) {
    if (isFreeShipping) {
      shippingCostEl.textContent = 'FREE';
      shippingCostEl.style.color = '#15803d';
    } else {
      shippingCostEl.textContent = formatPrice(199);
      shippingCostEl.style.color = '#111';
    }
  }

  if (totalEl) totalEl.textContent = formatPrice(grandTotal);

  // Update Free Shipping Progress Bar
  if (shippingText && shippingBar) {
    const progress = Math.min(100, Math.round((rawSubtotal / AppState.freeShippingThreshold) * 100));
    shippingBar.style.width = `${progress}%`;

    if (isFreeShipping) {
      shippingText.innerHTML = `<strong>Congratulations!</strong> You have unlocked Free Express Shipping Across India!`;
    } else {
      const remaining = AppState.freeShippingThreshold - rawSubtotal;
      shippingText.innerHTML = `Add <strong>${formatPrice(remaining)}</strong> more to unlock <strong>Free Express Shipping</strong>!`;
    }
  }
}

function changeCartPageQty(index, delta) {
  if (!AppState.cart[index]) return;
  AppState.cart[index].quantity += delta;
  if (AppState.cart[index].quantity <= 0) {
    AppState.cart.splice(index, 1);
  }
  renderCart(); // Sync to localStorage and badge
  renderCartPage();
}

function removeCartPageItem(index) {
  if (!AppState.cart[index]) return;
  const removed = AppState.cart.splice(index, 1);
  renderCart(); // Sync to localStorage and badge
  renderCartPage();
  if (removed && removed[0]) {
    showToast(`Removed ${removed[0].title} from bag`);
  }
}

function renderCartRecommendations() {
  const recGrid = document.getElementById('cartRecommendedGrid');
  if (!recGrid || typeof GULLY_PRODUCTS === 'undefined') return;

  // Pick up to 4 popular products that are not currently the only thing in cart
  const candidates = GULLY_PRODUCTS.slice(0, 4);
  recGrid.innerHTML = candidates.map(createProductCardHTML).join('');
}
