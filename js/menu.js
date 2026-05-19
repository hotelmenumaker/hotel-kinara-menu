/**
 * menu.js — Menu rendering engine
 * Reads HOTEL_CONFIG from config.js and builds all menu HTML
 */

const Menu = (() => {

  // Track active subcategory per category index
  const activeSubcats = {};

  /* ─────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────── */
  function init() {
    _renderCatTabs();
    _renderAllSections();
    _setupScrollSpy();
    _setupSearch();
  }

  /* ─────────────────────────────────────────────────────
     CATEGORY TABS
  ───────────────────────────────────────────────────── */
  function _renderCatTabs() {
    const wrap = document.getElementById('catTabs');
    wrap.innerHTML = HOTEL_CONFIG.menu.map((cat, i) =>
      `<button class="cat-tab ${i === 0 ? 'active' : ''}"
        id="tab-${i}"
        onclick="Menu.scrollToCategory(${i})">
        ${cat.icon} ${cat.category}
      </button>`
    ).join('');
  }

  /* ─────────────────────────────────────────────────────
     ALL SECTIONS
  ───────────────────────────────────────────────────── */
  function _renderAllSections() {
    const body = document.getElementById('menuBody');
    body.innerHTML = HOTEL_CONFIG.menu.map((cat, catIdx) => {
      const defaultSub = activeSubcats[catIdx] || cat.subcategories[0].name;
      const hasPills   = cat.subcategories.length > 1;

      return `
      <div class="cat-section" id="section-${catIdx}">
        <div class="cat-heading">
          <span class="cat-icon-lg">${cat.icon}</span>
          <h2>${cat.category}</h2>
        </div>

        ${hasPills ? `
        <div class="subcat-scroll" id="subcat-${catIdx}">
          ${cat.subcategories.map(sub =>
            `<button class="subcat-pill ${sub.name === defaultSub ? 'active' : ''}"
              onclick="Menu.switchSubcat(${catIdx}, '${sub.name}')">
              ${sub.name}
            </button>`
          ).join('')}
        </div>` : ''}

        <div id="items-${catIdx}" class="food-cards">
          ${_renderItems(
            cat.subcategories.find(s => s.name === defaultSub) || cat.subcategories[0]
          )}
        </div>

        <div class="divider"></div>
      </div>`;
    }).join('');
  }

  /* ─────────────────────────────────────────────────────
     FOOD CARDS
  ───────────────────────────────────────────────────── */
  function _renderItems(subcat) {
    return subcat.items.map(item => {
      const qty     = Cart.getQty(item.id);
      const unavail = item.available === false;

      const badgeCls = item.badge
        ? item.badge.toLowerCase().includes('spicy') ? 'spicy'
        : item.badge.toLowerCase().includes('best') ? 'bestseller' : ''
        : '';

      return `
      <div class="food-card ${unavail ? 'unavailable' : ''} ${item.type === 'nveg' ? 'nveg-card' : ''}" id="card-${item.id}">
        <div class="food-card-inner">

          <div class="food-card-img">
            <div class="skeleton"></div>
            <img
              src="${item.img}"
              alt="${item.name}"
              loading="lazy"
              onload="this.classList.add('loaded')"
              onerror="if(this.src.indexOf('placeholder')===-1){this.src='images/menu/placeholder.jpg'}else{this.style.display='none'}"
            />
          </div>

          <div class="food-card-body">
            <div class="food-card-top">

              <div class="food-name-row">
                <span class="veg-dot ${item.type}"></span>
                <span class="food-name">${item.name}</span>
                ${unavail ? '<span class="unavailable-tag">Unavailable</span>' : ''}
              </div>

              <p class="food-desc">${item.desc}</p>

              ${item.badge ? `
              <div class="food-badges">
                <span class="badge ${badgeCls}">${item.badge}</span>
              </div>` : ''}

            </div>

            <div class="food-card-bottom">
              <span class="food-price">${HOTEL_CONFIG.currency}${item.price}</span>
              <div id="ctrl-${item.id}">
                ${qty > 0 ? _qtyCtrl(item.id, qty) : _addBtn(item.id)}
              </div>
            </div>
          </div>

        </div>
      </div>`;
    }).join('');
  }

  function _addBtn(id) {
    return `<button class="add-btn" onclick="Cart.add('${id}')">+</button>`;
  }

  function _qtyCtrl(id, qty) {
    return `
    <div class="qty-ctrl">
      <button class="qty-btn" onclick="Cart.decrease('${id}')">−</button>
      <span class="qty-num">${qty}</span>
      <button class="qty-btn" onclick="Cart.increase('${id}')">+</button>
    </div>`;
  }

  /* ─────────────────────────────────────────────────────
     SWITCH SUBCATEGORY
  ───────────────────────────────────────────────────── */
  function switchSubcat(catIdx, subcatName) {
    activeSubcats[catIdx] = subcatName;

    // Update pill styles
    const wrap = document.getElementById(`subcat-${catIdx}`);
    if (wrap) {
      wrap.querySelectorAll('.subcat-pill').forEach(p => {
        p.classList.toggle('active', p.textContent.trim() === subcatName);
      });
    }

    // Re-render items
    const cat    = HOTEL_CONFIG.menu[catIdx];
    const subcat = cat.subcategories.find(s => s.name === subcatName) || cat.subcategories[0];
    const div    = document.getElementById(`items-${catIdx}`);
    if (div) div.innerHTML = _renderItems(subcat);
  }

  /* ─────────────────────────────────────────────────────
     UPDATE A SINGLE CARD CONTROL (called by Cart)
  ───────────────────────────────────────────────────── */
  function refreshCtrl(id) {
    const ctrl = document.getElementById(`ctrl-${id}`);
    if (!ctrl) return;
    const qty = Cart.getQty(id);
    ctrl.innerHTML = qty > 0 ? _qtyCtrl(id, qty) : _addBtn(id);
  }

  /* ─────────────────────────────────────────────────────
     SCROLL TO CATEGORY
  ───────────────────────────────────────────────────── */
  function scrollToCategory(idx) {
    const section = document.getElementById(`section-${idx}`);
    if (!section) return;
    const headerH = 60 + 46; // header + tabs height
    const top = section.getBoundingClientRect().top + window.scrollY - headerH - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  /* ─────────────────────────────────────────────────────
     SCROLL SPY — highlight active tab while scrolling
  ───────────────────────────────────────────────────── */
  function _setupScrollSpy() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.id.replace('section-', ''));
          _setActiveTab(idx);
        }
      });
    }, { rootMargin: '-60px 0px -68% 0px', threshold: 0 });

    HOTEL_CONFIG.menu.forEach((_, i) => {
      const el = document.getElementById(`section-${i}`);
      if (el) observer.observe(el);
    });
  }

  function _setActiveTab(idx) {
    document.querySelectorAll('.cat-tab').forEach((t, i) => {
      t.classList.toggle('active', i === idx);
    });
    const tab = document.getElementById(`tab-${idx}`);
    if (tab) tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  /* ─────────────────────────────────────────────────────
     FIND ITEM across all categories
  ───────────────────────────────────────────────────── */
  function findItem(id) {
    for (const cat of HOTEL_CONFIG.menu) {
      for (const sub of cat.subcategories) {
        const item = sub.items.find(i => i.id === id);
        if (item) return item;
      }
    }
    return null;
  }

  /* ─────────────────────────────────────────────────────
     SEARCH
  ───────────────────────────────────────────────────── */
  function _setupSearch() {
    const s = document.getElementById('menuSearch');
    const clearBtn = document.getElementById('searchClear');
    if (!s) return;
    s.value = ''; // reset on each menu init
    s.addEventListener('input', e => {
      const q = e.target.value.toLowerCase().trim();
      if (clearBtn) clearBtn.style.display = q ? 'flex' : 'none';
      const cards = document.querySelectorAll('.food-card');
      let visible = 0;
      cards.forEach(card => {
        const show = !q || card.innerText.toLowerCase().includes(q);
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      let noRes = document.getElementById('searchNoResults');
      if (!noRes) {
        noRes = document.createElement('div');
        noRes.id = 'searchNoResults';
        noRes.style.cssText = 'text-align:center;padding:48px 24px;color:var(--text2);font-size:15px;display:none';
        noRes.innerHTML = '<div style="font-size:36px;margin-bottom:12px">🍽️</div><p style="margin:0 0 4px;font-size:16px;color:var(--text)">No dishes found</p><p style="margin:0;font-size:13px">Try a different keyword</p>';
        const mb = document.getElementById('menuBody');
        if (mb) mb.after(noRes);
      }
      noRes.style.display = (q && visible === 0) ? 'block' : 'none';
    });
  }

  /* ─────────────────────────────────────────────────────
     CLEAR SEARCH
  ───────────────────────────────────────────────────── */
  function clearSearch() {
    const s = document.getElementById('menuSearch');
    const clearBtn = document.getElementById('searchClear');
    if (s) { s.value = ''; s.focus(); }
    if (clearBtn) clearBtn.style.display = 'none';
    document.querySelectorAll('.food-card').forEach(c => c.style.display = '');
    const noRes = document.getElementById('searchNoResults');
    if (noRes) noRes.style.display = 'none';
  }

  // Public API
  return { init, switchSubcat, scrollToCategory, refreshCtrl, findItem, clearSearch };
})();