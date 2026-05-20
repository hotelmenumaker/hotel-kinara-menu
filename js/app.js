/**
 * app.js — Main controller v6
 * Features: dark/light theme toggle, particles, ripples,
 *           screens, order flow, bill screen, toast
 */

const App = (() => {

  let _guest      = JSON.parse(localStorage.getItem('hotel_guest') || '{"name":"","mobile":"","table":""}');
  let _isDark     = localStorage.getItem('hotel_theme') !== 'light';
  let _toastTimer = null;
  let _toastHideTimer = null;

  /* ═══════════════════════════ BOOT ═══════════════════════════ */
  function boot() {
    _applyThemeMode(_isDark);
    _applyBrandColors();
    _applyImages();
    _buildWelcomeForm();
    _setupRipples();
    _setupParticles();
    _setupDrawerSwipe();
    _restoreSession();
  }

  /* ═══════════════════════ THEME TOGGLE ═══════════════════════ */
  function _applyThemeMode(dark) {
    const r = document.documentElement;
    if (dark) {
      r.style.setProperty('--bg',       '#080807');
      r.style.setProperty('--surface',  '#111110');
      r.style.setProperty('--surface2', '#191917');
      r.style.setProperty('--surface3', '#202020');
      r.style.setProperty('--border',   'rgba(255,255,255,.07)');
      r.style.setProperty('--border2',  'rgba(255,255,255,.11)');
      r.style.setProperty('--text',     '#F2EDE0');
      r.style.setProperty('--text2',    '#a09880');
      r.style.setProperty('--text3',    '#5a5040');
      r.style.setProperty('--shadow',   'rgba(0,0,0,.5)');
      r.style.setProperty('--card-bg',  'linear-gradient(145deg,#141412,#0f0f0d)');
      r.style.setProperty('--header-bg','rgba(8,8,7,.96)');
      r.style.setProperty('--drawer-bg','linear-gradient(180deg,#181816,#111110)');
      document.body.setAttribute('data-theme', 'dark');
    } else {
      r.style.setProperty('--bg',       '#f8f5ef');
      r.style.setProperty('--surface',  '#ffffff');
      r.style.setProperty('--surface2', '#f2ede4');
      r.style.setProperty('--surface3', '#ebe5da');
      r.style.setProperty('--border',   'rgba(0,0,0,.08)');
      r.style.setProperty('--border2',  'rgba(0,0,0,.12)');
      r.style.setProperty('--text',     '#1a1510');
      r.style.setProperty('--text2',    '#6b5d4a');
      r.style.setProperty('--text3',    '#9e8f7a');
      r.style.setProperty('--shadow',   'rgba(0,0,0,.12)');
      r.style.setProperty('--card-bg',  'linear-gradient(145deg,#ffffff,#faf7f2)');
      r.style.setProperty('--header-bg','rgba(248,245,239,.96)');
      r.style.setProperty('--drawer-bg','linear-gradient(180deg,#ffffff,#f8f5ef)');
      document.body.setAttribute('data-theme', 'light');
    }
    const mt = document.querySelector('meta[name="theme-color"]');
    if (mt) mt.content = dark ? '#080807' : '#f8f5ef';
    // Update toggle icon
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = dark ? '☀️' : '🌙';
  }

  function toggleTheme() {
    _isDark = !_isDark;
    localStorage.setItem('hotel_theme', _isDark ? 'dark' : 'light');
    _applyThemeMode(_isDark);
    showToast(_isDark ? 'Dark mode on' : 'Light mode on', _isDark ? '🌙' : '☀️');
  }

  function _applyBrandColors() {
    const t = HOTEL_CONFIG.theme;
    const r = document.documentElement;
    r.style.setProperty('--accent',      t.accent);
    r.style.setProperty('--accent-dark', t.accentDark);
    r.style.setProperty('--accent-text', t.accentText);
    document.title = HOTEL_CONFIG.hotelName + ' — Menu';
  }

  function _shade(hex, amt) {
    const c   = hex.replace('#','');
    const num = parseInt(c.length === 3 ? c.split('').map(x=>x+x).join('') : c, 16);
    const r   = Math.min(255, Math.max(0, (num >> 16) + amt));
    const g   = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
    const b   = Math.min(255, Math.max(0, (num & 0xff) + amt));
    return `#${((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}`;
  }

  /* ═══════════════════════ IMAGES ════════════════════════════ */
  function _applyImages() {
    const bgEl = document.querySelector('.welcome-bg');
    if (bgEl) bgEl.style.backgroundImage = `url('${HOTEL_CONFIG.images.welcomeBanner}')`;

    const heroImg = document.getElementById('heroBanner');
    if (heroImg) heroImg.src = HOTEL_CONFIG.images.menuHero;

    const logoImg   = document.getElementById('headerLogo');
    const nameEl    = document.getElementById('headerHotelName');
    if (logoImg) {
      logoImg.src = HOTEL_CONFIG.images.logo;
      logoImg.onload  = () => { logoImg.style.display = 'block'; if (nameEl) nameEl.style.display = 'none'; };
      logoImg.onerror = () => { logoImg.style.display = 'none'; };
    }

    const fav = document.getElementById('favicon');
    if (fav) fav.href = HOTEL_CONFIG.images.favicon;

    const mapBtn = document.getElementById('mapBtn');
    if (mapBtn) mapBtn.href = HOTEL_CONFIG.googleMapsLink || '#';
  }

  /* ═══════════════════════ WELCOME FORM ══════════════════════ */
  function _buildWelcomeForm() {
    const cfg  = HOTEL_CONFIG.guestForm;
    const form = document.getElementById('guestForm');
    let html   = '';
    if (cfg.askName) html += `
      <div class="field-group">
        <label class="field-label" for="fieldName">Your Name <span class="optional-tag">(optional)</span></label>
        <input id="fieldName" type="text" class="field-input" placeholder="e.g. Rahul Sharma" autocomplete="name" autocapitalize="words"/>
      </div>`;
    if (cfg.askMobile) html += `
      <div class="field-group">
        <label class="field-label" for="fieldMobile">Mobile Number <span class="optional-tag">(optional)</span></label>
        <input id="fieldMobile" type="tel" class="field-input" placeholder="e.g. 9876543210" inputmode="tel" maxlength="10" autocomplete="tel"/>
      </div>`;
    form.innerHTML = html;
    form.querySelectorAll('.field-input').forEach((inp, idx, all) => {
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') { if (idx < all.length - 1) all[idx+1].focus(); else enterMenu(); }
      });
    });
  }

  /* ═══════════════════════ RIPPLE ════════════════════════════ */
  function _setupRipples() {
    document.addEventListener('pointerdown', e => {
      const btn = e.target.closest('.ripple');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const wave = document.createElement('span');
      wave.className = 'ripple-wave';
      wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
      btn.appendChild(wave);
      wave.addEventListener('animationend', () => wave.remove());
    });
  }

  /* ═══════════════════════ PARTICLES ═════════════════════════ */
  function _setupParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animId;

    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };

    function Particle() {
      this.x = Math.random() * W; this.y = Math.random() * H;
      this.size = Math.random() * 1.5 + .5;
      this.speedX = (Math.random() - .5) * .35; this.speedY = (Math.random() - .5) * .35;
      this.opacity = Math.random() * .4 + .05;
      this.life = 0; this.maxLife = Math.random() * 200 + 100;
    }
    Particle.prototype.update = function() {
      this.x += this.speedX; this.y += this.speedY; this.life++;
      if (this.x < 0) this.x = W; if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H; if (this.y > H) this.y = 0;
    };
    Particle.prototype.draw = function() {
      const fade = this.life < 30 ? this.life/30 : this.life > this.maxLife-30 ? (this.maxLife-this.life)/30 : 1;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
      ctx.fillStyle = `rgba(201,168,76,${this.opacity * fade})`; ctx.fill();
    };

    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 60; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p, i) => { p.update(); p.draw(); if (p.life >= p.maxLife) particles[i] = new Particle(); });
      animId = requestAnimationFrame(animate);
    };

    const checkScreen = () => {
      const isWelcome = document.getElementById('welcome').classList.contains('active');
      if (isWelcome) { canvas.classList.add('visible'); if (!animId) animate(); }
      else { canvas.classList.remove('visible'); cancelAnimationFrame(animId); animId = null; }
    };
    checkScreen();
    new MutationObserver(checkScreen).observe(document.getElementById('welcome'), { attributes: true, attributeFilter: ['class'] });
  }

  /* ═══════════════════════ ENTER MENU ════════════════════════ */
  function enterMenu() {
    const ni = document.getElementById('fieldName');
    const mi = document.getElementById('fieldMobile');
    if (ni) _guest.name   = ni.value.trim();
    if (mi) _guest.mobile = mi.value.trim();
    _updateGuestChip();
    localStorage.setItem('hotel_guest', JSON.stringify(_guest));
    _showScreen('menu');
    Menu.init();
  }

  function _updateGuestChip() {
    const chip = document.getElementById('guestChip');
    if (!chip) return;
    let parts = [];
    if (_guest.table && String(_guest.table).trim() !== '') parts.push(`Table <strong>${_guest.table}</strong>`);
    if (_guest.name  && _guest.name.trim() !== '')  parts.push(_guest.name);
    chip.innerHTML = parts.join(' · ');
    chip.style.display = parts.length > 0 ? '' : 'none';
  }

  // function _restoreSession() {
  //   const lastPage = localStorage.getItem('currentPage');
  //   if (_guest && (_guest.name || _guest.mobile || _guest.table)) {
  //     const ni = document.getElementById('fieldName');
  //     const mi = document.getElementById('fieldMobile');
  //     if (ni) ni.value = _guest.name   || '';
  //     if (mi) mi.value = _guest.mobile || '';
  //     _updateGuestChip();
  //   }
  //   if (lastPage && lastPage !== 'welcome') { Menu.init(); _showScreen(lastPage); }
  // }

  // function _restoreSession() {
  //   const lastPage = localStorage.getItem('currentPage');
  //   if (_guest && (_guest.name || _guest.mobile || _guest.table)) {
  //     const ni = document.getElementById('fieldName');
  //     const mi = document.getElementById('fieldMobile');
  //     if (ni) ni.value = _guest.name   || '';
  //     if (mi) mi.value = _guest.mobile || '';
  //     _updateGuestChip();
  //   }
  //   if (lastPage && lastPage !== 'welcome') {
  //     Menu.init();
  //     _showScreen(lastPage);
  //     // Re-render bill screen if user was on it when they refreshed
  //     if (lastPage === 'bill') {
  //       const orders = Cart.getPreviousOrders();
  //       if (orders && orders.length > 0) {
  //         _renderBill(orders);
  //       } else {
  //         // No orders to show — fall back to menu
  //         _showScreen('menu');
  //       }
  //     }
  //   }
  // }

  function _restoreSession() {
    const lastPage = localStorage.getItem('currentPage');
    if (_guest && (_guest.name || _guest.mobile || _guest.table)) {
      const ni = document.getElementById('fieldName');
      const mi = document.getElementById('fieldMobile');
      if (ni) ni.value = _guest.name   || '';
      if (mi) mi.value = _guest.mobile || '';
      _updateGuestChip();
    }
    if (lastPage && lastPage !== 'welcome') {
      Menu.init();
      _showScreen(lastPage);

      if (lastPage === 'bill') {
        const orders = Cart.getPreviousOrders();
        if (orders && orders.length > 0) {
          _renderBill(orders);
        } else {
          _showScreen('menu');
        }
      }

      if (lastPage === 'success') {
        const savedResult = localStorage.getItem('hotel_last_result');
        if (savedResult) {
          _renderSuccess(JSON.parse(savedResult));
        } else {
          // No result saved — fall back to menu
          _showScreen('menu');
        }
      }
    }
  }

  /* ═══════════════════════ SCREENS ═══════════════════════════ */
  function _showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    localStorage.setItem('currentPage', id);
    window.scrollTo(0, 0);
    // Hide cart bar on screens where it has no business showing
    const cartBar = document.getElementById('cartBar');
    if (cartBar) {
      if (id === 'bill' || id === 'success' || id === 'welcome') {
        cartBar.classList.remove('show');
      }
    }
  }

  function startFreshOrder() {
    if (!confirm('Start a new order? This will clear all history.')) return;
    _hardReset();
  }

  function _hardReset() {
    Cart.startFreshOrder();
    localStorage.removeItem('hotel_guest');
    localStorage.removeItem('currentPage');
    localStorage.removeItem('hotel_last_result'); 
    _guest = { name: '', mobile: '', table: '' };
    ['fieldName','fieldMobile'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    _showScreen('welcome');
  }

  function goBackToMenu() {
    closeCart();
    _showScreen('menu');
    Cart.renderDrawer();
  }

  function goBackToMenuFromBill() {
    _showScreen('menu');
    Cart.renderDrawer();
  }

  /* ═══════════════════════ CART DRAWER ═══════════════════════ */
  function openCart() {
    Cart.renderDrawer();
    document.getElementById('drawer').classList.add('show');
    document.getElementById('drawerOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    document.getElementById('drawer').classList.remove('show');
    document.getElementById('drawerOverlay').classList.remove('show');
    document.body.style.overflow = '';
    closeOrderTypeModal();
  }

  /* ═══════════════════════ ORDER TYPE MODAL ══════════════════ */
  function openOrderTypeModal() {
    if (Cart.isEmpty()) { showToast('Please add items first', '🛒'); return; }
    const isAdditional = Cart.getPreviousOrders().length > 0;
    // If additional round and previous order was dine-in with a known table, skip straight to dine-in step
    // if (isAdditional) {
    //   const prevOrders = Cart.getPreviousOrders();
    //   const lastOrder = prevOrders[prevOrders.length - 1];
    //   if (lastOrder && lastOrder.orderType === 'dine-in' && (lastOrder.table || _guest.table)) {
    //     if (!_guest.table && lastOrder.table) _guest.table = lastOrder.table;
    //     document.getElementById('orderTypeModal').classList.add('show');
    //     _showOrderStep('stepDineIn');
    //     const ti = document.getElementById('orderTable');
    //     if (ti) ti.value = _guest.table || lastOrder.table || '';
    //     return;
    //   }
    // }
    if (isAdditional) {
      const prevOrders = Cart.getPreviousOrders();
      const lastOrder = prevOrders[prevOrders.length - 1];
      if (lastOrder && lastOrder.orderType === 'dine-in' && (lastOrder.table || _guest.table)) {
        if (!_guest.table && lastOrder.table) _guest.table = lastOrder.table;
        document.getElementById('orderTypeModal').classList.add('show');
        _showOrderStep('stepDineIn');
        const ti = document.getElementById('orderTable');
        if (ti) ti.value = _guest.table || lastOrder.table || '';
        return;
      }
      // If additional round and previous order was home delivery, skip straight to delivery step
      if (lastOrder && lastOrder.orderType === 'delivery') {
        document.getElementById('orderTypeModal').classList.add('show');
        _showOrderStep('stepDelivery');
        const ni = document.getElementById('deliveryName');
        const mi = document.getElementById('deliveryMobile');
        const ai = document.getElementById('deliveryAddress');
        if (ni && _guest.name)    ni.value = _guest.name;
        if (mi && _guest.mobile)  mi.value = _guest.mobile;
        if (ai && _guest.address) ai.value = _guest.address;
        _updateDeliveryTotals();
        return;
      }
    }
    document.getElementById('orderTypeModal').classList.add('show');
    _showOrderStep('stepChoose');
  }

  function closeOrderTypeModal() {
    const m = document.getElementById('orderTypeModal');
    if (m) m.classList.remove('show');
  }

  function _showOrderStep(stepId) {
    document.querySelectorAll('.order-step').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(stepId);
    if (el) el.classList.add('active');
  }

  function selectOrderType(type) {
    if (type === 'dine') {
      _showOrderStep('stepDineIn');
      const ti = document.getElementById('orderTable');
      if (ti && _guest.table) ti.value = _guest.table;
      setTimeout(() => ti && ti.focus(), 300);
    } else {
      _showOrderStep('stepDelivery');
      const ni = document.getElementById('deliveryName');
      const mi = document.getElementById('deliveryMobile');
      if (ni && _guest.name)   ni.value = _guest.name;
      if (mi && _guest.mobile) mi.value = _guest.mobile;
      // Update delivery total summary
      _updateDeliveryTotals();
      setTimeout(() => ni && !ni.value && ni.focus(), 300);
    }
  }

  // function backToOrderTypeChoice() {
  //   _showOrderStep('stepChoose');
  // }

  function _updateDeliveryTotals() {
    const { subtotal } = Cart.getTotals();
    const currency = HOTEL_CONFIG.currency;
    const previousOrders = Cart.getPreviousOrders();
    const isAddOnRound = previousOrders.length > 0;
    // const prevSubtotal = previousOrders.reduce((s, r) => s + r.total, 0);
    // const foodSubtotal = prevSubtotal + subtotal;
    // const deliveryCharge = isAddOnRound ? 0 : (HOTEL_CONFIG.deliveryCharge || 0);
    // const grandTotal = foodSubtotal + deliveryCharge;
    const prevSubtotal = previousOrders.reduce((s, r) => s + r.total, 0);
    const foodSubtotal = prevSubtotal + subtotal;
    const deliveryCharge = HOTEL_CONFIG.deliveryCharge || 0; // always the real charge
    const grandTotal = foodSubtotal + deliveryCharge;        // always include it in total

    const subEl         = document.getElementById('deliverySubtotalDisplay');
    const totalEl       = document.getElementById('deliveryGrandTotalDisplay');
    const chargeEl      = document.getElementById('deliveryChargeDisplay');
    const badgeEl       = document.getElementById('deliveryChargeBadge');
    const totalChargeEl = document.getElementById('deliveryChargeTotal');
    const bannerEl      = document.getElementById('deliveryChargeBanner');
    const dtsDeliveryRow = document.querySelector('.dts-delivery');
    const dtsDeliveryAmt = dtsDeliveryRow ? dtsDeliveryRow.querySelector('span:last-child') : null;
    const dtsDeliveryLabel = dtsDeliveryRow ? dtsDeliveryRow.querySelector('span:first-child') : null;

    // Update food subtotal label to show breakdown if add-on round
    const dtsSubtotalRow = document.querySelector('.delivery-total-summary .dts-row:first-child span:first-child');
    if (dtsSubtotalRow) {
      dtsSubtotalRow.textContent = isAddOnRound
        ? `Food Subtotal (${previousOrders.length + 1} rounds)`
        : 'Food Subtotal';
    }

    if (subEl)   subEl.textContent   = `${currency}${foodSubtotal}`;
    if (totalEl) totalEl.textContent = `${currency}${grandTotal}`;

    // if (isAddOnRound) {
    //   // Hide top banner on additional rounds
    //   if (bannerEl) bannerEl.style.display = 'none';
    //   if (chargeEl) chargeEl.textContent   = '';
    //   if (badgeEl)  badgeEl.textContent    = '';

    //   // Show delivery row as already included
    //   if (dtsDeliveryRow)  dtsDeliveryRow.style.display  = '';
    //   if (dtsDeliveryLabel) dtsDeliveryLabel.textContent = '🛵 Delivery Charge';
    //   if (dtsDeliveryAmt) {
    //     dtsDeliveryAmt.textContent  = '✓ Already charged';
    //     dtsDeliveryAmt.style.color  = 'var(--text3)';
    //     dtsDeliveryAmt.style.fontSize = '12px';
    //   }
    //   if (totalChargeEl) totalChargeEl.textContent = `${currency}0`;
    if (isAddOnRound) {
      // Hide top banner on additional rounds
      if (bannerEl) bannerEl.style.display = 'none';
      if (chargeEl) chargeEl.textContent   = '';
      if (badgeEl)  badgeEl.textContent    = '';

      if (dtsDeliveryRow)  dtsDeliveryRow.style.display  = '';
      if (dtsDeliveryLabel) dtsDeliveryLabel.textContent = '🛵 Delivery Charge';
      if (dtsDeliveryAmt) {
        dtsDeliveryAmt.textContent    = `+ ${currency}${HOTEL_CONFIG.deliveryCharge || 0}`;  // ← show actual charge
        dtsDeliveryAmt.style.color    = '';   // ← reset color
        dtsDeliveryAmt.style.fontSize = '';   // ← reset font size
      }
      if (totalChargeEl) totalChargeEl.textContent = `+ ${currency}${HOTEL_CONFIG.deliveryCharge || 0}`;  // ← fix this too

    } else {
      // First round — show banner and full delivery charge
      if (bannerEl) bannerEl.style.display = '';
      if (chargeEl) chargeEl.textContent   = `+ ${currency}${HOTEL_CONFIG.deliveryCharge || 0} delivery charge added`;
      if (badgeEl)  badgeEl.textContent    = `${currency}${HOTEL_CONFIG.deliveryCharge || 0}`;

      if (dtsDeliveryRow)  dtsDeliveryRow.style.display  = '';
      if (dtsDeliveryLabel) dtsDeliveryLabel.textContent = '🛵 Delivery Charge';
      if (dtsDeliveryAmt) {
        dtsDeliveryAmt.textContent    = `+ ${currency}${HOTEL_CONFIG.deliveryCharge || 0}`;
        dtsDeliveryAmt.style.color    = '';
        dtsDeliveryAmt.style.fontSize = '';
      }
      if (totalChargeEl) totalChargeEl.textContent = `+ ${currency}${HOTEL_CONFIG.deliveryCharge || 0}`;
    }
  }

  // function _updateDeliveryTotals() {
  //   const { subtotal } = Cart.getTotals();
  //   const currency = HOTEL_CONFIG.currency;
  //   // const deliveryCharge = 40;
  //   const deliveryCharge = HOTEL_CONFIG.deliveryCharge || 0;
  //   const grandTotal = subtotal + deliveryCharge;
  //   const subEl   = document.getElementById('deliverySubtotalDisplay');
  //   const totalEl = document.getElementById('deliveryGrandTotalDisplay');
  //   const chargeEl = document.getElementById('deliveryChargeDisplay');
  //   if (subEl)    subEl.textContent   = `${currency}${subtotal}`;
  //   if (totalEl)  totalEl.textContent = `${currency}${grandTotal}`;
  //   // if (chargeEl) chargeEl.textContent = `+ ${currency}${deliveryCharge} delivery charge added`;
  //   if (chargeEl) chargeEl.textContent = `+ ${currency}${deliveryCharge} delivery charge added`;
  //   const badgeEl = document.getElementById('deliveryChargeBadge');
  //   const totalChargeEl = document.getElementById('deliveryChargeTotal');
  //   if (badgeEl) badgeEl.textContent = `${currency}${deliveryCharge}`;
  //   if (totalChargeEl) totalChargeEl.textContent = `+ ${currency}${deliveryCharge}`;
  // }

  // function _updateDeliveryTotals() {
  //   const { subtotal } = Cart.getTotals();
  //   const currency = HOTEL_CONFIG.currency;
  //   const previousOrders = Cart.getPreviousOrders();
  //   const isAddOnRound = previousOrders.length > 0;
  //   const prevSubtotal = previousOrders.reduce((s, r) => s + r.total, 0);
  //   const foodSubtotal = prevSubtotal + subtotal;

  //   // Delivery charge only applies once (first round)
  //   const deliveryCharge = isAddOnRound ? 0 : (HOTEL_CONFIG.deliveryCharge || 0);
  //   const grandTotal = foodSubtotal + deliveryCharge;

  //   const subEl      = document.getElementById('deliverySubtotalDisplay');
  //   const totalEl    = document.getElementById('deliveryGrandTotalDisplay');
  //   const chargeEl   = document.getElementById('deliveryChargeDisplay');
  //   const badgeEl    = document.getElementById('deliveryChargeBadge');
  //   const totalChargeEl = document.getElementById('deliveryChargeTotal');
  //   const bannerEl   = document.getElementById('deliveryChargeBanner');

  //   if (subEl)   subEl.textContent   = `${currency}${foodSubtotal}`;
  //   if (totalEl) totalEl.textContent = `${currency}${grandTotal}`;

  //   if (isAddOnRound) {
  //     // Hide delivery charge banner and row on additional rounds
  //     if (bannerEl)      bannerEl.style.display      = 'none';
  //     if (chargeEl)      chargeEl.textContent        = '';
  //     if (badgeEl)       badgeEl.textContent         = '';
  //     if (totalChargeEl) totalChargeEl.textContent   = `${currency}0`;

  //     // Hide the delivery charge row in the summary
  //     // const dtsDeliveryRow = document.querySelector('.dts-delivery');
  //     // if (dtsDeliveryRow) dtsDeliveryRow.style.display = 'none';
  //     // Show delivery row as already included
  //     const dtsDeliveryRow = document.querySelector('.dts-delivery');
  //     if (dtsDeliveryRow) {
  //       dtsDeliveryRow.style.display = '';
  //       const dtsDeliveryLabel = dtsDeliveryRow.querySelector('span:first-child');
  //       const dtsDeliveryAmt   = dtsDeliveryRow.querySelector('span:last-child');
  //       if (dtsDeliveryLabel) dtsDeliveryLabel.textContent = '🛵 Delivery Charge';
  //       if (dtsDeliveryAmt)   dtsDeliveryAmt.textContent   = '✓ Already charged';
  //       dtsDeliveryAmt.style.color = 'var(--text3)';
  //       dtsDeliveryAmt.style.fontSize = '12px';
  //     }
  //   } else {
  //     if (bannerEl)      bannerEl.style.display      = '';
  //     if (chargeEl)      chargeEl.textContent        = `+ ${currency}${HOTEL_CONFIG.deliveryCharge || 0} delivery charge added`;
  //     if (badgeEl)       badgeEl.textContent         = `${currency}${HOTEL_CONFIG.deliveryCharge || 0}`;
  //     if (totalChargeEl) totalChargeEl.textContent   = `+ ${currency}${HOTEL_CONFIG.deliveryCharge || 0}`;

  //     const dtsDeliveryRow = document.querySelector('.dts-delivery');
  //     if (dtsDeliveryRow) dtsDeliveryRow.style.display = '';
  //   }
  // }

  function confirmDineIn() {
    const ti  = document.getElementById('orderTable');
    const val = ti ? ti.value.trim() : '';
    if (!val || isNaN(val) || +val < 1) {
      ti && ti.classList.add('error');
      setTimeout(() => ti && ti.classList.remove('error'), 2000);
      showToast('Enter your table number', '⚠️'); return;
    }
    _guest.table = val;
    localStorage.setItem('hotel_guest', JSON.stringify(_guest));
    _updateGuestChip();
    const notes = (document.getElementById('orderNotes') || {}).value || '';
    const result = Cart.placeOrder({ type: 'dine-in', name: _guest.name, mobile: _guest.mobile, table: val, notes });
    if (result) _afterOrder(result);
  }

  function confirmDelivery() {
    const ni = document.getElementById('deliveryName');
    const mi = document.getElementById('deliveryMobile');
    const ai = document.getElementById('deliveryAddress');
    const name = ni ? ni.value.trim() : '', mobile = mi ? mi.value.trim() : '', address = ai ? ai.value.trim() : '';
    if (!name)   { _shakeField(ni); showToast('Enter your name', '⚠️'); return; }
    if (!mobile || mobile.length < 10) { _shakeField(mi); showToast('Enter a valid 10-digit mobile', '⚠️'); return; }
    if (!address) { _shakeField(ai); showToast('Enter your delivery address', '⚠️'); return; }
    const notes = (document.getElementById('orderNotes') || {}).value || '';
    const result = Cart.placeOrder({ type: 'delivery', name, mobile, address, notes });
    if (result) _afterOrder(result);
  }

  function _shakeField(el) {
    if (!el) return;
    el.classList.add('error'); el.focus();
    setTimeout(() => el.classList.remove('error'), 2000);
  }

  // function _afterOrder(result) {
  //   closeOrderTypeModal();
  //   const on = document.getElementById('orderNotes');
  //   if (on) on.value = '';

  //   const typeEl    = document.getElementById('successType');
  //   const tableCard = document.getElementById('successTableCard');
  //   const tableEl   = document.getElementById('successTable');
  //   const nameCard  = document.getElementById('successNameCard');
  //   const nameEl    = document.getElementById('successName');
  //   const addrCard  = document.getElementById('successAddrCard');
  //   const addrEl    = document.getElementById('successAddr');
  //   const roundEl   = document.getElementById('successRound');

  //   if (typeEl) typeEl.textContent = result.orderType === 'delivery' ? '🛵 Home Delivery' : '🍽️ Dine-In';

  //   if (result.orderType === 'dine-in') {
  //     if (tableCard) tableCard.style.display = 'flex';
  //     if (tableEl)   tableEl.textContent = result.table || '—';
  //     if (addrCard)  addrCard.style.display = 'none';
  //   } else {
  //     if (tableCard) tableCard.style.display = 'none';
  //     if (addrCard)  addrCard.style.display = 'flex';
  //     if (addrEl)    addrEl.textContent = result.address || '';
  //   }

  //   if (result.name) {
  //     if (nameEl)   nameEl.textContent = result.name;
  //     if (nameCard) nameCard.style.display = 'flex';
  //   } else {
  //     if (nameCard) nameCard.style.display = 'none';
  //   }

  //   if (roundEl) roundEl.style.display = result.orderRound > 1 ? 'block' : 'none';

  //   closeCart();
  //   setTimeout(() => _showScreen('success'), 320);
  // }

  function _afterOrder(result) {
    closeOrderTypeModal();
    const on = document.getElementById('orderNotes');
    if (on) on.value = '';

    // Save result to localStorage so refresh can restore it
    localStorage.setItem('hotel_last_result', JSON.stringify(result));

    _renderSuccess(result);
    closeCart();
    setTimeout(() => _showScreen('success'), 320);
  }

  function _renderSuccess(result) {
    const typeEl    = document.getElementById('successType');
    const tableCard = document.getElementById('successTableCard');
    const tableEl   = document.getElementById('successTable');
    const nameCard  = document.getElementById('successNameCard');
    const nameEl    = document.getElementById('successName');
    const addrCard  = document.getElementById('successAddrCard');
    const addrEl    = document.getElementById('successAddr');
    const roundEl   = document.getElementById('successRound');

    if (typeEl) typeEl.textContent = result.orderType === 'delivery' ? '🛵 Home Delivery' : '🍽️ Dine-In';

    if (result.orderType === 'dine-in') {
      if (tableCard) tableCard.style.display = 'flex';
      if (tableEl)   tableEl.textContent     = result.table || '—';
      if (addrCard)  addrCard.style.display  = 'none';
    } else {
      if (tableCard) tableCard.style.display = 'none';
      if (addrCard)  addrCard.style.display  = 'flex';
      if (addrEl)    addrEl.textContent      = result.address || '';
    }

    if (result.name) {
      if (nameEl)   nameEl.textContent      = result.name;
      if (nameCard) nameCard.style.display  = 'flex';
    } else {
      if (nameCard) nameCard.style.display  = 'none';
    }

    if (roundEl) roundEl.style.display = result.orderRound > 1 ? 'block' : 'none';
  }

  function placeOrder() { openOrderTypeModal(); }

  /* ═══════════════════════ GENERATE BILL ═════════════════════ */
  function generateBill() {
    const orders = Cart.getPreviousOrders();
    if (!orders || orders.length === 0) {
      showToast('No orders placed yet', '⚠️'); return;
    }
    // If there are still items in cart (unsent), warn
    if (!Cart.isEmpty()) {
      if (!confirm('You have items in cart that haven\'t been ordered yet. Generate bill without them?')) return;
    }

    _renderBill(orders);
    closeCart();
    setTimeout(() => _showScreen('bill'), 320);
  }

  function _renderBill(orders) {
    const currency = HOTEL_CONFIG.currency;
    const now      = new Date();
    const billTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const billDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    // Aggregate all items across all rounds
    const allItems = {};
    let foodSubtotal = 0;
    // const deliveryCharge = 40;
    const deliveryCharge = HOTEL_CONFIG.deliveryCharge || 0;

    orders.forEach(round => {
      round.items.forEach(({ item, qty }) => {
        if (allItems[item.id]) {
          allItems[item.id].qty += qty;
        } else {
          allItems[item.id] = { item: { ...item }, qty };
        }
        foodSubtotal += item.price * qty;
      });
    });

    // Get guest info from first order
    const firstOrder = orders[0];
    const guestName  = _guest.name  || firstOrder.name  || '';
    const guestTable = _guest.table || firstOrder.table || '';
    const orderType  = firstOrder.orderType;
    const isDelivery = orderType === 'delivery';
    const grandTotal = foodSubtotal + (isDelivery ? deliveryCharge : 0);

    // Render bill header info
    const billHotel    = document.getElementById('billHotelName');
    const billDate2    = document.getElementById('billDate');
    const billTime2    = document.getElementById('billTime');
    const billType     = document.getElementById('billOrderType');
    const billTable    = document.getElementById('billTable');
    const billTableRow = document.getElementById('billTableRow');
    const billGuest    = document.getElementById('billGuest');
    const billGuestRow = document.getElementById('billGuestRow');
    const billAddressRow = document.getElementById('billAddressRow');
    const billAddress  = document.getElementById('billAddress');
    const billRounds   = document.getElementById('billRounds');

    if (billHotel) {
      const words = HOTEL_CONFIG.hotelName.split(' ');
      billHotel.innerHTML = words.length > 1
        ? words.slice(0,-1).join(' ') + ' <span>' + words[words.length-1] + '</span>'
        : HOTEL_CONFIG.hotelName;
    }
    if (billDate2) billDate2.textContent = billDate;
    if (billTime2) billTime2.textContent = billTime;
    if (billType)  billType.textContent  = isDelivery ? '🛵 Home Delivery' : '🍽️ Dine-In';

    // Table row — show only for dine-in
    if (billTableRow) billTableRow.style.display = (!isDelivery && guestTable) ? 'flex' : 'none';
    if (billTable) billTable.textContent = guestTable || '—';

    // Guest name row
    if (billGuestRow) billGuestRow.style.display = guestName ? 'flex' : 'none';
    if (billGuest) billGuest.textContent = guestName;

    // Delivery address row
    if (billAddressRow) billAddressRow.style.display = (isDelivery && firstOrder.address) ? 'flex' : 'none';
    if (billAddress) billAddress.textContent = firstOrder.address || '';

    if (billRounds) billRounds.textContent = `${orders.length} round${orders.length > 1 ? 's' : ''}`;

    // Update bill payment notice
    const billPaymentNotice = document.querySelector('.bill-payment-notice');
    if (billPaymentNotice) {
      billPaymentNotice.innerHTML = isDelivery
        ? '🛵 Your order will be delivered soon · Pay via <strong>UPI / Cash</strong> to delivery boy'
        : '🏧 Please take this bill to the <strong>billing desk</strong> to complete your payment';
    }
    const payNote = document.getElementById('billPaymentNote');
    const paySub  = document.getElementById('billPaymentSub');
    if (payNote) payNote.textContent = isDelivery ? 'Payment for Home Delivery' : 'Please proceed to the billing desk';
    if (paySub)  paySub.textContent  = isDelivery ? 'Pay via UPI / QR Code or cash to delivery boy' : 'Show this bill & complete your payment there';

    // Render rounds summary
    const roundsDiv = document.getElementById('billRoundsList');
    if (roundsDiv) {
      roundsDiv.innerHTML = orders.map(r => `
        <div class="bill-round-row">
          <span class="bill-round-label">Order ${r.round} · ${r.time}</span>
          <span class="bill-round-amt">${currency}${r.total}</span>
        </div>
      `).join('');
    }

    // Render items
    const itemsDiv = document.getElementById('billItems');
    if (itemsDiv) {
      itemsDiv.innerHTML = Object.values(allItems).map(({ item, qty }) => `
        <div class="bill-item">
          <span class="bill-item-dot ${item.type}"></span>
          <span class="bill-item-name">${item.name}</span>
          <span class="bill-item-qty">×${qty}</span>
          <span class="bill-item-price">${currency}${item.price * qty}</span>
        </div>
      `).join('');
    }

    // Totals — show subtotal, optional delivery row, grand total
    const subTotalEl     = document.getElementById('billSubTotal');
    const deliveryRowEl  = document.getElementById('billDeliveryRow');
    const deliveryChargeEl = document.getElementById('billDeliveryCharge');
    const totalEl        = document.getElementById('billGrandTotal');

    // if (subTotalEl)      subTotalEl.textContent      = `${currency}${foodSubtotal}`;
    // if (deliveryRowEl)   deliveryRowEl.style.display  = isDelivery ? 'flex' : 'none';
    // if (deliveryChargeEl) deliveryChargeEl.textContent = `${currency}${deliveryCharge}`;
    // if (totalEl)         totalEl.textContent          = `${currency}${grandTotal}`;

    const cgstPct = HOTEL_CONFIG.gst?.enabled ? (HOTEL_CONFIG.gst.cgst / 100) : 0;
    const sgstPct = HOTEL_CONFIG.gst?.enabled ? (HOTEL_CONFIG.gst.sgst / 100) : 0;
    const cgst = Math.round(foodSubtotal * cgstPct);
    const sgst = Math.round(foodSubtotal * sgstPct);

    const grandWithTax = foodSubtotal + cgst + sgst + (isDelivery ? deliveryCharge : 0);

    if (subTotalEl)       subTotalEl.textContent       = `${currency}${foodSubtotal}`;

    // const cgstRowEl = document.getElementById('billCgstRow');
    // const cgstEl    = document.getElementById('billCgst');
    // const sgstRowEl = document.getElementById('billSgstRow');
    // const sgstEl    = document.getElementById('billSgst');
    // if (cgstEl)    cgstEl.textContent    = `${currency}${cgst}`;
    // if (sgstEl)    sgstEl.textContent    = `${currency}${sgst}`;
    const cgstRowEl   = document.getElementById('billCgstRow');
    const cgstEl      = document.getElementById('billCgst');
    const sgstRowEl   = document.getElementById('billSgstRow');
    const sgstEl      = document.getElementById('billSgst');
    const cgstLabelEl = document.getElementById('billCgstLabel');
    const sgstLabelEl = document.getElementById('billSgstLabel');

    if (cgstLabelEl) cgstLabelEl.textContent = `CGST (${HOTEL_CONFIG.gst?.cgst ?? 0}%)`;
    if (sgstLabelEl) sgstLabelEl.textContent = `SGST (${HOTEL_CONFIG.gst?.sgst ?? 0}%)`;
    if (cgstEl)      cgstEl.textContent      = `${currency}${cgst}`;
    if (sgstEl)      sgstEl.textContent      = `${currency}${sgst}`;

    if (deliveryRowEl)    deliveryRowEl.style.display   = isDelivery ? 'flex' : 'none';
    if (deliveryChargeEl) deliveryChargeEl.textContent  = `${currency}${deliveryCharge}`;
    if (totalEl)          totalEl.textContent           = `${currency}${grandWithTax}`;
    // Bill number (timestamp-based)
    const billNoEl = document.getElementById('billNumber');
    if (billNoEl) billNoEl.textContent = `#${Date.now().toString().slice(-6)}`;
  }

  /* ═══════════════════════ BILL PDF ══════════════════════════ */
  function _buildBillData() {
    const orders   = Cart.getPreviousOrders();
    const currency = HOTEL_CONFIG.currency;
    const now      = new Date();
    const billTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const billDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const billNo   = `#${Date.now().toString().slice(-6)}`;

    const allItems = {};
    let grandTotal = 0;
    // const deliveryCharge = 40;
    const deliveryCharge = HOTEL_CONFIG.deliveryCharge || 0;

    orders.forEach(round => {
      round.items.forEach(({ item, qty }) => {
        if (allItems[item.id]) { allItems[item.id].qty += qty; }
        else { allItems[item.id] = { item: { ...item }, qty }; }
        grandTotal += item.price * qty;
      });
    });

    // const firstOrder = orders[0] || {};
    // const isDelivery = firstOrder.orderType === 'delivery';
    // if (isDelivery) grandTotal += deliveryCharge;

    // const cgstPct = HOTEL_CONFIG.gst?.enabled ? (HOTEL_CONFIG.gst.cgst / 100) : 0;
    // const sgstPct = HOTEL_CONFIG.gst?.enabled ? (HOTEL_CONFIG.gst.sgst / 100) : 0;
    // const cgst = Math.round(grandTotal * cgstPct);
    // const sgst = Math.round(grandTotal * sgstPct);
    // grandTotal = grandTotal + cgst + sgst;   // ← ADD THIS

    const firstOrder = orders[0] || {};
    const isDelivery = firstOrder.orderType === 'delivery';

    const foodOnly = grandTotal; // ← save food subtotal BEFORE adding delivery
    if (isDelivery) grandTotal += deliveryCharge;

    const cgstPct = HOTEL_CONFIG.gst?.enabled ? (HOTEL_CONFIG.gst.cgst / 100) : 0;
    const sgstPct = HOTEL_CONFIG.gst?.enabled ? (HOTEL_CONFIG.gst.sgst / 100) : 0;
    const cgst = Math.round(foodOnly * cgstPct); // ← tax on food only
    const sgst = Math.round(foodOnly * sgstPct); // ← tax on food only
    grandTotal = grandTotal + cgst + sgst;

    return {
      hotelName:  HOTEL_CONFIG.hotelName,
      address:    HOTEL_CONFIG.address || '',
      phone:      HOTEL_CONFIG.phone   || '',
      currency,
      billNo, billDate, billTime,
      guestName:  _guest.name  || firstOrder.name  || '',
      guestTable: _guest.table || firstOrder.table || '',
      guestMobile:_guest.mobile|| firstOrder.mobile|| '',
      orderType:  firstOrder.orderType || 'dine-in',
      deliveryAddress: firstOrder.address || '',
      deliveryCharge: isDelivery ? deliveryCharge : 0,
      foodSubtotal: foodOnly,  
      rounds:     orders,
      items:      Object.values(allItems),
      grandTotal,
    };
  }

  function downloadBillPDF() {
    if (typeof window.jspdf === 'undefined') {
      showToast('PDF library loading, please retry', '⏳'); return;
    }
    const { jsPDF } = window.jspdf;
    const d = _buildBillData();
    _generatePDF(d, true);
  }

  function shareBillWhatsApp() {
    const d = _buildBillData();
    const c = d.currency;
    let msg = `🧾 *BILL — ${d.hotelName}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📋 *Bill No:* ${d.billNo}\n`;
    msg += `📅 *Date:* ${d.billDate}  🕐 ${d.billTime}\n`;
    if (d.orderType === 'dine-in') msg += `📍 *Table No:* ${d.guestTable || '—'}\n`;
    if (d.guestName)   msg += `👤 *Guest:* ${d.guestName}\n`;
    if (d.guestMobile) msg += `📱 *Mobile:* ${d.guestMobile}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `*ITEMS ORDERED:*\n`;
    d.items.forEach(({ item, qty }) => {
      const dot = item.type === 'veg' ? '🟢' : '🔴';
      const total = item.price * qty;
      msg += `${dot} ${item.name} × ${qty}  →  ${c}${total}\n`;
    });
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    if (d.rounds.length > 1) {
      d.rounds.forEach(r => { msg += `Order ${r.round} (${r.time}): ${c}${r.total}\n`; });
      msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    }
    // if (d.deliveryCharge) msg += `🛵 Delivery Charge: ${c}${d.deliveryCharge}\n`;
    // msg += `💰 *TOTAL AMOUNT: ${c}${d.grandTotal}*\n`;
    // const _foodSub = d.grandTotal - (d.deliveryCharge || 0) - 
    // Math.round((d.grandTotal - (d.deliveryCharge || 0)) * (HOTEL_CONFIG.gst?.cgst || 0) / 100) - 
    // Math.round((d.grandTotal - (d.deliveryCharge || 0)) * (HOTEL_CONFIG.gst?.sgst || 0) / 100);

    const cgstPct = HOTEL_CONFIG.gst?.enabled ? (HOTEL_CONFIG.gst.cgst / 100) : 0;
    const sgstPct = HOTEL_CONFIG.gst?.enabled ? (HOTEL_CONFIG.gst.sgst / 100) : 0;
    const cgst = Math.round(d.foodSubtotal * cgstPct);
    const sgst = Math.round(d.foodSubtotal * sgstPct);

    if (cgst > 0) msg += `CGST (${HOTEL_CONFIG.gst.cgst}%): ${c}${cgst}\n`;
    if (sgst > 0) msg += `SGST (${HOTEL_CONFIG.gst.sgst}%): ${c}${sgst}\n`;
    if (d.deliveryCharge) msg += `🛵 Delivery Charge: ${c}${d.deliveryCharge}\n`;
    msg += `💰 *TOTAL AMOUNT: ${c}${d.grandTotal}*\n`;

    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += d.orderType === 'delivery'
      ? `💳 _Pay via UPI / QR or pay cash to delivery boy_\n`
      : `⚠️ _Payment pending at billing desk_\n`;
    msg += `_Sent via QR Menu_`;
    window.open(`https://wa.me/${HOTEL_CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  }
  //newly added
  // function _generatePDF(d, download) {
  //   const { jsPDF } = window.jspdf;
  //   const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 220] });
  //   const W = doc.internal.pageSize.getWidth();
  //   const H = doc.internal.pageSize.getHeight();
  //   const c = 'Rs.';
  //   const MARGIN = 5;
  //   const L = MARGIN;
  //   const R = W - MARGIN;
  //   const CW = R - L;
  //   let y = 6;

  //   /* ── helpers ─────────────────────────────────────────── */
  //   const dashed = (yy) => {
  //     doc.setDrawColor(160, 160, 160);
  //     doc.setLineWidth(0.2);
  //     doc.setLineDash([1, 1], 0);
  //     doc.line(L, yy, R, yy);
  //     doc.setLineDash([], 0);
  //   };
  //   const solid = (yy) => {
  //     doc.setDrawColor(180, 180, 180);
  //     doc.setLineWidth(0.25);
  //     doc.line(L, yy, R, yy);
  //   };
  //   const center = (txt, yy, size = 9, style = 'normal') => {
  //     doc.setFont('helvetica', style);
  //     doc.setFontSize(size);
  //     doc.setTextColor(20, 20, 20);
  //     doc.text(txt, W / 2, yy, { align: 'center' });
  //   };
  //   const left = (txt, yy, size = 8, style = 'normal', color = [20,20,20]) => {
  //     doc.setFont('helvetica', style);
  //     doc.setFontSize(size);
  //     doc.setTextColor(...color);
  //     doc.text(txt, L, yy);
  //   };
  //   const right = (txt, yy, size = 8, style = 'normal') => {
  //     doc.setFont('helvetica', style);
  //     doc.setFontSize(size);
  //     doc.setTextColor(20, 20, 20);
  //     doc.text(txt, R, yy, { align: 'right' });
  //   };

  //   /* ── White background ────────────────────────────────── */
  //   doc.setFillColor(255, 255, 255);
  //   doc.rect(0, 0, W, H, 'F');

  //   /* ── Restaurant icon (drawn, no image needed) ────────── */
  //   // Plate circle
  //   doc.setDrawColor(30, 30, 30);
  //   doc.setLineWidth(0.6);
  //   doc.circle(W / 2, y + 5, 5);
  //   doc.setFillColor(30, 30, 30);
  //   doc.circle(W / 2, y + 5, 5, 'S');
  //   // Dome shape (filled arc simulation with ellipse)
  //   doc.setFillColor(255, 255, 255);
  //   doc.ellipse(W / 2, y + 4.5, 3.5, 2.5, 'F');
  //   // Fork left
  //   doc.setDrawColor(30, 30, 30);
  //   doc.setLineWidth(0.5);
  //   doc.line(W / 2 - 7, y, W / 2 - 7, y + 10);
  //   doc.line(W / 2 - 8.5, y, W / 2 - 8.5, y + 4);
  //   doc.line(W / 2 - 7, y + 4, W / 2 - 8.5, y + 4);
  //   // Knife right
  //   doc.line(W / 2 + 7, y, W / 2 + 7, y + 10);
  //   doc.line(W / 2 + 8.5, y, W / 2 + 8.5, y + 3);
  //   doc.line(W / 2 + 7, y + 3, W / 2 + 8.5, y + 3);

  //   y += 14;

  //   // "Restaurant" italic text under icon
  //   doc.setFont('helvetica', 'bolditalic');
  //   doc.setFontSize(9);
  //   doc.setTextColor(30, 30, 30);
  //   doc.text('Restaurant', W / 2, y, { align: 'center' });
  //   y += 7;

  //   /* ── Hotel name + address + phone ────────────────────── */
  //   center(d.hotelName.toUpperCase(), y, 12, 'bold');
  //   y += 6;
  //   if (d.address) { center(d.address, y, 8); y += 5; }
  //   if (d.phone)   { center(d.phone,   y, 8); y += 5; }
  //   y += 3;

  //   solid(y); y += 5;

  //   /* ── Receipt meta ────────────────────────────────────── */
  //   left(`Receipt No.: ${d.billNo}`, y, 8);           y += 5;
  //   if (d.orderType !== 'delivery' && d.guestTable) {
  //     left(`Table No.: ${d.guestTable}`, y, 8);       y += 5;
  //   }
  //   left(`Date: ${d.billDate}   ${d.billTime}`, y, 8); y += 5;
  //   if (d.guestName) {
  //     left(`Customer Name: ${d.guestName}`, y, 8);    y += 5;
  //   }
  //   if (d.guestMobile) {
  //     left(`Mobile: ${d.guestMobile}`, y, 8);         y += 5;
  //   }
  //   if (d.orderType === 'delivery' && d.deliveryAddress) {
  //     const addrLines = doc.splitTextToSize(`Deliver To: ${d.deliveryAddress}`, CW);
  //     addrLines.forEach(line => { left(line, y, 8); y += 5; });
  //   }
  //   y += 2;

  //   /* ── Column headers ──────────────────────────────────── */
  //   const COL_ITEM  = L;
  //   const COL_PRICE = W - 32;
  //   const COL_AMT   = R;

  //   doc.setFont('helvetica', 'bold');
  //   doc.setFontSize(8.5);
  //   doc.setTextColor(20, 20, 20);
  //   doc.text('QTY/ Item Name', COL_ITEM,  y);
  //   doc.text('Price',          COL_PRICE, y, { align: 'right' });
  //   doc.text('Amount',         COL_AMT,   y, { align: 'right' });
  //   y += 3;
  //   dashed(y); y += 4;

  //   /* ── Items ───────────────────────────────────────────── */
  //   d.items.forEach(({ item, qty }) => {
  //     const label = `${qty}  ${item.name}`;
  //     const nameLines = doc.splitTextToSize(label, COL_PRICE - L - 4);
  //     const rowH = nameLines.length * 5;

  //     doc.setFont('helvetica', 'normal');
  //     doc.setFontSize(8);
  //     doc.setTextColor(20, 20, 20);
  //     doc.text(nameLines, COL_ITEM, y + 4);
  //     doc.text(`${item.price}.00`, COL_PRICE, y + 4, { align: 'right' });

  //     doc.setFont('helvetica', 'normal');
  //     doc.text(`${item.price * qty}.00`, COL_AMT, y + 4, { align: 'right' });

  //     y += Math.max(8, rowH + 2);
  //     dashed(y); y += 4;
  //   });

  //   /* ── Totals ──────────────────────────────────────────── */
  //   const foodSubtotal   = d.grandTotal - (d.deliveryCharge || 0);
  //   const cgst           = Math.round(foodSubtotal * 0.00);
  //   const sgst           = Math.round(foodSubtotal * 0.00);
  //   const taxedTotal     = foodSubtotal + cgst + sgst + (d.deliveryCharge || 0);
  
  //   left('Sub Total:',  y, 8); right(`${foodSubtotal}.00`,  y, 8); y += 5;
  //   left('CGST: 0%',    y, 8); right(`${cgst}.00`,          y, 8); y += 5;
  //   left('SGST: 0%',    y, 8); right(`${sgst}.00`,          y, 8); y += 5;

  //   if (d.deliveryCharge) {
  //     left('Delivery:',  y, 8); right(`${d.deliveryCharge}.00`, y, 8); y += 5;
  //   }

  //   doc.setFont('helvetica', 'bold');
  //   doc.setFontSize(9);
  //   doc.setTextColor(20, 20, 20);
  //   doc.text('Total:', L, y);
  //   doc.text(`${taxedTotal}.00`, R, y, { align: 'right' });
  //   y += 7;

  //   solid(y); y += 5;

  //   /* ── Payment mode ────────────────────────────────────── */
  //   const payMode = d.orderType === 'delivery' ? 'UPI / Cash' : 'Cash / Card';
  //   left(`Payment Mode: ${payMode}`, y, 8); y += 8;

  //   solid(y); y += 7;

  //   /* ── Footer ──────────────────────────────────────────── */
  //   center('PLEASE VISIT US AGAIN', y, 9, 'bold'); y += 6;
  //   center('THANK YOU!!',           y, 9, 'bold'); y += 8;

  //   /* ── Barcode (simulated with vertical lines) ─────────── */
  //   const bcX    = L + CW * 0.05;
  //   const bcW    = CW * 0.9;
  //   const bcH    = 12;
  //   const bars   = 60;
  //   const barW   = bcW / bars;
  //   const seed   = d.billNo.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0);

  //   for (let i = 0; i < bars; i++) {
  //     const thick = ((seed * (i + 3)) % 5 < 2);
  //     doc.setFillColor(20, 20, 20);
  //     doc.rect(bcX + i * barW, y, thick ? barW * 1.5 : barW * 0.7, bcH, 'F');
  //   }
  //   y += bcH + 4;

  //   // Barcode number under bars
  //   center(d.billNo.replace('#', '').padStart(12, '0'), y, 6);

  //   /* ── Save ────────────────────────────────────────────── */
  //   const fileName = `Receipt-${d.hotelName.replace(/\s+/g, '-')}-${d.billNo}.pdf`;
  //   doc.save(fileName);
  //   showToast('Receipt downloaded!', '✨');
  // }

  function _generatePDF(d, download) {
    const { jsPDF } = window.jspdf;
    const estimatedH = 150 + (d.items.length * 14) + (d.rounds && d.rounds.length > 1 ? d.rounds.length * 7 : 0) + (d.deliveryAddress ? 12 : 0);
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, estimatedH] });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const c = 'Rs.';
    const M = 4;
    const L = M;
    const R = W - M;
    const CW = R - L;
    let y = 0;

    // helpers
    const fill = (x, yy, w, h, r, g, b) => {
      doc.setFillColor(r, g, b); doc.rect(x, yy, w, h, 'F');
    };
    const txtC = (str, yy, sz, style, cr, cg, cb) => {
      doc.setFont('helvetica', style || 'normal');
      doc.setFontSize(sz || 8);
      doc.setTextColor(cr ?? 20, cg ?? 18, cb ?? 12);
      doc.text(String(str), W / 2, yy, { align: 'center' });
    };
    const txtL = (str, x, yy, sz, style, cr, cg, cb) => {
      doc.setFont('helvetica', style || 'normal');
      doc.setFontSize(sz || 8);
      doc.setTextColor(cr ?? 20, cg ?? 18, cb ?? 12);
      doc.text(String(str), x, yy);
    };
    const txtR = (str, x, yy, sz, style, cr, cg, cb) => {
      doc.setFont('helvetica', style || 'normal');
      doc.setFontSize(sz || 8);
      doc.setTextColor(cr ?? 20, cg ?? 18, cb ?? 12);
      doc.text(String(str), x, yy, { align: 'right' });
    };
    const dashed = (yy) => {
      doc.setDrawColor(180, 170, 148);
      doc.setLineWidth(0.2);
      doc.setLineDash([0.8, 0.8], 0);
      doc.line(L, yy, R, yy);
      doc.setLineDash([], 0);
    };
    const solid = (yy) => {
      doc.setDrawColor(60, 55, 40);
      doc.setLineWidth(0.3);
      doc.line(L, yy, R, yy);
    };
    const metaRow = (lbl, val, yy) => {
      txtL(lbl, L, yy, 7.5, 'normal', 138, 126, 98);
      txtR(val, R, yy, 7.5, 'bold', 22, 20, 14);
    };

    // white background
    fill(0, 0, W, H, 255, 255, 255);

    // ── HEADER dark band ──────────────────────────────
    const HDR_H = 36;
    fill(0, 0, W, HDR_H, 22, 20, 14);

    // three gold decorative lines
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.25); doc.line(W * 0.25, 5,   W * 0.75, 5);
    doc.setLineWidth(0.7);  doc.line(W * 0.25, 6.2, W * 0.75, 6.2);
    doc.setLineWidth(0.25); doc.line(W * 0.25, 7.4, W * 0.75, 7.4);

    // fork | plate | knife icon (centred)
    const ix = W / 2, ib = 14;
    doc.setDrawColor(212, 175, 55); doc.setLineWidth(0.5);
    // plate
    doc.circle(ix, ib, 3.5); fill(ix - 2, ib - 2, 4, 4, 22, 20, 14);
    // fork left
    doc.line(ix - 7, ib - 4, ix - 7, ib + 4);
    doc.line(ix - 8.2, ib - 4, ix - 8.2, ib);
    doc.line(ix - 7, ib, ix - 8.2, ib);
    // knife right
    doc.line(ix + 7, ib - 4, ix + 7, ib + 4);
    doc.line(ix + 8.2, ib - 4, ix + 8.2, ib - 1);
    doc.line(ix + 7, ib - 1, ix + 8.2, ib - 1);

    y = ib + 7;

    // hotel name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(212, 175, 55);
    doc.text(d.hotelName.toUpperCase(), W / 2, y, { align: 'center', charSpace: 1.5 });
    y += 5;

    // subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(160, 148, 110);
    doc.text('OFFICIAL ORDER BILL', W / 2, y, { align: 'center', charSpace: 1.2 });
    y += 3.5;

    // address / phone
    if (d.address || d.phone) {
      const contact = [d.address, d.phone].filter(Boolean).join('  |  ');
      doc.setFontSize(5.5);
      doc.setTextColor(110, 100, 76);
      doc.text(contact, W / 2, y, { align: 'center' });
    }

    // gold closing rule
    fill(0, HDR_H - 0.7, W, 0.7, 212, 175, 55);

    y = HDR_H + 5;

    // ── META ─────────────────────────────────────────
    metaRow('Receipt No.', d.billNo,   y); y += 5.5;
    metaRow('Date',        d.billDate, y); y += 5.5;
    metaRow('Time',        d.billTime, y); y += 5.5;
    metaRow('Order Type',  d.orderType === 'delivery' ? 'Home Delivery' : 'Dine-In', y); y += 5.5;
    metaRow('Rounds',      String(d.rounds ? d.rounds.length : 1), y); y += 4;

    dashed(y); y += 5;

    // ── CUSTOMER ─────────────────────────────────────
    if (d.guestName || d.guestMobile || d.guestTable || d.deliveryAddress) {
      if (d.guestName)   { metaRow('Customer', d.guestName,   y); y += 5.5; }
      if (d.guestMobile) { metaRow('Mobile',   d.guestMobile, y); y += 5.5; }
      if (d.guestTable && d.orderType !== 'delivery') {
        metaRow('Table No.', d.guestTable, y); y += 5.5;
      }
      if (d.deliveryAddress) {
        txtL('Deliver To', L, y, 7.5, 'normal', 138, 126, 98);
        const al = doc.splitTextToSize(d.deliveryAddress, CW * 0.55);
        txtR(al[0], R, y, 7.5, 'bold', 22, 20, 14); y += 5;
        al.slice(1).forEach(ln => { txtR(ln, R, y, 7, 'normal', 22, 20, 14); y += 5; });
      }
      dashed(y); y += 5;
    }

    // ── ITEMS TABLE ───────────────────────────────────
    // column X positions — all right-aligned anchors
    const C_NAME = L + 5;   // item name left edge
    const C_QTY  = R - 26;  // qty  right anchor
    const C_RATE = R - 13;  // rate right anchor
    const C_AMT  = R;       // amt  right anchor
    const NAME_W = C_QTY - C_NAME - 2;

    // header row
    fill(0, y, W, 8, 22, 20, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(212, 175, 55);
    doc.text('ITEM',   C_NAME, y + 5.5);
    doc.text('QTY',    C_QTY,  y + 5.5, { align: 'right' });
    doc.text('RATE',   C_RATE, y + 5.5, { align: 'right' });
    doc.text('AMT',    C_AMT,  y + 5.5, { align: 'right' });
    y += 9;

    // item rows
    d.items.forEach(({ item, qty }, idx) => {
      const lines = doc.splitTextToSize(item.name, NAME_W);
      const rowH  = Math.max(10, lines.length * 5 + 3);

      // alternating bg
      if (idx % 2 !== 0) fill(0, y, W, rowH, 250, 248, 242);

      // veg / non-veg square
      const isVeg = item.type === 'veg';
      doc.setDrawColor(isVeg ? 30 : 200, isVeg ? 155 : 40, isVeg ? 30 : 40);
      doc.setLineWidth(0.8);
      doc.rect(L + 0.5, y + rowH / 2 - 1.5, 2.8, 2.8);

      const midY = y + rowH / 2 + 1.5;

      // item name
      txtL(lines, C_NAME, y + 5.5, 7.5, 'normal', 22, 20, 14);

      // qty
      txtR(String(qty),          C_QTY,  midY, 7.5, 'normal', 100, 92, 76);
      // rate
      txtR(`${c}${item.price}`,  C_RATE, midY, 7.5, 'normal', 100, 92, 76);
      // amount
      txtR(`${c}${item.price * qty}`, C_AMT, midY, 7.5, 'bold', 22, 20, 14);

      y += rowH;
    });

    // table bottom rule
    fill(0, y, W, 0.5, 22, 20, 14);
    y += 6;

    // ── TOTALS ───────────────────────────────────────
    // const foodSub    = d.grandTotal - (d.deliveryCharge || 0);
    const foodSub = d.foodSubtotal;

    const cgstPct = HOTEL_CONFIG.gst?.enabled ? (HOTEL_CONFIG.gst.cgst / 100) : 0;
    const sgstPct = HOTEL_CONFIG.gst?.enabled ? (HOTEL_CONFIG.gst.sgst / 100) : 0;
    const cgst    = Math.round(foodSub * cgstPct);
    const sgst    = Math.round(foodSub * sgstPct);

    const grandFinal = foodSub + cgst + sgst + (d.deliveryCharge || 0);

    const totRow = (lbl, val, bold) => {
      txtL(lbl, L,  y, 7.5, bold ? 'bold' : 'normal', bold ? 22 : 110, bold ? 20 : 100, bold ? 14 : 78);
      txtR(val, R,  y, 7.5, bold ? 'bold' : 'normal', bold ? 22 : 110, bold ? 20 : 100, bold ? 14 : 78);
      y += 5.5;
    };

    totRow('Sub Total:',  `${c}${foodSub}`);
    // totRow('CGST (5%):', `${c}${cgst}`);
    // totRow('SGST (5%):', `${c}${sgst}`);
    totRow(`CGST (${HOTEL_CONFIG.gst?.cgst ?? 0}%):`, `${c}${cgst}`);
    totRow(`SGST (${HOTEL_CONFIG.gst?.sgst ?? 0}%):`, `${c}${sgst}`);
    if (d.deliveryCharge) {
      txtL('Delivery:', L, y, 7.5, 'normal', 180, 100, 20);
      txtR(`${c}${d.deliveryCharge}`, R, y, 7.5, 'bold', 180, 100, 20);
      y += 5.5;
    }

    y += 1; solid(y); y += 2;

    // grand total band
    fill(0, y, W, 12, 22, 20, 14);
    fill(0, y, 3,  12, 212, 175, 55);  // gold left accent
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(212, 175, 55);
    doc.text('GRAND TOTAL', L + 5, y + 8);
    doc.setFontSize(10);
    doc.text(`${c}${grandFinal}`, R, y + 8, { align: 'right' });
    y += 16;

    // ── PAYMENT MODE ─────────────────────────────────
    const payMode = d.orderType === 'delivery' ? 'UPI / Cash on Delivery' : 'UPI / Cash';
    txtL(`Payment Mode: ${payMode}`, L, y, 7.5, 'normal', 90, 82, 62); y += 8;

    // payment notice box (gold dashed border)
    doc.setFillColor(255, 251, 232);
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.3);
    doc.setLineDash([1, 1], 0);
    doc.rect(L, y, CW, 14, 'FD');
    doc.setLineDash([], 0);

    const pl1 = d.orderType === 'delivery' ? 'Pay via UPI or cash to delivery boy' : 'Complete payment at billing counter';
    const pl2 = d.orderType === 'delivery' ? 'Amount includes delivery charge'     : 'Show this receipt at cashier desk';
    txtC(pl1, y + 6,  7.5, 'bold',   22, 20, 14);
    txtC(pl2, y + 11, 6.5, 'normal', 130, 118, 88);
    y += 18;

    // ── BARCODE ───────────────────────────────────────
    const bcX  = L + CW * 0.05;
    const bcW  = CW * 0.9;
    const bcH  = 12;
    const bars = 55;
    const bw   = bcW / bars;
    const seed = d.billNo.split('').reduce((a, ch) => a + ch.charCodeAt(0), 71);

    for (let i = 0; i < bars; i++) {
      const thick = ((seed * (i + 7) * 13) % 7) < 3;
      fill(bcX + i * bw, y, thick ? bw * 1.4 : bw * 0.65, bcH, 22, 20, 14);
    }
    y += bcH + 3;
    txtC(d.billNo.replace('#', '').padStart(12, '0'), y, 6.5, 'normal', 130, 118, 88);
    y += 7;

    // ── FOOTER dark band ─────────────────────────────
    fill(0, y, W, 18, 22, 20, 14);
    fill(0, y, W, 0.7, 212, 175, 55);
    txtC('PLEASE VISIT US AGAIN', y + 7,  8.5, 'bold', 212, 175, 55);
    txtC('THANK YOU!!',           y + 14, 8.5, 'bold', 212, 175, 55);

    // ── SAVE ─────────────────────────────────────────
    const fileName = `Receipt-${d.hotelName.replace(/\s+/g, '-')}-${d.billNo}.pdf`;
    doc.save(fileName);
    showToast('Receipt downloaded!', '✨');
  }

  function closeBillAndReset() {
    // Clear all data — hard reset without confirm (bill was already generated)
    Cart.startFreshOrder();
    localStorage.removeItem('hotel_guest');
    localStorage.removeItem('currentPage');
    localStorage.removeItem('hotel_last_result');  
    _guest = { name: '', mobile: '', table: '' };
    ['fieldName','fieldMobile'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    _showScreen('welcome');
  }

  /* ═══════════════════════ SWIPE DRAWER ══════════════════════ */
  function _setupDrawerSwipe() {
    const drawer = document.getElementById('drawer');
    let startY = 0;
    drawer.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    drawer.addEventListener('touchend',   e => { if (e.changedTouches[0].clientY - startY > 80) closeCart(); }, { passive: true });
  }

  /* ═══════════════════════ TOAST ═════════════════════════════ */
  function showToast(msg, icon = '✓') {
    const t = document.getElementById('toast');
    if (!t) return;
    clearTimeout(_toastTimer); clearTimeout(_toastHideTimer);
    t.classList.remove('show', 'hide');
    const iconEl = document.getElementById('toastIcon');
    const msgEl  = document.getElementById('toastMsg');
    if (iconEl) iconEl.textContent = icon;
    if (msgEl)  msgEl.innerHTML    = msg;
    void t.offsetWidth;
    t.classList.add('show');
    _toastTimer = setTimeout(() => {
      t.classList.remove('show'); t.classList.add('hide');
      _toastHideTimer = setTimeout(() => t.classList.remove('hide'), 300);
    }, 2400);
  }

  /* ═══════════════════════ HOTEL NAME ════════════════════════ */
  function renderHotelName(el, full = false) {
    if (!el) return;
    const words = HOTEL_CONFIG.hotelName.split(' ');
    if (words.length === 1) { el.innerHTML = `<span>${words[0]}</span>`; return; }
    el.innerHTML = full
      ? words.slice(0,-1).join(' ') + ' <span>' + words[words.length-1] + '</span>'
      : words[0] + ' <span>' + words.slice(1).join(' ') + '</span>';
  }

  return {
    boot, enterMenu, goBackToMenu, goBackToMenuFromBill, startFreshOrder,
    openCart, closeCart, placeOrder,
    openOrderTypeModal, closeOrderTypeModal,
    selectOrderType, confirmDineIn, confirmDelivery,
    showOrderStep: _showOrderStep,   // ← ADD THIS
    generateBill, downloadBillPDF, shareBillWhatsApp, closeBillAndReset,
    toggleTheme, showToast, renderHotelName,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.boot();
  App.renderHotelName(document.getElementById('headerHotelName'), false);
  App.renderHotelName(document.querySelector('.welcome-hotel-name'), true);
  const tagEl = document.querySelector('.welcome-tagline');
  if (tagEl) tagEl.textContent = HOTEL_CONFIG.tagline;
});
