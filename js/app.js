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

  function _restoreSession() {
    const lastPage = localStorage.getItem('currentPage');
    if (_guest && (_guest.name || _guest.mobile || _guest.table)) {
      const ni = document.getElementById('fieldName');
      const mi = document.getElementById('fieldMobile');
      if (ni) ni.value = _guest.name   || '';
      if (mi) mi.value = _guest.mobile || '';
      _updateGuestChip();
    }
    if (lastPage && lastPage !== 'welcome') { Menu.init(); _showScreen(lastPage); }
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
    _guest = { name: '', mobile: '', table: '' };
    ['fieldName','fieldMobile'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    _showScreen('welcome');
  }

  function goBackToMenu() {
    closeCart();
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

  function _updateDeliveryTotals() {
    const { subtotal } = Cart.getTotals();
    const currency = HOTEL_CONFIG.currency;
    const deliveryCharge = 40;
    const grandTotal = subtotal + deliveryCharge;
    const subEl   = document.getElementById('deliverySubtotalDisplay');
    const totalEl = document.getElementById('deliveryGrandTotalDisplay');
    const chargeEl = document.getElementById('deliveryChargeDisplay');
    if (subEl)    subEl.textContent   = `${currency}${subtotal}`;
    if (totalEl)  totalEl.textContent = `${currency}${grandTotal}`;
    if (chargeEl) chargeEl.textContent = `+ ${currency}${deliveryCharge} delivery charge added`;
  }

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

  function _afterOrder(result) {
    closeOrderTypeModal();
    const on = document.getElementById('orderNotes');
    if (on) on.value = '';

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
      if (tableEl)   tableEl.textContent = result.table || '—';
      if (addrCard)  addrCard.style.display = 'none';
    } else {
      if (tableCard) tableCard.style.display = 'none';
      if (addrCard)  addrCard.style.display = 'flex';
      if (addrEl)    addrEl.textContent = result.address || '';
    }

    if (result.name) {
      if (nameEl)   nameEl.textContent = result.name;
      if (nameCard) nameCard.style.display = 'flex';
    } else {
      if (nameCard) nameCard.style.display = 'none';
    }

    if (roundEl) roundEl.style.display = result.orderRound > 1 ? 'block' : 'none';

    closeCart();
    setTimeout(() => _showScreen('success'), 320);
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
    const deliveryCharge = 40;

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

    if (subTotalEl)      subTotalEl.textContent      = `${currency}${foodSubtotal}`;
    if (deliveryRowEl)   deliveryRowEl.style.display  = isDelivery ? 'flex' : 'none';
    if (deliveryChargeEl) deliveryChargeEl.textContent = `${currency}${deliveryCharge}`;
    if (totalEl)         totalEl.textContent          = `${currency}${grandTotal}`;

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
    const deliveryCharge = 40;
    orders.forEach(round => {
      round.items.forEach(({ item, qty }) => {
        if (allItems[item.id]) { allItems[item.id].qty += qty; }
        else { allItems[item.id] = { item: { ...item }, qty }; }
        grandTotal += item.price * qty;
      });
    });

    const firstOrder = orders[0] || {};
    const isDelivery = firstOrder.orderType === 'delivery';
    if (isDelivery) grandTotal += deliveryCharge;
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
    if (d.deliveryCharge) msg += `🛵 Delivery Charge: ${c}${d.deliveryCharge}\n`;
    msg += `💰 *TOTAL AMOUNT: ${c}${d.grandTotal}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += d.orderType === 'delivery'
      ? `💳 _Pay via UPI / QR or pay cash to delivery boy_\n`
      : `⚠️ _Payment pending at billing desk_\n`;
    msg += `_Sent via QR Menu_`;
    window.open(`https://wa.me/${HOTEL_CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  function _generatePDF(d, download) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
    const W = doc.internal.pageSize.getWidth();   // 148mm for A5
    const H = doc.internal.pageSize.getHeight();  // 210mm for A5
    const c = d.currency;
    const MARGIN = 10;
    const CONTENT_W = W - MARGIN * 2;
    let y = 0;

    // ── Background ──────────────────────────────────────────────
    doc.setFillColor(250, 248, 244);
    doc.rect(0, 0, W, H, 'F');

    // ── Header band ─────────────────────────────────────────────
    doc.setFillColor(22, 22, 20);
    doc.rect(0, 0, W, 38, 'F');

    // Gold accent bar at very top
    doc.setFillColor(212, 175, 55);
    doc.rect(0, 0, W, 3, 'F');

    // Hotel name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(212, 175, 55);
    doc.text(d.hotelName.toUpperCase(), W / 2, 16, { align: 'center' });

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(200, 195, 185);
    doc.text('OFFICIAL ORDER BILL', W / 2, 23, { align: 'center' });

    // Address & phone
    if (d.address || d.phone) {
      const contact = [d.address, d.phone].filter(Boolean).join('  ·  ');
      doc.setFontSize(6.5);
      doc.setTextColor(160, 155, 145);
      doc.text(contact, W / 2, 30, { align: 'center' });
    }

    // Gold bottom rule on header
    doc.setFillColor(212, 175, 55);
    doc.rect(0, 35, W, 0.6, 'F');

    y = 45;

    // ── Bill Info Box ───────────────────────────────────────────
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 215, 205);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN, y, CONTENT_W, 28, 2.5, 2.5, 'FD');

    const colMid = W / 2;
    const leftX  = MARGIN + 5;
    const rightX = colMid + 5;

    // Left column
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(130, 125, 115);
    doc.text('BILL NO.',  leftX, y + 7);
    doc.text('DATE',      leftX, y + 14);
    doc.text('TIME',      leftX, y + 21);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(25, 25, 22);
    doc.text(d.billNo,     leftX + 22, y + 7);
    doc.text(d.billDate,   leftX + 22, y + 14);
    doc.text(d.billTime,   leftX + 22, y + 21);

    // Vertical divider
    doc.setDrawColor(220, 215, 205);
    doc.setLineWidth(0.3);
    doc.line(colMid, y + 4, colMid, y + 24);

    // Right column
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(130, 125, 115);
    doc.text('ORDER TYPE', rightX, y + 7);
    doc.text('STATUS',     rightX, y + 14);
    doc.text('ROUNDS',     rightX, y + 21);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(25, 25, 22);
    const orderTypeLabel = d.orderType === 'delivery' ? 'Home Delivery' : 'Dine-In';
    doc.text(orderTypeLabel, rightX + 25, y + 7);
    doc.text('Pending Payment', rightX + 25, y + 14);
    doc.text(String(d.rounds.length), rightX + 25, y + 21);

    y += 34;

    // ── Guest / Delivery Info ───────────────────────────────────
    const guestRows = [];
    if (d.guestName)    guestRows.push(['Customer',  d.guestName]);
    if (d.guestMobile)  guestRows.push(['Mobile',    d.guestMobile]);
    if (d.guestTable && d.orderType !== 'delivery') guestRows.push(['Table No.',  d.guestTable]);
    if (d.deliveryAddress) guestRows.push(['Deliver To', d.deliveryAddress]);

    if (guestRows.length > 0) {
      const ROW_H = 8;
      // Calculate box height dynamically for multi-line address
      let totalBoxH = 8;
      const rowHeights = guestRows.map(row => {
        const split = doc.splitTextToSize(row[1], CONTENT_W - 46);
        return Math.max(ROW_H, split.length * 4.5 + 3);
      });
      totalBoxH += rowHeights.reduce((a, b) => a + b, 0);

      doc.setFillColor(248, 246, 241);
      doc.setDrawColor(220, 215, 205);
      doc.setLineWidth(0.3);
      doc.roundedRect(MARGIN, y, CONTENT_W, totalBoxH, 2.5, 2.5, 'FD');

      let ry = y + 6;
      guestRows.forEach((row, idx) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(100, 95, 85);
        doc.text(row[0].toUpperCase(), leftX, ry);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(25, 25, 22);
        doc.setFontSize(7.5);
        const split = doc.splitTextToSize(row[1], CONTENT_W - 46);
        doc.text(split, leftX + 30, ry);
        ry += rowHeights[idx];
      });

      y += totalBoxH + 6;
    }

    // ── Items Table ─────────────────────────────────────────────
    // Header
    doc.setFillColor(22, 22, 20);
    doc.roundedRect(MARGIN, y, CONTENT_W, 9, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(212, 175, 55);
    doc.text('ITEM',           leftX,        y + 6);
    doc.text('QTY',            W - MARGIN - 28, y + 6, { align: 'right' });
    doc.text('RATE',           W - MARGIN - 14, y + 6, { align: 'right' });
    doc.text('AMOUNT',         W - MARGIN - 1,  y + 6, { align: 'right' });
    y += 11;

    // Items
    d.items.forEach(({ item, qty }, idx) => {
      const rowBg = idx % 2 === 0 ? [255,255,255] : [249,247,243];
      doc.setFillColor(...rowBg);
      const itemLines = doc.splitTextToSize(item.name, CONTENT_W - 50);
      const rowH = Math.max(9, itemLines.length * 4.5 + 4);
      doc.rect(MARGIN, y, CONTENT_W, rowH, 'F');

      // Veg/non-veg dot
      doc.setFillColor(item.type === 'veg' ? 34 : 220, item.type === 'veg' ? 139 : 38, item.type === 'veg' ? 34 : 38);
      doc.circle(leftX - 0.5, y + rowH / 2, 1.2, 'F');

      // Item name
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(25, 25, 22);
      doc.text(itemLines, leftX + 3, y + 5.5);

      // Qty, rate, amount — vertically centered
      const midY = y + rowH / 2 + 1.5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 55, 50);
      doc.text(String(qty),              W - MARGIN - 28, midY, { align: 'right' });
      doc.text(`${c}${item.price}`,       W - MARGIN - 14, midY, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 25, 22);
      doc.text(`${c}${item.price * qty}`, W - MARGIN - 1,  midY, { align: 'right' });

      y += rowH;
    });

    // ── Totals block ─────────────────────────────────────────────
    y += 4;
    doc.setDrawColor(200, 195, 185);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y, W - MARGIN, y);
    y += 5;

    // Food subtotal
    const foodSubtotal = d.grandTotal - (d.deliveryCharge || 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 75, 65);
    doc.text('Food Subtotal', leftX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 25, 22);
    doc.text(`${c}${foodSubtotal}`, W - MARGIN - 1, y, { align: 'right' });
    y += 7;

    // Delivery charge (if applicable)
    if (d.deliveryCharge) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 75, 65);
      doc.text('Home Delivery Charge', leftX, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(200, 120, 30);
      doc.text(`+ ${c}${d.deliveryCharge}`, W - MARGIN - 1, y, { align: 'right' });
      y += 5;

      // Thin divider before grand total
      doc.setDrawColor(200, 195, 185);
      doc.setLineWidth(0.3);
      doc.line(MARGIN + CONTENT_W * 0.4, y, W - MARGIN, y);
      y += 5;
    }

    // Grand total band
    doc.setFillColor(22, 22, 20);
    doc.roundedRect(MARGIN, y - 3, CONTENT_W, 13, 2.5, 2.5, 'F');
    doc.setFillColor(212, 175, 55);
    doc.roundedRect(MARGIN, y - 3, CONTENT_W, 13, 2.5, 2.5, 'S'); // outline

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(212, 175, 55);
    doc.text('GRAND TOTAL', leftX, y + 5.5);
    doc.setFontSize(11);
    doc.text(`${c}${d.grandTotal}`, W - MARGIN - 1, y + 5.5, { align: 'right' });

    y += 18;

    // ── Payment notice ───────────────────────────────────────────
    if (y + 20 > H - 12) {
      doc.addPage();
      y = 14;
    }
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 215, 205);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN, y, CONTENT_W, 16, 2.5, 2.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(22, 22, 20);
    if (d.orderType === 'delivery') {
      doc.text('💳  Pay via UPI / QR Code or Cash to Delivery Boy', W / 2, y + 7, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 95, 85);
      doc.text('Amount includes home delivery charge', W / 2, y + 13, { align: 'center' });
    } else {
      doc.text('Please complete payment at the billing counter', W / 2, y + 7, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 95, 85);
      doc.text('Show this bill at the cashier desk', W / 2, y + 13, { align: 'center' });
    }

    y += 22;

    // ── Footer ───────────────────────────────────────────────────
    doc.setFillColor(212, 175, 55);
    doc.rect(0, H - 10, W, 0.6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(130, 125, 115);
    doc.text(`Thank you for dining at ${d.hotelName}  ❤️`, W / 2, H - 5, { align: 'center' });

    const fileName = `Bill-${d.hotelName.replace(/\s+/g, '-')}-${d.billNo}.pdf`;
    doc.save(fileName);
    showToast('Professional bill PDF downloaded!', '✨');
  }

  function closeBillAndReset() {
    // Clear all data — hard reset without confirm (bill was already generated)
    Cart.startFreshOrder();
    localStorage.removeItem('hotel_guest');
    localStorage.removeItem('currentPage');
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
    boot, enterMenu, goBackToMenu, startFreshOrder,
    openCart, closeCart, placeOrder,
    openOrderTypeModal, closeOrderTypeModal,
    selectOrderType, confirmDineIn, confirmDelivery,
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
