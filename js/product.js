/**
 * Gully Labs - Individual Product Page Controller
 * Handles dynamic product loading, responsive gallery, interactive sizes,
 * pincode checking, accordions, size guide modal, and cart integration.
 */

(function () {
  'use strict';

  let currentProduct = null;
  let selectedSize = null;
  let selectedColor = null;
  let quantity = 1;

  document.addEventListener('DOMContentLoaded', () => {
    initProductPage();
    initSizeGuideModal();
    initPincodeChecker();
    initAccordions();
  });

  function initProductPage() {
    if (typeof GULLY_PRODUCTS === 'undefined' || !Array.isArray(GULLY_PRODUCTS) || GULLY_PRODUCTS.length === 0) {
      console.warn('GULLY_PRODUCTS not loaded');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const handle = params.get('handle');

    if (id) {
      currentProduct = GULLY_PRODUCTS.find(p => p.id === id || p.handle === id);
    }
    if (!currentProduct && handle) {
      const normHandle = handle.toLowerCase().replace(/[^a-z0-9]/g, '');
      currentProduct = GULLY_PRODUCTS.find(p => {
        const normP = (p.handle || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const normTitle = (p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return normP === normHandle || normHandle.includes(normP) || normP.includes(normHandle) || normTitle.includes(normHandle);
      });
    }

    // Default fallback to first product if none specified
    if (!currentProduct) {
      currentProduct = GULLY_PRODUCTS[0];
    }

    renderProduct(currentProduct);
    renderRelatedProducts(currentProduct);
  }

  function renderProduct(product) {
    document.title = `${product.title} | Gully Labs`;

    // Breadcrumb title
    const crumbTitle = document.getElementById('crumbTitle');
    if (crumbTitle) crumbTitle.textContent = product.title;

    const container = document.getElementById('productDetail');
    if (!container) return;

    // Gallery images
    const gallery = (product.gallery && product.gallery.length)
      ? product.gallery
      : [product.primaryImage, product.secondaryImage || product.primaryImage];

    // Default size selection
    const sizes = product.sizes && product.sizes.length ? product.sizes : ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
    selectedSize = sizes.includes('UK 8') ? 'UK 8' : sizes[0];

    // Colors
    const colors = product.colors && product.colors.length ? product.colors : ['Classic Heritage', 'Bittersweet Umber'];
    selectedColor = colors[0];

    // Pricing & discount
    const currentPriceFormatted = `₹${product.price.toLocaleString('en-IN')}`;
    let origPriceHTML = '';
    let discountHTML = '';
    if (product.originalPrice && product.originalPrice > product.price) {
      const origFormatted = `₹${product.originalPrice.toLocaleString('en-IN')}`;
      const savings = product.originalPrice - product.price;
      const pct = Math.round((savings / product.originalPrice) * 100);
      origPriceHTML = `<span class="pd-price-was">${origFormatted}</span>`;
      discountHTML = `<span class="pd-discount-tag">SAVE ₹${savings.toLocaleString('en-IN')} (${pct}% OFF)</span>`;
    }

    const badgeText = product.badge || 'HAND LASTED IN INDIA';

    // HTML Construction
    container.innerHTML = `
      <!-- LEFT: Sticky Product Gallery -->
      <div class="pd-gallery-col">
        <div class="pd-main-stage">
          <span class="pd-badge-floating">${badgeText}</span>
          <img id="pdMainImg" src="${gallery[0]}" alt="${product.title}">
        </div>

        <div class="pd-thumbnails-track" id="pdThumbsTrack">
          ${gallery.map((src, idx) => `
            <button type="button" class="pd-thumb-btn ${idx === 0 ? 'selected' : ''}" data-src="${src}" aria-label="View angle ${idx + 1}">
              <img src="${src}" alt="${product.title} thumbnail ${idx + 1}" loading="lazy">
            </button>
          `).join('')}
        </div>

        <div class="pd-gallery-perks">
          <div class="pd-perk-item">
            <span>🪵</span>
            Hand-Lasted on Wooden Lasts
          </div>
          <div class="pd-perk-item">
            <span>👞</span>
            100% Genuine Full-Grain Leather
          </div>
          <div class="pd-perk-item">
            <span>☁️</span>
            OrthoLite Cushioned Footbed
          </div>
        </div>
      </div>

      <!-- RIGHT: Sticky Product Details & Purchase Form -->
      <div class="pd-info-col">
        <div class="pd-eyebrow">HAND LASTED INDIAN SNEAKERS • ${product.subCategory || 'GULLY NO. 001'}</div>
        <h1 class="pd-product-title">${product.title}</h1>

        <div class="pd-rating-bar">
          <span class="pd-stars">★★★★★</span>
          <strong>${product.rating || '4.8'}</strong>
          <span class="pd-review-count">(${product.reviewsCount || 48} reviews)</span>
          <span class="pd-pairs-badge">250+ pairs handcrafted</span>
        </div>

        <div class="pd-price-row">
          <span class="pd-price-now" id="pdPriceNow">${currentPriceFormatted}</span>
          ${origPriceHTML}
          ${discountHTML}
        </div>
        <div class="pd-tax-shipping-sub">MRP inclusive of all taxes • Free express shipping across India</div>

        <div class="pd-urgency-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>High Demand: Only 6 pairs left in this handcrafted run. Dispatches within 24 hours.</span>
        </div>

        <!-- Color Selection -->
        <div class="pd-colors-section">
          <div class="pd-section-label">Color: <span id="pdSelectedColorLabel" style="font-weight:600; text-transform:none;">${selectedColor}</span></div>
          <div class="pd-color-chips-row" id="pdColorChips">
            ${colors.map((c, idx) => `
              <button type="button" class="pd-color-chip ${idx === 0 ? 'selected' : ''}" data-color="${c}">
                ${c}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Size Selection -->
        <div class="pd-sizes-section">
          <div class="pd-sizes-header">
            <div class="pd-section-label">Select Size (UK / India): <span id="pdSelectedSizeLabel" style="font-weight:700;">${selectedSize}</span></div>
            <button type="button" class="pd-size-guide-link" id="sizeGuideTrigger">
              📏 Size Guide
            </button>
          </div>
          <div class="pd-sizes-grid" id="pdSizesGrid">
            ${sizes.map(s => `
              <button type="button" class="pd-size-pill ${s === selectedSize ? 'selected' : ''}" data-size="${s}">
                ${s}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Quantity & Add to Cart Action -->
        <div class="pd-actions-group">
          <div class="pd-btn-row">
            <div class="pd-qty-box">
              <button type="button" class="pd-qty-btn" id="pdQtyDec" aria-label="Decrease quantity">&minus;</button>
              <span class="pd-qty-display" id="pdQtyDisplay">1</span>
              <button type="button" class="pd-qty-btn" id="pdQtyInc" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="pd-add-to-cart-btn" id="pdAddToCartBtn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>Add to Cart</span>
            </button>
          </div>

          <button type="button" class="pd-buy-now-btn" id="pdBuyNowBtn">
            Buy It Now
          </button>
        </div>

        <!-- Pincode Delivery Check -->
        <div class="pd-pincode-card">
          <div class="pd-pincode-card-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Estimate Delivery Date
          </div>
          <form class="pd-pincode-input-row" id="pdPincodeForm">
            <input type="text" class="pd-pincode-field" id="pdPincodeInput" placeholder="Enter 6-digit Pincode" maxlength="6" pattern="[0-9]{6}">
            <button type="submit" class="pd-pincode-submit">Check</button>
          </form>
          <div class="pd-pincode-result" id="pdPincodeResult"></div>
        </div>

        <!-- 4-Box Trust Grid -->
        <div class="pd-trust-grid">
          <div class="pd-trust-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <span>Free Express Shipping Across India</span>
          </div>
          <div class="pd-trust-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>Easy 30-Day Doorstep Returns & Exchanges</span>
          </div>
          <div class="pd-trust-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>100% Genuine Full-Grain Leather</span>
          </div>
          <div class="pd-trust-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Hand Lasted for Indian Feet</span>
          </div>
        </div>

        <!-- Accordions -->
        <div class="pd-accordion-wrap">
          <div class="pd-accordion-item active">
            <button type="button" class="pd-accordion-btn">
              <span>The Silhouette & Inspiration</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="pd-accordion-body">
              <p>${product.description || 'Hand-lasted silhouette inspired by classic Indian street heritage. Designed with a wider toe-box engineered specifically for the anatomical profile of Indian feet, ensuring zero pinching and all-day comfort.'}</p>
            </div>
          </div>

          <div class="pd-accordion-item">
            <button type="button" class="pd-accordion-btn">
              <span>Premium Materials & Construction</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="pd-accordion-body">
              <p>${product.materials || '100% Genuine Full-Grain Tumble Leather upper, moisture-wicking perforated leather lining, dual-density OrthoLite footbed, and durable vulcanized anti-slip rubber cupsole.'}</p>
            </div>
          </div>

          <div class="pd-accordion-item">
            <button type="button" class="pd-accordion-btn">
              <span>Fit & Sizing Recommendations</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="pd-accordion-body">
              <p>Fits true to size for UK and Indian foot profiles. If you normally wear a half-size, we recommend taking the nearest size up for optimal comfort with athletic socks.</p>
            </div>
          </div>

          <div class="pd-accordion-item">
            <button type="button" class="pd-accordion-btn">
              <span>Express Shipping & 30-Day Exchanges</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="pd-accordion-body">
              <p>All orders are processed and dispatched within 24 hours via express air courier. We offer a no-questions-asked 30-day exchange policy with complimentary doorstep pickup across all pin codes in India.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach interactive event listeners
    attachGalleryListeners();
    attachSizeListeners();
    attachColorListeners();
    attachQuantityListeners();
    attachPurchaseListeners(product);
  }

  function attachGalleryListeners() {
    const mainImg = document.getElementById('pdMainImg');
    const thumbBtns = document.querySelectorAll('.pd-thumb-btn');

    thumbBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const src = btn.getAttribute('data-src');
        if (mainImg && src) {
          mainImg.src = src;
        }
        thumbBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  }

  function attachSizeListeners() {
    const sizeBtns = document.querySelectorAll('.pd-size-pill');
    const sizeLabel = document.getElementById('pdSelectedSizeLabel');

    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedSize = btn.getAttribute('data-size');
        if (sizeLabel) sizeLabel.textContent = selectedSize;
      });
    });
  }

  function attachColorListeners() {
    const colorChips = document.querySelectorAll('.pd-color-chip');
    const colorLabel = document.getElementById('pdSelectedColorLabel');

    colorChips.forEach(chip => {
      chip.addEventListener('click', () => {
        colorChips.forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        selectedColor = chip.getAttribute('data-color');
        if (colorLabel) colorLabel.textContent = selectedColor;
      });
    });
  }

  function attachQuantityListeners() {
    const qtyVal = document.getElementById('pdQtyDisplay');
    const decBtn = document.getElementById('pdQtyDec');
    const incBtn = document.getElementById('pdQtyInc');

    if (decBtn) {
      decBtn.addEventListener('click', () => {
        if (quantity > 1) {
          quantity--;
          if (qtyVal) qtyVal.textContent = quantity;
        }
      });
    }

    if (incBtn) {
      incBtn.addEventListener('click', () => {
        if (quantity < 10) {
          quantity++;
          if (qtyVal) qtyVal.textContent = quantity;
        }
      });
    }
  }

  function attachPurchaseListeners(product) {
    const addBtn = document.getElementById('pdAddToCartBtn');
    const buyBtn = document.getElementById('pdBuyNowBtn');

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (!selectedSize) {
          if (typeof showToast === 'function') {
            showToast('Please select a size first', 'error');
          } else {
            alert('Please select a size first');
          }
          return;
        }

        if (typeof addToCart === 'function') {
          addToCart(product.id, selectedSize, quantity);
        } else {
          console.error('addToCart function not available');
        }
      });
    }

    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        if (!selectedSize) {
          if (typeof showToast === 'function') {
            showToast('Please select a size first', 'error');
          } else {
            alert('Please select a size first');
          }
          return;
        }

        if (typeof addToCart === 'function') {
          addToCart(product.id, selectedSize, quantity);
          if (typeof openCartDrawer === 'function') {
            openCartDrawer();
          }
        }
      });
    }
  }

  function renderRelatedProducts(product) {
    const relatedGrid = document.getElementById('relatedGrid');
    if (!relatedGrid || typeof GULLY_PRODUCTS === 'undefined') return;

    // Filter products from same category or bestsellers, excluding current
    let related = GULLY_PRODUCTS.filter(p => p.id !== product.id && p.category === product.category);
    if (related.length < 4) {
      const others = GULLY_PRODUCTS.filter(p => p.id !== product.id && !related.includes(p));
      related = related.concat(others);
    }
    related = related.slice(0, 4);

    if (typeof createProductCardHTML === 'function') {
      relatedGrid.innerHTML = related.map(createProductCardHTML).join('');
    }
  }

  function initPincodeChecker() {
    document.addEventListener('submit', e => {
      if (e.target && e.target.id === 'pdPincodeForm') {
        e.preventDefault();
        const input = document.getElementById('pdPincodeInput');
        const res = document.getElementById('pdPincodeResult');
        if (!input || !res) return;

        const val = input.value.trim();
        if (/^[1-9][0-9]{5}$/.test(val)) {
          res.style.display = 'block';
          res.style.color = '#15803d';
          res.innerHTML = `✓ <strong>Express Delivery to ${val}</strong>: Dispatches within 24 hours. Estimated delivery in 2-3 business days. Free shipping & COD available.`;
        } else {
          res.style.display = 'block';
          res.style.color = '#dc2626';
          res.innerHTML = '✕ Please enter a valid 6-digit Indian delivery pincode.';
        }
      }
    });
  }

  function initAccordions() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.pd-accordion-btn');
      if (!btn) return;
      const item = btn.closest('.pd-accordion-item');
      if (!item) return;

      const isActive = item.classList.contains('active');
      // Optional: close other accordions or toggle
      item.classList.toggle('active', !isActive);
    });
  }

  function initSizeGuideModal() {
    document.addEventListener('click', e => {
      if (e.target && (e.target.id === 'sizeGuideTrigger' || e.target.closest('#sizeGuideTrigger'))) {
        const modal = document.getElementById('sizeGuideModal');
        if (modal) modal.classList.add('open');
      }

      if (e.target && (e.target.id === 'sizeGuideClose' || e.target.closest('#sizeGuideClose') || e.target.classList.contains('size-guide-modal-backdrop'))) {
        const modal = document.getElementById('sizeGuideModal');
        if (modal) modal.classList.remove('open');
      }
    });
  }

})();
