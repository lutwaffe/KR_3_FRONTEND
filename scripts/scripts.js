(() => {
  'use strict';

  const PRODUCTS = {
    p1: { id: 'p1', title: 'Беспроводные наушники X100', price: 4999, img: 'product-1-600.jpg' },
    p2: { id: 'p2', title: 'Портативная колонка Boom', price: 2499, img: 'product-2-600.jpg' },
    p3: { id: 'p3', title: 'Смарт-часы FitPro', price: 3199, img: 'product-3-600.jpg' }
  };

  const SELECT = {
    CART_BADGE: '#cart-badge',
    ADD_BTN: '.add-to-cart',
    MODAL: '#modal',
    MODAL_OVERLAY: '#modal-overlay',
    MODAL_CLOSE: '#modal-close',
    TOAST: '#toast',
    CART_CONTAINER: '#cart-container',
    CART_ITEMS: '#cart-items',
    CART_SUMMARY: '#cart-summary',
    CART_TOTAL: '#cart-total',
    CONTACT_FORM: '#contact-form',
    MENU_TOGGLE: '.menu-toggle',
    NAV_LIST: '.nav__list'
  };

  const STORAGE_KEY = 'shop_cart_v1';

  function readCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch(e) { console.error(e); return {}; }
  }

  function writeCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateBadge();
  }

  function updateBadge() {
    const el = document.querySelector(SELECT.CART_BADGE);
    if (!el) return;
    const cart = readCart();
    const total = Object.values(cart).reduce((s, n) => s + n, 0);
    el.textContent = total;
  }

  function showToast(msg, ms = 1800) {
    const t = document.querySelector(SELECT.TOAST);
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    setTimeout(() => { t.hidden = true; t.textContent = ''; }, ms);
  }

  const modalEl = document.querySelector(SELECT.MODAL);
  const modalOverlayEl = document.querySelector(SELECT.MODAL_OVERLAY);
  const modalCloseBtn = document.querySelector(SELECT.MODAL_CLOSE);

  function openModal(productTitle) {
    if (!modalEl || !modalOverlayEl) return;
    modalEl.querySelector('#modal-desc').textContent = `${productTitle} добавлен в корзину`;
    modalOverlayEl.hidden = false; modalEl.hidden = false;
    modalOverlayEl.classList.add('visible'); modalEl.classList.add('visible');
    modalEl.focus();
  }

  function closeModal() {
    if (!modalEl || !modalOverlayEl) return;
    modalOverlayEl.hidden = true; modalEl.hidden = true;
    modalOverlayEl.classList.remove('visible'); modalEl.classList.remove('visible');
  }

  function addToCart(id) {
    const cart = readCart();
    cart[id] = (cart[id] || 0) + 1;
    writeCart(cart);
    if (PRODUCTS[id]) openModal(PRODUCTS[id].title);
    showToast('Товар добавлен');
    renderCartPage();
  }

  function renderCartPage() {
    const container = document.querySelector(SELECT.CART_CONTAINER);
    if (!container) return;
    const itemsEl = document.querySelector(SELECT.CART_ITEMS);
    const summaryEl = document.querySelector(SELECT.CART_SUMMARY);
    const totalEl = document.querySelector(SELECT.CART_TOTAL);
    const emptyEl = document.getElementById('empty-cart');

    const cart = readCart();
    const keys = Object.keys(cart);

    if (!itemsEl || !summaryEl || !totalEl) return;

    if (keys.length === 0) {
      itemsEl.hidden = true; summaryEl.hidden = true; if (emptyEl) emptyEl.hidden = false;
      return;
    }

    itemsEl.innerHTML = '';
    keys.forEach(id => {
      const qty = cart[id];
      const p = PRODUCTS[id] || { title: id, price: 0 };
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <div><strong>${p.title}</strong><div class="sr-price">Цена: ${p.price} руб.</div></div>
        <div>
          <input type="number" min="1" class="cart-qty" value="${qty}" data-id="${id}" style="width:5rem">
          <button class="button remove-item" data-id="${id}">Удалить</button>
        </div>
      `;
      itemsEl.appendChild(li);
    });

    itemsEl.hidden = false;
    if (emptyEl) emptyEl.hidden = true;
    summaryEl.hidden = false;

    totalEl.textContent = keys.reduce((sum, id) => sum + ((PRODUCTS[id]?.price || 0) * cart[id]), 0) + ' ₽';

    itemsEl.querySelectorAll('.cart-qty').forEach(input => {
      input.addEventListener('change', e => {
        const id = e.target.dataset.id;
        let v = parseInt(e.target.value) || 1;
        const c = readCart(); c[id] = v; writeCart(c); renderCartPage();
      });
    });

    itemsEl.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = btn.dataset.id; const c = readCart(); delete c[id]; writeCart(c); renderCartPage();
      });
    });
  }

  function renderProductPage() {
    const titleEl = document.getElementById('product-title');
    if (!titleEl) return;
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (!id || !PRODUCTS[id]) { titleEl.textContent = 'Товар не найден'; return; }
    const p = PRODUCTS[id];
    titleEl.textContent = p.title;
    const img = document.getElementById('product-img'); if (img) { img.src = 'images/' + p.img; img.alt = p.title; }
    const price = document.getElementById('product-price'); if (price) price.innerHTML = `<strong>${p.price} ₽</strong>`;
    const desc = document.getElementById('product-desc'); if (desc) desc.textContent = 'Полное описание товара.';
    const btn = document.getElementById('product-add'); if (btn) btn.addEventListener('click', () => addToCart(id));
  }

  function setupMenuToggle() {
    const btn = document.querySelector(SELECT.MENU_TOGGLE);
    const nav = document.querySelector(SELECT.NAV_LIST);
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      nav.setAttribute('aria-hidden', String(expanded));
    });
  }

  function setupContactForm() {
    const form = document.querySelector(SELECT.CONTACT_FORM); if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('fname'); const email = document.getElementById('femail');
      let valid = true;
      if (!name.value.trim()) { document.getElementById('fname-error').textContent='Введите имя'; valid=false; }
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email.value)) { document.getElementById('femail-error').textContent='Введите корректный email'; valid=false; }
      if (!valid) return;
      document.getElementById('contact-status').textContent='Спасибо! Мы получили ваше сообщение.'; form.reset();
    });
  }

  function init() {
    document.addEventListener('click', e => {
      const addBtn = e.target.closest('.add-to-cart');
      if (addBtn) { e.preventDefault(); addToCart(addBtn.dataset.id); return; }
      const removeBtn = e.target.closest('.remove-item');
      if (removeBtn) { e.preventDefault(); const cart = readCart(); delete cart[removeBtn.dataset.id]; writeCart(cart); renderCartPage(); return; }
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalOverlayEl) modalOverlayEl.addEventListener('click', closeModal);

    updateBadge();
    renderCartPage();
    renderProductPage();
    setupMenuToggle();
    setupContactForm();
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }

})();
