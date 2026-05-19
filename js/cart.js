/**
 * cart.js — Cart engine
 * Supports multiple order rounds (place order, then add more items)
 */

const Cart = (() => {

  let _cart = JSON.parse(localStorage.getItem('hotel_cart') || '{}');
  let _orderRound = parseInt(localStorage.getItem('hotel_order_round') || '1');
  let _previousOrders = JSON.parse(localStorage.getItem('hotel_previous_orders') || '[]');

  function getQty(id) { return _cart[id] ? _cart[id].qty : 0; }

  function getTotals() {
    const entries = Object.values(_cart);
    const count   = entries.reduce((s, e) => s + e.qty, 0);
    const total   = entries.reduce((s, e) => s + e.item.price * e.qty, 0);
    return { entries, count, total };
  }

  function isEmpty() { return Object.keys(_cart).length === 0; }
  function getOrderRound() { return _orderRound; }
  function getPreviousOrders() { return _previousOrders; }

  function add(id) {
    const item = Menu.findItem(id);
    if (!item) return;
    if (_cart[id]) { _cart[id].qty++; } else { _cart[id] = { item, qty: 1 }; }
    _sync(id);
    App.showToast(`<span class="t-accent">${item.name}</span> added to cart`, '✓');
  }

  function increase(id) { if (!_cart[id]) return; _cart[id].qty++; _sync(id); }

  function decrease(id) {
    if (!_cart[id]) return;
    _cart[id].qty--;
    if (_cart[id].qty <= 0) delete _cart[id];
    _sync(id);
  }

  function clear() {
    const prevIds = Object.keys(_cart);
    _cart = {};
    _persist();
    _updateUI();
    prevIds.forEach(id => Menu.refreshCtrl(id));
  }

  function _persist() {
    localStorage.setItem('hotel_cart', JSON.stringify(_cart));
    localStorage.setItem('hotel_order_round', _orderRound);
    localStorage.setItem('hotel_previous_orders', JSON.stringify(_previousOrders));
  }

  function _sync(id) {
    _persist();
    Menu.refreshCtrl(id);
    _updateUI();
  }

  function _updateUI() {
    const { count, total } = getTotals();
    const countEl    = document.getElementById('cartCount');
    const cartBar    = document.getElementById('cartBar');
    const addMoreBtn = document.getElementById('addMoreBtn');
    const cartBtn    = document.querySelector('.cart-btn');

    if (count > 0) {
      if (countEl && !countEl.classList.contains('show')) {
        // First item added — bounce the cart button
        if (cartBtn) {
          cartBtn.classList.add('cart-bounce');
          cartBtn.addEventListener('animationend', () => cartBtn.classList.remove('cart-bounce'), { once: true });
        }
      }
      if (countEl) { countEl.textContent = count; countEl.classList.add('show'); }
      cartBar.classList.add('show');
      document.getElementById('barCount').textContent  = `${count} item${count > 1 ? 's' : ''}`;
      document.getElementById('barAmount').textContent = `${HOTEL_CONFIG.currency}${total}`;
    } else {
      if (countEl) countEl.classList.remove('show');
      if (_previousOrders.length > 0) {
        cartBar.classList.add('show');
        document.getElementById('barCount').textContent  = `Order ${_previousOrders.length} sent ✓`;
        document.getElementById('barAmount').textContent = `+ Add more items`;
      } else {
        cartBar.classList.remove('show');
      }
    }

    // Update both item count fields in drawer
    const dic  = document.getElementById('drawerItemCount');
    const dic2 = document.getElementById('drawerItemCount2');
    const dt   = document.getElementById('drawerTotal');
    if (dic)  dic.textContent  = `${count} item${count !== 1 ? 's' : ''}`;
    if (dic2) dic2.textContent = count;
    if (dt)   dt.textContent   = `${HOTEL_CONFIG.currency}${total}`;

    if (addMoreBtn) addMoreBtn.style.display = _previousOrders.length > 0 ? 'flex' : 'none';
    const freshOrderBtn = document.getElementById('freshOrderBtn');
    if (freshOrderBtn) freshOrderBtn.style.display = _previousOrders.length > 0 ? 'flex' : 'none';
  }

  function renderDrawer() {
    const { entries, count, total } = getTotals();
    const currency = HOTEL_CONFIG.currency;

    const titleSub = document.getElementById('drawerCount');
    if (titleSub) titleSub.textContent = count > 0 ? `(${count})` : '';

    document.getElementById('drawerItemCount').textContent = `${count} item${count !== 1 ? 's' : ''}`;
    document.getElementById('drawerTotal').textContent     = `${currency}${total}`;

    const itemsDiv = document.getElementById('drawerItems');

    if (count === 0 && _previousOrders.length === 0) {
      itemsDiv.innerHTML = `
      <div class="empty-cart">
        <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <p>Your cart is empty</p>
      </div>`;
      return;
    }

    let html = '';

    if (_previousOrders.length > 0) {
      _previousOrders.forEach(round => {
        const typeIcon = round.orderType === 'delivery' ? '🛵' : '🍽️';
        const typeLabel = round.orderType === 'delivery' ? 'Home Delivery' : `Table ${round.table || 'N/A'}`;
        html += `
        <p class="prev-order-note">
          ✓ Order ${round.round} • ${typeIcon} <strong>${typeLabel}</strong><br>
          📅 ${round.day || ''}, ${round.date || ''} • 🕒 <strong>${round.time}</strong><br>
          💰 <strong>${currency}${round.total}</strong>
        </p>`;
        round.items.forEach(({ item, qty }) => {
          html += _cartItemHTML(item, qty, false);
        });
      });

      if (count > 0) {
        html += `<p class="notes-label" style="margin-top:6px">Adding to order:</p>`;
      }
    }

    entries.forEach(({ item, qty }) => {
      html += _cartItemHTML(item, qty, true);
    });

    itemsDiv.innerHTML = html;
  }

  function _cartItemHTML(item, qty, editable) {
    const currency = HOTEL_CONFIG.currency;
    return `
    <div class="cart-item">
      <span class="veg-dot ${item.type}" style="flex-shrink:0"></span>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">
          ${currency}${item.price} × ${qty} = ${currency}${item.price * qty}
        </div>
      </div>
      ${editable ? `
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="Cart.drawerDecrease('${item.id}')">−</button>
        <span class="qty-num">${qty}</span>
        <button class="qty-btn" onclick="Cart.drawerIncrease('${item.id}')">+</button>
      </div>` : `<span style="font-size:13px;color:var(--text3)">×${qty}</span>`}
    </div>`;
  }

  function drawerIncrease(id) { increase(id); renderDrawer(); }
  function drawerDecrease(id) { decrease(id); renderDrawer(); }

  /* ─────────────────────────────────────────────────────
     PLACE ORDER → WhatsApp
     orderInfo = { type, name, mobile, table?, address?, notes }
  ───────────────────────────────────────────────────── */
  function placeOrder(orderInfo) {
    const { entries, count, total } = getTotals();
    if (count === 0) { App.showToast('Please add items first'); return null; }

    const currency = HOTEL_CONFIG.currency;
    const now      = new Date();
    const time     = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const date     = now.toLocaleDateString('en-IN');
    const day      = now.toLocaleDateString('en-IN', { weekday: 'long' });
    const isAddOn  = _previousOrders.length > 0;

    let msg = '';
    if (isAddOn) {
      msg += `➕ *Additional Order (Round ${_orderRound}) — ${HOTEL_CONFIG.hotelName}*\n`;
    } else {
      msg += `🍽️ *New Order — ${HOTEL_CONFIG.hotelName}*\n`;
    }
    msg += `──────────────────\n`;

    if (orderInfo.type === 'dine-in') {
      msg += `🏠 *Order Type:* Dine-In\n`;
      msg += `📍 *Table No:* ${orderInfo.table}\n`;
    } else {
      msg += `🛵 *Order Type:* Home Delivery\n`;
    }

    if (orderInfo.name)   msg += `👤 *Name:* ${orderInfo.name}\n`;
    if (orderInfo.mobile) msg += `📱 *Mobile:* ${orderInfo.mobile}\n`;

    if (orderInfo.type === 'delivery' && orderInfo.address) {
      msg += `🏡 *Delivery Address:*\n${orderInfo.address}\n`;
    }

    msg += `📅 *Day:* ${day}\n`;
    msg += `📆 *Date:* ${date}\n`;
    msg += `🕐 *Time:* ${time}\n`;
    msg += `──────────────────\n`;
    msg += `*ORDER DETAILS:*\n\n`;

    entries.forEach(({ item, qty }) => {
      const dot = item.type === 'veg' ? '🟢' : '🔴';
      msg += `${dot} ${item.name} × ${qty}  —  ${currency}${item.price * qty}\n`;
    });

    msg += `──────────────────\n`;
    msg += `*TOTAL: ${currency}${total}*\n`;

    if (orderInfo.notes && orderInfo.notes.trim()) {
      msg += `\n📝 *Note:* ${orderInfo.notes.trim()}\n`;
    }

    msg += `\n_Sent via QR Menu_`;

    _previousOrders.push({
      round: _orderRound,
      orderType: orderInfo.type,
      items: entries.map(e => ({ item: e.item, qty: e.qty })),
      total, time, date, day,
      table: orderInfo.table || null,
      address: orderInfo.address || null,
    });
    _orderRound++;
    _persist();

    const url = `https://wa.me/${HOTEL_CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    clear();

    return {
      orderType: orderInfo.type,
      table: orderInfo.table || null,
      address: orderInfo.address || null,
      name: orderInfo.name || null,
      orderRound: _orderRound - 1,
    };
  }

  function startFreshOrder() {
    _cart = {};
    _previousOrders = [];
    _orderRound = 1;
    localStorage.removeItem('hotel_cart');
    localStorage.removeItem('hotel_previous_orders');
    localStorage.removeItem('hotel_order_round');
    _updateUI();
  }

  return {
    getQty, getTotals, isEmpty,
    getOrderRound, getPreviousOrders,
    add, increase, decrease, clear,
    renderDrawer, drawerIncrease, drawerDecrease,
    placeOrder, startFreshOrder,
  };
})();

document.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (btn && btn.innerText.toLowerCase().includes('add')) {
    btn.classList.add('added-bounce');
    setTimeout(() => btn.classList.remove('added-bounce'), 500);
  }
});
