/**
 * ==========================================================================
 * SNEAKER SHOWCASE INTERACTIVE COMPONENT
 * ==========================================================================
 * Features:
 *  - SECTION 1: 10-Product Sneaker Collection Wall (5-col desktop, 3-col tablet, 2-col mobile)
 *    Side-on profile shots, hover lift + soft orange glow, click to switch & scroll.
 *  - SECTION 2: Single-Product Interactive Carousel
 *    Large centred shoe, glowing orange bar beneath, manual sliding (prev/next, swipe, keyboard, dots/thumbs),
 *    size selector, and wired Add to Cart button.
 *  - Bi-directional sync between wall grid and carousel.
 *  - Zero layout shift (CLS) with lazy-loading and stable aspect ratios.
 */

class SneakerShowcaseComponent {
  constructor(options = {}) {
    this.products = options.products || (typeof SNEAKER_SHOWCASE_PRODUCTS !== 'undefined' ? SNEAKER_SHOWCASE_PRODUCTS : []);
    this.wallContainerId = options.wallContainerId || 'sneakerWallGrid';
    this.carouselSectionId = options.carouselSectionId || 'sneakerCarouselSection';
    this.currentIndex = 0;
    this.selectedSizes = {}; // Maps product index to chosen size
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.isSwiping = false;

    if (!this.products || this.products.length === 0) {
      console.warn('[SneakerShowcase] No products found in data source.');
      return;
    }

    this.init();
  }

  init() {
    this.renderWallGrid();
    this.renderCarousel();
    this.attachEventListeners();
    this.updateActiveProduct(0, false); // Initialize at first item without auto-scroll
  }

  /* ------------------------------------------------------------------------
     SECTION 1 — RENDER SNEAKER COLLECTION WALL
     ------------------------------------------------------------------------ */
  renderWallGrid() {
    const wallContainer = document.getElementById(this.wallContainerId);
    if (!wallContainer) return;

    wallContainer.innerHTML = this.products.map((p, index) => {
      const formattedPrice = this.formatCurrency(p.price);
      return `
        <div class="sneaker-wall-tile ${index === 0 ? 'is-active' : ''}" 
             data-index="${index}" 
             tabindex="0"
             role="button"
             aria-label="Select ${p.name} - ${formattedPrice}">
          <div class="sneaker-tile-stage">
            <img class="sneaker-tile-img" 
                 src="${p.image}" 
                 alt="${p.altText || p.name}" 
                 loading="lazy" 
                 width="400" 
                 height="300">
            <!-- Under-shoe soft orange accent glow -->
            <div class="sneaker-tile-glow" aria-hidden="true"></div>
          </div>
          <div class="sneaker-tile-meta">
            <span class="sneaker-tile-code">${p.code}</span>
            <h4 class="sneaker-tile-name">${p.name}</h4>
            <div class="sneaker-tile-price">${formattedPrice}</div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click and keyboard selection to grid tiles
    const tiles = wallContainer.querySelectorAll('.sneaker-wall-tile');
    tiles.forEach(tile => {
      tile.addEventListener('click', (e) => {
        const index = parseInt(tile.getAttribute('data-index'), 10);
        this.selectProduct(index, true); // Scroll Section 2 into view
      });

      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const index = parseInt(tile.getAttribute('data-index'), 10);
          this.selectProduct(index, true);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     SECTION 2 — RENDER SINGLE-PRODUCT CAROUSEL
     ------------------------------------------------------------------------ */
  renderCarousel() {
    const section = document.getElementById(this.carouselSectionId);
    if (!section) return;

    section.innerHTML = `
      <div class="sneaker-panel">
        <div class="sneaker-section-header">
          <div>
            <span class="sneaker-section-eyebrow">Spotlight Feature</span>
            <h3 class="sneaker-section-title">Single-Product Study</h3>
            <p class="sneaker-section-desc">
              Inspect the architectural lines, hand-lasted tensioning, and full-grain leather construction of each archival drop.
            </p>
          </div>
          <span class="sneaker-count-pill" id="sneakerCarouselCounter">01 / ${String(this.products.length).padStart(2, '0')}</span>
        </div>

        <div class="sneaker-carousel-container" tabindex="0" aria-label="Sneaker Carousel Showcase">
          <!-- Large Showcase Viewport -->
          <div class="sneaker-stage-viewport" id="sneakerStageViewport">
            <!-- Navigation Arrows -->
            <button type="button" class="sneaker-arrow-btn sneaker-arrow-prev" id="sneakerPrevBtn" aria-label="Previous Sneaker">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            <button type="button" class="sneaker-arrow-btn sneaker-arrow-next" id="sneakerNextBtn" aria-label="Next Sneaker">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            <!-- Horizontal Sliding Track -->
            <div class="sneaker-stage-slider" id="sneakerStageSlider">
              ${this.products.map((p, idx) => `
                <div class="sneaker-stage-slide" data-index="${idx}" aria-hidden="${idx === 0 ? 'false' : 'true'}">
                  <div class="sneaker-stage-img-wrapper">
                    <img class="sneaker-stage-img" 
                         src="${p.image}" 
                         alt="${p.altText || p.name}" 
                         loading="${idx === 0 ? 'eager' : 'lazy'}" 
                         width="680" 
                         height="425">
                  </div>
                  <!-- Glowing Orange Bar & Ambient Floor Pedestal -->
                  <div class="sneaker-stage-glow-pedestal" aria-hidden="true">
                    <div class="sneaker-stage-ambient-glow"></div>
                    <div class="sneaker-stage-orange-bar"></div>
                    <div class="sneaker-stage-floor-reflection"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Navigation Dots Track -->
          <div class="sneaker-nav-track" id="sneakerNavDots" role="tablist" aria-label="Select Sneaker Slide">
            ${this.products.map((p, idx) => `
              <button type="button" 
                      class="sneaker-nav-dot ${idx === 0 ? 'is-active' : ''}" 
                      data-index="${idx}" 
                      role="tab" 
                      aria-label="Go to ${p.name}" 
                      aria-selected="${idx === 0 ? 'true' : 'false'}"></button>
            `).join('')}
          </div>

          <!-- Detailed Product Control Card (Code, Name, Colour, Price, Sizes, Add to Cart) -->
          <div class="sneaker-details-card" id="sneakerDetailsCard">
            <!-- Populated dynamically via updateActiveProduct -->
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     UPDATE ACTIVE PRODUCT & SYNCHRONIZE BOTH SECTIONS
     ------------------------------------------------------------------------ */
  updateActiveProduct(index, shouldScroll = false) {
    if (index < 0) index = this.products.length - 1;
    if (index >= this.products.length) index = 0;

    this.currentIndex = index;
    const product = this.products[index];

    // 1. Slide the carousel stage
    const slider = document.getElementById('sneakerStageSlider');
    if (slider) {
      slider.style.transform = `translateX(-${index * 100}%)`;
    }

    // Update slide aria-hidden
    const slides = document.querySelectorAll('.sneaker-stage-slide');
    slides.forEach((s, idx) => {
      s.setAttribute('aria-hidden', idx === index ? 'false' : 'true');
    });

    // 2. Update navigation dots
    const dots = document.querySelectorAll('.sneaker-nav-dot');
    dots.forEach((dot, idx) => {
      const isActive = idx === index;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // 3. Update counter pill
    const counter = document.getElementById('sneakerCarouselCounter');
    if (counter) {
      counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(this.products.length).padStart(2, '0')}`;
    }

    // 4. Update Section 1 Wall Grid Active State
    const tiles = document.querySelectorAll('.sneaker-wall-tile');
    tiles.forEach((t, idx) => {
      t.classList.toggle('is-active', idx === index);
    });

    // 5. Update Product Details Card
    this.renderDetailsCard(product);

    // 6. Optional scroll into view
    if (shouldScroll) {
      const section = document.getElementById(this.carouselSectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  /* ------------------------------------------------------------------------
     RENDER PRODUCT DETAILS CARD (CODE, NAME, COLOUR, PRICE, SIZES, ADD TO CART)
     ------------------------------------------------------------------------ */
  renderDetailsCard(product) {
    const detailsCard = document.getElementById('sneakerDetailsCard');
    if (!detailsCard) return;

    // Default to first size if not yet selected for this product
    if (!this.selectedSizes[product.id] && product.sizes && product.sizes.length > 0) {
      this.selectedSizes[product.id] = product.sizes[0];
    }
    const currentSelectedSize = this.selectedSizes[product.id] || '';
    const formattedPrice = this.formatCurrency(product.price);

    detailsCard.innerHTML = `
      <div class="sneaker-details-header">
        <div>
          <div class="sneaker-details-code">${product.code}</div>
          <h2 class="sneaker-details-name">${product.name}</h2>
          <div class="sneaker-details-colour">Colour: <strong>${product.colour}</strong></div>
        </div>
        <div class="sneaker-details-price">${formattedPrice}</div>
      </div>

      <!-- Size Selector -->
      <div class="sneaker-size-section">
        <div class="sneaker-size-label-row">
          <span>Select Size: <strong id="sneakerSelectedSizeText">${currentSelectedSize || 'Please select'}</strong></span>
          <button type="button" class="sneaker-size-guide-btn" id="sneakerSizeGuideTrigger">Size Guide</button>
        </div>
        <div class="sneaker-size-pills-row" id="sneakerSizePillsRow">
          ${(product.sizes || []).map(size => `
            <button type="button" 
                    class="sneaker-size-pill ${size === currentSelectedSize ? 'is-selected' : ''}" 
                    data-size="${size}">
              ${size}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Actions Row: Add to Cart -->
      <div class="sneaker-actions-row">
        <button type="button" class="sneaker-add-cart-btn" id="sneakerAddToCartBtn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span id="sneakerAddToCartBtnText">Add to Cart — ${formattedPrice}</span>
        </button>

        <div class="sneaker-guarantee-strip">
          <span class="sneaker-guarantee-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Hand-Lasted Quality
          </span>
          <span class="sneaker-guarantee-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Free Express Shipping Across India
          </span>
          <span class="sneaker-guarantee-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            Easy 30-Day Exchange
          </span>
        </div>
      </div>
    `;

    // Size selection handler
    const sizePills = detailsCard.querySelectorAll('.sneaker-size-pill');
    sizePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const size = pill.getAttribute('data-size');
        this.selectedSizes[product.id] = size;
        sizePills.forEach(p => p.classList.toggle('is-selected', p === pill));
        const textEl = document.getElementById('sneakerSelectedSizeText');
        if (textEl) textEl.textContent = size;
      });
    });

    // Size Guide modal trigger integration
    const sizeGuideBtn = document.getElementById('sneakerSizeGuideTrigger');
    if (sizeGuideBtn) {
      sizeGuideBtn.addEventListener('click', () => {
        if (typeof openSizeGuideModal === 'function') {
          openSizeGuideModal();
        } else {
          alert('Gully Labs Size Guide:\nOur hand-lasted sneakers run true to size (UK standard). If you wear half sizes, we recommend sizing up.');
        }
      });
    }

    // Add to Cart button handler
    const addBtn = document.getElementById('sneakerAddToCartBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const size = this.selectedSizes[product.id];
        this.handleAddToCart(product, size);
      });
    }
  }

  /* ------------------------------------------------------------------------
     ADD TO CART DISPATCHER & FALLBACK PLACEHOLDER
     ------------------------------------------------------------------------ */
  handleAddToCart(product, size) {
    if (!size) {
      // Highlight size selector with a shake animation
      const pills = document.querySelectorAll('.sneaker-size-pill');
      pills.forEach(p => {
        p.classList.add('shake');
        setTimeout(() => p.classList.remove('shake'), 400);
      });
      if (typeof showToast === 'function') {
        showToast('Please choose your size first', 'error');
      } else {
        alert('Please choose your size first');
      }
      return;
    }

    // Visual button feedback
    const btn = document.getElementById('sneakerAddToCartBtn');
    const btnText = document.getElementById('sneakerAddToCartBtnText');
    const originalText = btnText ? btnText.textContent : 'Add to Cart';

    if (btn) btn.classList.add('added-success');
    if (btnText) btnText.textContent = `Added ${size} to Cart! ✓`;

    setTimeout(() => {
      if (btn) btn.classList.remove('added-success');
      if (btnText) btnText.textContent = originalText;
    }, 1800);

    /* ----------------------------------------------------------------------
       WIRE TO EXISTING CART (OR CUSTOM SYSTEM)
       If a global cart function exists in the project, invoke it:
       ---------------------------------------------------------------------- */
    if (typeof addToCart === 'function') {
      addToCart(product.id, size, 1);
      return;
    }

    if (window.GullySite && typeof window.GullySite.addToCart === 'function') {
      window.GullySite.addToCart(product.id, size, 1);
      return;
    }

    /* ----------------------------------------------------------------------
       PLACEHOLDER FUNCTION:
       Connect your custom cart endpoint or state management here if desired.
       ---------------------------------------------------------------------- */
    console.log('[SneakerShowcase] Placeholder Cart Handler: Product Added:', {
      productId: product.id,
      title: product.name,
      code: product.code,
      colour: product.colour,
      size: size,
      price: product.price,
      quantity: 1
    });

    if (typeof showToast === 'function') {
      showToast(`Added ${product.name} (${size}) to bag!`, 'success');
    }
  }

  /* ------------------------------------------------------------------------
     MANUAL CAROUSEL NAVIGATION & TOUCH SWIPE / KEYBOARD CONTROLS
     ------------------------------------------------------------------------ */
  selectProduct(index, shouldScroll = false) {
    this.updateActiveProduct(index, shouldScroll);
  }

  prevSlide() {
    this.updateActiveProduct(this.currentIndex - 1, false);
  }

  nextSlide() {
    this.updateActiveProduct(this.currentIndex + 1, false);
  }

  attachEventListeners() {
    // 1. Previous / Next buttons
    const prevBtn = document.getElementById('sneakerPrevBtn');
    const nextBtn = document.getElementById('sneakerNextBtn');
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());

    // 2. Dots navigation
    const dotsContainer = document.getElementById('sneakerNavDots');
    if (dotsContainer) {
      dotsContainer.addEventListener('click', (e) => {
        const dot = e.target.closest('.sneaker-nav-dot');
        if (dot) {
          const index = parseInt(dot.getAttribute('data-index'), 10);
          this.selectProduct(index, false);
        }
      });
    }

    // 3. Mobile touch swipe handling on carousel stage
    const viewport = document.getElementById('sneakerStageViewport');
    if (viewport) {
      viewport.addEventListener('touchstart', (e) => {
        this.touchStartX = e.touches[0].clientX;
        this.touchEndX = this.touchStartX;
        this.isSwiping = true;
      }, { passive: true });

      viewport.addEventListener('touchmove', (e) => {
        if (!this.isSwiping) return;
        this.touchEndX = e.touches[0].clientX;
      }, { passive: true });

      viewport.addEventListener('touchend', () => {
        if (!this.isSwiping) return;
        this.isSwiping = false;
        const diffX = this.touchStartX - this.touchEndX;
        const threshold = 40; // 40px swipe threshold
        if (diffX > threshold) {
          this.nextSlide();
        } else if (diffX < -threshold) {
          this.prevSlide();
        }
      }, { passive: true });
    }

    // 4. Keyboard arrow navigation (Left / Right arrows)
    window.addEventListener('keydown', (e) => {
      // Only navigate if carousel section is active or in viewport
      const carouselEl = document.getElementById(this.carouselSectionId);
      if (!carouselEl) return;

      const rect = carouselEl.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      // Don't intercept typing in inputs or search bars
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.nextSlide();
      }
    });
  }

  formatCurrency(amount) {
    if (typeof amount !== 'number') return amount;
    return `₹${amount.toLocaleString('en-IN')}`;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('sneakerWallGrid') || document.getElementById('sneakerCarouselSection')) {
    window.sneakerShowcase = new SneakerShowcaseComponent();
  }
});
