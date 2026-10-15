(function () {
  "use strict";

  const data = window.MENU_DATA;
  if (!data) {
    console.error("MENU_DATA is missing. Load js/menu.js before js/app.js.");
    return;
  }

  const { restaurant, categories, items } = data;
  const state = {
    cart: loadCart(),
    query: "",
    filters: new Set(),
    activeCategory: categories[0].id,
    detailItem: null,
    detailQty: 1,
    toastTimer: null
  };
  let sectionObserver;

  const els = {
    categoryTabs: document.querySelector("#categoryTabs"),
    menuSections: document.querySelector("#menuSections"),
    searchInput: document.querySelector("#searchInput"),
    clearSearch: document.querySelector("#clearSearch"),
    filterPills: document.querySelector("#filterPills"),
    cartSidebar: document.querySelector("#cartSidebar"),
    cartDrawer: document.querySelector("#cartDrawer"),
    cartDrawerContent: document.querySelector("#cartDrawerContent"),
    drawerBackdrop: document.querySelector("#drawerBackdrop"),
    mobileCartBar: document.querySelector("#mobileCartBar"),
    headerCartButton: document.querySelector("#headerCartButton"),
    closeCartButton: document.querySelector("#closeCartButton"),
    itemDialog: document.querySelector("#itemDialog"),
    itemDialogContent: document.querySelector("#itemDialogContent"),
    checkoutDialog: document.querySelector("#checkoutDialog"),
    checkoutForm: document.querySelector("#checkoutForm"),
    checkoutSummary: document.querySelector("#checkoutSummary"),
    checkoutError: document.querySelector("#checkoutError"),
    deliveryFields: document.querySelector("#deliveryFields"),
    pickupFields: document.querySelector("#pickupFields"),
    confirmationDialog: document.querySelector("#confirmationDialog"),
    toast: document.querySelector("#toast"),
    orderNowButton: document.querySelector("#orderNowButton")
  };

  hydrateRestaurant();
  renderTabs();
  renderMenu();
  renderCart();
  bindEvents();
  observeSections();

  function hydrateRestaurant() {
    document.querySelectorAll("[data-restaurant-name]").forEach((el) => { el.textContent = restaurant.name; });
    document.querySelector("[data-tagline]").textContent = restaurant.tagline;
    document.querySelector("[data-open-status]").textContent = restaurant.openLabel;
    document.querySelector("[data-hours]").textContent = restaurant.shortHours;
    document.querySelector("[data-hours-full]").textContent = restaurant.fullHours;
    document.querySelector("[data-address]").textContent = restaurant.address;
    document.querySelector("[data-pickup-address]").textContent = restaurant.address;
    document.querySelector("[data-phone-display]").textContent = restaurant.phoneDisplay;
    document.querySelectorAll("[data-phone-link]").forEach((el) => { el.href = `tel:${restaurant.phoneLink}`; });
    document.querySelector("[data-map-link]").href = restaurant.mapUrl;
  }

  function renderTabs() {
    els.categoryTabs.innerHTML = categories.map((category, index) => `
      <button class="category-tab" type="button" data-category="${category.id}" aria-current="${index === 0}">
        <span>${category.name}</span>
      </button>`).join("");
  }

  function renderMenu() {
    const query = normalize(state.query);
    const filtered = items.filter((item) => {
      const matchesText = !query || normalize(`${item.name} ${item.description}`).includes(query);
      const matchesFilters = [...state.filters].every((filter) => item.tags.includes(filter));
      return matchesText && matchesFilters;
    });

    const sections = categories.map((category) => {
      const categoryItems = filtered.filter((item) => item.category === category.id);
      if (!categoryItems.length) return "";
      return `
        <section class="menu-section" id="section-${category.id}" data-section="${category.id}" aria-labelledby="title-${category.id}">
          <div class="section-title"><h3 id="title-${category.id}">${category.name}</h3><span>${categoryItems.length} أصناف</span></div>
          <div class="menu-grid">${categoryItems.map(cardTemplate).join("")}</div>
        </section>`;
    }).join("");

    els.menuSections.innerHTML = sections || `<div class="no-results"><span aria-hidden="true">🔎</span><strong>ملقيناش الصنف ده</strong><p>جرّب كلمة تانية أو امسح الفلاتر.</p></div>`;
    observeSections();
  }

  function cardTemplate(item) {
    return `
      <article class="menu-card" data-item-card="${item.id}">
        <button class="card__media" type="button" data-details="${item.id}" aria-label="تفاصيل ${item.name}">
          ${pictureTemplate(item, "card")}
          ${item.badge ? `<span class="card__badge">${item.badge}</span>` : ""}
        </button>
        <div class="card__body">
          <div class="card__title-row"><h4>${item.name}</h4><span class="card__price">${money(item.price)}</span></div>
          <p class="card__description">${item.description}</p>
          <div class="card__actions">
            <button class="quick-add" type="button" data-quick-add="${item.id}">أضف للسلة</button>
            <button class="details-button" type="button" data-details="${item.id}">تفاصيل</button>
          </div>
        </div>
      </article>`;
  }

  function pictureTemplate(item, context) {
    const sizes = context === "dialog" ? "(min-width: 48rem) 42rem, 100vw" : "(min-width: 80rem) 18rem, (min-width: 48rem) 33vw, 50vw";
    return `<picture>
      <source type="image/avif" srcset="assets/images/${item.image}-480.avif 480w, assets/images/${item.image}-800.avif 800w" sizes="${sizes}">
      <img src="assets/images/${item.image}-800.jpg" width="800" height="600" alt="${item.alt}" loading="lazy" decoding="async">
    </picture>`;
  }

  function renderCart() {
    const panel = cartTemplate();
    els.cartSidebar.innerHTML = panel;
    els.cartDrawerContent.innerHTML = panel;

    const count = cartCount();
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = number(count);
      el.hidden = count === 0 && el !== els.mobileCartBar;
    });
    document.querySelectorAll("[data-cart-total]").forEach((el) => { el.textContent = money(subtotal()); });
    els.mobileCartBar.hidden = count === 0;
    saveCart();
  }

  function cartTemplate() {
    if (!state.cart.length) {
      return `<div class="cart-panel"><div class="cart-panel__header"><div><span class="eyebrow">طلبك</span><h3>السلة</h3></div><span>0 أصناف</span></div><div class="empty-cart">
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 3h2l2.1 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 7H6"/><path d="M9 20h.01M18 20h.01"/></svg>
        <h4>السلة مستنية اختيارك</h4><p>ابدأ بصنف من الأكثر طلبًا، وهتلاقي كل التفاصيل هنا.</p></div></div>`;
    }

    const subtotalValue = subtotal();
    const remaining = Math.max(restaurant.freeDeliveryAt - subtotalValue, 0);
    const progress = Math.min((subtotalValue / restaurant.freeDeliveryAt) * 100, 100);
    return `<div class="cart-panel">
      <div class="cart-panel__header"><div><span class="eyebrow">طلبك</span><h3>السلة</h3></div><span>${number(cartCount())} أصناف</span></div>
      <div class="cart-items">${state.cart.map(cartItemTemplate).join("")}</div>
      <div class="cart-summary">
        <div class="delivery-progress"><p>${remaining ? `زود ${money(remaining)} والتوصيل علينا` : "وصلت للتوصيل المجاني 🎉"}</p><div class="progress-track"><div class="progress-fill" style="inline-size:${progress}%"></div></div></div>
        <div class="summary-row"><span>الإجمالي الفرعي</span><strong>${money(subtotalValue)}</strong></div>
        <div class="summary-row"><span>التوصيل</span><strong>حسب طريقة الاستلام</strong></div>
        <div class="summary-row summary-row--total"><span>الإجمالي المبدئي</span><strong>${money(subtotalValue)}</strong></div>
        <button class="button button--primary button--full" type="button" data-checkout>إتمام الطلب</button>
      </div>
    </div>`;
  }

  function cartItemTemplate(entry) {
    const item = items.find((candidate) => candidate.id === entry.id);
    const extras = entry.selections.map((selection) => selection.name).join("، ");
    return `<div class="cart-item" data-cart-key="${entry.key}">
      <img class="cart-item__image" src="assets/images/${item.image}-480.avif" width="96" height="96" alt="" loading="lazy">
      <div class="cart-item__details"><strong>${item.name}</strong>${extras ? `<small>${extras}</small>` : ""}
        <div class="quantity-control" aria-label="كمية ${item.name}"><button type="button" data-decrease="${entry.key}" aria-label="تقليل الكمية">−</button><span>${number(entry.qty)}</span><button type="button" data-increase="${entry.key}" aria-label="زيادة الكمية">+</button></div>
      </div><span class="cart-item__price">${money(entry.unitPrice * entry.qty)}</span>
    </div>`;
  }

  function openItem(itemId) {
    const item = items.find((candidate) => candidate.id === itemId);
    if (!item) return;
    state.detailItem = item;
    state.detailQty = 1;
    els.itemDialogContent.innerHTML = itemDialogTemplate(item);
    showDialog(els.itemDialog);
  }

  function itemDialogTemplate(item) {
    const groups = item.options.map((group, groupIndex) => {
      const type = group.multiple ? "checkbox" : "radio";
      return `<fieldset class="option-group"><legend>${group.group}${group.required ? " *" : ""}</legend><div class="option-list">${group.choices.map((choice, choiceIndex) => `
        <label class="option-choice"><input type="${type}" name="option-${groupIndex}" value="${choice.name}" data-option-price="${choice.price}" ${!group.multiple && choiceIndex === 0 ? "checked" : ""}><span>${choice.name}</span><small>${choice.price ? `+ ${money(choice.price)}` : "بدون زيادة"}</small></label>`).join("")}</div></fieldset>`;
    }).join("");

    return `<div class="dialog-item-media">${pictureTemplate(item, "dialog")}</div><div class="dialog-item-body">
      <div class="dialog-item-head"><h2 id="itemDialogTitle">${item.name}</h2><p>${item.description}</p><span class="dialog-base-price">يبدأ من ${money(item.price)}</span></div>
      <form id="itemOptionsForm">${groups}<label class="notes-field"><span>ملاحظات للمطبخ</span><textarea name="notes" maxlength="140" placeholder="مثال: من غير مخلل"></textarea></label>
      <div class="dialog-action-row"><div class="dialog-qty"><button type="button" data-dialog-decrease aria-label="تقليل الكمية">−</button><span data-dialog-qty>١</span><button type="button" data-dialog-increase aria-label="زيادة الكمية">+</button></div><button class="button button--primary" type="submit" data-dialog-add>أضف · ${money(item.price)}</button></div></form>
    </div>`;
  }

  function addQuick(itemId) {
    const item = items.find((candidate) => candidate.id === itemId);
    if (!item) return;
    if (item.options.length) {
      openItem(itemId);
      return;
    }
    addToCart(item, [], "", 1);
  }

  function addDetailedItem(form) {
    if (!state.detailItem) return;
    const selections = [...form.querySelectorAll("input:checked")].map((input) => ({ name: input.value, price: Number(input.dataset.optionPrice) || 0 }));
    const notes = form.elements.notes.value.trim();
    addToCart(state.detailItem, selections, notes, state.detailQty);
    els.itemDialog.close();
  }

  function addToCart(item, selections, notes, qty) {
    const optionKey = selections.map((selection) => selection.name).sort().join("|");
    const key = `${item.id}::${optionKey}::${notes}`;
    const existing = state.cart.find((entry) => entry.key === key);
    const unitPrice = item.price + selections.reduce((sum, selection) => sum + selection.price, 0);
    if (existing) existing.qty += qty;
    else state.cart.push({ key, id: item.id, qty, unitPrice, selections, notes });
    renderCart();
    pulseCard(item.id);
    showToast(`اتضاف ${item.name} للسلة`);
  }

  function changeQuantity(key, direction) {
    const entry = state.cart.find((item) => item.key === key);
    if (!entry) return;
    entry.qty += direction;
    if (entry.qty <= 0) state.cart = state.cart.filter((item) => item.key !== key);
    renderCart();
  }

  function openCart() {
    els.cartDrawer.setAttribute("aria-hidden", "false");
    els.drawerBackdrop.hidden = false;
    document.body.classList.add("is-locked");
    requestAnimationFrame(() => {
      els.cartDrawer.classList.add("is-open");
      els.drawerBackdrop.classList.add("is-visible");
    });
    setTimeout(() => els.closeCartButton.focus(), 210);
  }

  function closeCart() {
    els.cartDrawer.classList.remove("is-open");
    els.drawerBackdrop.classList.remove("is-visible");
    els.cartDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    setTimeout(() => { els.drawerBackdrop.hidden = true; }, 190);
  }

  function openCheckout() {
    if (!state.cart.length) return;
    closeCart();
    clearCheckoutError();
    syncFulfillmentFields(els.checkoutForm.elements.orderType.value);
    updateCheckoutSummary();
    showDialog(els.checkoutDialog);
  }

  function updateCheckoutSummary() {
    const subtotalValue = subtotal();
    const isDelivery = document.querySelector('input[name="orderType"]:checked')?.value === "توصيل";
    const delivery = isDelivery && subtotalValue < restaurant.freeDeliveryAt ? restaurant.deliveryFee : 0;
    const feeLabel = isDelivery ? "التوصيل" : "الاستلام من الفرع";
    const feeValue = isDelivery ? (delivery ? money(delivery) : "مجاني") : "بدون رسوم";
    els.checkoutSummary.innerHTML = `<div><span>${number(cartCount())} أصناف</span><span>${money(subtotalValue)}</span></div><div><span>${feeLabel}</span><span>${feeValue}</span></div><div><strong>الإجمالي</strong><strong>${money(subtotalValue + delivery)}</strong></div>`;
  }

  function submitCheckout(form) {
    const formData = new FormData(form);
    const orderType = formData.get("orderType");
    const required = [form.elements.name, form.elements.phone];
    if (orderType === "توصيل") required.push(form.elements.address);
    let invalid = false;
    required.forEach((field) => {
      const missing = !field.value.trim();
      field.setAttribute("aria-invalid", String(missing));
      if (missing) invalid = true;
    });
    if (invalid) {
      const firstInvalid = required.find((field) => !field.value.trim());
      showCheckoutError("كمّل البيانات المطلوبة عشان نجهّز رسالة الطلب.");
      firstInvalid?.scrollIntoView({ block: "center", behavior: reduceMotion() ? "auto" : "smooth" });
      firstInvalid?.focus({ preventScroll: true });
      return;
    }

    const subtotalValue = subtotal();
    const delivery = orderType === "توصيل" && subtotalValue < restaurant.freeDeliveryAt ? restaurant.deliveryFee : 0;
    const lines = state.cart.map((entry) => {
      const item = items.find((candidate) => candidate.id === entry.id);
      const details = entry.selections.length ? ` (${entry.selections.map((selection) => selection.name).join("، ")})` : "";
      const notes = entry.notes ? `\n  ملاحظة: ${entry.notes}` : "";
      return `• ${entry.qty} × ${item.name}${details} — ${money(entry.unitPrice * entry.qty)}${notes}`;
    }).join("\n");
    const addressLine = orderType === "توصيل" ? `\nالعنوان: ${formData.get("address")}` : "";
    const pickupLine = orderType === "استلام من المطعم" ? `\nميعاد الاستلام: ${formData.get("pickupTime")}\nالفرع: ${restaurant.address}` : "";
    const fulfillmentFeeLine = orderType === "توصيل" ? `التوصيل: ${delivery ? money(delivery) : "مجاني"}` : "الاستلام من الفرع: بدون رسوم";
    const message = `طلب جديد من موقع ${restaurant.name}\n\n${lines}\n\nالإجمالي الفرعي: ${money(subtotalValue)}\n${fulfillmentFeeLine}\nالإجمالي: ${money(subtotalValue + delivery)}\n\nطريقة الاستلام: ${orderType}\nالاسم: ${formData.get("name")}\nالموبايل: ${formData.get("phone")}${addressLine}${pickupLine}\n\nبرجاء تأكيد الطلب والوقت المتوقع.`;
    const whatsappUrl = `https://wa.me/${restaurant.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener");
    els.checkoutDialog.close();
    showDialog(els.confirmationDialog);
  }

  function bindEvents() {
    els.orderNowButton.addEventListener("click", () => document.querySelector("#menu").scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth" }));
    els.categoryTabs.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      document.querySelector(`#section-${button.dataset.category}`)?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
    });
    els.searchInput.addEventListener("input", (event) => {
      state.query = event.target.value;
      els.clearSearch.hidden = !state.query;
      renderMenu();
    });
    els.clearSearch.addEventListener("click", () => {
      state.query = "";
      els.searchInput.value = "";
      els.clearSearch.hidden = true;
      renderMenu();
      els.searchInput.focus();
    });
    els.filterPills.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      const filter = button.dataset.filter;
      state.filters.has(filter) ? state.filters.delete(filter) : state.filters.add(filter);
      button.setAttribute("aria-pressed", String(state.filters.has(filter)));
      renderMenu();
    });
    els.menuSections.addEventListener("click", (event) => {
      const details = event.target.closest("[data-details]");
      const add = event.target.closest("[data-quick-add]");
      if (details) openItem(details.dataset.details);
      if (add) addQuick(add.dataset.quickAdd);
    });
    document.addEventListener("click", (event) => {
      const increase = event.target.closest("[data-increase]");
      const decrease = event.target.closest("[data-decrease]");
      const checkout = event.target.closest("[data-checkout]");
      if (increase) changeQuantity(increase.dataset.increase, 1);
      if (decrease) changeQuantity(decrease.dataset.decrease, -1);
      if (checkout) openCheckout();
    });
    els.mobileCartBar.addEventListener("click", openCart);
    els.headerCartButton.addEventListener("click", openCart);
    els.closeCartButton.addEventListener("click", closeCart);
    els.drawerBackdrop.addEventListener("click", closeCart);
    els.itemDialog.addEventListener("click", (event) => { if (event.target === els.itemDialog || event.target.closest("[data-close-dialog]")) els.itemDialog.close(); });
    els.itemDialogContent.addEventListener("click", (event) => {
      if (event.target.closest("[data-dialog-increase]")) state.detailQty += 1;
      if (event.target.closest("[data-dialog-decrease]")) state.detailQty = Math.max(1, state.detailQty - 1);
      if (event.target.closest("[data-dialog-increase], [data-dialog-decrease]")) updateDialogPrice();
    });
    els.itemDialogContent.addEventListener("change", updateDialogPrice);
    els.itemDialogContent.addEventListener("submit", (event) => { event.preventDefault(); addDetailedItem(event.target); });
    els.checkoutDialog.addEventListener("click", (event) => { if (event.target === els.checkoutDialog || event.target.closest("[data-close-checkout]")) els.checkoutDialog.close(); });
    els.checkoutForm.addEventListener("change", (event) => {
      if (event.target.name !== "orderType") return;
      syncFulfillmentFields(event.target.value);
    });
    els.checkoutForm.addEventListener("input", (event) => {
      if (event.target.matches("input, select")) event.target.removeAttribute("aria-invalid");
      clearCheckoutError();
    });
    els.checkoutForm.addEventListener("submit", (event) => { event.preventDefault(); submitCheckout(event.target); });
    els.confirmationDialog.addEventListener("click", (event) => { if (event.target === els.confirmationDialog || event.target.closest("[data-close-confirmation]")) els.confirmationDialog.close(); });
    window.addEventListener("keydown", (event) => { if (event.key === "Escape" && els.cartDrawer.classList.contains("is-open")) closeCart(); });
  }

  function updateDialogPrice() {
    const form = document.querySelector("#itemOptionsForm");
    if (!form || !state.detailItem) return;
    const extras = [...form.querySelectorAll("input:checked")].reduce((sum, input) => sum + (Number(input.dataset.optionPrice) || 0), 0);
    form.querySelector("[data-dialog-qty]").textContent = number(state.detailQty);
    form.querySelector("[data-dialog-add]").textContent = `أضف · ${money((state.detailItem.price + extras) * state.detailQty)}`;
  }

  function observeSections() {
    sectionObserver?.disconnect();
    const sections = document.querySelectorAll("[data-section]");
    if (!sections.length) return;
    sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveCategory(visible.target.dataset.section);
    }, { rootMargin: "-28% 0px -62% 0px", threshold: [0, .1, .4] });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  function setActiveCategory(categoryId) {
    if (state.activeCategory === categoryId) return;
    state.activeCategory = categoryId;
    els.categoryTabs.querySelectorAll("[data-category]").forEach((button) => button.setAttribute("aria-current", String(button.dataset.category === categoryId)));
    const activeButton = els.categoryTabs.querySelector(`[data-category="${categoryId}"]`);
    if (!activeButton) return;
    const tabsRect = els.categoryTabs.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    const horizontalOffset = (buttonRect.left + buttonRect.width / 2) - (tabsRect.left + tabsRect.width / 2);
    els.categoryTabs.scrollBy({ left: horizontalOffset, behavior: "auto" });
  }

  function pulseCard(itemId) {
    const card = document.querySelector(`[data-item-card="${itemId}"]`);
    if (!card || reduceMotion()) return;
    card.animate([{ transform: "scale(1)" }, { transform: "scale(.985)" }, { transform: "scale(1)" }], { duration: 240, easing: "ease-out" });
  }

  function showToast(message) {
    clearTimeout(state.toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    state.toastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), 1800);
  }

  function syncFulfillmentFields(orderType) {
    const isDelivery = orderType === "توصيل";
    els.deliveryFields.hidden = !isDelivery;
    els.pickupFields.hidden = isDelivery;
    els.checkoutForm.elements.address.required = isDelivery;
    els.checkoutForm.elements.address.removeAttribute("aria-invalid");
    clearCheckoutError();
    updateCheckoutSummary();
  }

  function showCheckoutError(message) {
    els.checkoutError.textContent = message;
    els.checkoutError.hidden = false;
  }

  function clearCheckoutError() {
    els.checkoutError.hidden = true;
    els.checkoutError.textContent = "";
  }

  function showDialog(dialog) {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function cartCount() { return state.cart.reduce((sum, entry) => sum + entry.qty, 0); }
  function subtotal() { return state.cart.reduce((sum, entry) => sum + entry.unitPrice * entry.qty, 0); }
  function money(value) { return `${number(value)} ${restaurant.currency}`; }
  function number(value) { return new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(value); }
  function normalize(value) { return value.toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").trim(); }
  function reduceMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function saveCart() { try { localStorage.setItem("forn-cart-v2", JSON.stringify(state.cart)); } catch (_) {} }
  function loadCart() { try { return JSON.parse(localStorage.getItem("forn-cart-v2")) || []; } catch (_) { return []; } }
})();
