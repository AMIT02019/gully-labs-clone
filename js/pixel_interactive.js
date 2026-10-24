/**
 * Gully Labs Interactive Controller
 * Coordinates the authentic Shopify theme DOM components
 */
document.addEventListener('DOMContentLoaded', () => {
  initCartDrawer();
  initSearchDrawer();
  initMobileMenu();
  initLookbookHotspots();
  initQuickAddButtons();
});

function initCartDrawer() {
  const cartButtons = document.querySelectorAll('a[href*="/cart"], button[aria-controls="CartDrawer"], .header__icon--cart, [data-cart-drawer-trigger]');
  const cartDrawer = document.querySelector('#shopify-section-sections--25992598290716__cart-drawer, .cart-drawer, #CartDrawer');
  
  cartButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (cartDrawer) {
        cartDrawer.classList.toggle('active');
        cartDrawer.classList.toggle('is-empty', false);
        document.body.classList.toggle('overflow-hidden');
      }
    });
  });

  // Drawer close buttons
  const closeBtns = document.querySelectorAll('.cart-drawer__close, [data-drawer-close], .drawer__close-btn');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (cartDrawer) {
        cartDrawer.classList.remove('active');
        document.body.classList.remove('overflow-hidden');
      }
    });
  });
}

function initSearchDrawer() {
  const searchButtons = document.querySelectorAll('a[href*="/search"], .header__icon--search, [data-search-trigger]');
  const searchDrawer = document.querySelector('#shopify-section-sections--25992598290716__search-drawer, .search-drawer, #SearchDrawer');

  searchButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (searchDrawer) {
        searchDrawer.classList.toggle('active');
        document.body.classList.toggle('overflow-hidden');
      }
    });
  });
}

function initMobileMenu() {
  const menuButtons = document.querySelectorAll('.header__icon--menu, .mobile-menu-trigger, [aria-controls="MobileNav"]');
  const navDrawer = document.querySelector('.mobile-nav-drawer, .menu-drawer, #menu-drawer');

  menuButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (navDrawer) {
        navDrawer.classList.toggle('active');
        document.body.classList.toggle('overflow-hidden');
      }
    });
  });
}

function initLookbookHotspots() {
  const hotspots = document.querySelectorAll('.image-point__item, .lookbook-hotspot, .point-item');
  hotspots.forEach(spot => {
    spot.addEventListener('click', () => {
      const popover = spot.querySelector('.image-point__popover, .hotspot-card');
      if (popover) {
        popover.classList.toggle('active');
      }
    });
  });
}

function initQuickAddButtons() {
  const addButtons = document.querySelectorAll('.product-card__btn, .quick-add-btn, button[name="add"], .ct-Plue');
  addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.product-card, .pro-card') || btn;
      const title = card.querySelector('.product-card__title, .card__title')?.textContent?.trim() || 'Item';
      
      // Update cart count badge
      const badges = document.querySelectorAll('.cart-count-bubble span, .cart-count, .cart-count-badge');
      badges.forEach(b => {
        let count = parseInt(b.textContent || '0', 10) || 0;
        b.textContent = count + 1;
      });

      // Show toast
      showNotification(`Added ${title} to cart!`);
    });
  });
}

function showNotification(msg) {
  let toast = document.getElementById('gully-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'gully-toast';
    toast.style.cssText = 'position:fixed; bottom:24px; right:24px; background:#000; color:#fff; padding:12px 24px; border-radius:9999px; font-size:14px; font-weight:700; z-index:999999; box-shadow:0 8px 24px rgba(0,0,0,0.2); transition:all 0.3s ease;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 3000);
}
