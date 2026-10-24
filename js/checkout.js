/**
 * Gully Labs - Dedicated Checkout Page Controller (checkout.html)
 * Handles live cart summary, PIN code auto-fill, payment method selection,
 * promo codes, and interactive order placement with instant confirmation.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCheckout();
});

function initCheckout() {
  const container = document.getElementById('checkoutItemsContainer');
  if (!container) return; // Not on checkout page

  // Restore cart if available
  renderCheckoutSummary();

  // Setup Promo Code Listener
  const applyPromoBtn = document.getElementById('checkoutApplyPromoBtn');
  const promoInput = document.getElementById('checkoutPromoInput');
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
      renderCheckoutSummary();
    });

    promoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyPromoBtn.click();
      }
    });
  }
}

function renderCheckoutSummary() {
  const container = document.getElementById('checkoutItemsContainer');
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const shippingLineEl = document.getElementById('checkoutShippingLine');
  const shippingBadgeEl = document.getElementById('checkoutShippingBadge');
  const discountLine = document.getElementById('checkoutDiscountLine');
  const discountAmountEl = document.getElementById('checkoutDiscountAmount');
  const grandTotalEl = document.getElementById('checkoutGrandTotal');
  const submitTotalEl = document.getElementById('checkoutSubmitTotal');

  if (!container) return;

  const cart = AppState.cart || [];

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 2.5rem 1rem; color: #71717a;">
        <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🛍️</div>
        <p style="font-weight: 700; margin-bottom: 0.5rem; color: #111;">Your bag is currently empty</p>
        <p style="font-size: 0.85rem; margin-bottom: 1.25rem;">Add some hand-lasted footwear to proceed.</p>
        <a href="shop.html" class="btn btn-primary" style="padding: 0.6rem 1.2rem; font-size: 0.85rem; text-decoration: none;">Explore Catalog</a>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = formatPrice(0);
    if (grandTotalEl) grandTotalEl.textContent = formatPrice(0);
    if (submitTotalEl) submitTotalEl.textContent = formatPrice(0);
    return;
  }

  // Render mini item cards
  container.innerHTML = cart.map(item => `
    <div class="checkout-mini-item">
      <div class="checkout-mini-img-wrap">
        <img src="${item.image}" alt="${item.title}" onerror="this.src='assets/images/img_001_d54b9d76.jpeg'">
        <span class="checkout-mini-qty">${item.quantity}</span>
      </div>
      <div class="checkout-mini-info">
        <div class="checkout-mini-title">${item.title}</div>
        <div class="checkout-mini-size">Size: ${item.size}</div>
      </div>
      <div class="checkout-mini-price">${formatPrice(item.price * item.quantity)}</div>
    </div>
  `).join('');

  // Calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = Math.round(rawSubtotal * (AppState.promoDiscount || 0));
  const finalSubtotal = rawSubtotal - discountAmount;

  const isFreeShipping = rawSubtotal >= AppState.freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : 199;
  const grandTotal = finalSubtotal + shippingFee;

  if (subtotalEl) subtotalEl.textContent = formatPrice(rawSubtotal);

  if (discountLine && discountAmountEl) {
    if (discountAmount > 0) {
      discountLine.style.display = 'flex';
      discountAmountEl.textContent = `-${formatPrice(discountAmount)}`;
    } else {
      discountLine.style.display = 'none';
    }
  }

  const shippingText = isFreeShipping ? 'FREE' : formatPrice(199);
  if (shippingLineEl) {
    shippingLineEl.textContent = shippingText;
    shippingLineEl.style.color = isFreeShipping ? '#15803d' : '#111111';
  }
  if (shippingBadgeEl) {
    shippingBadgeEl.textContent = shippingText;
    shippingBadgeEl.style.color = isFreeShipping ? '#15803d' : '#111111';
  }

  if (grandTotalEl) grandTotalEl.textContent = formatPrice(grandTotal);
  if (submitTotalEl) submitTotalEl.textContent = formatPrice(grandTotal);
}

/* ==========================================================================
   Payment Accordion Switching
   ========================================================================== */
function switchPaymentTab(method) {
  const methods = ['upi', 'card', 'netbanking', 'cod'];
  methods.forEach(m => {
    const capitalized = m.charAt(0).toUpperCase() + m.slice(1);
    const option = document.getElementById(`payOption${capitalized}`);
    const details = document.getElementById(`payDetails${capitalized}`);
    const radio = option ? option.querySelector('input[type="radio"]') : null;

    if (m === method) {
      if (option) option.classList.add('selected');
      if (details) details.classList.add('open');
      if (radio) radio.checked = true;
    } else {
      if (option) option.classList.remove('selected');
      if (details) details.classList.remove('open');
      if (radio) radio.checked = false;
    }
  });
}

function quickFillUPI(app) {
  switchPaymentTab('upi');
  const upiInput = document.getElementById('upiVpaInput');
  const verifyStatus = document.getElementById('upiVerifyStatus');
  if (upiInput) {
    if (app === 'GPay') upiInput.value = 'kabir@okhdfcbank';
    else if (app === 'PhonePe') upiInput.value = 'kabir@ybl';
    else if (app === 'Paytm') upiInput.value = 'kabir@paytm';
  }
  if (verifyStatus) {
    verifyStatus.innerHTML = `✓ ${app} Quick Pay Ready`;
  }
  showToast(`Express Checkout: ${app} Selected`, 'success');
}

function verifyUpiVpa() {
  const upiInput = document.getElementById('upiVpaInput');
  const verifyStatus = document.getElementById('upiVerifyStatus');
  if (!upiInput || !upiInput.value.includes('@')) {
    showToast('Please enter a valid UPI ID (e.g. name@bank)');
    return;
  }
  if (verifyStatus) {
    verifyStatus.innerHTML = `✓ Verified VPA: ${upiInput.value.trim()}`;
    verifyStatus.style.color = '#15803d';
  }
  showToast('UPI ID verified successfully!', 'success');
}

/* ==========================================================================
   Indian PIN Code Auto-Lookup
   ========================================================================== */
function handlePinCodeLookup(pin) {
  const cleanPin = pin.trim();
  if (cleanPin.length !== 6 || isNaN(cleanPin)) return;

  const cityInput = document.getElementById('shipCity');
  const stateSelect = document.getElementById('shipState');

  const pinDirectory = {
    '11': { city: 'New Delhi', state: 'Delhi' },
    '56': { city: 'Bengaluru', state: 'Karnataka' },
    '40': { city: 'Mumbai', state: 'Maharashtra' },
    '41': { city: 'Pune', state: 'Maharashtra' },
    '60': { city: 'Chennai', state: 'Tamil Nadu' },
    '50': { city: 'Hyderabad', state: 'Telangana' },
    '70': { city: 'Kolkata', state: 'West Bengal' },
    '38': { city: 'Ahmedabad', state: 'Gujarat' },
    '30': { city: 'Jaipur', state: 'Rajasthan' },
    '16': { city: 'Chandigarh', state: 'Punjab' },
    '20': { city: 'Noida', state: 'Uttar Pradesh' },
    '12': { city: 'Gurugram', state: 'Haryana' },
    '68': { city: 'Kochi', state: 'Kerala' }
  };

  const prefix = cleanPin.substring(0, 2);
  const match = pinDirectory[prefix];
  if (match) {
    if (cityInput && !cityInput.value) cityInput.value = match.city;
    if (stateSelect) {
      for (let i = 0; i < stateSelect.options.length; i++) {
        if (stateSelect.options[i].value === match.state) {
          stateSelect.selectedIndex = i;
          break;
        }
      }
    }
    showToast(`Detected location: ${match.city}, ${match.state}`, 'info');
  }
}

/* ==========================================================================
   Order Placement Simulation & Interactive Modal
   ========================================================================== */
function processOrderPlacement(event) {
  event.preventDefault();

  const cart = AppState.cart || [];
  if (cart.length === 0) {
    showToast('Your bag is empty! Please add items before placing order.');
    return;
  }

  const firstName = (document.getElementById('shipFirstName')?.value || 'Collector').trim();
  const address = (document.getElementById('shipAddress')?.value || '').trim();
  const city = (document.getElementById('shipCity')?.value || '').trim();
  const grandTotalText = document.getElementById('checkoutGrandTotal')?.textContent || '₹0';

  // Generate Unique Gully Labs Order ID
  const orderId = `GL-${Math.floor(100000 + Math.random() * 900000)}`;

  // Calculate estimated delivery date: 3-4 days ahead
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', options);

  // Populate Order Success Modal
  const modal = document.getElementById('orderSuccessModal');
  const orderNumEl = document.getElementById('modalOrderNumber');
  const custNameEl = document.getElementById('modalCustomerName');
  const deliveryDateEl = document.getElementById('modalDeliveryDate');
  const addressEl = document.getElementById('modalAddress');
  const totalPaidEl = document.getElementById('modalTotalPaid');

  if (orderNumEl) orderNumEl.textContent = `ORDER #${orderId}`;
  if (custNameEl) custNameEl.textContent = firstName;
  if (deliveryDateEl) deliveryDateEl.textContent = formattedDelivery;
  if (addressEl) addressEl.textContent = `${address}, ${city}`;
  if (totalPaidEl) totalPaidEl.textContent = grandTotalText;

  if (modal) {
    modal.classList.add('open');
  }

  // Clear Cart from State and LocalStorage
  AppState.cart = [];
  try {
    localStorage.removeItem('gully_cart');
    localStorage.removeItem('gully_order_notes');
  } catch (e) {}

  // Update header badges
  document.querySelectorAll('.cart-count-badge').forEach(b => b.textContent = '0');

  showToast('Order confirmed! Receipt dispatched to your email.', 'success');
}
