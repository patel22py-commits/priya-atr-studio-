/* ===================================================================
   PRIYA STUDIO - CORE APPLICATION LOGIC
   Dark Mode, Cart, Wishlist, WhatsApp Ordering, Filters & Modals
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- APPLICATION STATE ---
  const state = {
    products: [...PRODUCTS_DATA],
    cart: JSON.parse(localStorage.getItem('priya_cart') || '[]'),
    wishlist: JSON.parse(localStorage.getItem('priya_wishlist') || '[]'),
    activeCategory: 'all',
    searchQuery: '',
    sortBy: 'featured',
    appliedCoupon: null,
    discountPercent: 0
  };

  // --- DOM SELECTORS ---
  const elements = {
    // Theme
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    mobileThemeToggleBtn: document.getElementById('mobile-theme-toggle-btn'),
    // Header & Mobile Nav
    header: document.getElementById('site-header'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    mobileCloseBtn: document.getElementById('mobile-close-btn'),
    mobileDrawer: document.getElementById('mobile-drawer'),
    drawerOverlay: document.getElementById('drawer-overlay'),
    // Badges & Counts
    cartCountBadge: document.getElementById('cart-count-badge'),
    mobileCartBadge: document.getElementById('mobile-cart-badge'),
    wishlistCountBadge: document.getElementById('wishlist-count-badge'),
    // Products Grid & Filters
    productsGrid: document.getElementById('products-grid'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    searchInput: document.getElementById('search-input'),
    sortSelect: document.getElementById('sort-select'),
    // Cart Drawer
    cartToggleBtn: document.getElementById('cart-toggle-btn'),
    cartCloseBtn: document.getElementById('cart-close-btn'),
    cartDrawer: document.getElementById('cart-drawer'),
    cartItemsList: document.getElementById('cart-items-list'),
    cartSubtotalElem: document.getElementById('cart-subtotal'),
    freeShippingNotice: document.getElementById('free-shipping-notice'),
    freeShippingProgressBar: document.getElementById('free-shipping-progress'),
    couponInput: document.getElementById('coupon-input'),
    applyCouponBtn: document.getElementById('apply-coupon-btn'),
    couponMessage: document.getElementById('coupon-message'),
    whatsappCheckoutBtn: document.getElementById('whatsapp-checkout-btn'),
    standardCheckoutBtn: document.getElementById('standard-checkout-btn'),
    // Quick View Modal
    quickViewModal: document.getElementById('quick-view-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    qvBody: document.getElementById('qv-body'),
    // Custom Order Form
    customOrderForm: document.getElementById('custom-order-form'),
    // FAQ Accordion
    faqItems: document.querySelectorAll('.faq-item'),
    // Toast Container
    toastContainer: document.getElementById('toast-container')
  };

  // =================================================================
  // 1. THEME TOGGLE (DARK MODE / LIGHT MODE)
  // =================================================================
  const initTheme = () => {
    const savedTheme = localStorage.getItem('priya_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', initialTheme);
  };

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('priya_theme', newTheme);
    
    showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode! 🌙☀️`, 'info');
  };

  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.addEventListener('click', toggleTheme);
  }
  if (elements.mobileThemeToggleBtn) {
    elements.mobileThemeToggleBtn.addEventListener('click', toggleTheme);
  }

  // =================================================================
  // 2. HEADER & MOBILE NAVIGATION DRAWER
  // =================================================================
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      elements.header.classList.add('scrolled');
    } else {
      elements.header.classList.remove('scrolled');
    }
  });

  const openMobileNav = () => {
    elements.mobileDrawer.classList.add('open');
    elements.drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileNav = () => {
    elements.mobileDrawer.classList.remove('open');
    if (!elements.cartDrawer.classList.contains('open')) {
      elements.drawerOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (elements.mobileMenuBtn) elements.mobileMenuBtn.addEventListener('click', openMobileNav);
  if (elements.mobileCloseBtn) elements.mobileCloseBtn.addEventListener('click', closeMobileNav);

  // Close nav when clicking a link
  document.querySelectorAll('.mobile-nav-links .nav-link, .mobile-sub-link').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // Mobile submenu accordion toggle
  const mobileResinToggle = document.getElementById('mobile-resin-toggle');
  const mobileResinGroup = document.getElementById('mobile-resin-group');
  if (mobileResinToggle && mobileResinGroup) {
    mobileResinToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileResinGroup.classList.toggle('active');
    });
  }

  // Mobile Jewellery submenu accordion toggle
  const mobileJewelToggle = document.getElementById('mobile-jewel-toggle');
  const mobileJewelGroup = document.getElementById('mobile-jewel-group');
  if (mobileJewelToggle && mobileJewelGroup) {
    mobileJewelToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileJewelGroup.classList.toggle('active');
    });
  }

  // =================================================================
  // 3. TOAST NOTIFICATIONS
  // =================================================================
  const showToast = (message, type = 'success') => {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = 'fa-check-circle';
    if (type === 'heart') icon = 'fa-heart';
    if (type === 'info') icon = 'fa-sparkles';
    if (type === 'warn') icon = 'fa-exclamation-triangle';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  };

  // =================================================================
  // 4. PRODUCT CATALOG RENDERING & FILTERING
  // =================================================================
  const renderProducts = () => {
    if (!elements.productsGrid) return;

    let filtered = state.products.filter(item => {
      // Category & Subcategory filter
      if (state.activeCategory === 'bestsellers') {
        if (!(item.badge && item.badge.toLowerCase().includes('bestseller')) && item.rating < 4.9) {
          return false;
        }
      } else if (state.activeCategory === 'varmala-preservation') {
        if (item.subCategory !== 'varmala-preservation') return false;
      } else if (state.activeCategory === 'baby-memory') {
        if (item.subCategory !== 'baby-memory') return false;
      } else if (state.activeCategory === 'keychain') {
        if (item.subCategory !== 'keychain') return false;
      } else if (state.activeCategory === 'resin-earrings' || state.activeCategory === 'earrings') {
        if (item.subCategory !== 'resin-earrings' && item.subCategory !== 'earrings') return false;
      } else if (state.activeCategory === 'anti-tarnish') {
        if (item.subCategory !== 'anti-tarnish') return false;
      } else if (state.activeCategory === 'navratri-collection') {
        if (item.subCategory !== 'navratri-collection') return false;
      } else if (state.activeCategory !== 'all' && item.category !== state.activeCategory) {
        return false;
      }
      // Search query filter
      if (state.searchQuery.trim() !== '') {
        const query = state.searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCat = item.categoryName.toLowerCase().includes(query);
        return matchesName || matchesDesc || matchesCat;
      }
      return true;
    });

    // Sorting
    if (state.sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (state.sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (state.sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    if (filtered.length === 0) {
      elements.productsGrid.innerHTML = `
        <div class="catalog-empty">
          <i class="fa-solid fa-box-open"></i>
          <h3>No products found</h3>
          <p>Try searching for resin clocks, pearl necklaces, or graphic t-shirts.</p>
        </div>
      `;
      return;
    }

    elements.productsGrid.innerHTML = filtered.map(item => {
      const isWishlisted = state.wishlist.includes(item.id);
      return `
        <div class="product-card" data-id="${item.id}">
          <div class="product-image-box">
            <img src="${item.image}" alt="${item.name}" class="product-image" loading="lazy">
            ${item.badge ? `
              <div class="product-badge-list">
                <span class="p-badge ${item.badgeType || 'resin'}">${item.badge}</span>
              </div>
            ` : ''}
            <div class="product-actions-floating">
              <button class="btn-icon-round wishlist-btn ${isWishlisted ? 'wishlisted' : ''}" data-id="${item.id}" title="Add to Wishlist">
                <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
              </button>
            </div>
          </div>
          
          <div class="product-details">
            <span class="product-cat">${item.collection || item.categoryName}</span>
            <h4 class="product-name" data-id="${item.id}">${item.name}</h4>
            <p class="product-short-desc">${item.shortDescription || item.description.slice(0, 100) + '...'}</p>
            <div class="product-rating">
              <div>
                ${getStarRatingHTML(item.rating)}
              </div>
              <span>(${item.reviewsCount})</span>
            </div>
            <div class="product-bottom">
              <div class="product-bottom-header">
                <div class="product-prices">
                  <span class="price-current">₹${item.price.toLocaleString('en-IN')}</span>
                  ${item.originalPrice ? `<span class="price-original">₹${item.originalPrice.toLocaleString('en-IN')}</span>` : ''}
                </div>
              </div>
              <div class="card-action-row">
                <button class="btn-card-view" data-id="${item.id}">
                  <i class="fa-regular fa-eye"></i> <span class="btn-lbl-full">View Product</span><span class="btn-lbl-mob">View</span>
                </button>
                <button class="btn-add-cart" data-id="${item.id}">
                  <i class="fa-solid fa-bag-shopping"></i> <span class="btn-lbl-full">Add to Cart</span><span class="btn-lbl-mob">Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    attachProductEventListeners();
  };

  const getStarRatingHTML = (rating) => {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fa-solid fa-star"></i>';
    }
    if (hasHalf) {
      stars += '<i class="fa-solid fa-star-half-stroke"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="fa-regular fa-star"></i>';
    }
    return stars;
  };

  // Event listeners on product cards
  const attachProductEventListeners = () => {
    // Add to cart buttons
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        addToCart(id);
      });
    });

    // Wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        toggleWishlist(id);
      });
    });

    // View Product and product card click
    document.querySelectorAll('.btn-card-view, .product-name, .product-image-box').forEach(elem => {
      elem.addEventListener('click', (e) => {
        if (e.target.closest('.wishlist-btn')) return;
        const id = elem.getAttribute('data-id') || elem.closest('.product-card').getAttribute('data-id');
        openQuickView(id);
      });
    });
  };

  // Filter tab buttons
  elements.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      state.activeCategory = btn.getAttribute('data-filter');
      renderProducts();
    });
  });

  // Search input
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderProducts();
    });
  }

  // Sort dropdown
  if (elements.sortSelect) {
    elements.sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderProducts();
    });
  }

  // Direct category clicks from banners & nav
  window.filterByCollection = (category) => {
    state.activeCategory = category;
    elements.filterBtns.forEach(b => {
      if (b.getAttribute('data-filter') === category) {
        b.classList.add('active');
        b.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        b.classList.remove('active');
      }
    });
    renderProducts();
    const section = document.getElementById('shop-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });

    // Update bottom nav active highlight
    const mbNavItems = document.querySelectorAll('.mb-nav-item');
    mbNavItems.forEach(item => item.classList.remove('active'));
    if (category === 'resin-art' || category === 'varmala-preservation' || category === 'baby-memory' || category === 'keychain' || category === 'resin-earrings') {
      const el = document.getElementById('mb-nav-resin');
      if (el) el.classList.add('active');
    } else if (category === 'jewellery' || category === 'anti-tarnish' || category === 'navratri-collection') {
      const el = document.getElementById('mb-nav-jewel');
      if (el) el.classList.add('active');
    }
  };

  const mbHome = document.getElementById('mb-nav-home');
  if (mbHome) {
    mbHome.addEventListener('click', () => {
      document.querySelectorAll('.mb-nav-item').forEach(i => i.classList.remove('active'));
      mbHome.classList.add('active');
    });
  }

  // =================================================================
  // 5. WISHLIST MANAGEMENT
  // =================================================================
  const toggleWishlist = (productId) => {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const index = state.wishlist.indexOf(productId);
    if (index > -1) {
      state.wishlist.splice(index, 1);
      showToast(`Removed "${product.name.slice(0, 20)}..." from Wishlist`, 'info');
    } else {
      state.wishlist.push(productId);
      showToast(`Added "${product.name.slice(0, 20)}..." to Wishlist! ❤️`, 'heart');
    }

    localStorage.setItem('priya_wishlist', JSON.stringify(state.wishlist));
    updateBadges();
    renderProducts();
  };

  // =================================================================
  // 6. CART MANAGEMENT & SLIDE-OUT DRAWER
  // =================================================================
  const saveCart = () => {
    localStorage.setItem('priya_cart', JSON.stringify(state.cart));
    updateBadges();
    renderCart();
  };

  const updateBadges = () => {
    const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (elements.cartCountBadge) elements.cartCountBadge.textContent = totalCount;
    if (elements.mobileCartBadge) elements.mobileCartBadge.textContent = totalCount;
    const mbCartBadge = document.getElementById('mb-cart-badge');
    if (mbCartBadge) mbCartBadge.textContent = totalCount;
    if (elements.wishlistCountBadge) elements.wishlistCountBadge.textContent = state.wishlist.length;
  };

  const addToCart = (productId, selectedOption = null, quantity = 1) => {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const chosenOption = selectedOption || (product.options && product.options.length ? product.options[0] : 'Standard');
    const existingIndex = state.cart.findIndex(item => item.id === productId && item.selectedOption === chosenOption);

    if (existingIndex > -1) {
      state.cart[existingIndex].quantity += quantity;
    } else {
      state.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        selectedOption: chosenOption,
        quantity: quantity
      });
    }

    saveCart();
    showToast(`Added "${product.name.slice(0, 24)}..." to bag! 🛍️`, 'success');
    openCart();
  };

  const openCart = () => {
    elements.cartDrawer.classList.add('open');
    elements.drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeCart = () => {
    elements.cartDrawer.classList.remove('open');
    if (!elements.mobileDrawer.classList.contains('open')) {
      elements.drawerOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (elements.cartToggleBtn) elements.cartToggleBtn.addEventListener('click', openCart);
  if (elements.cartCloseBtn) elements.cartCloseBtn.addEventListener('click', closeCart);
  if (elements.drawerOverlay) {
    elements.drawerOverlay.addEventListener('click', () => {
      closeCart();
      closeMobileNav();
    });
  }

  const renderCart = () => {
    if (!elements.cartItemsList) return;

    if (state.cart.length === 0) {
      elements.cartItemsList.innerHTML = `
        <div class="cart-empty-message">
          <i class="fa-solid fa-basket-shopping"></i>
          <h4>Your bag is empty</h4>
          <p>Explore our handcrafted resin art and custom apparel to start shopping!</p>
          <button class="btn btn-primary btn-sm" onclick="document.getElementById('cart-close-btn').click();">Start Shopping</button>
        </div>
      `;
      if (elements.cartSubtotalElem) elements.cartSubtotalElem.textContent = '₹0';
      if (elements.freeShippingProgressBar) elements.freeShippingProgressBar.style.width = '0%';
      if (elements.freeShippingNotice) {
        elements.freeShippingNotice.innerHTML = `Add ₹${STUDIO_CONFIG.freeShippingThreshold} for <strong>FREE Delivery!</strong>`;
      }
      return;
    }

    elements.cartItemsList.innerHTML = state.cart.map((item, index) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <h5>${item.name}</h5>
          <div class="cart-item-variant">${item.selectedOption}</div>
          <div class="cart-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
          <button class="cart-item-del" data-index="${index}" title="Remove item">
            <i class="fa-solid fa-trash-can"></i>
          </button>
          <div class="cart-item-qty">
            <button class="qty-btn" data-action="decrease" data-index="${index}">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" data-action="increase" data-index="${index}">+</button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach cart item quantity buttons
    elements.cartItemsList.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'));
        const action = btn.getAttribute('data-action');
        if (action === 'increase') {
          state.cart[index].quantity += 1;
        } else if (action === 'decrease') {
          if (state.cart[index].quantity > 1) {
            state.cart[index].quantity -= 1;
          } else {
            state.cart.splice(index, 1);
          }
        }
        saveCart();
      });
    });

    elements.cartItemsList.querySelectorAll('.cart-item-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'));
        state.cart.splice(index, 1);
        saveCart();
        showToast('Item removed from cart', 'info');
      });
    });

    // Subtotal & Shipping calculation
    const rawSubtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = Math.round((rawSubtotal * state.discountPercent) / 100);
    const finalTotal = rawSubtotal - discountAmount;

    if (elements.cartSubtotalElem) {
      if (state.discountPercent > 0) {
        elements.cartSubtotalElem.innerHTML = `
          <div>Total:</div>
          <div>
            <span style="font-size:0.9rem; text-decoration:line-through; color:var(--text-muted); margin-right:8px;">₹${rawSubtotal.toLocaleString('en-IN')}</span>
            <span>₹${finalTotal.toLocaleString('en-IN')}</span>
          </div>
        `;
      } else {
        elements.cartSubtotalElem.innerHTML = `<span>Total:</span> <span>₹${finalTotal.toLocaleString('en-IN')}</span>`;
      }
    }

    // Free Shipping Progress
    const remainingForFreeShipping = STUDIO_CONFIG.freeShippingThreshold - rawSubtotal;
    if (remainingForFreeShipping <= 0) {
      elements.freeShippingNotice.innerHTML = `🎉 You unlocked <strong>FREE Delivery!</strong>`;
      elements.freeShippingProgressBar.style.width = '100%';
    } else {
      const progressPercent = Math.min(100, Math.round((rawSubtotal / STUDIO_CONFIG.freeShippingThreshold) * 100));
      elements.freeShippingNotice.innerHTML = `Add ₹${remainingForFreeShipping.toLocaleString('en-IN')} more for <strong>FREE Delivery!</strong>`;
      elements.freeShippingProgressBar.style.width = `${progressPercent}%`;
    }
  };

  // Coupon Code Application
  if (elements.applyCouponBtn) {
    elements.applyCouponBtn.addEventListener('click', () => {
      const code = elements.couponInput.value.trim().toUpperCase();
      if (STUDIO_CONFIG.couponCodes[code]) {
        state.appliedCoupon = code;
        state.discountPercent = STUDIO_CONFIG.couponCodes[code];
        elements.couponMessage.textContent = `Applied ${code}! (${state.discountPercent}% OFF)`;
        elements.couponMessage.style.color = '#25D366';
        renderCart();
        showToast(`Promo Code Applied: ${state.discountPercent}% OFF! 🎉`, 'success');
      } else {
        elements.couponMessage.textContent = 'Invalid code. Try "PRIYA10"';
        elements.couponMessage.style.color = '#e07a5f';
      }
    });
  }

  // =================================================================
  // 7. ORDER ON WHATSAPP GENERATOR
  // =================================================================
  const generateWhatsAppOrder = () => {
    if (state.cart.length === 0) {
      showToast('Your cart is empty! Add items first.', 'warn');
      return;
    }

    const rawSubtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = Math.round((rawSubtotal * state.discountPercent) / 100);
    const finalTotal = rawSubtotal - discountAmount;

    let message = `*✨ NEW ORDER INQUIRY - PRIYA STUDIO ✨*\n\n`;
    message += `Hello Priya Studio! I would like to place an order for the following items:\n\n`;

    state.cart.forEach((item, idx) => {
      message += `${idx + 1}. *${item.name}*\n`;
      message += `   • Variant: ${item.selectedOption}\n`;
      message += `   • Qty: ${item.quantity}\n`;
      message += `   • Price: ₹${item.price * item.quantity}\n\n`;
    });

    if (state.discountPercent > 0) {
      message += `Coupon Applied: ${state.appliedCoupon} (${state.discountPercent}% OFF)\n`;
    }
    message += `*Total Order Value:* ₹${finalTotal.toLocaleString('en-IN')}\n\n`;
    message += `*Customer Details:*\n`;
    message += `Name: [Please type your name]\n`;
    message += `Delivery Address: [Please type city & pin code]\n\n`;
    message += `Please confirm product availability and payment details. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${STUDIO_CONFIG.phone}?text=${encodedMessage}`;
    window.open(waUrl, '_blank');
  };

  if (elements.whatsappCheckoutBtn) {
    elements.whatsappCheckoutBtn.addEventListener('click', generateWhatsAppOrder);
  }

  // Standard checkout button
  if (elements.standardCheckoutBtn) {
    elements.standardCheckoutBtn.addEventListener('click', () => {
      if (state.cart.length === 0) {
        showToast('Your cart is empty!', 'warn');
        return;
      }
      generateWhatsAppOrder();
    });
  }

  // =================================================================
  // 8. PRODUCT DETAIL / QUICK VIEW MODAL
  // =================================================================
  const openQuickView = (productId) => {
    const product = state.products.find(p => p.id === productId);
    if (!product || !elements.qvBody) return;

    let selectedVariant = product.options && product.options.length ? product.options[0] : 'Standard';
    let currentQty = 1;

    // Find 2 related products from same category
    const relatedProducts = state.products
      .filter(p => p.id !== product.id && p.category === product.category)
      .slice(0, 2);

    const galleryImages = product.images && product.images.length ? product.images : [product.image];

    elements.qvBody.innerHTML = `
      <div class="quick-view-grid">
        <!-- Gallery Column -->
        <div class="qv-gallery-col">
          <div class="qv-img-container">
            <img src="${galleryImages[0]}" alt="${product.name}" class="qv-img" id="qv-main-img">
          </div>
          ${galleryImages.length > 1 ? `
            <div class="qv-thumbnails">
              ${galleryImages.map((imgSrc, idx) => `
                <div class="qv-thumb ${idx === 0 ? 'active' : ''}" data-src="${imgSrc}">
                  <img src="${imgSrc}" alt="${product.name} Photo ${idx + 1}" style="width:100%; height:100%; object-fit:cover;">
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Product Details Column -->
        <div class="qv-details">
          <span class="qv-meta-tag">${product.collection || product.categoryName}</span>
          <h2 class="qv-title">${product.name}</h2>
          
          ${product.badges && product.badges.length ? `
            <div class="qv-badges-row" style="display:flex; flex-wrap:wrap; gap:6px; margin: 6px 0 10px;">
              ${product.badges.map(b => `<span class="p-badge sale" style="font-size:0.75rem; padding:4px 10px; text-transform:uppercase;">${b}</span>`).join('')}
            </div>
          ` : ''}

          <div class="product-rating" style="margin-bottom:8px;">
            <div>${getStarRatingHTML(product.rating)}</div>
            <span>${product.rating} (${product.reviewsCount} customer reviews)</span>
          </div>

          <div class="qv-prices">
            <span class="price-current">₹${product.price.toLocaleString('en-IN')}</span>
            ${product.originalPrice ? `<span class="price-original" style="font-size:1.1rem;">₹${product.originalPrice.toLocaleString('en-IN')}</span>` : ''}
          </div>

          <!-- Short Description -->
          <p class="qv-short-desc">${product.shortDescription || product.description.slice(0, 150) + '...'}</p>

          <!-- Selling Line / Highlight if available -->
          ${product.websiteHighlight || product.sellingLine ? `<div class="qv-selling-line" style="font-style:italic; font-weight:600; color:var(--accent-primary); margin-bottom:12px; font-size:0.95rem;">${product.websiteHighlight || product.sellingLine}</div>` : ''}

          <!-- Specifications Table if available -->
          ${product.color || product.style || product.gender || product.collection || product.productType || product.design || product.accent || product.charm || product.closure || product.finish || product.metalFinish || product.stone || product.centreStone || product.accentStones || product.occasion || product.idealFor || product.material || product.customization || product.madeFor ? `
            <div class="qv-specs-box">
              ${product.productType ? `<div class="qv-spec-item"><strong>Product Type:</strong> ${product.productType}</div>` : ''}
              ${product.material ? `<div class="qv-spec-item"><strong>Material:</strong> ${product.material}</div>` : ''}
              ${product.customization ? `<div class="qv-spec-item"><strong>Customization:</strong> ${product.customization}</div>` : ''}
              ${product.design ? `<div class="qv-spec-item"><strong>Design:</strong> ${product.design}</div>` : ''}
              ${product.color ? `<div class="qv-spec-item"><strong>Primary Colour:</strong> ${product.color}</div>` : ''}
              ${product.metalFinish || product.finish ? `<div class="qv-spec-item"><strong>Metal Finish:</strong> ${product.metalFinish || product.finish}</div>` : ''}
              ${product.centreStone ? `<div class="qv-spec-item"><strong>Centre Stone:</strong> ${product.centreStone}</div>` : ''}
              ${product.accentStones ? `<div class="qv-spec-item"><strong>Accent Stones:</strong> ${product.accentStones}</div>` : ''}
              ${product.stone ? `<div class="qv-spec-item"><strong>Stone:</strong> ${product.stone}</div>` : ''}
              ${product.accent ? `<div class="qv-spec-item"><strong>Accent:</strong> ${product.accent}</div>` : ''}
              ${product.charm ? `<div class="qv-spec-item"><strong>Charm:</strong> ${product.charm}</div>` : ''}
              ${product.closure ? `<div class="qv-spec-item"><strong>Closure:</strong> ${product.closure}</div>` : ''}
              ${product.style ? `<div class="qv-spec-item"><strong>Style:</strong> ${product.style}</div>` : ''}
              ${product.categoryName ? `<div class="qv-spec-item"><strong>Category:</strong> ${product.categoryName}</div>` : ''}
              ${product.occasion ? `<div class="qv-spec-item"><strong>Occasion:</strong> ${product.occasion}</div>` : ''}
              ${product.idealFor ? `<div class="qv-spec-item"><strong>Ideal For:</strong> ${product.idealFor}</div>` : (product.gender ? `<div class="qv-spec-item"><strong>Gender:</strong> ${product.gender}</div>` : '')}
              ${product.madeFor ? `<div class="qv-spec-item"><strong>Made For:</strong> ${product.madeFor}</div>` : ''}
              ${product.collection ? `<div class="qv-spec-item"><strong>Collection:</strong> ${product.collection}</div>` : ''}
            </div>
          ` : ''}

          <!-- Key Features -->
          ${product.keyFeatures && product.keyFeatures.length ? `
            <div class="qv-features-section">
              <h5 class="qv-features-title">✨ Key Features</h5>
              <ul class="qv-features-list">
                ${product.keyFeatures.map(feat => `<li><i class="fa-solid fa-check"></i> ${feat}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Perfect For Section if available -->
          ${product.perfectFor && product.perfectFor.length ? `
            <div class="qv-features-section">
              <h5 class="qv-features-title">💍 Perfect For</h5>
              <ul class="qv-features-list">
                ${product.perfectFor.map(item => `<li><i class="fa-solid fa-heart" style="color:#e07a5f; font-size:0.75rem;"></i> ${item}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- How It Works Section if available -->
          ${product.howItWorks && product.howItWorks.length ? `
            <div class="qv-features-section" style="background:var(--bg-tertiary); padding:12px; border-radius:var(--radius-sm); margin-bottom:14px;">
              <h5 class="qv-features-title" style="margin-bottom:8px;">🖼️ How It Works</h5>
              <ol style="margin:0; padding-left:18px; font-size:0.85rem; color:var(--text-secondary); line-height:1.6;">
                ${product.howItWorks.map(step => `<li style="margin-bottom:4px;">${step}</li>`).join('')}
              </ol>
            </div>
          ` : ''}

          <!-- Why Choose Section if available -->
          ${product.whyChoose || product.whyYoullLoveIt ? `
            <div style="background:var(--bg-secondary); border-left:3px solid var(--accent-primary); padding:10px 12px; border-radius:4px; margin-bottom:14px; font-size:0.85rem;">
              <strong style="color:var(--text-primary); display:block; margin-bottom:4px;">${product.whyYoullLoveIt ? "❤️ Why You'll Love It" : '💖 Why Choose Custom Varmala Preservation?'}</strong>
              <span style="color:var(--text-secondary); line-height:1.5;">${product.whyYoullLoveIt || product.whyChoose}</span>
            </div>
          ` : ''}

          <!-- Full Description -->
          <div style="font-size:0.88rem; color:var(--text-secondary); line-height:1.6; margin-bottom:18px; white-space: pre-line;">
            ${product.description}
          </div>

          <!-- Website CTA Banner if available -->
          ${product.websiteCTA ? `
            <div style="text-align:center; padding:12px; background:linear-gradient(135deg, rgba(235,110,128,0.1), rgba(212,163,115,0.15)); border-radius:8px; margin-bottom:18px; border:1px dashed var(--accent-primary);">
              <div style="font-weight:700; color:var(--accent-primary); font-size:0.95rem;">🌸 ${product.websiteCTA}</div>
            </div>
          ` : ''}

          <!-- Size / Option Selector -->
          ${product.options && product.options.length ? `
            <div class="qv-selector-group">
              <label class="qv-selector-label">Available Sizes / Options:</label>
              <div class="qv-options">
                ${product.options.map((opt, i) => `
                  <div class="qv-option-chip ${i === 0 ? 'active' : ''}" data-val="${opt}">${opt}</div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Quantity Selector & Actions -->
          <div class="qv-actions-cluster">
            <div class="qv-qty-row">
              <span style="font-size:0.88rem; font-weight:700;">Quantity:</span>
              <div class="qv-qty-control">
                <button class="qv-qty-btn" id="qv-qty-minus">-</button>
                <input type="text" class="qv-qty-input" id="qv-qty-val" value="1" readonly>
                <button class="qv-qty-btn" id="qv-qty-plus">+</button>
              </div>
            </div>

            <div class="qv-cta-buttons">
              <button class="btn btn-primary" id="qv-add-cart-btn">
                <i class="fa-solid fa-bag-shopping"></i> Add to Cart
              </button>
              <button class="btn btn-buynow" id="qv-buy-now-btn">
                <i class="fa-brands fa-whatsapp"></i> Buy Now
              </button>
            </div>
          </div>

          <!-- Shipping & Return Information -->
          <div class="qv-policies-box">
            <div class="qv-policy-item">
              <i class="fa-solid fa-truck-fast"></i>
              <div><strong>Shipping:</strong> Dispatched in 24–48 hours. Free delivery on orders above ₹999 across India.</div>
            </div>
            <div class="qv-policy-item">
              <i class="fa-solid fa-rotate-left"></i>
              <div><strong>Returns:</strong> 7-day hassle-free replacement for transit damage or sizing issues.</div>
            </div>
          </div>

          <!-- Related Products -->
          ${relatedProducts.length ? `
            <div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--border-light);">
              <h5 style="font-size:0.9rem; font-weight:700; margin-bottom:10px;">You May Also Like:</h5>
              <div style="display:flex; gap:12px;">
                ${relatedProducts.map(rel => `
                  <div class="qv-rel-item" style="display:flex; align-items:center; gap:8px; background:var(--bg-tertiary); padding:6px 10px; border-radius:var(--radius-sm); cursor:pointer; flex:1;" onclick="window.openProductDetail('${rel.id}')">
                    <img src="${rel.image}" alt="${rel.name}" style="width:38px; height:38px; border-radius:4px; object-fit:cover;">
                    <div style="font-size:0.78rem; overflow:hidden;">
                      <div style="font-weight:600; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${rel.name}</div>
                      <div style="color:var(--accent-primary); font-weight:700;">₹${rel.price}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

        </div>
      </div>
    `;

    // Thumbnail click listener
    const thumbs = elements.qvBody.querySelectorAll('.qv-thumb');
    const mainImg = elements.qvBody.querySelector('#qv-main-img');
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        const src = thumb.getAttribute('data-src');
        if (mainImg && src) {
          mainImg.src = src;
        }
      });
    });

    // Chip click listeners
    const chips = elements.qvBody.querySelectorAll('.qv-option-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedVariant = chip.getAttribute('data-val');
      });
    });

    // Quantity buttons
    const qtyValElem = elements.qvBody.querySelector('#qv-qty-val');
    const minusBtn = elements.qvBody.querySelector('#qv-qty-minus');
    const plusBtn = elements.qvBody.querySelector('#qv-qty-plus');

    if (minusBtn && plusBtn && qtyValElem) {
      minusBtn.addEventListener('click', () => {
        if (currentQty > 1) {
          currentQty--;
          qtyValElem.value = currentQty;
        }
      });
      plusBtn.addEventListener('click', () => {
        currentQty++;
        qtyValElem.value = currentQty;
      });
    }

    // Add to cart from modal
    const qvAddBtn = elements.qvBody.querySelector('#qv-add-cart-btn');
    if (qvAddBtn) {
      qvAddBtn.addEventListener('click', () => {
        addToCart(product.id, selectedVariant, currentQty);
        closeQuickView();
      });
    }

    // Buy Now button from modal
    const qvBuyBtn = elements.qvBody.querySelector('#qv-buy-now-btn');
    if (qvBuyBtn) {
      qvBuyBtn.addEventListener('click', () => {
        const total = product.price * currentQty;
        const msg = encodeURIComponent(`Hello Priya Studio! I would like to instantly order:\n\n*Product:* ${product.name}\n*Price:* ₹${product.price} each\n*Size/Variant:* ${selectedVariant}\n*Quantity:* ${currentQty}\n*Total Value:* ₹${total.toLocaleString('en-IN')}\n\nPlease share payment and delivery details.`);
        window.open(`https://wa.me/${STUDIO_CONFIG.phone}?text=${msg}`, '_blank');
      });
    }

    elements.quickViewModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.openProductDetail = (id) => {
    openQuickView(id);
  };

  const closeQuickView = () => {
    elements.quickViewModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (elements.modalCloseBtn) elements.modalCloseBtn.addEventListener('click', closeQuickView);
  if (elements.quickViewModal) {
    const backdrop = elements.quickViewModal.querySelector('.modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeQuickView);
  }

  // =================================================================
  // 9. CUSTOM ORDER FORM SUBMISSION
  // =================================================================
  if (elements.customOrderForm) {
    elements.customOrderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('custom-name').value.trim();
      const phone = document.getElementById('custom-phone').value.trim();
      const category = document.getElementById('custom-category').value;
      const details = document.getElementById('custom-details').value.trim();

      let msg = `*✨ CUSTOM ORDER INQUIRY - PRIYA STUDIO ✨*\n\n`;
      msg += `*Name:* ${name}\n`;
      msg += `*Contact:* ${phone}\n`;
      msg += `*Category Interested:* ${category}\n`;
      msg += `*Custom Requirements:* ${details}\n\n`;
      msg += `Kindly provide a quote and design preview. Thank you!`;

      const waUrl = `https://wa.me/${STUDIO_CONFIG.phone}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
      showToast('Custom request prepared! Opening WhatsApp...', 'success');
      elements.customOrderForm.reset();
    });
  }

  // =================================================================
  // 10. FAQ ACCORDION
  // =================================================================
  elements.faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        elements.faqItems.forEach(i => i.classList.remove('active'));
        if (!isOpen) {
          item.classList.add('active');
        }
      });
    }
  });

  // =================================================================
  // INITIALIZE APP
  // =================================================================
  initTheme();
  updateBadges();
  renderProducts();
  renderCart();
});
