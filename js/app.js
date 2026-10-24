/**
 * GULLY LABS - Interactive Clone Application
 * Features:
 * - Reactive Cart State with Drawer, Free Shipping Meter, Promo codes
 * - Dynamic Currency Switcher (INR, USD, EUR, GBP, AED)
 * - Hero Slideshow with autoplay & manual controls
 * - Filterable Product Grids (Bestsellers, New Arrivals, Hidden Gems, Apparel)
 * - Quick View Modal with multi-angle gallery
 * - Interactive Shoppable Lookbook Pins
 * - Debounced Instant Search Drawer
 * - Complete Checkout Simulation & Order Confirmation
 * - Size Guide Modal
 * - Toast Notification System
 */

// State Management
const AppState = {
  currency: 'INR',
  currencyRates: {
    INR: { symbol: '₹', rate: 1, name: 'INR (₹)' },
    USD: { symbol: '$', rate: 0.012, name: 'USD ($)' },
    EUR: { symbol: '€', rate: 0.011, name: 'EUR (€)' },
    GBP: { symbol: '£', rate: 0.0095, name: 'GBP (£)' },
    AED: { symbol: 'AED ', rate: 0.044, name: 'AED' }
  },
  cart: (() => {
    try {
      const raw = localStorage.getItem('gully_cart');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  })(),
  promoDiscount: 0,
  freeShippingThreshold: 5000, // INR
  activeHeroSlide: 0,
  heroSlides: [
    {
      image: 'assets/images/img_069_b42d4713.png',
      tag: 'HAND LASTED IN INDIA',
      title: 'SNEAKERS ROOTED IN INDIAN CULTURE',
      description: 'Crafted pair-by-pair using traditional lasting techniques, supple full-grain leathers, and modern ergonomics.',
      primaryBtnText: 'Shop Bestsellers',
      primaryBtnHref: '#bestsellers',
      secondaryBtnText: 'The Craft',
      secondaryBtnHref: '#story'
    },
    {
      image: 'assets/images/img_097_8e5f1c1d.png',
      tag: 'ARCHIVAL DROP',
      title: 'GULLY 17 MOTORSPORT APPAREL',
      description: 'A celebration of vintage speed, heavyweight French terry, and iconic street-tailored track silhouettes.',
      primaryBtnText: 'Explore Apparel',
      primaryBtnHref: '#apparel',
      secondaryBtnText: 'Lookbook',
      secondaryBtnHref: '#lookbook'
    },
    {
      image: 'assets/images/img_088_800c511a.jpeg',
      tag: 'COLLABORATION',
      title: 'GULLY X RAGA: AANDHI KOBICHA',
      description: 'Harmonizing earth-pigment Japanese Kobicha suede with raw Indian edge-finishing. Strictly 200 pairs made.',
      primaryBtnText: 'Discover Collaboration',
      primaryBtnHref: '#bestsellers',
      secondaryBtnText: 'View Details',
      secondaryBtnHref: '#hidden-gems'
    }
  ]
};

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initCountdownTimer();
  initCurrencySelector();
  initHeroSlider();
  renderAllProductSections();
  initCart();
  initSearch();
  initQuickView();
  initLookbook();
  initNewsletter();
  initMobileNav();
  initStickyHeader();
  initMegaMenu();
});

/* ==========================================================================
   0. COUNTDOWN PROMO TIMER
   ========================================================================== */
function initCountdownTimer() {
  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMins = document.getElementById('cdMins');
  const cdSecs = document.getElementById('cdSecs');
  if (!cdDays || !cdHours || !cdMins || !cdSecs) return;

  // Set an authoritative countdown clock
  const targetTime = Date.now() + (2 * 24 * 3600 + 14 * 3600 + 30 * 60 + 45) * 1000;

  function update() {
    const diff = Math.max(0, targetTime - Date.now());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    cdDays.textContent = String(days).padStart(2, '0');
    cdHours.textContent = String(hours).padStart(2, '0');
    cdMins.textContent = String(minutes).padStart(2, '0');
    cdSecs.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   1. CURRENCY CONVERSION & FORMATTING
   ========================================================================== */
function initCurrencySelector() {
  const select = document.getElementById('currencySelector');
  if (!select) return;

  select.value = AppState.currency;
  select.addEventListener('change', (e) => {
    AppState.currency = e.target.value;
    updatePricesAcrossSite();
    renderCart();
    showToast(`Currency changed to ${AppState.currency}`);
  });
}

function formatPrice(amountInINR) {
  const current = AppState.currencyRates[AppState.currency] || AppState.currencyRates.INR;
  const converted = amountInINR * current.rate;
  if (AppState.currency === 'INR') {
    return `${current.symbol}${converted.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }
  return `${current.symbol}${converted.toFixed(2)}`;
}

function updatePricesAcrossSite() {
  // Update all elements with data-price-inr
  document.querySelectorAll('[data-price-inr]').forEach(el => {
    const inr = parseFloat(el.getAttribute('data-price-inr'));
    el.textContent = formatPrice(inr);
  });
  // Update original price if present
  document.querySelectorAll('[data-orig-price-inr]').forEach(el => {
    const inr = parseFloat(el.getAttribute('data-orig-price-inr'));
    el.textContent = formatPrice(inr);
  });
}

/* ==========================================================================
   2. HERO SLIDESHOW
   ========================================================================== */
function initHeroSlider() {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.hero-slide');
  const counter = document.getElementById('heroSlideCounter');
  const nextBtn = document.getElementById('heroNextBtn');
  const prevBtn = document.getElementById('heroPrevBtn');
  let autoTimer = null;

  function goToSlide(index) {
    slides[AppState.activeHeroSlide].classList.remove('active');
    AppState.activeHeroSlide = (index + slides.length) % slides.length;
    slides[AppState.activeHeroSlide].classList.add('active');

    if (counter) {
      counter.textContent = `0${AppState.activeHeroSlide + 1} / 0${slides.length}`;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    autoTimer = setInterval(() => {
      goToSlide(AppState.activeHeroSlide + 1);
    }, 6000);
  }

  function stopAutoplay() {
    if (autoTimer) clearInterval(autoTimer);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(AppState.activeHeroSlide + 1);
      startAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(AppState.activeHeroSlide - 1);
      startAutoplay();
    });
  }

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  startAutoplay();
}

/* ==========================================================================
   3. PRODUCT RENDERING & CARDS
   ========================================================================== */
function createProductCardHTML(product) {
  const secondaryImg = product.secondaryImage || product.primaryImage;
  const badgeHTML = product.badge ? `<span class="card-badge">${product.badge}</span>` : '';
  const ratingText = product.rating ? `<span>★</span> ${product.rating} | ${product.reviewsCount} reviews` : '<span>★</span> 5.0';
  const defaultSize = product.sizes && product.sizes.length ? product.sizes[2] || product.sizes[0] : 'UK 8';

  const sizesHTML = (product.sizes || []).slice(0, 5).map(size => `
    <button type="button" class="card-size-pill ${size === defaultSize ? 'selected' : ''}" data-size="${size}" onclick="selectCardSize(this, event)">
      ${size}
    </button>
  `).join('');

  return `
    <div class="product-card" data-product-id="${product.id}" data-selected-size="${defaultSize}">
      <div class="card-media">
        ${badgeHTML}
        <button type="button" class="card-plus-btn" onclick="handleCardQuickAdd('${product.id}', this)" aria-label="Quick add">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <span class="card-rating">${ratingText}</span>
        <a href="product.html?id=${product.id}">
          <img src="${product.primaryImage}" alt="${product.title}" class="img-primary" loading="lazy">
          <img src="${secondaryImg}" alt="${product.title} angle 2" class="img-secondary" loading="lazy">
        </a>
      </div>
      <div class="card-info">
        <span class="card-subcat">${product.subCategory || product.category}</span>
        <h4 class="card-title"><a href="product.html?id=${product.id}">${product.title}</a></h4>
        <div class="card-price-row">
          <span class="card-price" data-price-inr="${product.price}">${formatPrice(product.price)}</span>
          ${product.originalPrice ? `<span class="card-price-orig" data-orig-price-inr="${product.originalPrice}">${formatPrice(product.originalPrice)}</span>` : ''}
        </div>
        <div class="card-sizes">
          ${sizesHTML}
        </div>
        <button type="button" class="card-quick-add" onclick="handleCardQuickAdd('${product.id}', this)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          Quick Add
        </button>
      </div>
    </div>
  `;
}


function selectCardSize(btn, event) {
  event.stopPropagation();
  const card = btn.closest('.product-card');
  card.querySelectorAll('.card-size-pill, .size-pill').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  card.setAttribute('data-selected-size', btn.getAttribute('data-size'));
}

function handleCardQuickAdd(productId, btn) {
  const card = btn.closest('.product-card');
  const size = card ? card.getAttribute('data-selected-size') : 'UK 8';
  addToCart(productId, size, 1);
}

function renderAllProductSections() {
  if (typeof GULLY_PRODUCTS === 'undefined') return;

  // Bestsellers Grid
  const bestsellersGrid = document.getElementById('bestsellersGrid');
  if (bestsellersGrid) {
    const items = GULLY_PRODUCTS.filter(p => p.tags.includes('bestsellers'));
    bestsellersGrid.innerHTML = items.map(createProductCardHTML).join('');
  }

  // New Arrivals Grid
  const newArrivalsGrid = document.getElementById('newArrivalsGrid');
  if (newArrivalsGrid) {
    const items = GULLY_PRODUCTS.filter(p => p.tags.includes('new-arrivals') || p.id === 'prod-007' || p.id === 'prod-008' || p.id === 'prod-009' || p.id === 'prod-010').slice(0, 4);
    newArrivalsGrid.innerHTML = items.map(createProductCardHTML).join('');
  }

  // Hidden Gems Grid
  const hiddenGemsGrid = document.getElementById('hiddenGemsGrid');
  if (hiddenGemsGrid) {
    const items = GULLY_PRODUCTS.filter(p => p.tags.includes('hidden-gems') || p.subCategory.includes('002') || p.subCategory.includes('004')).slice(0, 4);
    hiddenGemsGrid.innerHTML = items.map(createProductCardHTML).join('');
  }

  // Apparel Grid
  const apparelGrid = document.getElementById('apparelGrid');
  if (apparelGrid) {
    const items = GULLY_PRODUCTS.filter(p => p.category === 'apparel').slice(0, 4);
    apparelGrid.innerHTML = items.map(createProductCardHTML).join('');
  }

  // Filter Tabs Handler
  document.querySelectorAll('.filter-tabs .tab-btn').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const parent = tab.closest('.filter-tabs');
      parent.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterType = tab.getAttribute('data-filter');
      const targetGrid = document.getElementById(parent.getAttribute('data-target') || parent.getAttribute('data-target-grid') || 'bestsellersGrid');
      if (!targetGrid) return;

      let filtered = GULLY_PRODUCTS;
      if (filterType === 'all') {
        filtered = GULLY_PRODUCTS.slice(0, 8);
      } else if (filterType === 'sneakers') {
        filtered = GULLY_PRODUCTS.filter(p => p.category === 'sneakers').slice(0, 8);
      } else if (filterType === 'slides') {
        filtered = GULLY_PRODUCTS.filter(p => p.category === 'slides').slice(0, 8);
      } else if (filterType === 'apparel') {
        filtered = GULLY_PRODUCTS.filter(p => p.category === 'apparel').slice(0, 8);
      } else if (filterType === 'accessories') {
        filtered = GULLY_PRODUCTS.filter(p => p.category === 'accessories').slice(0, 8);
      } else if (filterType === 'men') {
        filtered = GULLY_PRODUCTS.filter(p => p.gender === 'Unisex' || p.gender === 'Men').slice(0, 8);
      } else if (filterType === 'women') {
        filtered = GULLY_PRODUCTS.filter(p => p.gender === 'Unisex' || p.gender === 'Women').slice(0, 8);
      }

      targetGrid.innerHTML = filtered.map(createProductCardHTML).join('');
      updatePricesAcrossSite();
    });
  });
}

/* ==========================================================================
   4. SHOPPING CART & SIDE DRAWER
   ========================================================================== */
function initCart() {
  const cartTrigger = document.getElementById('cartTrigger');
  const cartClose = document.getElementById('cartDrawerClose');
  const cartDrawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('drawerBackdrop');

  if (cartTrigger) cartTrigger.addEventListener('click', openCartDrawer);
  if (cartClose) cartClose.addEventListener('click', closeCartDrawer);
  if (backdrop) backdrop.addEventListener('click', closeAllDrawers);

  // Promo code
  const applyPromoBtn = document.getElementById('applyPromoBtn');
  if (applyPromoBtn) {
    applyPromoBtn.addEventListener('click', () => {
      const code = (document.getElementById('promoInput')?.value || '').trim().toUpperCase();
      if (code === 'GULLY10') {
        AppState.promoDiscount = 0.10;
        showToast('Promo code GULLY10 applied! 10% discount added.', 'success');
      } else if (code === 'FREESHIP') {
        AppState.promoDiscount = 0.05;
        showToast('Promo code FREESHIP applied!', 'success');
      } else if (code) {
        showToast('Invalid promo code. Try GULLY10');
      }
      renderCart();
    });
  }

  // Checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', openCheckoutModal);
  }
}

function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.classList.add('drawer-open');
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.classList.remove('drawer-open');
  }
}

function closeAllDrawers() {
  closeCartDrawer();
  closeSearchDrawer();
  closeMobileNav();
}

function addToCart(productId, size, quantity = 1) {
  const product = GULLY_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingItemIndex = AppState.cart.findIndex(item => item.id === productId && item.size === size);
  if (existingItemIndex > -1) {
    AppState.cart[existingItemIndex].quantity += quantity;
  } else {
    AppState.cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.primaryImage,
      size: size,
      quantity: quantity
    });
  }

  renderCart();
  openCartDrawer();
  showToast(`Added ${product.title} (${size}) to cart!`, 'success');
}

function updateCartQuantity(index, delta) {
  if (!AppState.cart[index]) return;
  AppState.cart[index].quantity += delta;
  if (AppState.cart[index].quantity <= 0) {
    AppState.cart.splice(index, 1);
  }
  renderCart();
}

function removeCartItem(index) {
  if (!AppState.cart[index]) return;
  const removed = AppState.cart.splice(index, 1);
  renderCart();
  showToast(`Removed ${removed[0].title} from cart`);
}

function renderCart() {
  try {
    localStorage.setItem('gully_cart', JSON.stringify(AppState.cart));
  } catch (e) {}

  const countBadges = document.querySelectorAll('.cart-count-badge');
  const totalItems = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
  countBadges.forEach(b => b.textContent = totalItems);

  const container = document.getElementById('cartDrawerItems');
  const subtotalEl = document.getElementById('cartSubtotal');
  const shippingMeterText = document.getElementById('shippingMeterText');
  const shippingMeterBar = document.getElementById('shippingMeterBar');

  if (!container) return;

  if (AppState.cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <p><strong>Your Gully cart is currently empty</strong></p>
        <p style="font-size:0.8rem; margin-top:0.4rem;">Browse our hand-lasted sneakers and artisanal apparel.</p>
        <button type="button" class="btn btn-primary" style="margin-top:1.5rem;" onclick="closeCartDrawer()">Start Shopping</button>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = formatPrice(0);
    if (shippingMeterText) shippingMeterText.textContent = `Add ${formatPrice(AppState.freeShippingThreshold)} for Free Shipping across India!`;
    if (shippingMeterBar) shippingMeterBar.style.width = '0%';
    return;
  }

  // Calculate Subtotal
  let rawSubtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (AppState.promoDiscount > 0) {
    rawSubtotal = rawSubtotal * (1 - AppState.promoDiscount);
  }

  if (subtotalEl) subtotalEl.textContent = formatPrice(rawSubtotal);

  // Free Shipping Progress
  if (shippingMeterText && shippingMeterBar) {
    const rawTotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const progress = Math.min(100, Math.round((rawTotal / AppState.freeShippingThreshold) * 100));
    shippingMeterBar.style.width = `${progress}%`;

    if (rawTotal >= AppState.freeShippingThreshold) {
      shippingMeterText.innerHTML = `<strong>Congratulations! You have unlocked Free Shipping!</strong>`;
    } else {
      const remaining = AppState.freeShippingThreshold - rawTotal;
      shippingMeterText.innerHTML = `Add <strong>${formatPrice(remaining)}</strong> more to unlock <strong>Free Express Shipping</strong>!`;
    }
  }

  // Render items list
  container.innerHTML = AppState.cart.map((item, index) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" class="cart-item-img">
      <div class="cart-item-details">
        <div class="cart-item-header">
          <div>
            <h5 class="cart-item-title">${item.title}</h5>
            <span class="cart-item-size">Size: ${item.size}</span>
          </div>
          <button type="button" class="cart-item-remove" onclick="removeCartItem(${index})" title="Remove item">&times;</button>
        </div>
        <div class="cart-item-footer">
          <div class="qty-control">
            <button type="button" class="qty-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button type="button" class="qty-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
          </div>
          <span class="cart-item-price">${formatPrice(item.price * item.quantity)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   5. QUICK VIEW MODAL
   ========================================================================== */
function initQuickView() {
  const modalBackdrop = document.getElementById('quickViewBackdrop');
  const closeBtn = document.getElementById('quickViewClose');

  if (closeBtn) closeBtn.addEventListener('click', closeQuickView);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeQuickView();
    });
  }
}

function openQuickView(productId) {
  const product = GULLY_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const modalBackdrop = document.getElementById('quickViewBackdrop');
  const content = document.getElementById('quickViewContent');
  if (!modalBackdrop || !content) return;

  const gallery = product.gallery && product.gallery.length ? product.gallery : [product.primaryImage, product.secondaryImage];
  
  const thumbsHTML = gallery.map((img, i) => `
    <img src="${img}" alt="Thumbnail ${i+1}" class="modal-thumb ${i === 0 ? 'active' : ''}" onclick="changeModalMainImage(this, '${img}')">
  `).join('');

  const sizesHTML = (product.sizes || []).map((size, idx) => `
    <button type="button" class="size-pill ${idx === 0 ? 'selected' : ''}" data-size="${size}" onclick="selectModalSize(this)">
      ${size}
    </button>
  `).join('');

  content.innerHTML = `
    <div class="modal-grid">
      <div class="modal-gallery">
        <img src="${gallery[0]}" alt="${product.title}" id="modalMainImg" class="modal-main-img">
        <div class="modal-thumbnails">${thumbsHTML}</div>
      </div>

      <div class="modal-details">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="section-tag">${product.subCategory || product.category}</span>
          ${product.badge ? `<span class="badge badge-blue">${product.badge}</span>` : ''}
        </div>

        <h3 class="modal-title">${product.title}</h3>

        <div class="product-rating" style="position:static; box-shadow:none; padding:0;">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="#f5a623"><path d="M8 0L9.89 5.81H16L11.06 9.41L12.95 15.22L8 11.62L3.06 15.22L4.94 9.4L0 5.81H6.11L8 0Z"/></svg>
          <strong>${product.rating} ★ (${product.reviewsCount} verified reviews)</strong>
        </div>

        <div class="product-price-row" style="margin-top:0.5rem;">
          <span class="product-price" style="font-size:1.4rem;">${formatPrice(product.price)}</span>
          ${product.originalPrice ? `<span class="product-price-orig" style="font-size:1.1rem;">${formatPrice(product.originalPrice)}</span>` : ''}
        </div>

        <p style="font-size:0.9rem; color:var(--color-dark-gray); line-height:1.5;">${product.description}</p>

        <div style="background:var(--color-lighter-gray); padding:1rem; border-radius:var(--radius-md);">
          <strong style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:0.25rem;">Craftsmanship & Materials:</strong>
          <span style="font-size:0.8rem; color:var(--color-gray);">${product.materials}</span>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <label style="font-size:0.8rem; font-weight:800; text-transform:uppercase;">Select Size (UK Standard):</label>
            <a href="javascript:void(0)" onclick="openSizeGuideModal()" style="font-size:0.75rem; text-decoration:underline; font-weight:600;">Size Guide</a>
          </div>
          <div class="product-sizes-row" id="modalSizesContainer">
            ${sizesHTML}
          </div>
        </div>

        <button type="button" class="btn btn-primary btn-full" style="padding:1rem;" onclick="addFromModal('${product.id}')">
          Add to Cart • ${formatPrice(product.price)}
        </button>
      </div>
    </div>
  `;

  modalBackdrop.classList.add('active');
  document.body.classList.add('drawer-open');
}

function changeModalMainImage(thumb, src) {
  const mainImg = document.getElementById('modalMainImg');
  if (mainImg) mainImg.src = src;
  document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

function selectModalSize(btn) {
  document.querySelectorAll('#modalSizesContainer .size-pill').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function addFromModal(productId) {
  const selectedPill = document.querySelector('#modalSizesContainer .size-pill.selected');
  const size = selectedPill ? selectedPill.getAttribute('data-size') : 'UK 8';
  addToCart(productId, size, 1);
  closeQuickView();
}

function closeQuickView() {
  const modalBackdrop = document.getElementById('quickViewBackdrop');
  if (modalBackdrop) modalBackdrop.classList.remove('active');
  document.body.classList.remove('drawer-open');
}

/* ==========================================================================
   6. SHOPPABLE LOOKBOOK
   ========================================================================== */
function initLookbook() {
  const pins = document.querySelectorAll('.lookbook-pin');
  pins.forEach(pin => {
    pin.addEventListener('click', (e) => {
      // Toggle popover
      const isActive = pin.classList.contains('active');
      pins.forEach(p => p.classList.remove('active'));
      if (!isActive) pin.classList.add('active');
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.lookbook-pin')) {
      pins.forEach(p => p.classList.remove('active'));
    }
  });
}

/* ==========================================================================
   7. INSTANT SEARCH DRAWER
   ========================================================================== */
function initSearch() {
  const searchTrigger = document.getElementById('searchTrigger');
  const searchClose = document.getElementById('searchDrawerClose') || document.getElementById('searchClose');
  const searchDrawer = document.getElementById('searchDrawer');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  if (searchTrigger) searchTrigger.addEventListener('click', openSearchDrawer);
  if (searchClose) searchClose.addEventListener('click', closeSearchDrawer);

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        if (searchResults) searchResults.innerHTML = '';
        return;
      }

      const matches = GULLY_PRODUCTS.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subCategory.toLowerCase().includes(q) ||
        (p.materials && p.materials.toLowerCase().includes(q))
      );

      if (searchResults) {
        if (matches.length === 0) {
          searchResults.innerHTML = `<p style="padding:1rem; color:var(--color-gray); grid-column:1/-1;">No products found for "${q}". Try searching for 'Baaz', 'Suede', or 'Shacket'.</p>`;
        } else {
          searchResults.innerHTML = matches.map(p => `
            <div class="search-result-card" onclick="openQuickView('${p.id}'); closeSearchDrawer();">
              <img src="${p.primaryImage}" alt="${p.title}">
              <div>
                <h6 style="font-size:0.85rem; font-weight:700;">${p.title}</h6>
                <span style="font-size:0.8rem; color:var(--color-accent); font-weight:800;">${formatPrice(p.price)}</span>
              </div>
            </div>
          `).join('');
        }
      }
    });
  }

  // Quick Tag clicks
  document.querySelectorAll('.search-tag-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const term = pill.getAttribute('data-tag');
      if (searchInput) {
        searchInput.value = term;
        searchInput.dispatchEvent(new Event('input'));
      }
    });
  });
}

function openSearchDrawer() {
  const drawer = document.getElementById('searchDrawer') || document.getElementById('searchModal');
  const backdrop = document.getElementById('drawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.classList.add('drawer-open');
    setTimeout(() => {
      document.getElementById('searchInput')?.focus();
    }, 150);
  }
}

function closeSearchDrawer() {
  const drawer = document.getElementById('searchDrawer') || document.getElementById('searchModal');
  const backdrop = document.getElementById('drawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.classList.remove('drawer-open');
  }
}

/* ==========================================================================
   8. CHECKOUT SIMULATION MODAL
   ========================================================================== */
function openCheckoutModal() {
  window.location.href = 'checkout.html';
}

function _legacyCheckoutModal() {
  closeCartDrawer();
  const backdrop = document.getElementById('checkoutBackdrop');
  const content = document.getElementById('checkoutContent');
  if (!backdrop || !content) return;

  const total = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = total * AppState.promoDiscount;
  const finalTotal = total - discount;

  content.innerHTML = `
    <div class="checkout-modal-dialog">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; border-bottom:1px solid var(--color-light-gray); padding-bottom:1rem;">
        <h3 style="font-size:1.3rem; font-weight:800; text-transform:uppercase;">Secure Checkout</h3>
        <button type="button" onclick="closeCheckoutModal()" style="font-size:1.5rem; line-height:1;">&times;</button>
      </div>

      <form id="checkoutForm" onsubmit="submitCheckout(event)">
        <div class="checkout-steps">
          <div class="checkout-group">
            <label>1. Contact & Shipping Details</label>
            <input type="email" placeholder="Email Address" required class="checkout-input" value="sneakerhead@gullylabs.com">
            <div class="checkout-row">
              <input type="text" placeholder="First Name" required class="checkout-input" value="Kabir">
              <input type="text" placeholder="Last Name" required class="checkout-input" value="Verma">
            </div>
            <input type="text" placeholder="Delivery Address (Street, Apartment)" required class="checkout-input" value="42, Indiranagar 100ft Road">
            <div class="checkout-row">
              <input type="text" placeholder="City" required class="checkout-input" value="Bengaluru">
              <input type="text" placeholder="PIN Code" required class="checkout-input" value="560038">
            </div>
            <input type="tel" placeholder="Phone Number" required class="checkout-input" value="+91 98765 43210">
          </div>

          <div class="checkout-group">
            <label>2. Payment Method</label>
            <div class="payment-options-grid">
              <label class="payment-option-label active" onclick="selectPaymentOption(this)">
                <input type="radio" name="payment" value="upi" checked>
                <span>Instant UPI (GPay / PhonePe)</span>
              </label>
              <label class="payment-option-label" onclick="selectPaymentOption(this)">
                <input type="radio" name="payment" value="card">
                <span>Credit / Debit Card</span>
              </label>
              <label class="payment-option-label" onclick="selectPaymentOption(this)">
                <input type="radio" name="payment" value="netbanking">
                <span>Net Banking</span>
              </label>
              <label class="payment-option-label" onclick="selectPaymentOption(this)">
                <input type="radio" name="payment" value="cod">
                <span>Cash on Delivery (COD)</span>
              </label>
            </div>
          </div>

          <div style="background:var(--color-lighter-gray); padding:1rem; border-radius:var(--radius-sm);">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.35rem; font-size:0.85rem;">
              <span>Subtotal (${AppState.cart.length} items):</span>
              <strong>${formatPrice(total)}</strong>
            </div>
            ${discount > 0 ? `
              <div style="display:flex; justify-content:space-between; margin-bottom:0.35rem; font-size:0.85rem; color:var(--color-green);">
                <span>Discount:</span>
                <strong>-${formatPrice(discount)}</strong>
              </div>
            ` : ''}
            <div style="display:flex; justify-content:space-between; margin-bottom:0.35rem; font-size:0.85rem;">
              <span>Express Delivery (India):</span>
              <strong style="color:var(--color-green);">FREE</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:0.5rem; padding-top:0.5rem; border-top:1px solid var(--color-light-gray); font-size:1.1rem; font-weight:800;">
              <span>Total Payable:</span>
              <span>${formatPrice(finalTotal)}</span>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full" style="padding:1rem;">
            Place Order • ${formatPrice(finalTotal)}
          </button>
        </div>
      </form>
    </div>
  `;

  backdrop.classList.add('active');
  document.body.classList.add('drawer-open');
}

function selectPaymentOption(label) {
  document.querySelectorAll('.payment-option-label').forEach(l => l.classList.remove('active'));
  label.classList.add('active');
}

function closeCheckoutModal() {
  const backdrop = document.getElementById('checkoutBackdrop');
  if (backdrop) backdrop.classList.remove('active');
  document.body.classList.remove('drawer-open');
}

function submitCheckout(e) {
  e.preventDefault();
  const orderId = `GL-${Math.floor(100000 + Math.random() * 900000)}`;
  const content = document.getElementById('checkoutContent');

  content.innerHTML = `
    <div class="checkout-modal-dialog" style="text-align:center; padding:3rem 2rem;">
      <div style="width:70px; height:70px; border-radius:50%; background:#e8f5e9; color:#2e7d32; display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem; font-size:2rem;">
        ✓
      </div>
      <h3 style="font-size:1.8rem; font-weight:800; text-transform:uppercase; margin-bottom:0.5rem;">Order Confirmed!</h3>
      <p style="font-size:1rem; color:var(--color-gray); margin-bottom:1.5rem;">
        Thank you for choosing hand-lasted Indian craftsmanship. Your order <strong>#${orderId}</strong> is received and will be dispatched via priority express shipping.
      </p>

      <div style="background:var(--color-lighter-gray); padding:1rem; border-radius:var(--radius-md); text-align:left; margin-bottom:2rem; font-size:0.85rem;">
        <p><strong>Tracking updates:</strong> Sent via WhatsApp & Email.</p>
        <p><strong>Estimated delivery:</strong> 2-3 business days.</p>
      </div>

      <button type="button" class="btn btn-primary" onclick="finishCheckout()">Continue Exploring</button>
    </div>
  `;

  AppState.cart = [];
  renderCart();
}

function finishCheckout() {
  closeCheckoutModal();
}

/* ==========================================================================
   9. SIZE GUIDE MODAL
   ========================================================================== */
function openSizeGuideModal() {
  const modal = document.getElementById('sizeGuideModal');
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('drawer-open');
  }
}

function closeSizeGuideModal() {
  const modal = document.getElementById('sizeGuideModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.classList.remove('drawer-open');
  }
}

/* ==========================================================================
   10. MOBILE NAVIGATION & STICKY HEADER
   ========================================================================== */
function initMobileNav() {
  const toggle = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const closeBtn = document.getElementById('mobileNavClose');
  const backdrop = document.getElementById('drawerBackdrop');

  if (toggle) {
    toggle.addEventListener('click', () => {
      drawer?.classList.add('active');
      backdrop?.classList.add('active');
      document.body.classList.add('drawer-open');
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeMobileNav);
}

function closeMobileNav() {
  const drawer = document.getElementById('mobileNavDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.classList.remove('drawer-open');
  }
}

function initStickyHeader() {
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   11. NEWSLETTER & NOTIFICATIONS
   ========================================================================== */
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (input && input.value) {
        showToast('Welcome to the Gully family! Early drop invite sent.', 'success');
        input.value = '';
      }
    });
  }
}

function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : 'ℹ'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ==========================================================================
   MEGA MENU CONTROLLER
   ========================================================================== */
function initMegaMenu() {
  const megaItems = document.querySelectorAll('.nav-item.has-mega');
  megaItems.forEach(item => {
    let timeoutId = null;

    item.addEventListener('mouseenter', () => {
      clearTimeout(timeoutId);
      megaItems.forEach(other => {
        if (other !== item) other.classList.remove('is-active');
      });
      item.classList.add('is-active');
    });

    item.addEventListener('mouseleave', () => {
      timeoutId = setTimeout(() => {
        item.classList.remove('is-active');
      }, 180);
    });

    const trigger = item.querySelector('.nav-link');
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        if (window.innerWidth >= 900) {
          if (!item.classList.contains('is-active')) {
            e.preventDefault();
            megaItems.forEach(other => other.classList.remove('is-active'));
            item.classList.add('is-active');
          }
        }
      });
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item.has-mega')) {
      megaItems.forEach(item => item.classList.remove('is-active'));
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      megaItems.forEach(item => item.classList.remove('is-active'));
    }
  });
}
