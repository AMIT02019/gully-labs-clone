/**
 * ASCENTA STUDIO "LAST DEPT." INTERACTIVE ILLUMINATED FOOTWEAR WALL
 * Modular, resilient interactive engine for Gully Labs.
 */

(function () {
  'use strict';

  // 1. Physical Layout Geometry (master wall: 5504 x 3072)
  const SNEAKER_GEOMETRY = Object.freeze({
    master: 'media-v15/wall-3200.webp',
    width: 5504,
    height: 3072,
    frameWidth: 1376,
    frameHeight: 768,
    shelfCentersX: [710, 1745, 2790, 3825, 4864],
    rowCentersY: [970, 2010],
    names: [
      'Foundry 01', 'Yard 02', 'Hangar 03', 'Tier 04', 'Escarp 05',
      'Index 06', 'Frame 07', 'Form 08', 'Plinth 09', 'Grade 10'
    ],
    frame(n) {
      if (!Number.isInteger(n) || n < 1 || n > 10) throw new RangeError('Invalid shoe index: ' + n);
      const col = (n - 1) % 5, row = Math.floor((n - 1) / 5);
      return {
        n,
        x: Math.max(0, Math.min(this.width - this.frameWidth, this.shelfCentersX[col] - this.frameWidth / 2)),
        y: this.rowCentersY[row] - this.frameHeight / 2,
        width: this.frameWidth,
        height: this.frameHeight
      };
    },
    mount(container, n) {
      if (window.SNEAKER_DELIVERY) return window.SNEAKER_DELIVERY.mount(container, n);
      const frame = this.frame(n);
      const image = new Image();
      container.classList.add('spatial-frame');
      container.dataset.viewShoe = n;
      image.alt = `Close-up of ${this.names[n - 1]}`;
      image.src = this.master;
      Object.assign(container.style, {
        position: 'relative',
        overflow: 'hidden',
        aspectRatio: `${frame.width}/${frame.height}`
      });
      Object.assign(image.style, {
        position: 'absolute',
        maxWidth: 'none',
        width: `${100 * this.width / frame.width}%`,
        height: `${100 * this.height / frame.height}%`,
        left: `${-100 * frame.x / frame.width}%`,
        top: `${-100 * frame.y / frame.height}%`
      });
      container.replaceChildren(image);
      return frame;
    }
  });

  // 2. High-Res Image Delivery System
  const imageCache = new Map();
  const getDetailURL = (n) => {
    const pixels = (window.innerWidth || 1920) * (window.devicePixelRatio || 1);
    const width = pixels > 2752 ? 3840 : pixels > 1376 ? 2752 : 1376;
    return `media-v15/detail-${String(n).padStart(2, '0')}-${width}.webp`;
  };

  const loadDetail = (n) => {
    const url = getDetailURL(n);
    if (!imageCache.has(url)) {
      const image = new Image();
      image.decoding = 'async';
      image.src = url;
      imageCache.set(url, { image, ready: image.decode ? image.decode() : Promise.resolve() });
      if (imageCache.get(url).ready.catch) {
        imageCache.get(url).ready.catch(() => imageCache.delete(url));
      }
    }
    return imageCache.get(url);
  };

  const mountDetail = (container, n) => {
    const cached = loadDetail(n);
    const image = cached.image.cloneNode();
    image.alt = `Close-up of ${SNEAKER_GEOMETRY.names[n - 1]}`;
    image.className = 'delivered-detail';
    container.classList.add('spatial-frame');
    container.dataset.viewShoe = n;
    Object.assign(container.style, {
      position: 'relative',
      overflow: 'hidden',
      aspectRatio: '1376/768'
    });
    Object.assign(image.style, {
      display: 'block',
      width: '100%',
      height: '100%',
      objectFit: 'fill'
    });
    container.replaceChildren(image);
    container.qualityReady = cached.ready;
    return SNEAKER_GEOMETRY.frame(n);
  };

  window.SNEAKER_DELIVERY = { load: loadDetail, mount: mountDetail, detailURL: getDetailURL };

  // 3. Concept Shoes Catalog (Curated with INR pricing for Gully Labs)
  const collectionSizes = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
  const collectionPrices = [5990, 5490, 5990, 5690, 5290, 4490, 5790, 5690, 4290, 5190];
  const SNEAKER_PRODUCTS = [
    ['FOUNDRY 01', 'Peach orange', 'Sculpted lines. A translucent amber sole.', 'Horizontal overlays, tonal laces and three transparent supports.'],
    ['YARD 02', 'Forest / Bone', 'A high collar with a distinctive buckle closure.', 'Light contrast panels, a padded collar and a straight sole profile.'],
    ['HANGAR 03', 'Cobalt / White', 'Padded panels with a clear blue sole.', 'Cobalt laces, light woven panels and a white toe.'],
    ['TIER 04', 'Lilac / Cream', 'Soft volumes. A layered silhouette.', 'A mid-cut collar, overlapping panels and twin pull tabs.'],
    ['ESCARP 05', 'Graphite / Olive', 'A rugged profile, finished with orange laces.', 'A protected toe and a deeply sculpted outsole.'],
    ['INDEX 06', 'Sand / Burgundy', 'A low profile with diagonal panelling.', 'A soft-touch finish and a speckled sole.'],
    ['FRAME 07', 'Graphite / Cobalt', 'An enveloping collar. A sharp flash of blue.', 'A high-cut profile and a flat gum-coloured sole.'],
    ['FORM 08', 'Pearl / Silver', 'Continuous knit over a clear amber sole.', 'A silver heel and one uninterrupted translucent sole chamber.'],
    ['PLINTH 09', 'White / Terracotta', 'Clean lines, grounded in terracotta.', 'A low-cut shape, white laces and a stitched toe.'],
    ['GRADE 10', 'Coral / Blue / Lime', 'A woven upper on a sculpted foundation.', 'A stretch collar and vertical grooves along the sole.']
  ].map(([name, color, description, details], i) => ({
    id: i + 1,
    productId: `concept-${String(i + 1).padStart(2, '0')}`,
    name,
    color,
    description,
    details,
    price: collectionPrices[i],
    currency: 'INR',
    sizes: [...collectionSizes]
  }));

  // 4. Pre-calculated Shelf Coordinate Hitboxes & LED zones from zonas.json
  const ZONAS_FALLBACK = [
    { n: 1, led: [0.01875, 0.349895, 0.219922, 0.169349], hit: [0.04375, 0.259762, 0.17, 0.16571] },
    { n: 2, led: [0.210938, 0.349895, 0.211328, 0.169349], hit: [0.23625, 0.259762, 0.16125, 0.16571] },
    { n: 3, led: [0.404688, 0.349895, 0.203906, 0.169349], hit: [0.43, 0.259762, 0.15375, 0.16571] },
    { n: 4, led: [0.590625, 0.349895, 0.209375, 0.169349], hit: [0.615625, 0.259762, 0.159375, 0.16571] },
    { n: 5, led: [0.775, 0.349895, 0.21875, 0.169349], hit: [0.8, 0.259762, 0.16875, 0.16571] },
    { n: 6, led: [0.01875, 0.682995, 0.219922, 0.177747], hit: [0.04375, 0.604619, 0.17, 0.162351] },
    { n: 7, led: [0.210938, 0.682995, 0.211328, 0.177747], hit: [0.23625, 0.604619, 0.16125, 0.162351] },
    { n: 8, led: [0.404688, 0.682995, 0.203906, 0.177747], hit: [0.43, 0.604619, 0.15375, 0.162351] },
    { n: 9, led: [0.590625, 0.682995, 0.209375, 0.177747], hit: [0.615625, 0.604619, 0.159375, 0.162351] },
    { n: 10, led: [0.775, 0.682995, 0.21875, 0.177747], hit: [0.8, 0.604619, 0.16875, 0.162351] }
  ];

  // Helper DOM creator
  const createEl = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };

  const formatPrice = (p) => {
    return '₹' + (p.price || p).toLocaleString('en-IN');
  };

  // 5. Initialize Stage Engine
  function initLastDeptStage() {
    const scene = document.querySelector('#scene');
    if (!scene) return;

    const forward = scene.querySelector('#forward');
    const reverse = scene.querySelector('#reverse');
    const destination = scene.querySelector('#destination');
    const backBtn = document.querySelector('#ascenta-back') || document.querySelector('#back');
    const statusEl = document.querySelector('#status');
    const detailsLink = document.querySelector('#ascenta-details') || document.querySelector('#details');

    const productsMap = new Map(SNEAKER_PRODUCTS.map(p => [p.id, p]));
    const selectedSizes = new Map();
    const leds = [];
    const hits = [];
    const labels = [];

    let mode = 'wall';
    let prepared = null;
    let wantBack = false;
    let activeShoe = null;
    let addTimer = null;
    let pointer = { x: -1, y: -1 };

    const pc = (v) => `${v * 100}%`;

    // Build Product Info Sheet inside scene
    const panel = createEl('section', 'scene-product');
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Footwear silhouette information and sizing');

    const heading = createEl('div', 'product-heading');
    const kicker = createEl('p', 'product-kicker');
    const title = createEl('h1');
    const description = createEl('p');
    heading.append(kicker, title, description);

    const plane = createEl('div', 'product-plane');
    const collectionNote = createEl('p', 'purchase-note', 'LAST DEPT. // SERIES 01');
    const purchaseHeader = createEl('div', 'purchase-header');
    const colorEl = createEl('p', 'product-color');
    const priceEl = createEl('p', 'product-price');
    purchaseHeader.append(colorEl, priceEl);

    // Size Selector
    const sizeField = createEl('div', 'size-field');
    const sizeTop = createEl('div', 'size-top');
    const sizeLabel = createEl('label', 'size-label', 'Select Size');
    const sizeUnit = createEl('span', 'size-unit', 'UK / IND');
    sizeLabel.htmlFor = 'ascenta-size-select';
    sizeTop.append(sizeLabel, sizeUnit);

    const sizeControl = createEl('div', 'size-control');
    const sizeSelect = createEl('select', 'size-select');
    sizeSelect.id = 'ascenta-size-select';
    sizeSelect.setAttribute('aria-label', 'Select shoe size');
    sizeControl.append(sizeSelect);
    sizeField.append(sizeTop, sizeControl);

    // Tactile Add to Bag Button
    const addBtn = createEl('button', 'add-to-bag');
    addBtn.type = 'button';
    addBtn.disabled = true;

    const addCopy = createEl('span', 'add-copy');
    const addLabel = createEl('span', 'add-label', 'Add to Bag');
    const addHint = createEl('span', 'add-hint', 'Select your size');
    addCopy.append(addLabel, addHint);

    const addSymbol = createEl('span', 'add-symbol');
    addSymbol.setAttribute('aria-hidden', 'true');
    addSymbol.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <g class="add-arrow"><path d="M5 8h14l1 12H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></g>
        <path class="add-check" d="m5 12 4 4L19 6"/>
      </svg>
    `;
    addBtn.append(addCopy, addSymbol);

    // Magnetic Pointer Hover on Add Button
    addBtn.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      const bounds = addBtn.getBoundingClientRect();
      addBtn.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
      addBtn.style.setProperty('--icon-x', `${(event.clientX - bounds.left - bounds.width / 2) * 0.04}px`);
      addBtn.style.setProperty('--icon-y', `${(event.clientY - bounds.top - bounds.height / 2) * 0.12}px`);
    });

    addBtn.addEventListener('pointerleave', () => {
      addBtn.style.setProperty('--icon-x', '0px');
      addBtn.style.setProperty('--icon-y', '0px');
    });

    // Design Details Accordion
    const more = createEl('details', 'product-more');
    const summary = createEl('summary', '', 'Archival Design Details');
    const designDetails = createEl('p');
    more.append(summary, designDetails);

    plane.append(collectionNote, purchaseHeader, sizeField, addBtn, more);
    panel.append(heading, plane);
    scene.append(panel);

    // Light Turn-Off & Turn-On Handlers
    function turnOffLeds() {
      leds.forEach(e => e.classList.remove('on'));
      labels.forEach(l => l.classList.remove('on'));
    }

    function lightShelf(n) {
      if (mode !== 'wall') return;
      turnOffLeds();
      const lamp = leds[n - 1];
      if (lamp) {
        if (!lamp.getAttribute('src')) lamp.src = `led_${n}.png`;
        lamp.classList.add('on');
      }
      const label = labels[n - 1];
      if (label) label.classList.add('on');
      prepareShoe(n);
    }

    function prepareShoe(n) {
      if (prepared === n && destination.dataset.viewShoe === String(n)) return;
      prepared = n;
      mountDetail(destination, n);

      const deliveryWidth = (window.innerWidth * (window.devicePixelRatio || 1)) > 1920 ? 3840 : 1920;
      for (const [video, key] of [[forward, 'forward'], [reverse, 'reverse']]) {
        if (!video) continue;
        video.pause();
        video.hidden = true;
        video.preload = key === 'reverse' ? 'none' : 'auto';
        video.src = `media-v15/camera-${String(n).padStart(2, '0')}-${key}-${deliveryWidth}.mp4`;
        video.load();
      }
    }

    function resetStage() {
      panel.hidden = true;
      panel.classList.remove('ready');
      activeShoe = null;
      if (forward) { forward.pause(); forward.hidden = true; }
      if (reverse) { reverse.pause(); reverse.hidden = true; }
      destination.hidden = true;
      mode = 'wall';
      scene.dataset.mode = mode;
      wantBack = false;
      turnOffLeds();
      hits.forEach(h => h.disabled = false);
      if (backBtn) backBtn.hidden = true;
      if (detailsLink) detailsLink.hidden = false;
      if (statusEl) statusEl.textContent = 'Hover to illuminate shelf. Click silhouette to fly in.';
    }

    // Resilient Video Playback with Promise Timeout
    async function playVideoSafely(video) {
      if (!video) return Promise.reject(new Error('No video element'));
      return new Promise((resolve, reject) => {
        let isDone = false;
        const timeout = setTimeout(() => {
          if (!isDone) {
            isDone = true;
            reject(new Error('Video playback timeout'));
          }
        }, 3000);

        const onFrame = () => {
          if (isDone) return;
          isDone = true;
          clearTimeout(timeout);
          video.hidden = false;
          resolve();
        };

        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            if (video.requestVideoFrameCallback) {
              video.requestVideoFrameCallback(onFrame);
            } else {
              video.addEventListener('playing', onFrame, { once: true });
            }
          }).catch(err => {
            if (!isDone) {
              isDone = true;
              clearTimeout(timeout);
              reject(err);
            }
          });
        }
      });
    }

    function stageShoeDetails(n) {
      const p = productsMap.get(n);
      if (!p) return;
      activeShoe = n;

      kicker.textContent = `LAST DEPT. / ${String(n).padStart(2, '0')}`;
      title.textContent = p.name;
      description.textContent = p.description;
      colorEl.textContent = p.color;
      priceEl.textContent = formatPrice(p);
      designDetails.textContent = p.details;
      more.open = false;

      // Populate Sizes
      sizeSelect.replaceChildren();
      const defaultOption = createEl('option', '', 'Select your size');
      defaultOption.value = '';
      defaultOption.disabled = true;
      defaultOption.selected = true;
      sizeSelect.append(defaultOption);

      p.sizes.forEach(sz => {
        const opt = createEl('option', '', sz);
        opt.value = sz;
        sizeSelect.append(opt);
      });

      // Reset button state
      clearTimeout(addTimer);
      addBtn.classList.remove('is-added');
      addLabel.textContent = 'Add to Bag';

      if (selectedSizes.has(n)) {
        const prevSize = selectedSizes.get(n);
        sizeSelect.value = prevSize;
        addBtn.disabled = false;
        addHint.textContent = `${prevSize} selected · Ready to add`;
      } else {
        addBtn.disabled = true;
        addHint.textContent = 'Select your size to continue';
      }
    }

    function revealShoeDetails() {
      if (activeShoe === null) return;
      panel.hidden = false;
      panel.classList.add('ready');
      if (backBtn) backBtn.hidden = false;
    }

    // Fly in to explore shoe
    async function enterShoe(n) {
      if (mode !== 'wall') return;
      prepareShoe(n);
      mode = 'outbound';
      scene.dataset.mode = mode;

      panel.hidden = true;
      stageShoeDetails(n);
      turnOffLeds();
      const lamp = leds[n - 1];
      if (lamp) lamp.classList.add('on');

      hits.forEach(h => h.disabled = true);
      if (statusEl) statusEl.textContent = `Inspecting ${SNEAKER_GEOMETRY.names[n - 1]}...`;

      try {
        if (forward) {
          await playVideoSafely(forward);
        } else {
          throw new Error('No forward video');
        }
      } catch (err) {
        // Resilient fallback: instantly switch to destination detail frame
        console.warn('Camera flight skipped, showing high-res detail frame:', err);
        destination.hidden = false;
        if (forward) forward.hidden = true;
        mode = 'detail';
        scene.dataset.mode = mode;
        revealShoeDetails();
      }
    }

    // Fly back to wall view
    async function leaveShoe() {
      if (mode === 'outbound') {
        wantBack = true;
        return;
      }
      if (mode !== 'detail') return;

      mode = 'inbound';
      scene.dataset.mode = mode;
      if (backBtn) backBtn.hidden = true;
      panel.hidden = true;

      try {
        if (reverse) {
          reverse.preload = 'auto';
          await playVideoSafely(reverse);
          destination.hidden = true;
          if (forward) forward.hidden = true;
        } else {
          throw new Error('No reverse video');
        }
      } catch (err) {
        console.warn('Reverse camera flight skipped, resetting to wall:', err);
        resetStage();
      }
    }

    // Video Event Listeners
    if (forward) {
      forward.addEventListener('ended', () => {
        mode = 'detail';
        scene.dataset.mode = mode;
        destination.hidden = false;
        forward.hidden = true;
        if (!wantBack) revealShoeDetails();
        if (wantBack) leaveShoe();
      });
    }

    if (reverse) {
      reverse.addEventListener('ended', resetStage);
    }

    if (backBtn) {
      backBtn.addEventListener('click', leaveShoe);
    }

    if (detailsLink) {
      detailsLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (mode !== 'wall') leaveShoe();
      });
    }

    // Size Selection Handler
    sizeSelect.addEventListener('change', () => {
      const val = sizeSelect.value;
      if (!val) return;
      selectedSizes.set(activeShoe, val);
      addBtn.disabled = false;
      addHint.textContent = `${val} selected · Ready to add`;
    });

    // Add To Bag Handler
    addBtn.addEventListener('click', () => {
      const p = productsMap.get(activeShoe);
      const chosenSize = selectedSizes.get(activeShoe);
      if (!p || !chosenSize) return;

      clearTimeout(addTimer);
      addBtn.classList.add('is-added');
      addLabel.textContent = 'In Your Bag';
      addHint.textContent = `${p.name} · ${chosenSize}`;

      // Wire into Gully Labs storefront cart system!
      if (typeof window.addToCart === 'function') {
        window.addToCart(p.productId, chosenSize, 1);
      } else {
        // Fallback local cart storage
        try {
          const raw = localStorage.getItem('gully_cart');
          const cart = raw ? JSON.parse(raw) : [];
          const existing = cart.find(item => item.id === p.productId && item.size === chosenSize);
          if (existing) existing.quantity++;
          else cart.push({ id: p.productId, title: p.name, price: p.price, size: chosenSize, quantity: 1, image: `media-v18/thumb-${String(activeShoe).padStart(2,'0')}.webp` });
          localStorage.setItem('gully_cart', JSON.stringify(cart));
        } catch (e) {}
      }

      // Re-enable button after 2.2 seconds
      addTimer = setTimeout(() => {
        addBtn.classList.remove('is-added');
        addLabel.textContent = 'Add to Bag';
        addHint.textContent = `${chosenSize} selected · Ready to add`;
      }, 2200);
    });

    // Mount Zones, LEDs & Click Targets
    function mountZones(zones) {
      for (const z of zones) {
        // 1. LED Light
        const led = new Image();
        led.alt = '';
        led.className = 'led';
        Object.assign(led.style, {
          left: pc(z.led[0]),
          top: pc(z.led[1]),
          width: pc(z.led[2]),
          height: pc(z.led[3])
        });

        // 2. Clickable Hit Area
        const hit = document.createElement('button');
        hit.type = 'button';
        hit.className = 'hit';
        hit.dataset.shoe = z.n;
        const productName = SNEAKER_PRODUCTS[z.n - 1]?.name || SNEAKER_GEOMETRY.names[z.n - 1];
        hit.setAttribute('aria-label', `Explore ${productName}`);
        Object.assign(hit.style, {
          left: pc(z.hit[0]),
          top: pc(z.hit[1]),
          width: pc(z.hit[2]),
          height: pc(z.hit[3])
        });

        hit.addEventListener('pointerenter', () => lightShelf(z.n));
        hit.addEventListener('pointerleave', () => { if (mode === 'wall') turnOffLeds(); });
        hit.addEventListener('focus', () => lightShelf(z.n));
        hit.addEventListener('blur', () => { if (mode === 'wall') turnOffLeds(); });
        hit.addEventListener('click', () => enterShoe(z.n));

        // 3. Floating Holographic Label
        const label = createEl('div', 'holo-name', productName);
        label.append(createEl('span', '', `${String(z.n).padStart(2, '0')} // ARCHIVE`));
        label.dataset.product = z.n;
        label.setAttribute('aria-hidden', 'true');
        const col = (z.n - 1) % 5, row = Math.floor((z.n - 1) / 5);
        label.style.left = `${SNEAKER_GEOMETRY.shelfCentersX[col] / 5504 * 100}%`;
        label.style.top = `${row === 0 ? 46.7 : 80.8}%`;

        scene.insertBefore(led, forward || destination);
        scene.insertBefore(hit, forward || destination);
        scene.insertBefore(label, forward || destination);

        leds.push(led);
        hits.push(hit);
        labels.push(label);
      }

      scene.dataset.mode = 'wall';
    }

    // Try fetch zonas.json; immediately fallback to ZONAS_FALLBACK
    fetch('zonas.json')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(zones => mountZones(zones))
      .catch(() => mountZones(ZONAS_FALLBACK));

    // Global Keydown & Pointer Listeners
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mode !== 'wall' && !document.querySelector('dialog[open]')) {
        leaveShoe();
      }
    });

    // Studio Notes Dialog Wire-up
    const studioDialog = document.querySelector('#studio-dialog') || document.querySelector('.ascenta-studio-dialog');
    if (studioDialog) {
      document.querySelectorAll('[data-studio-open]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (typeof studioDialog.showModal === 'function') {
            studioDialog.showModal();
          } else {
            studioDialog.setAttribute('open', '');
          }
        });
      });

      const closeBtn = studioDialog.querySelector('.ascenta-studio-close') || studioDialog.querySelector('.studio-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => studioDialog.close ? studioDialog.close() : studioDialog.removeAttribute('open'));
      }

      const exploreBtn = studioDialog.querySelector('.ascenta-studio-explore') || studioDialog.querySelector('.studio-explore');
      if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
          if (studioDialog.close) studioDialog.close();
          else studioDialog.removeAttribute('open');
          if (mode !== 'wall') leaveShoe();
        });
      }

      studioDialog.addEventListener('click', (event) => {
        if (event.target === studioDialog) {
          if (studioDialog.close) studioDialog.close();
          else studioDialog.removeAttribute('open');
        }
      });
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLastDeptStage);
  } else {
    initLastDeptStage();
  }
})();
