/**
 * Gully Labs - Shop & Collection Page Controller
 * Handles dynamic filtering by gender, category, collection, search, and sorting.
 * Renders high-quality product cards using createProductCardHTML with size selection and quick-add.
 */

(function () {
  'use strict';

  let currentCategory = 'all';
  let currentGender = 'all';
  let currentSort = 'featured';
  let currentColor = 'all';
  let searchQuery = '';

  document.addEventListener('DOMContentLoaded', () => {
    initShopPage();
  });

  function initShopPage() {
    if (typeof GULLY_PRODUCTS === 'undefined' || !Array.isArray(GULLY_PRODUCTS)) {
      console.warn('GULLY_PRODUCTS catalog not loaded');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    const genderParam = params.get('gender');
    const sortParam = params.get('sort');
    const qParam = params.get('q');

    if (catParam) currentCategory = catParam.toLowerCase();
    if (genderParam) currentGender = genderParam.toLowerCase();
    if (sortParam) currentSort = sortParam;
    if (qParam) searchQuery = qParam.trim();
    const colorParam = params.get('color');
    if (colorParam) currentColor = colorParam.toLowerCase();

    setupFilterControls();
    updatePageHeader();
    renderFilteredProducts();
  }

  function updatePageHeader() {
    const titleEl = document.getElementById('shopPageTitle');
    const descEl = document.getElementById('shopPageDesc');
    const crumbEl = document.getElementById('shopCrumbActive');

    let title = 'All Products & Silhouettes';
    let desc = 'Explore the complete collection of hand-lasted Indian sneakers, architectural slides, and heavy-gauge apparel.';

    if (currentCategory === 'apparel') {
      if (currentGender === 'men') {
        title = "Men's Apparel & Accessories";
        desc = 'Heavyweight 380 GSM twill shackets, saddle-stitch poplin shirts, and archival motorsport jerseys.';
      } else if (currentGender === 'women') {
        title = "Women's Apparel & Accessories";
        desc = 'Tailored pintuck trousers, boxy toggle shackets, and structured poplin silhouettes.';
      } else {
        title = 'Apparel & Accessories';
        desc = 'Heavyweight cotton twill, custom-knitted jerseys, and tailored streetwear layers.';
      }
    } else if (currentCategory === 'slides') {
      title = 'Architectural Slides & Mules';
      desc = 'Ergonomic daily mules engineered with contoured footbeds and premium nubuck leathers.';
    } else if (currentCategory === 'sneakers') {
      if (currentGender === 'men') {
        title = "Men's Hand-Lasted Sneakers";
        desc = 'Handcrafted silhouettes engineered on wider wooden lasts specifically contoured for Indian feet.';
      } else if (currentGender === 'women') {
        title = "Women's Hand-Lasted Sneakers";
        desc = 'Bespoke colorways, lightweight lasts, and hand-lasted footwear crafted from full-grain leather.';
      } else {
        title = 'Hand-Lasted Indian Sneakers';
        desc = 'Sneakers rooted in Indian culture, storytelling, and bespoke shoe-making craftsmanship.';
      }
    } else if (currentGender === 'men') {
      title = "Men's Collection";
      desc = 'Explore the complete range of hand-lasted footwear, slides, and heavy-gauge layers for men.';
    } else if (currentGender === 'women') {
      title = "Women's Collection";
      desc = 'Discover handcrafted sneakers, architectural mules, and tailored apparel designed for women.';
    }

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;
    if (crumbEl) crumbEl.textContent = title;
    document.title = `${title} | Gully Labs`;
  }

  function setupFilterControls() {
    // Category pills
    const catPills = document.querySelectorAll('.shop-cat-pill');
    catPills.forEach(pill => {
      const cat = pill.getAttribute('data-category');
      pill.classList.toggle('active', cat === currentCategory);

      pill.addEventListener('click', (e) => {
        e.preventDefault();
        currentCategory = cat;
        catPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-category') === cat));
        updateURL();
        updatePageHeader();
        renderFilteredProducts();
      });
    });

    // Gender pills
    const genderPills = document.querySelectorAll('.shop-gender-pill');
    genderPills.forEach(pill => {
      const g = pill.getAttribute('data-gender');
      pill.classList.toggle('active', g === currentGender);

      pill.addEventListener('click', (e) => {
        e.preventDefault();
        currentGender = g;
        genderPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-gender') === g));
        updateURL();
        updatePageHeader();
        renderFilteredProducts();
      });
    });

    // Colour pills
    const colorPills = document.querySelectorAll('.shop-color-pill');
    colorPills.forEach(pill => {
      const c = pill.getAttribute('data-color');
      pill.classList.toggle('active', c === currentColor);

      pill.addEventListener('click', (e) => {
        e.preventDefault();
        currentColor = c;
        colorPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-color') === c));
        updateURL();
        renderFilteredProducts();
      });
    });

    // Sort select
    const sortSelect = document.getElementById('shopSortSelect');
    if (sortSelect) {
      sortSelect.value = currentSort;
      sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        updateURL();
        renderFilteredProducts();
      });
    }
  }

  function updateURL() {
    const params = new URLSearchParams();
    if (currentCategory !== 'all') params.set('category', currentCategory);
    if (currentGender !== 'all') params.set('gender', currentGender);
    if (currentSort !== 'featured') params.set('sort', currentSort);
    if (currentColor !== 'all') params.set('color', currentColor);
    if (searchQuery) params.set('q', searchQuery);

    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newURL);
  }

  function renderFilteredProducts() {
    const grid = document.getElementById('shopGrid');
    const emptyState = document.getElementById('shopEmptyState');
    const countEl = document.getElementById('shopProductCount');
    const activeFiltersBar = document.getElementById('shopActiveFiltersBar');

    if (!grid) return;

    let items = GULLY_PRODUCTS.slice();

    // 1. Filter by category
    if (currentCategory === 'apparel') {
      items = items.filter(p => p.category === 'apparel');
    } else if (currentCategory === 'slides') {
      items = items.filter(p =>
        (p.subCategory && (p.subCategory.includes('004') || p.subCategory.includes('005'))) ||
        p.id === 'prod-014' ||
        (p.title && p.title.toLowerCase().includes('slide'))
      );
    } else if (currentCategory === 'sneakers') {
      items = items.filter(p => p.category === 'sneakers' && p.id !== 'prod-014');
    }

    // 2. Filter by gender
    if (currentGender === 'men') {
      items = items.filter(p => p.gender === 'Men' || p.gender === 'Unisex');
    } else if (currentGender === 'women') {
      items = items.filter(p => p.gender === 'Women' || p.gender === 'Unisex');
    }

    // 2b. Filter by colour
    if (currentColor !== 'all') {
      items = items.filter(p => (p.colorFamily || '').toLowerCase() === currentColor);
    }

    // 3. Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
        (p.materials && p.materials.toLowerCase().includes(q))
      );
    }

    // 4. Sort
    if (currentSort === 'price-asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'rating') {
      items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    // Update count label
    if (countEl) {
      countEl.textContent = `${items.length} Product${items.length === 1 ? '' : 's'}`;
    }

    // Render active filter chips
    renderActiveFilterChips(activeFiltersBar);

    // Empty state or grid
    if (items.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      if (typeof createProductCardHTML === 'function') {
        grid.innerHTML = items.map(createProductCardHTML).join('');
      } else {
        grid.innerHTML = items.map(renderFallbackCard).join('');
      }
    }
  }

  function renderActiveFilterChips(container) {
    if (!container) return;

    const chips = [];
    if (currentCategory !== 'all') {
      chips.push({ label: `Category: ${capitalize(currentCategory)}`, type: 'cat' });
    }
    if (currentGender !== 'all') {
      chips.push({ label: `Gender: ${capitalize(currentGender)}`, type: 'gender' });
    }
    if (currentColor !== 'all') {
      chips.push({ label: `Colour: ${capitalize(currentColor)}`, type: 'color' });
    }
    if (searchQuery) {
      chips.push({ label: `Search: "${searchQuery}"`, type: 'query' });
    }

    if (chips.length === 0) {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    container.style.display = 'flex';
    container.innerHTML = chips.map(chip => `
      <span class="shop-active-filter-chip">
        <span>${chip.label}</span>
        <button type="button" data-type="${chip.type}" aria-label="Remove filter">&times;</button>
      </span>
    `).join('') + `
      <button type="button" class="shop-clear-all-btn" id="shopClearAllFilters">Clear All</button>
    `;

    // Attach chip remove listeners
    container.querySelectorAll('.shop-active-filter-chip button').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        if (type === 'cat') currentCategory = 'all';
        if (type === 'gender') currentGender = 'all';
        if (type === 'color') currentColor = 'all';
        if (type === 'query') searchQuery = '';
        updateCategoryPills();
        updateGenderPills();
        updateColorPills();
        updateURL();
        updatePageHeader();
        renderFilteredProducts();
      });
    });

    const clearAllBtn = document.getElementById('shopClearAllFilters');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        currentCategory = 'all';
        currentGender = 'all';
        currentColor = 'all';
        searchQuery = '';
        updateCategoryPills();
        updateGenderPills();
        updateColorPills();
        updateURL();
        updatePageHeader();
        renderFilteredProducts();
      });
    }
  }

  function updateCategoryPills() {
    document.querySelectorAll('.shop-cat-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-category') === currentCategory);
    });
  }

  function updateGenderPills() {
    document.querySelectorAll('.shop-gender-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-gender') === currentGender);
    });
  }

  function updateColorPills() {
    document.querySelectorAll('.shop-color-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-color') === currentColor);
    });
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function renderFallbackCard(product) {
    return `
      <div class="product-card">
        <a href="product.html?id=${product.id}">
          <img src="${product.primaryImage}" alt="${product.title}">
          <h4>${product.title}</h4>
          <p>₹${product.price.toLocaleString('en-IN')}</p>
        </a>
      </div>
    `;
  }

})();
