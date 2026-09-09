/* =============================================================
   CAFÉ BLOOM — menu.js
   Handles: full menu data, category filtering, live search,
   rendering menu cards (via window.CafeBloom.createMenuCard),
   and reading ?search= / ?filter=favorites from the URL.
   ============================================================= */

(function () {
  "use strict";

  const MENU_ITEMS = [
    { id: "m1", name: "Caramel Macchiato", category: "Coffee", price: 320, rating: 4.8, description: "Espresso, steamed milk and a ribbon of caramel.", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop" },
    { id: "m2", name: "Classic Cappuccino", category: "Coffee", price: 280, rating: 4.7, description: "Bold espresso topped with a thick layer of foam.", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=800&auto=format&fit=crop" },
    { id: "m3", name: "Vanilla Latte", category: "Coffee", price: 300, rating: 4.6, description: "Smooth espresso and milk sweetened with vanilla.", image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=800&auto=format&fit=crop" },
    { id: "m4", name: "Cold Brew", category: "Coffee", price: 260, rating: 4.5, description: "Slow-steeped for 18 hours, smooth and low in acidity.", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop&sat=-30" },
    { id: "m5", name: "Avocado Toast", category: "Breakfast", price: 420, rating: 4.6, description: "Sourdough, smashed avocado, chili flakes and lime.", image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?q=80&w=800&auto=format&fit=crop" },
    { id: "m6", name: "Belgian Waffles", category: "Breakfast", price: 380, rating: 4.7, description: "Crisp waffles with maple syrup and fresh berries.", image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?q=80&w=800&auto=format&fit=crop" },
    { id: "m7", name: "Classic Omelette", category: "Breakfast", price: 340, rating: 4.4, description: "Three eggs, herbs, cheese and a side of toast.", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop" },
    { id: "m8", name: "Creamy Pasta", category: "Main Course", price: 520, rating: 4.7, description: "Slow-simmered cream sauce with herbs and parmesan.", image: "images/creamy-pasta.jpg" },
    { id: "m9", name: "Grilled Chicken Sandwich", category: "Main Course", price: 460, rating: 4.6, description: "Toasted brioche, grilled chicken, and house sauce.", image: "images/grilled-chicken-sandwich.jpg" },
    { id: "m10", name: "Margherita Flatbread", category: "Main Course", price: 480, rating: 4.5, description: "Wood-fired flatbread with tomato, basil and mozzarella.", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop" },
    { id: "m11", name: "Chocolate Croissant", category: "Desserts", price: 220, rating: 4.9, description: "Buttery, flaky pastry filled with dark chocolate.", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop" },
    { id: "m12", name: "Berry Cheesecake", category: "Desserts", price: 350, rating: 4.9, description: "Silky baked cheesecake topped with mixed berries.", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop" },
    { id: "m13", name: "Tiramisu", category: "Desserts", price: 380, rating: 4.8, description: "Espresso-soaked layers with mascarpone cream.", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=800&auto=format&fit=crop" },
    { id: "m14", name: "Fresh Orange Juice", category: "Drinks", price: 210, rating: 4.5, description: "Cold-pressed oranges, no added sugar.", image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=800&auto=format&fit=crop" },
    { id: "m15", name: "Iced Lemon Mint", category: "Drinks", price: 190, rating: 4.4, description: "Fresh lemon, mint and soda over ice.", image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=800&auto=format&fit=crop" },
    { id: "m16", name: "Berry Smoothie", category: "Drinks", price: 260, rating: 4.6, description: "Blended strawberries, blueberries and yogurt.", image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?q=80&w=800&auto=format&fit=crop" },
  ];

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  let activeCategory = "all";
  let activeQuery = "";
  let favoritesOnly = false;

  function renderMenu() {
    const grid = $("#menuGrid");
    const emptyMsg = $("#menuEmpty");
    if (!grid) return;
    grid.innerHTML = "";

    const cf = window.CafeBloom;
    const query = activeQuery.trim().toLowerCase();

    const filtered = MENU_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const matchesQuery = !query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
      const matchesFav = !favoritesOnly || (cf && cf.isFavorite(item.id));
      return matchesCategory && matchesQuery && matchesFav;
    });

    if (filtered.length === 0) {
      emptyMsg.hidden = false;
      return;
    }
    emptyMsg.hidden = true;

    filtered.forEach((item) => {
      if (cf && cf.createMenuCard) grid.appendChild(cf.createMenuCard(item));
    });
  }

  function initFilters() {
    const buttons = $$(".filter-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        activeCategory = btn.getAttribute("data-filter");
        favoritesOnly = false;
        renderMenu();
      });
    });
  }

  function initSearch() {
    const input = $("#menuSearch");
    if (!input) return;
    input.addEventListener("input", () => {
      activeQuery = input.value;
      renderMenu();
    });
  }

  function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search");
    const filter = params.get("filter");
    if (search) {
      activeQuery = search;
      const input = $("#menuSearch");
      if (input) input.value = search;
    }
    if (filter === "favorites") {
      favoritesOnly = true;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyUrlParams();
    initFilters();
    initSearch();
    renderMenu();
  });
})();
