/**
 * app.js — Main controller
 * Handles: theme, particles, ripples, screens, guest form,
 *          cart drawer, order-type modal, toast
 */

const App = (() => {

  let _guest = JSON.parse(localStorage.getItem('hotel_guest') || '{"name":"","mobile":"","table":""}');
  let _toastTimer = null;
  let _toastHideTimer = null;

  /* ─── BOOT ─────────────────────────────────────────── */
  function boot() {
    _applyTheme();
    _applyImages();
    _buildWelcomeForm();
    _setupRipples();
    _setupParticles();
    _setupDrawerSwipe();
    _restoreSession();
  }

  /* ─── THEME ─────────────────────────────────────────── */
  function _applyTheme() {
    const t = HOTEL_CONFIG.theme;
    const r = document.documentElement;
    r.style.setProperty('--accent',       t.accent);
    r.style.setProperty('--accent-dark',  t.accentDark);
    r.style.setProperty('--accent-text',  t.accentText);
    r.style.setProperty('--bg',           t.bgColor);
    r.style.setProperty('--surface',      t.surfaceColor);
    r.style.setProperty('--surface2',     _shade(t.surfaceColor, 6));
    r.style.setProperty('--surface3',     _shade(t.surfaceColor, 12));
    r.style.setProperty('--border',       'rgba(255,255,255,.07)');
    r.style.setProperty('--border2',      'rgba(255,255,255,.11)');
    r.style.setProperty('--text',         t.textPrimary);
    r.style.setProperty('--text2',        t.textMuted);
    r.style.setProperty('--text3',        _shade(t.textMuted, -30));
    document.title = HOTEL_CONFIG.hotelName + ' — Menu';
    const mt = document.querySelector('meta[name="theme-color"]');
    if (mt) mt.content = t.bgColor;
  }

  function _shade(hex, amt) {
    const c = hex.replace('#','');
    const num = parseInt(c.length === 3 ? c.split('').map(x=>x+x).join('') : c, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amt));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
    const b = Math.min(255, Math.max(0, (num & 0xff) + amt));
    return `#${((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}`;
  }

  /* ─── IMAGES ─────────────────────────────────────────── */
  function _applyImages() {
    const bgEl = document.querySelector('.welcome-bg');
    if (bgEl) bgEl.style.backgroundImage = `url('${HOTEL_CONFIG.images.welcomeBanner}')`;

    const heroImg = document.getElementById('heroBanner');
    if (heroImg) heroImg.src = HOTEL_CONFIG.images.menuHero;

    const logoImg = document.getElementById('headerLogo');
    const hotelNameEl = document.getElementById('headerHotelName');
    if (logoImg) {
      logoImg.src = HOTEL_CONFIG.images.logo;
      logoImg.onload = () => {
        logoImg.style.display = 'block';
        if (hotelNameEl) hotelNameEl.style.display = 'none';
      };
      logoImg.onerror = () => { logoImg.style.display = 'none'; };
    }

    const favicon = document.getElementById('favicon');
    if (favicon) favicon.href = HOTEL_CONFIG.images.favicon;

    const mapBtn = document.getElementById('mapBtn');
    if (mapBtn) mapBtn.href = HOTEL_CONFIG.googleMapsLink || '#';
  }

  /* ─── WELCOME FORM ─────────────────────────────────── */
  function _buildWelcomeForm() {
    const cfg  = HOTEL_CONFIG.guestForm;
    const form = document.getElementById('guestForm');
    let html   = '';

    if (cfg.askName) {
      html += `
      <div class="field-group">
        <label class="field-label" for="fieldName">
          Your Name <span class="optional-tag">(optional)</span>
        </label>
        <input id="fieldName" type="text" class="field-input"
          placeholder="e.g. Rahul Sharma"
          autocomplete="name" autocapitalize="words"/>
      </div>`;
    }
    if (cfg.askMobile) {
      html += `
      <div class="field-group">
        <label class="field-label" for="fieldMobile">
          Mobile Number <span class="optional-tag">(optional)</span>
        </label>
        <input id="fieldMobile" type="tel" class="field-input"
          placeholder="e.g. 9876543210"
          inputmode="tel" maxlength="10" autocomplete="tel"/>
      </div>`;
    }

    form.innerHTML = html;

    form.querySelectorAll('.field-input').forEach((inp, idx, all) => {
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          if (idx < all.length - 1) all[idx + 1].focus();
          else enterMenu();
        }
      });
    });
  }

  /* ─── RIPPLE ─────────────────────────────────────────── */
  function _setupRipples() {
    document.addEventListener('pointerdown', e => {
      const btn = e.target.closest('.ripple');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const wave = document.createElement('span');
      wave.className = 'ripple-wave';
      wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
      btn.appendChild(wave);
      wave.addEventListener('animationend', () => wave.remove());
    });
  }

  /* ─── PARTICLE CANVAS ────────────────────────────────── */
  function _setupParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function Particle() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 1.5 + .5;
      this.speedX = (Math.random() - .5) * .35;
      this.speedY = (Math.random() - .5) * .35;
      this.opacity = Math.random() * .4 + .05;
      this.life = 0;
      this.maxLife = Math.random() * 200 + 100;
    }

    Particle.prototype.update = function() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
    };

    Particle.prototype.draw = function() {
      const fade = this.life < 30 ? this.life / 30 : this.life > this.maxLife - 30 ? (this.maxLife - this.life) / 30 : 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${this.opacity * fade})`;
      ctx.fill();
    };

    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 60; i++) particles.push(new Particle());

    let animId;
    function animate() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p, i) => {
        p.update();
        p.draw();
        if (p.life >= p.maxLife) particles[i] = new Particle();
      });
      animId = requestAnimationFrame(animate);
    }

    // Start particles only on welcome screen
    function checkScreen() {
      const isWelcome = document.getElementById('welcome').classList.contains('active');
      if (isWelcome) {
        canvas.classList.add('visible');
        if (!animId) animate();
      } else {
        canvas.classList.remove('visible');
        cancelAnimationFrame(animId);
        animId = null;
      }
    }

    checkScreen();
    const obs = new MutationObserver(checkScreen);
    obs.observe(document.getElementById('welcome'), { attributes: true, attributeFilter: ['class'] });
  }

  /* ─── ENTER MENU ─────────────────────────────────────── */
  function enterMenu() {
    const nameInp   = document.getElementById('fieldName');
    const mobileInp = document.getElementById('fieldMobile');
    if (nameInp)   _guest.name   = nameInp.value.trim();
    if (mobileInp) _guest.mobile = mobileInp.value.trim();

    _updateGuestChip();
    localStorage.setItem('hotel_guest', JSON.stringify(_guest));
    _showScreen('menu');
    Menu.init();
  }

  function _updateGuestChip() {
    const chip = document.getElementById('guestChip');
    if (!chip) return;
    let parts = [];
    if (_guest.table) parts.push(`Table <strong>${_guest.table}</strong>`);
    if (_guest.name)  parts.push(_guest.name);
    chip.innerHTML = parts.join(' · ');
  }

  function _restoreSession() {
    const lastPage = localStorage.getItem('currentPage');
    if (_guest && (_guest.name || _guest.mobile || _guest.table)) {
      const ni = document.getElementById('fieldName');
      const mi = document.getElementById('fieldMobile');
      if (ni) ni.value = _guest.name || '';
      if (mi) mi.value = _guest.mobile || '';
      _updateGuestChip();
    }
    if (lastPage && lastPage !== 'welcome') {
      Menu.init();
      _showScreen(lastPage);
    }
  }

  /* ─── SCREENS ─────────────────────────────────────────── */
  function _showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    localStorage.setItem('currentPage', id);
    window.scrollTo(0, 0);
  }

  function startFreshOrder() {
    if (!confirm('Start a new order? This will clear all previous order history.')) return;
    Cart.startFreshOrder();
    localStorage.removeItem('hotel_guest');
    localStorage.removeItem('currentPage');
    _guest = { name: '', mobile: '', table: '' };
    _showScreen('welcome');
    ['fieldName','fieldMobile'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }

  function goBackToMenu() {
    closeCart();
    _showScreen('menu');
    Cart.renderDrawer();
  }

  /* ─── CART DRAWER ─────────────────────────────────────── */
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

  /* ─── ORDER TYPE MODAL ─────────────────────────────────── */
  function openOrderTypeModal() {
    if (Cart.isEmpty()) { showToast('Please add items first', '🛒'); return; }
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
      setTimeout(() => ni && !ni.value && ni.focus(), 300);
    }
  }

  function confirmDineIn() {
    const ti  = document.getElementById('orderTable');
    const val = ti ? ti.value.trim() : '';
    if (!val || isNaN(val) || +val < 1) {
      ti && ti.classList.add('error');
      ti && ti.focus();
      setTimeout(() => ti && ti.classList.remove('error'), 2000);
      showToast('Enter your table number', '⚠️');
      return;
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
    const name    = ni ? ni.value.trim() : '';
    const mobile  = mi ? mi.value.trim() : '';
    const address = ai ? ai.value.trim() : '';

    if (!name)   { _shakeField(ni); showToast('Enter your name', '⚠️'); return; }
    if (!mobile || mobile.length < 10) { _shakeField(mi); showToast('Enter a valid 10-digit mobile', '⚠️'); return; }
    if (!address) { _shakeField(ai); showToast('Enter your delivery address', '⚠️'); return; }

    const notes = (document.getElementById('orderNotes') || {}).value || '';
    const result = Cart.placeOrder({ type: 'delivery', name, mobile, address, notes });
    if (result) _afterOrder(result);
  }

  function _shakeField(el) {
    if (!el) return;
    el.classList.add('error');
    el.focus();
    setTimeout(() => el.classList.remove('error'), 2000);
  }

  function _afterOrder(result) {
    closeOrderTypeModal();
    const on = document.getElementById('orderNotes');
    if (on) on.value = '';

    // Populate success screen
    const typeEl    = document.getElementById('successType');
    const tableCard = document.getElementById('successTableCard');
    const tableEl   = document.getElementById('successTable');
    const nameCard  = document.getElementById('successNameCard');
    const nameEl    = document.getElementById('successName');
    const addrCard  = document.getElementById('successAddrCard');
    const addrEl    = document.getElementById('successAddr');

    if (typeEl) typeEl.textContent = result.orderType === 'delivery' ? '🛵 Home Delivery' : '🍽️ Dine-In';

    if (result.orderType === 'dine-in') {
      if (tableCard) tableCard.style.display = 'flex';
      if (tableEl)   tableEl.textContent = result.table || '—';
      if (addrCard)  addrCard.style.display = 'none';
    } else {
      if (tableCard) tableCard.style.display = 'none';
      if (addrCard)  { addrCard.style.display = 'flex'; }
      if (addrEl)    addrEl.textContent = result.address || '';
    }

    if (result.name) {
      if (nameEl)   nameEl.textContent = result.name;
      if (nameCard) nameCard.style.display = 'flex';
    } else {
      if (nameCard) nameCard.style.display = 'none';
    }

    const roundEl = document.getElementById('successRound');
    if (roundEl) roundEl.style.display = result.orderRound > 1 ? 'block' : 'none';

    closeCart();
    setTimeout(() => _showScreen('success'), 320);
  }

  function placeOrder() { openOrderTypeModal(); }

  /* ─── SWIPE DRAWER TO CLOSE ─────────────────────────── */
  function _setupDrawerSwipe() {
    const drawer = document.getElementById('drawer');
    let startY = 0;
    drawer.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    drawer.addEventListener('touchend', e => {
      if (e.changedTouches[0].clientY - startY > 80) closeCart();
    }, { passive: true });
  }

  /* ─── TOAST ─────────────────────────────────────────── */
  function showToast(msg, icon = '✓') {
    const t = document.getElementById('toast');
    const iconEl = document.getElementById('toastIcon');
    const msgEl  = document.getElementById('toastMsg');
    if (!t) return;

    clearTimeout(_toastTimer);
    clearTimeout(_toastHideTimer);
    t.classList.remove('show', 'hide');

    if (iconEl) iconEl.textContent = icon;
    if (msgEl) msgEl.innerHTML = msg;
    else t.innerHTML = msg;

    // Force reflow
    void t.offsetWidth;
    t.classList.add('show');

    _toastTimer = setTimeout(() => {
      t.classList.remove('show');
      t.classList.add('hide');
      _toastHideTimer = setTimeout(() => t.classList.remove('hide'), 300);
    }, 2400);
  }

  /* ─── HOTEL NAME ─────────────────────────────────────── */
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
    showToast, renderHotelName,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.boot();
  App.renderHotelName(document.getElementById('headerHotelName'), false);
  App.renderHotelName(document.querySelector('.welcome-hotel-name'), true);
  const tagEl = document.querySelector('.welcome-tagline');
  if (tagEl) tagEl.textContent = HOTEL_CONFIG.tagline;
});
