/* Shared script for the Gully Labs-inspired demo site (shop / product /
   collections pages). Dependency-free vanilla JS. No real checkout or
   payments: the checkout in the cart drawer is a labelled demo only.
   Cart is stored in localStorage under 'gully_demo_cart'. */

(function () {
  'use strict';

  var CART_KEY = 'gully_demo_cart';
  var FREE_SHIPPING_THRESHOLD = 5000;

  /* NOTE: data/products.js declares a top-level `const GULLY_PRODUCTS`.
     A top-level const is a global lexical binding, NOT a window property,
     so `window.GULLY_PRODUCTS` would be undefined in a real browser.
     Use the bare identifier, exactly as the original js/app.js does. */
  function getProducts() {
    try {
      // eslint-disable-next-line no-undef
      return (typeof GULLY_PRODUCTS !== 'undefined' && Array.isArray(GULLY_PRODUCTS))
        ? GULLY_PRODUCTS
        : [];
    } catch (e) { return []; }
  }

  function formatINR(n) {
    return '\u20B9' + Number(n).toLocaleString('en-IN');
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function productUrl(p) { return 'product.html?id=' + encodeURIComponent(p.id); }

  /* ---------------- Product card (uses .products-grid / .product-card) ---- */
  function renderProductCard(p) {
    var secondary = p.secondaryImage || p.primaryImage;
    var isBestseller = p.badge === 'Bestseller';
    var badge = p.badge ? '<span class="card-badge' + (isBestseller ? ' badge-bestseller' : '') + '">' + escapeHtml(p.badge) + '</span>' : '<span></span>';
    var rating = p.rating ? '<span class="card-rating"><span>&#9733;</span> ' + escapeHtml(p.rating) + '</span>' : '';
    return '<article class="product-card">' +
      '<div class="card-top-row">' + badge + rating + '</div>' +
      '<div class="product-card-media">' +
        '<a class="product-image-container" href="' + productUrl(p) + '">' +
          '<img src="' + escapeHtml(p.primaryImage) + '" alt="' + escapeHtml(p.title) + '" class="product-img img-primary" loading="lazy">' +
          '<img src="' + escapeHtml(secondary) + '" alt="' + escapeHtml(p.title) + ' second view" class="product-img img-secondary" loading="lazy">' +
        '</a>' +
        '<a class="card-eye-btn" href="' + productUrl(p) + '" aria-label="View ' + escapeHtml(p.title) + '">' + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"></path><circle cx="12" cy="12" r="3"></circle></svg>' + '</a>' +
        '<a class="card-choose-btn" href="' + productUrl(p) + '">Choose options</a>' +
      '</div>' +
      '<div class="product-info">' +
        '<span class="product-subcat">' + escapeHtml(p.subCategory || p.category) + '</span>' +
        '<div class="product-title-row">' +
          '<h4 class="product-title"><a href="' + productUrl(p) + '">' + escapeHtml(p.title) + '</a></h4>' +
          '<span class="product-price">' + formatINR(p.price) + '</span>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  /* ---------------- Cart -------------------------------------------------- */
  function getCart() {
    try {
      var raw = window.localStorage.getItem(CART_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }

  function saveCart(cart) {
    try { window.localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* private mode */ }
  }

  function cartCount() {
    return getCart().reduce(function (sum, item) { return sum + (item.qty || 1); }, 0);
  }

  function updateCartCount() {
    var badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(function (b) { b.textContent = String(cartCount()); });
  }

  function addToCart(productId, size, qty) {
    var products = getProducts();
    var product = products.find(function (p) { return p.id === productId; });
    if (!product) return false;
    var cart = getCart();
    var existing = cart.find(function (item) { return item.id === productId && item.size === size; });
    if (existing) {
      existing.qty += (qty || 1);
    } else {
      cart.push({ id: productId, size: size || '', qty: qty || 1 });
    }
    saveCart(cart);
    updateCartCount();
    renderCartDrawer();
    return true;
  }

  function cartSubtotal() {
    var products = getProducts();
    return getCart().reduce(function (sum, item) {
      var p = products.find(function (x) { return x.id === item.id; });
      return sum + (p ? p.price * (item.qty || 1) : 0);
    }, 0);
  }

  function renderCartDrawer() {
    var list = document.getElementById('cartDrawerItems');
    if (!list) return;
    var products = getProducts();
    var cart = getCart();
    var subtotal = cartSubtotal();

    var meterText = document.getElementById('shippingMeterText');
    var meterBar = document.getElementById('shippingMeterBar');
    if (meterText) {
      meterText.textContent = subtotal >= FREE_SHIPPING_THRESHOLD
        ? 'You have unlocked Free Express Shipping!'
        : 'Add ' + formatINR(FREE_SHIPPING_THRESHOLD - subtotal) + ' more for Free Express Shipping.';
    }
    if (meterBar) {
      meterBar.style.width = Math.min(100, Math.round(subtotal / FREE_SHIPPING_THRESHOLD * 100)) + '%';
    }

    var subtotalEl = document.getElementById('cartSubtotal');
    if (subtotalEl) subtotalEl.textContent = formatINR(subtotal);

    if (!cart.length) {
      list.innerHTML = '<div class="cart-empty-state"><p>Your cart is empty.</p>' +
        '<p><a href="shop.html">Browse all products &rarr;</a></p></div>';
      return;
    }
    list.innerHTML = cart.map(function (item, index) {
      var p = products.find(function (x) { return x.id === item.id; });
      if (!p) return '';
      return '<div class="cart-item">' +
        '<img src="' + escapeHtml(p.primaryImage) + '" alt="' + escapeHtml(p.title) + '" class="cart-item-img">' +
        '<div class="cart-item-details">' +
          '<div class="cart-item-header">' +
            '<span class="cart-item-title"><a href="' + productUrl(p) + '">' + escapeHtml(p.title) + '</a></span>' +
            '<button type="button" class="cart-item-remove" data-cart-remove="' + index + '" aria-label="Remove item">&times;</button>' +
          '</div>' +
          (item.size ? '<div class="cart-item-size">Size: ' + escapeHtml(item.size) + '</div>' : '') +
          '<div class="cart-item-footer">' +
            '<span class="qty-control">' +
              '<button type="button" class="qty-btn" data-cart-dec="' + index + '" aria-label="Decrease quantity">&minus;</button>' +
              '<span class="qty-val">' + escapeHtml(item.qty) + '</span>' +
              '<button type="button" class="qty-btn" data-cart-inc="' + index + '" aria-label="Increase quantity">+</button>' +
            '</span>' +
            '<span class="cart-item-price">' + formatINR(p.price * (item.qty || 1)) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function openCartDrawer() {
    var drawer = document.getElementById('cartDrawer');
    var backdrop = document.getElementById('drawerBackdrop');
    if (drawer) drawer.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
    document.body.classList.add('drawer-open');
    renderCartDrawer();
  }

  function closeDrawers() {
    ['cartDrawer', 'mobileNavDrawer'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
    var backdrop = document.getElementById('drawerBackdrop');
    if (backdrop) backdrop.classList.remove('active');
    document.body.classList.remove('drawer-open');
  }

  /* ---------------- Header / drawer wiring ------------------------------- */
  
  function initMegaMenu() {
    var megaItems = document.querySelectorAll('.nav-item.has-mega');
    megaItems.forEach(function (item) {
      var timeoutId = null;

      item.addEventListener('mouseenter', function () {
        clearTimeout(timeoutId);
        megaItems.forEach(function (other) {
          if (other !== item) other.classList.remove('is-active');
        });
        item.classList.add('is-active');
      });

      item.addEventListener('mouseleave', function () {
        timeoutId = setTimeout(function () {
          item.classList.remove('is-active');
        }, 180);
      });

      var trigger = item.querySelector('.nav-link');
      if (trigger) {
        trigger.addEventListener('click', function (e) {
          if (window.innerWidth >= 900) {
            if (!item.classList.contains('is-active')) {
              e.preventDefault();
              megaItems.forEach(function (other) { other.classList.remove('is-active'); });
              item.classList.add('is-active');
            }
          }
        });
      }
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-item.has-mega')) {
        megaItems.forEach(function (item) { item.classList.remove('is-active'); });
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        megaItems.forEach(function (item) { item.classList.remove('is-active'); });
      }
    });
  }

  function initHeader() {
    var cartTrigger = document.getElementById('cartTrigger');
    if (cartTrigger) cartTrigger.addEventListener('click', openCartDrawer);
    var cartClose = document.getElementById('cartDrawerClose');
    if (cartClose) cartClose.addEventListener('click', closeDrawers);
    var searchTrigger = document.getElementById('searchTrigger');
    if (searchTrigger) searchTrigger.addEventListener('click', function () {
      var shopSearch = document.getElementById('shopSearch');
      if (shopSearch) { shopSearch.focus(); shopSearch.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      else { window.location.href = 'shop.html'; }
    });
    var mobileToggle = document.getElementById('mobileNavToggle');
    if (mobileToggle) mobileToggle.addEventListener('click', function () {
      var drawer = document.getElementById('mobileNavDrawer');
      var backdrop = document.getElementById('drawerBackdrop');
      if (drawer) drawer.classList.add('active');
      if (backdrop) backdrop.classList.add('active');
      document.body.classList.add('drawer-open');
    });
    var mobileClose = document.getElementById('mobileNavClose');
    if (mobileClose) mobileClose.addEventListener('click', closeDrawers);
    var backdrop = document.getElementById('drawerBackdrop');
    if (backdrop) backdrop.addEventListener('click', closeDrawers);

    var drawerItems = document.getElementById('cartDrawerItems');
    if (drawerItems) drawerItems.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cart-inc], [data-cart-dec], [data-cart-remove]');
      if (!btn) return;
      var cart = getCart();
      var index = parseInt(btn.getAttribute('data-cart-inc') || btn.getAttribute('data-cart-dec') || btn.getAttribute('data-cart-remove'), 10);
      if (btn.hasAttribute('data-cart-inc')) cart[index].qty += 1;
      else if (btn.hasAttribute('data-cart-dec')) {
        cart[index].qty -= 1;
        if (cart[index].qty < 1) cart.splice(index, 1);
      } else cart.splice(index, 1);
      saveCart(cart);
      updateCartCount();
      renderCartDrawer();
    });

    /* Demo checkout: name/address only, no card details, no payment. */
    var demoBtn = document.getElementById('demoCheckoutBtn');
    var demoFormWrap = document.getElementById('demoCheckoutForm');
    var demoForm = document.getElementById('demoCheckoutFields');
    var demoMsg = document.getElementById('demoCheckoutMsg');
    if (demoBtn && demoFormWrap) demoBtn.addEventListener('click', function () {
      if (!getCart().length) {
        if (demoMsg) { demoMsg.hidden = false; demoMsg.textContent = 'Your cart is empty. Add a product first, then try the demo checkout.'; }
        return;
      }
      demoFormWrap.hidden = false;
      if (demoMsg) demoMsg.hidden = true;
    });
    if (demoForm) demoForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var orderNo = 'DEMO-' + String(Date.now()).slice(-6);
      saveCart([]);
      updateCartCount();
      renderCartDrawer();
      demoFormWrap.hidden = true;
      if (demoMsg) {
        demoMsg.hidden = false;
        demoMsg.textContent = 'Demo order ' + orderNo + ' confirmed. This is a demo only: no real order was placed and no payment was taken.';
      }
    });
  }

  /* ---------------- Shop page -------------------------------------------- */
  function initShop() {
    var grid = document.getElementById('shopGrid');
    if (!grid) return;
    var products = getProducts();
    var params = new URLSearchParams(window.location.search);

    var searchInput = document.getElementById('shopSearch');
    var categorySelect = document.getElementById('shopCategory');
    var collectionSelect = document.getElementById('shopCollection');
    var sortSelect = document.getElementById('shopSort');
    var countEl = document.getElementById('shopCount');
    var emptyEl = document.getElementById('shopEmpty');

    /* Collection options come from the data, not a hard-coded list. */
    if (collectionSelect) {
      var seen = [];
      products.forEach(function (p) { if (seen.indexOf(p.subCategory) === -1) seen.push(p.subCategory); });
      seen.forEach(function (sub) {
        var opt = document.createElement('option');
        opt.value = sub;
        opt.textContent = sub;
        collectionSelect.appendChild(opt);
      });
    }

    if (searchInput && params.get('q')) searchInput.value = params.get('q');
    if (categorySelect && params.get('category')) categorySelect.value = params.get('category').toLowerCase();
    if (collectionSelect && params.get('collection')) collectionSelect.value = params.get('collection');

    function applyFilters() {
      var q = (searchInput ? searchInput.value : '').trim().toLowerCase();
      var category = categorySelect ? categorySelect.value : 'all';
      var collection = collectionSelect ? collectionSelect.value : 'all';
      var sort = sortSelect ? sortSelect.value : 'featured';

      var filtered = products.filter(function (p) {
        if (category !== 'all' && p.category !== category) return false;
        if (collection !== 'all' && p.subCategory !== collection) return false;
        if (params.get('sale') === '1' && !(p.originalPrice > p.price)) return false;
        if (q) {
          var hay = [p.title, p.subCategory, p.category, p.materials, (p.tags || []).join(' '), (p.colors || []).join(' ')].join(' ').toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });

      if (sort === 'price-asc') filtered.sort(function (a, b) { return a.price - b.price; });
      else if (sort === 'price-desc') filtered.sort(function (a, b) { return b.price - a.price; });
      else if (sort === 'rating') filtered.sort(function (a, b) { return b.rating - a.rating; });

      grid.innerHTML = filtered.map(renderProductCard).join('');
      if (countEl) countEl.textContent = 'Showing ' + filtered.length + ' of ' + products.length + ' products';
      if (emptyEl) emptyEl.hidden = filtered.length !== 0;
    }

    ['input', 'change'].forEach(function (evt) {
      if (searchInput) searchInput.addEventListener(evt, applyFilters);
      if (categorySelect) categorySelect.addEventListener(evt, applyFilters);
      if (collectionSelect) collectionSelect.addEventListener(evt, applyFilters);
      if (sortSelect) sortSelect.addEventListener(evt, applyFilters);
    });
    var clearBtn = document.getElementById('shopClearFilters');
    if (clearBtn) clearBtn.addEventListener('click', function () {
      if (searchInput) searchInput.value = '';
      if (categorySelect) categorySelect.value = 'all';
      if (collectionSelect) collectionSelect.value = 'all';
      if (sortSelect) sortSelect.value = 'featured';
      applyFilters();
    });
    applyFilters();
  }

  /* ---------------- Collections page -------------------------------------- */
  function initCollections() {
    var grid = document.getElementById('collectionsGrid');
    if (!grid) return;
    var products = getProducts();
    var groups = [];
    products.forEach(function (p) {
      var g = groups.find(function (x) { return x.name === p.subCategory; });
      if (g) g.items.push(p); else groups.push({ name: p.subCategory, items: [p] });
    });
    var cards = groups.map(function (g) {
      var rep = g.items[0];
      var href = 'shop.html?collection=' + encodeURIComponent(g.name);
      return '<article class="collection-card">' +
        '<a href="' + href + '"><img src="' + escapeHtml(rep.primaryImage) + '" alt="' + escapeHtml(g.name) + '"></a>' +
        '<div class="collection-card-body">' +
          '<h3><a href="' + href + '">' + escapeHtml(g.name) + '</a></h3>' +
          '<p>' + g.items.length + (g.items.length === 1 ? ' product' : ' products') + '</p>' +
          '<a class="site-card-link" href="' + href + '">Shop this collection &rarr;</a>' +
        '</div>' +
      '</article>';
    });
    var all = products[0];
    cards.push('<article class="collection-card">' +
      '<a href="shop.html">' + (all ? '<img src="' + escapeHtml(all.primaryImage) + '" alt="Shop all products">' : '') + '</a>' +
      '<div class="collection-card-body">' +
        '<h3><a href="shop.html">Shop All</a></h3>' +
        '<p>' + products.length + ' products</p>' +
        '<a class="site-card-link" href="shop.html">Browse everything &rarr;</a>' +
      '</div>' +
    '</article>');
    grid.innerHTML = cards.join('');
  }

  /* ---------------- Product page ------------------------------------------ */
  function initProduct() {
    var detail = document.getElementById('productDetail');
    if (!detail) return;
    var products = getProducts();
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    var handle = params.get('handle');
    var product = null;
    if (id) {
      product = products.find(function (p) { return p.id === id || p.handle === id; });
    }
    if (!product && handle) {
      var normHandle = handle.toLowerCase().replace(/[^a-z0-9]/g, '');
      product = products.find(function (p) {
        var normP = (p.handle || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        var normTitle = (p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return normP === normHandle || normHandle.indexOf(normP) !== -1 || normP.indexOf(normHandle) !== -1 || normHandle.indexOf(normTitle) !== -1 || normTitle.indexOf(normHandle) !== -1;
      });
    }
    if (!product) {
      product = products[0];
    }

    if (!product) {
      detail.innerHTML = '<div class="site-empty"><h2>Product not found</h2>' +
        '<p>We could not find that product in this demo catalogue.</p>' +
        '<p><a class="btn btn-primary" href="shop.html">Back to Shop All</a></p></div>';
      return;
    }

    var gallery = (product.gallery && product.gallery.length) ? product.gallery : [product.primaryImage];
    var thumbs = gallery.map(function (src, i) {
      return '<button type="button" class="pd-thumb' + (i === 0 ? ' selected' : '') + '" data-src="' + escapeHtml(src) + '" aria-label="View image ' + (i + 1) + '">' +
        '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(product.title) + ' view ' + (i + 1) + '"></button>';
    }).join('');
    var colors = (product.colors || []).map(function (c, i) {
      return '<span class="pd-chip' + (i === 0 ? ' selected' : '') + '">' + escapeHtml(c) + '</span>';
    }).join('');
    var sizes = (product.sizes || []).map(function (s) {
      return '<button type="button" class="size-pill pd-size" data-size="' + escapeHtml(s) + '">' + escapeHtml(s) + '</button>';
    }).join('');
    var orig = product.originalPrice ? '<span class="product-price-orig" style="font-size:1.1rem;">' + formatINR(product.originalPrice) + '</span>' : '';

    detail.innerHTML =
      '<div class="pd-layout">' +
        '<div class="pd-gallery">' +
          '<img id="pdMainImg" src="' + escapeHtml(gallery[0]) + '" alt="' + escapeHtml(product.title) + '">' +
          '<div class="pd-thumbs">' + thumbs + '</div>' +
        '</div>' +
        '<div class="pd-info">' +
          '<p class="product-subcat">' + escapeHtml(product.subCategory || product.category) + '</p>' +
          '<h1 class="pd-title">' + escapeHtml(product.title) + '</h1>' +
          '<p class="pd-rating"><span aria-hidden="true">&#9733;</span> ' + escapeHtml(product.rating) + ' &middot; ' + escapeHtml(product.reviewsCount) + ' reviews</p>' +
          '<div class="product-price-row"><span class="product-price" style="font-size:1.5rem;">' + formatINR(product.price) + '</span>' + orig + '</div>' +
          (product.badge ? '<p><span class="product-badge">' + escapeHtml(product.badge) + '</span></p>' : '') +
          '<p class="pd-label">Colour</p><p class="pd-chips">' + colors + '</p>' +
          '<p class="pd-label">Size <span class="pd-label-note">(choose one to add to cart)</span></p>' +
          '<div class="product-sizes-row" id="pdSizes">' + sizes + '</div>' +
          '<p id="pdSizePrompt" class="pd-prompt" hidden>Please choose a size first.</p>' +
          '<p class="pd-label">Quantity</p>' +
          '<div class="pd-buy-row">' +
            '<span class="qty-control"><button type="button" class="qty-btn" id="pdQtyDec" aria-label="Decrease quantity">&minus;</button><span class="qty-val" id="pdQtyVal">1</span><button type="button" class="qty-btn" id="pdQtyInc" aria-label="Increase quantity">+</button></span>' +
            '<button type="button" class="btn btn-primary" id="pdAddBtn">Add to Cart</button>' +
          '</div>' +
          '<p id="pdAddedMsg" class="pd-added" hidden>Added to your cart.</p>' +
          '<h2 class="pd-h2">About this product</h2>' +
          '<p>' + escapeHtml(product.description) + '</p>' +
          '<h2 class="pd-h2">Materials</h2>' +
          '<p>' + escapeHtml(product.materials) + '</p>' +
          '<details class="pd-details"><summary>Shipping</summary><p>Orders are dispatched the next working day. Delivery is free on orders of ' + formatINR(FREE_SHIPPING_THRESHOLD) + ' and above; a flat delivery fee applies below that. Cash on delivery is available on this demo store.</p></details>' +
          '<details class="pd-details"><summary>Returns &amp; exchanges</summary><p>Unused items can be returned or exchanged within 30 days. See the <a href="help.html#returns">returns help section</a> for the steps.</p></details>' +
        '</div>' +
      '</div>';

    var selectedSize = null;
    var qty = 1;
    detail.querySelectorAll('.pd-thumb').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.getElementById('pdMainImg').src = btn.getAttribute('data-src');
        detail.querySelectorAll('.pd-thumb').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
      });
    });
    detail.querySelectorAll('.pd-size').forEach(function (btn) {
      btn.addEventListener('click', function () {
        detail.querySelectorAll('.pd-size').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        selectedSize = btn.getAttribute('data-size');
        var prompt = document.getElementById('pdSizePrompt');
        if (prompt) prompt.hidden = true;
      });
    });
    document.getElementById('pdQtyDec').addEventListener('click', function () {
      if (qty > 1) { qty -= 1; document.getElementById('pdQtyVal').textContent = String(qty); }
    });
    document.getElementById('pdQtyInc').addEventListener('click', function () {
      qty += 1; document.getElementById('pdQtyVal').textContent = String(qty);
    });
    document.getElementById('pdAddBtn').addEventListener('click', function () {
      var prompt = document.getElementById('pdSizePrompt');
      if (!selectedSize) { if (prompt) prompt.hidden = false; return; }
      addToCart(product.id, selectedSize, qty);
      var msg = document.getElementById('pdAddedMsg');
      if (msg) msg.hidden = false;
      openCartDrawer();
    });

    /* Related: same category, up to 4, excluding this product. */
    var related = document.getElementById('relatedGrid');
    if (related) {
      var rel = products.filter(function (p) { return p.category === product.category && p.id !== product.id; }).slice(0, 4);
      related.innerHTML = rel.map(renderProductCard).join('');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateCartCount();
    renderCartDrawer();
    initHeader();
    initMegaMenu();
    initShop();
    initCollections();
    initProduct();
  });

  document.addEventListener('DOMContentLoaded', function () {
    var footerForm = document.getElementById('newsletterForm');
    var footerMsg = document.getElementById('footerNewsletterMsg');
    if (footerForm && footerMsg) footerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      footerMsg.textContent = 'Thanks \u2014 demo only, no email was sent or stored.';
      var input = footerForm.querySelector('input');
      if (input) input.value = '';
    });
  });

  /* Exposed for the inline page scripts and for testing. */
  window.GullySite = {
    formatINR: formatINR,
    renderProductCard: renderProductCard,
    getCart: getCart,
    addToCart: addToCart,
    updateCartCount: updateCartCount,
    renderCartDrawer: renderCartDrawer
  };
})();
