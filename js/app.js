/* =============================================================
   CAFÉ BLOOM — app.js
   Global behavior shared across every page: navbar, mobile drawer,
   theme toggle, cart, favorites, toasts, scroll reveal, lightbox,
   homepage review slider + featured menu/gallery preview render.
   Exposes helpers on window.CafeBloom for menu.js / reservation.js.
   ============================================================= */

(function () {
  "use strict";

  /* ---------------- Storage keys ---------------- */
  const CART_KEY = "cafeBloom_cart";
  const FAV_KEY = "cafeBloom_favorites";
  const THEME_KEY = "cafeBloom_theme";

  /* ---------------- Small helpers ---------------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const formatPrice = (n) => "৳" + n.toLocaleString("en-US");

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
  }

  /* =========================================================
     THEME TOGGLE
     ========================================================= */
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");

    const btn = $("#themeToggle");
    if (!btn) return;
    updateThemeIcon();

    btn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem(THEME_KEY, "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem(THEME_KEY, "dark");
      }
      updateThemeIcon();
    });
  }
  function updateThemeIcon() {
    const btn = $("#themeToggle");
    if (!btn) return;
    const icon = btn.querySelector("i");
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }

  /* =========================================================
     NAVBAR SCROLL + MOBILE DRAWER + SEARCH
     ========================================================= */
  function initNav() {
    const header = $("#siteHeader");
    if (header) {
      const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    const hamburger = $("#hamburger");
    const drawer = $("#mobileDrawer");
    const backdrop = $("#drawerBackdrop");
    function closeDrawer() {
      hamburger && hamburger.setAttribute("aria-expanded", "false");
      drawer && drawer.classList.remove("open");
      backdrop && backdrop.classList.remove("open");
    }
    if (hamburger && drawer && backdrop) {
      hamburger.addEventListener("click", () => {
        const open = drawer.classList.toggle("open");
        hamburger.setAttribute("aria-expanded", String(open));
        backdrop.classList.toggle("open", open);
      });
      backdrop.addEventListener("click", closeDrawer);
      $$("#mobileDrawer a").forEach((a) => a.addEventListener("click", closeDrawer));
    }

    const searchToggle = $("#searchToggle");
    const navSearch = $("#navSearch");
    const searchClose = $("#searchClose");
    const quickSearch = $("#quickSearch");
    if (searchToggle && navSearch) {
      searchToggle.addEventListener("click", () => {
        const willShow = navSearch.hidden;
        navSearch.hidden = !willShow;
        searchToggle.setAttribute("aria-expanded", String(willShow));
        if (willShow) quickSearch && quickSearch.focus();
      });
    }
    if (searchClose && navSearch) {
      searchClose.addEventListener("click", () => { navSearch.hidden = true; });
    }
    if (quickSearch) {
      quickSearch.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && quickSearch.value.trim()) {
          window.location.href = "menu.html?search=" + encodeURIComponent(quickSearch.value.trim());
        }
      });
    }

    const favToggle = $("#favToggle");
    if (favToggle) {
      favToggle.addEventListener("click", () => {
        window.location.href = "menu.html?filter=favorites";
      });
    }
  }

  /* =========================================================
     TOASTS
     ========================================================= */
  function showToast(message, icon) {
    const container = $("#toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = '<i class="fa-solid ' + (icon || "fa-circle-check") + '"></i><span></span>';
    toast.querySelector("span").textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("hide");
      setTimeout(() => toast.remove(), 320);
    }, 2600);
  }

  /* =========================================================
     CART
     ========================================================= */
  function getCart() { return readJSON(CART_KEY, []); }
  function saveCart(cart) { writeJSON(CART_KEY, cart); renderCartBadge(); renderCartDrawer(); }

  function addToCart(item) {
    const cart = getCart();
    const existing = cart.find((i) => i.id === item.id);
    if (existing) existing.qty += 1;
    else cart.push({ id: item.id, name: item.name, price: item.price, image: item.image, qty: 1 });
    saveCart(cart);
    showToast(item.name + " added to cart!", "fa-bag-shopping");
    openCart();
  }
  function changeQty(id, delta) {
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty += delta;
    const filtered = cart.filter((i) => i.qty > 0);
    saveCart(filtered);
  }
  function removeFromCart(id) {
    const cart = getCart().filter((i) => i.id !== id);
    saveCart(cart);
    showToast("Removed from cart.", "fa-trash");
  }
  function cartTotal() {
    return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
  }
  function renderCartBadge() {
    const count = getCart().reduce((sum, i) => sum + i.qty, 0);
    $$("#cartCount").forEach((el) => (el.textContent = String(count)));
  }
  function renderCartDrawer() {
    const wrap = $("#cartItems");
    const subtotalEl = $("#cartSubtotal");
    if (!wrap) return;
    const cart = getCart();
    if (cart.length === 0) {
      wrap.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    } else {
      wrap.innerHTML = cart.map((item) => `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <h5>${item.name}</h5>
            <span class="price">${formatPrice(item.price)}</span>
            <div class="qty-control">
              <button class="qty-minus" aria-label="Decrease quantity">−</button>
              <span>${item.qty}</span>
              <button class="qty-plus" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button class="cart-remove" aria-label="Remove ${item.name}"><i class="fa-solid fa-xmark"></i></button>
        </div>
      `).join("");
    }
    if (subtotalEl) subtotalEl.textContent = formatPrice(cartTotal());
  }
  function openCart() {
    $("#cartDrawer") && $("#cartDrawer").classList.add("open");
    $("#cartBackdrop") && $("#cartBackdrop").classList.add("open");
    $("#cartDrawer") && $("#cartDrawer").setAttribute("aria-hidden", "false");
  }
  function closeCart() {
    $("#cartDrawer") && $("#cartDrawer").classList.remove("open");
    $("#cartBackdrop") && $("#cartBackdrop").classList.remove("open");
    $("#cartDrawer") && $("#cartDrawer").setAttribute("aria-hidden", "true");
  }
  function initCart() {
    renderCartBadge();
    renderCartDrawer();
    $("#cartToggle") && $("#cartToggle").addEventListener("click", openCart);
    $("#cartClose") && $("#cartClose").addEventListener("click", closeCart);
    $("#cartBackdrop") && $("#cartBackdrop").addEventListener("click", closeCart);
    const wrap = $("#cartItems");
    if (wrap) {
      wrap.addEventListener("click", (e) => {
        const row = e.target.closest(".cart-item");
        if (!row) return;
        const id = row.getAttribute("data-id");
        if (e.target.closest(".qty-plus")) changeQty(id, 1);
        else if (e.target.closest(".qty-minus")) changeQty(id, -1);
        else if (e.target.closest(".cart-remove")) removeFromCart(id);
      });
    }
    const checkoutBtn = $("#checkoutBtn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        if (getCart().length === 0) { showToast("Your cart is empty.", "fa-bag-shopping"); return; }
        showToast("Demo checkout — payment integration is not connected.", "fa-circle-info");
      });
    }
  }

  /* =========================================================
     FAVORITES
     ========================================================= */
  function getFavorites() { return readJSON(FAV_KEY, []); }
  function isFavorite(id) { return getFavorites().includes(id); }
  function toggleFavorite(id, btnEl, name) {
    let favs = getFavorites();
    const active = favs.includes(id);
    if (active) {
      favs = favs.filter((f) => f !== id);
      showToast("Removed from favorites.", "fa-heart-crack");
    } else {
      favs.push(id);
      showToast((name || "Item") + " added to favorites!", "fa-heart");
    }
    writeJSON(FAV_KEY, favs);
    renderFavBadge();
    if (btnEl) {
      btnEl.classList.toggle("active", !active);
      btnEl.querySelector("i").className = !active ? "fa-solid fa-heart" : "fa-regular fa-heart";
      btnEl.classList.add("pulse");
      setTimeout(() => btnEl.classList.remove("pulse"), 400);
    }
    return !active;
  }
  function renderFavBadge() {
    $$("#favCount").forEach((el) => (el.textContent = String(getFavorites().length)));
  }

  /* =========================================================
     SCROLL REVEAL
     ========================================================= */
  function initReveal() {
    const targets = $$(".reveal");
    if (!targets.length) return;
    if (!("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach((t) => io.observe(t));
  }

  /* =========================================================
     MENU CARD BUILDER (shared with menu.js)
     ========================================================= */
  function createMenuCard(item) {
    const fav = isFavorite(item.id);
    const card = document.createElement("article");
    card.className = "menu-card";
    card.setAttribute("data-category", item.category);
    card.setAttribute("data-name", item.name.toLowerCase());
    card.innerHTML = `
      <div class="menu-card-media">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <button class="menu-fav ${fav ? "active" : ""}" aria-label="Add ${item.name} to favorites" aria-pressed="${fav}">
          <i class="fa-${fav ? "solid" : "regular"} fa-heart"></i>
        </button>
      </div>
      <div class="menu-card-body">
        <span class="menu-card-cat">${item.category}</span>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="menu-card-rating" aria-label="${item.rating} out of 5 stars">${"★".repeat(Math.round(item.rating))}${"☆".repeat(5 - Math.round(item.rating))}</div>
        <div class="menu-card-footer">
          <span class="menu-card-price">${formatPrice(item.price)}</span>
          <button class="add-cart-btn"><i class="fa-solid fa-bag-shopping"></i> Add</button>
        </div>
      </div>
    `;
    card.querySelector(".menu-fav").addEventListener("click", (e) => {
      toggleFavorite(item.id, e.currentTarget, item.name);
    });
    card.querySelector(".add-cart-btn").addEventListener("click", () => addToCart(item));
    return card;
  }

  /* =========================================================
     HOMEPAGE — FEATURED MENU
     ========================================================= */
  const FEATURED_ITEMS = [
    { id: "f1", name: "Caramel Macchiato", category: "Coffee", price: 320, rating: 4.8, description: "Espresso, steamed milk and a ribbon of caramel.", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop" },
    { id: "f2", name: "Classic Cappuccino", category: "Coffee", price: 280, rating: 4.7, description: "Bold espresso topped with a thick layer of foam.", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=800&auto=format&fit=crop" },
    { id: "f3", name: "Avocado Toast", category: "Breakfast", price: 420, rating: 4.6, description: "Sourdough, smashed avocado, chili flakes and lime.", image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?q=80&w=800&auto=format&fit=crop" },
    { id: "f4", name: "Chocolate Croissant", category: "Desserts", price: 220, rating: 4.9, description: "Buttery, flaky pastry filled with dark chocolate.", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop" },
    { id: "f5", name: "Creamy Pasta", category: "Main Course", price: 520, rating: 4.7, description: "Slow-simmered cream sauce with herbs and parmesan.", image: "images/creamy-pasta.jpg"},
    { id: "f6", name: "Berry Cheesecake", category: "Desserts", price: 350, rating: 4.9, description: "Silky baked cheesecake topped with mixed berries.", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop" },
  ];
  function initFeaturedMenu() {
    const grid = $("#featuredMenuGrid");
    if (!grid) return;
    FEATURED_ITEMS.forEach((item) => grid.appendChild(createMenuCard(item)));
  }

  /* =========================================================
     HOMEPAGE — GALLERY PREVIEW + LIGHTBOX (shared with gallery.html)
     ========================================================= */
  const PREVIEW_IMAGES = [
    { src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=900&auto=format&fit=crop", alt: "Latte art in a ceramic cup on a wooden table" },
    { src: "https://images.unsplash.com/photo-1481833761820-0509d3217039?q=80&w=900&auto=format&fit=crop", alt: "Fresh pastries arranged on a bakery counter" },
    { src: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=900&auto=format&fit=crop" , alt: "Coffee beans in a wooden scoop"},
    { src: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=900&auto=format&fit=crop", alt: "Barista pouring milk into a cup of coffee" },
    { src: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=900&auto=format&fit=crop", alt: "Slice of cheesecake plated with berries" },
    { src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=900&auto=format&fit=crop", alt: "Cozy café seating area with warm lighting" },
  ];
  let lightboxImages = [];
  let lightboxIndex = 0;

  function initGalleryPreview() {
    const grid = $("#galleryPreviewGrid");
    if (!grid) return;
    lightboxImages = PREVIEW_IMAGES;
    grid.innerHTML = PREVIEW_IMAGES.map((img, i) => `
      <button class="gallery-item" data-index="${i}" aria-label="View larger image: ${img.alt}">
        <img src="${img.src}" alt="${img.alt}" loading="lazy">
      </button>
    `).join("");
    $$(".gallery-item", grid).forEach((btn) => {
      btn.addEventListener("click", () => openLightbox(Number(btn.getAttribute("data-index"))));
    });
  }

  function openLightbox(index) {
    const lightbox = $("#lightbox");
    if (!lightbox || !lightboxImages.length) return;
    lightboxIndex = index;
    updateLightbox();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function updateLightbox() {
    const img = $("#lightboxImg");
    const count = $("#lightboxCount");
    const item = lightboxImages[lightboxIndex];
    if (img) { img.src = item.src; img.alt = item.alt; }
    if (count) count.textContent = (lightboxIndex + 1) + " / " + lightboxImages.length;
  }
  function closeLightbox() {
    const lightbox = $("#lightbox");
    if (lightbox) lightbox.hidden = true;
    document.body.style.overflow = "";
  }
  function initLightboxControls() {
    $("#lightboxClose") && $("#lightboxClose").addEventListener("click", closeLightbox);
    $("#lightboxNext") && $("#lightboxNext").addEventListener("click", () => {
      lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
      updateLightbox();
    });
    $("#lightboxPrev") && $("#lightboxPrev").addEventListener("click", () => {
      lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
      updateLightbox();
    });
    document.addEventListener("keydown", (e) => {
      const lightbox = $("#lightbox");
      if (!lightbox || lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") $("#lightboxNext") && $("#lightboxNext").click();
      if (e.key === "ArrowLeft") $("#lightboxPrev") && $("#lightboxPrev").click();
    });
  }

  /* =========================================================
     GALLERY PAGE — FULL GRID + CATEGORY FILTER (gallery.html)
     ========================================================= */
  const GALLERY_ITEMS = [

    { src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=900&auto=format&fit=crop", alt: "Latte art in a ceramic cup", category: "Coffee" },

    { src: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=900&auto=format&fit=crop", alt: "Coffee beans in a wooden scoop", category: "Coffee" },

    { src: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=900&auto=format&fit=crop", alt: "Barista pouring milk into a cup", category: "Coffee" },

    { src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=900&auto=format&fit=crop", alt: "Espresso shot being pulled", category: "Coffee" },

    { src: "https://images.unsplash.com/photo-1481833761820-0509d3217039?q=80&w=900&auto=format&fit=crop", alt: "Fresh pastries on a bakery counter", category: "Food" },

    { src: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=900&auto=format&fit=crop", alt: "Slice of cheesecake plated with berries", category: "Food" },

    { src: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?q=80&w=900&auto=format&fit=crop", alt: "Avocado toast on a wooden board", category: "Food" },

    { src: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=900&auto=format&fit=crop", alt: "Berry cheesecake close-up", category: "Food" },

    { src: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=900&auto=format&fit=crop", alt: "Sunlit café interior with wooden tables", category: "Interior" },

    { src: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=900&auto=format&fit=crop", alt: "Café seating area with warm lighting", category: "Interior" },

    { src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=900&auto=format&fit=crop", alt: "Cozy corner seating with plants", category: "Interior" },

    { src: "https://images.unsplash.com/photo-1481833761820-0509d3217039?q=80&w=900&auto=format&fit=crop&sat=-20", alt: "Bakery display counter", category: "Interior" },

    { src: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=900&auto=format&fit=crop&sat=-40", alt: "Barista smiling while preparing an order", category: "People" },

    { src: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=900&auto=format&fit=crop&flip=h", alt: "Guests chatting over coffee", category: "People" },

  {
    src: "images/gallery-1.jpeg",
    alt: "Latte art at Café Bloom",
    category: "Coffee"
  },
  {
    src: "images/gallery-2.jpeg",
    alt: "Fresh coffee at Café Bloom",
    category: "Coffee"
  },
  {
    src: "images/gallery-3.jpeg",
    alt: "Coffee beans and café details",
    category: "Coffee"
  },
  {
    src: "images/gallery-4.jpeg",
    alt: "Delicious food served at Café Bloom",
    category: "Coffee"
  },
  {
    src: "images/gallery-5.jpeg",
    alt: "Fresh dessert at Café Bloom",
    category: "Coffee"
  },
  {
    src: "images/gallery-6.jpeg",
    alt: "Beautiful café interior",
    category: "Coffee"
  },
  {
    src: "images/gallery-9.jpeg",
    alt: "Cozy seating area at Café Bloom",
    category: "Coffee"
  },
  {
    src: "images/gallery-8.jpeg",
    alt: "Barista preparing coffee",
    category: "Coffee"
  },
  {
    src: "images/gallery-7.jpeg",
    alt: "Guests enjoying Café Bloom",
    category: "People"
  }
  
];

  function initGalleryFull() {
    const grid = $("#galleryFullGrid");
    if (!grid) return;

    lightboxImages = GALLERY_ITEMS;

    function render(filter) {
      grid.innerHTML = GALLERY_ITEMS.map((img, i) => {
        const hidden = filter !== "all" && img.category !== filter;
        return `
          <button class="gallery-item${hidden ? " hidden-item" : ""}" data-index="${i}" data-category="${img.category}" aria-label="View larger image: ${img.alt}">
            <img src="${img.src}" alt="${img.alt}" loading="lazy">
          </button>
        `;
      }).join("");
      $$(".gallery-item", grid).forEach((btn) => {
        btn.addEventListener("click", () => openLightbox(Number(btn.getAttribute("data-index"))));
      });
    }
    render("all");

    const buttons = $$("#galleryFilters .filter-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        render(btn.getAttribute("data-filter"));
      });
    });
  }

  /* =========================================================
     HOMEPAGE — REVIEW SLIDER
     ========================================================= */
  function initReviewSlider() {
    const track = $("#reviewTrack");
    const dotsWrap = $("#reviewDots");
    if (!track || !dotsWrap) return;
    const slides = $$(".review-card", track);
    let current = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", "Go to review " + (i + 1));
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function goTo(i) {
      current = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + current * 100 + "%)";
      $$(".dot", dotsWrap).forEach((d, idx) => d.classList.toggle("active", idx === current));
    }

    $("#reviewNext") && $("#reviewNext").addEventListener("click", () => goTo(current + 1));
    $("#reviewPrev") && $("#reviewPrev").addEventListener("click", () => goTo(current - 1));

    let autoplay = setInterval(() => goTo(current + 1), 6000);
    const slider = $("#reviewSlider");
    slider && slider.addEventListener("mouseenter", () => clearInterval(autoplay));
    slider && slider.addEventListener("mouseleave", () => { autoplay = setInterval(() => goTo(current + 1), 6000); });
  }

  /* =========================================================
     ANIMATED STAT COUNTERS (about.html)
     ========================================================= */
  function initCounters() {
    const counters = $$(".counter");
    if (!counters.length) return;

    function animateCounter(el) {
      const target = Number(el.getAttribute("data-target")) || 0;
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = String(target);
      }
      requestAnimationFrame(tick);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => io.observe(c));
  }

  /* =========================================================
     NEWSLETTER
     ========================================================= */
  function initNewsletter() {
    const form = $("#newsletterForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("#newsletterEmail");
      const value = input.value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!valid) {
        showToast("Please enter a valid email address.", "fa-circle-exclamation");
        input.focus();
        return;
      }
      showToast("Newsletter subscription successful!", "fa-envelope-circle-check");
      form.reset();
    });
  }

  /* =========================================================
     INIT
     ========================================================= */
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initNav();
    initCart();
    renderFavBadge();
    initReveal();
    initFeaturedMenu();
    initGalleryPreview();
    initGalleryFull();
    initLightboxControls();
    initReviewSlider();
    initNewsletter();
    initCounters();
  });

  /* Expose shared helpers for menu.js / reservation.js / gallery pages */
  window.CafeBloom = {
    formatPrice,
    showToast,
    addToCart,
    getCart,
    isFavorite,
    toggleFavorite,
    createMenuCard,
    openLightbox,
    setLightboxImages: (imgs) => { lightboxImages = imgs; },
  };
})();
