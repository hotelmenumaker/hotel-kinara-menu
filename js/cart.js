/**
 * cart.js — Cart engine
 * Supports multiple order rounds (place order, then add more items)
 */

const Cart = (() => {

  let _cart = JSON.parse(localStorage.getItem('hotel_cart') || '{}');
  let _orderRound = parseInt(localStorage.getItem('hotel_order_round') || '1');
  let _previousOrders = JSON.parse(localStorage.getItem('hotel_previous_orders') || '[]');

  // Re-sync UI on page load if previous orders exist (e.g. after a page refresh)
  document.addEventListener('DOMContentLoaded', function () {
    if (_previousOrders.length > 0) {
      _updateUI();
    }
  });

  function getQty(id) { return _cart[id] ? _cart[id].qty : 0; }

  function getTotals() {
    const entries = Object.values(_cart);
    const count   = entries.reduce((s, e) => s + e.qty, 0);
    const subtotal = entries.reduce((s, e) => s + e.item.price * e.qty, 0);

    // AFTER:
    const firstOrder = _previousOrders[0];
    const isDelivery = firstOrder && firstOrder.orderType === 'delivery';

    // Only add delivery charge if this is the FIRST round (no previous orders yet)
    const isAddOnRound = _previousOrders.length > 0;
    // const deliveryCharge = (isDelivery && !isAddOnRound) ? 40 : 0;
    const deliveryCharge = (isDelivery && !isAddOnRound) ? (HOTEL_CONFIG.deliveryCharge || 0) : 0;
    const total = subtotal + deliveryCharge;

    // const firstOrder   = _previousOrders[0];
    // const isDelivery   = firstOrder && firstOrder.orderType === 'delivery';
    // const deliveryCost = isDelivery ? 40 : 0;

    // const cartSubtotal = entries.reduce((s, e) => s + e.item.price * e.qty, 0);
    // const prevSubtotal = _previousOrders.reduce((s, r) => s + r.total, 0);
    // const grandTotal   = prevSubtotal + cartSubtotal + deliveryCost;

    // const totalElement = document.getElementById('drawerTotal');
    // if (totalElement) totalElement.textContent = `${currency}${grandTotal}`;

    // // Round breakdown — show below totals row when ≥1 round placed
    // const breakdown = document.getElementById('drawerRoundsBreakdown');
    // if (breakdown) {
    //   if (_previousOrders.length > 0) {
    //     breakdown.style.display = 'flex';
    //     let bHtml = '';
    //     _previousOrders.forEach(r => {
    //       bHtml += `<div class="drb-row"><span class="drb-label">Order ${r.round} · ${r.time}</span><span class="drb-amt">${currency}${r.total}</span></div>`;
    //     });
    //     if (cartSubtotal > 0) {
    //       bHtml += `<div class="drb-row"><span class="drb-label">Order ${_orderRound} · Current</span><span class="drb-amt">${currency}${cartSubtotal}</span></div>`;
    //     }
    //     if (isDelivery) {
    //       bHtml += `<div class="drb-row drb-delivery"><span class="drb-label">🛵 Delivery Charge</span><span class="drb-amt">${currency}${deliveryCost}</span></div>`;
    //     }
    //     bHtml += `<div class="drb-row drb-grand"><span class="drb-label">Grand Total</span><span class="drb-amt">${currency}${grandTotal}</span></div>`;
    //     breakdown.innerHTML = bHtml;
    //   } else {
    //     breakdown.style.display = 'none';
    //   }
    // }

    return { entries, count, subtotal, deliveryCharge, total };


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
    // const { count, total } = getTotals();
    const { count, total, subtotal } = getTotals();
    const countEl    = document.getElementById('cartCount');
    const cartBar    = document.getElementById('cartBar');
    const addMoreBtn = document.getElementById('addMoreBtn');
    const cartBtn    = document.querySelector('.cart-btn');

    // Never show cart bar on bill or success screens
    const activeScreen = document.querySelector('.screen.active');
    const activeId = activeScreen ? activeScreen.id : '';
    const hiddenScreens = ['bill', 'success'];

    if (count > 0) {
      if (countEl && !countEl.classList.contains('show')) {
        // First item added — bounce the cart button
        if (cartBtn) {
          cartBtn.classList.add('cart-bounce');
          cartBtn.addEventListener('animationend', () => cartBtn.classList.remove('cart-bounce'), { once: true });
        }
      }
      if (countEl) { countEl.textContent = count; countEl.classList.add('show'); }
      if (!hiddenScreens.includes(activeId)) {
        cartBar.classList.add('show');
      } else {
        cartBar.classList.remove('show');
      }
      document.getElementById('barCount').textContent  = `${count} item${count > 1 ? 's' : ''}`;
      // document.getElementById('barAmount').textContent = `${HOTEL_CONFIG.currency}${total}`;
      const _prevSum = _previousOrders.reduce((s, r) => s + r.total, 0);
      const _isDelivery = _previousOrders[0] && _previousOrders[0].orderType === 'delivery';
      const _dc = _isDelivery ? (HOTEL_CONFIG.deliveryCharge || 0) : 0;
      const _grandBar = _prevSum + subtotal + _dc;
      document.getElementById('barAmount').textContent = `${HOTEL_CONFIG.currency}${_previousOrders.length > 0 ? _grandBar : total}`;
    } else {
      if (countEl) countEl.classList.remove('show');
      if (_previousOrders.length > 0 && !hiddenScreens.includes(activeId)) {
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
    // if (dt)   dt.textContent   = `${HOTEL_CONFIG.currency}${total}`;

    // if (addMoreBtn) addMoreBtn.style.display = _previousOrders.length > 0 ? 'flex' : 'none';
    // const freshOrderBtn = document.getElementById('freshOrderBtn');
    // if (freshOrderBtn) freshOrderBtn.style.display = _previousOrders.length > 0 ? 'flex' : 'none';
    // const genBillBtn = document.getElementById('genBillBtn');
    // if (genBillBtn) genBillBtn.style.display = _previousOrders.length > 0 ? 'flex' : 'none';
    const hasPrevOrders = _previousOrders.length > 0;
    const hasCartItems  = Object.keys(_cart).length > 0;

    if (addMoreBtn)  addMoreBtn.style.display  = hasPrevOrders ? 'flex' : 'none';

    // const freshOrderBtn = document.getElementById('freshOrderBtn');
    // if (freshOrderBtn) freshOrderBtn.style.display = hasPrevOrders ? 'flex' : 'none';

    const genBillBtn = document.getElementById('genBillBtn');
    if (genBillBtn) genBillBtn.style.display = hasPrevOrders ? 'flex' : 'none';

    // When cart is empty but previous orders exist — always show the cart bar
    // so user can open drawer and access Generate Bill
    if (!hasCartItems && hasPrevOrders) {
      const cartBar = document.getElementById('cartBar');
      const activeScreen = document.querySelector('.screen.active');
      const activeId = activeScreen ? activeScreen.id : '';
      const hiddenScreens = ['bill', 'success', 'welcome'];
      if (cartBar && !hiddenScreens.includes(activeId)) {
        cartBar.classList.add('show');
        document.getElementById('barCount').textContent  = `Order ${_previousOrders.length} placed ✓`;
        document.getElementById('barAmount').textContent = `Tap to Generate Bill`;
      }
    }
  }

  // function renderDrawer() {
  //   const { entries, count, total, subtotal } = getTotals();
  //   const currency = HOTEL_CONFIG.currency;

  //   const titleSub = document.getElementById('drawerCount');
  //   if (titleSub) titleSub.textContent = count > 0 ? `(${count})` : '';

  //   document.getElementById('drawerItemCount').textContent = `${count} item${count !== 1 ? 's' : ''}`;

  //   // const lastOrder = _previousOrders[_previousOrders.length - 1];
  //   // const isDelivery = lastOrder && lastOrder.orderType === 'delivery';
  //   // const deliveryCharge = isDelivery ? 40 : 0;

  //   // const totalElement = document.getElementById('drawerTotal');
  //   // if (totalElement) {
  //   //   totalElement.innerHTML = isDelivery
  //   //     ? `${currency}${total - deliveryCharge} + <span style="color:#f59e0b">Delivery ${currency}${deliveryCharge}</span> = <strong>${currency}${total}</strong>`
  //   //     : `${currency}${total}`;
  //   // }

  //   // const firstOrder = _previousOrders[0];
  //   // const isDelivery = firstOrder && firstOrder.orderType === 'delivery';
  //   // const deliveryCharge = isDelivery ? 40 : 0;
  //   // const isFirstRound = _previousOrders.length === 0; // no rounds placed yet

  //   // const totalElement = document.getElementById('drawerTotal');
  //   // if (totalElement) {
  //   //   totalElement.innerHTML = (isDelivery && isFirstRound)
  //   //     ? `${currency}${total - deliveryCharge} + <span style="color:#f59e0b">Delivery ${currency}${deliveryCharge}</span> = <strong>${currency}${total}</strong>`
  //   //     : `${currency}${total}`;
  //   // }

  //   const firstOrder = _previousOrders[0];
  //   const isDelivery = firstOrder && firstOrder.orderType === 'delivery';
  //   const deliveryCharge = isDelivery ? (HOTEL_CONFIG.deliveryCharge || 0) : 0;
  //   const prevTotal = _previousOrders.reduce((s, r) => s + r.total, 0);
  //   const grandTotal = prevTotal + subtotal + deliveryCharge;

  //   const totalElement = document.getElementById('drawerTotal');
  //   if (totalElement) {
  //     if (_previousOrders.length > 0) {
  //       totalElement.innerHTML = isDelivery
  //         ? `${currency}${grandTotal - deliveryCharge} + <span style="color:#f59e0b">🛵 ${currency}${deliveryCharge}</span> = <strong>${currency}${grandTotal}</strong>`
  //         : `<strong>${currency}${grandTotal}</strong>`;
  //     } else {
  //       totalElement.innerHTML = `${currency}${total}`;
  //     }
  //   }

  //   const itemsDiv = document.getElementById('drawerItems');

  //   if (count === 0 && _previousOrders.length === 0) {
  //     itemsDiv.innerHTML = `
  //     <div class="empty-cart">
  //       <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
  //       <p>Your cart is empty</p>
  //     </div>`;
  //     return;
  //   }

  //   let html = '';

  //   if (_previousOrders.length > 0) {
  //     _previousOrders.forEach(round => {
  //       const typeIcon = round.orderType === 'delivery' ? '🛵' : '🍽️';
  //       const typeLabel = round.orderType === 'delivery' ? 'Home Delivery' : `Table ${round.table || 'N/A'}`;
  //       html += `
  //       <p class="prev-order-note">
  //         ✓ Order ${round.round} • ${typeIcon} <strong>${typeLabel}</strong><br>
  //         📅 ${round.day || ''}, ${round.date || ''} • 🕒 <strong>${round.time}</strong><br>
  //         💰 <strong>${currency}${round.total}</strong>
  //       </p>`;
  //       round.items.forEach(({ item, qty }) => {
  //         html += _cartItemHTML(item, qty, false);
  //       });
  //     });

  //     if (count > 0) {
  //       html += `<p class="notes-label" style="margin-top:6px">Adding to order:</p>`;
  //     }
  //   }

  //   entries.forEach(({ item, qty }) => {
  //     html += _cartItemHTML(item, qty, true);
  //   });

  //   itemsDiv.innerHTML = html;
  // }



  function renderDrawer() {
    const { entries, count, total, subtotal } = getTotals();
    const currency = HOTEL_CONFIG.currency;

    const titleSub = document.getElementById('drawerCount');
    if (titleSub) titleSub.textContent = count > 0 ? `(${count})` : '';

    document.getElementById('drawerItemCount').textContent = `${count} item${count !== 1 ? 's' : ''}`;

    const firstOrder = _previousOrders[0];
    const isDelivery = firstOrder && firstOrder.orderType === 'delivery';
    const deliveryCharge = isDelivery ? (HOTEL_CONFIG.deliveryCharge || 0) : 0;
    const prevTotal = _previousOrders.reduce((s, r) => s + r.total, 0);
    const grandTotal = prevTotal + subtotal + deliveryCharge;

    const totalElement = document.getElementById('drawerTotal');
    if (totalElement) {
      if (_previousOrders.length > 0) {
        totalElement.innerHTML = `<strong>${currency}${grandTotal}</strong>`;
      } else {
        totalElement.innerHTML = `${currency}${total}`;
      }
    }

    // Round-by-round breakdown
    const breakdown = document.getElementById('drawerRoundsBreakdown');
    if (breakdown) {
      if (_previousOrders.length > 0) {
        breakdown.style.display = 'flex';
        let bHtml = '';

        _previousOrders.forEach(r => {
          bHtml += `<div class="drb-row"><span class="drb-label">✓ Order ${r.round} · ${r.time}</span><span class="drb-amt">${currency}${r.total}</span></div>`;
        });

        if (subtotal > 0) {
          bHtml += `<div class="drb-row drb-current"><span class="drb-label">🛒 Order ${_orderRound} · Now</span><span class="drb-amt">${currency}${subtotal}</span></div>`;
        }

        if (isDelivery) {
          bHtml += `<div class="drb-row drb-delivery"><span class="drb-label">🛵 Delivery Charge</span><span class="drb-amt">${currency}${deliveryCharge}</span></div>`;
        }

        bHtml += `<div class="drb-row drb-grand"><span class="drb-label">Grand Total</span><span class="drb-amt">${currency}${grandTotal}</span></div>`;
        breakdown.innerHTML = bHtml;
      } else {
        breakdown.style.display = 'none';
      }
    }

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

      // if (count > 0) {
      //   html += `<p class="notes-label" style="margin-top:6px">Adding to order:</p>`;
      // }
      if (count > 0) {
        html += `<p class="notes-label" style="margin-top:6px">Adding to order:</p>`;
      } else {
        html += `<p class="notes-label" style="margin-top:6px;color:var(--text3);font-style:italic;">No new items yet — browse the menu to add more</p>`;
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
    const { entries, count, subtotal } = getTotals();
    if (count === 0) { App.showToast('Please add items first'); return null; }

    const currency = HOTEL_CONFIG.currency;
    const now      = new Date();
    const time     = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const date     = now.toLocaleDateString('en-IN');
    const day      = now.toLocaleDateString('en-IN', { weekday: 'long' });
    const isAddOn  = _previousOrders.length > 0;
    const isDelivery = orderInfo.type === 'delivery';
    // const deliveryCharge = isDelivery ? 40 : 0;
    const deliveryCharge = isDelivery ? (HOTEL_CONFIG.deliveryCharge || 0) : 0;
    const orderTotal = subtotal; // ← store food-only total per round

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

    // msg += `──────────────────\n`;

    // if (isDelivery) {
    //   msg += `🛵 Delivery Charges: ${currency}${deliveryCharge}\n`;
    // }

    // msg += `*TOTAL: ${currency}${orderTotal}*\n`;
    msg += `──────────────────\n`;

    const cgstPct = HOTEL_CONFIG.gst?.enabled ? (HOTEL_CONFIG.gst.cgst / 100) : 0;
    const sgstPct = HOTEL_CONFIG.gst?.enabled ? (HOTEL_CONFIG.gst.sgst / 100) : 0;
    const cgst    = Math.round(subtotal * cgstPct);
    const sgst    = Math.round(subtotal * sgstPct);
    // const taxedTotal = subtotal + cgst + sgst + (isDelivery ? deliveryCharge : 0);
    const taxedTotal = subtotal + cgst + sgst + (isDelivery && !isAddOn ? deliveryCharge : 0);

    if (cgst > 0) msg += `CGST (${HOTEL_CONFIG.gst.cgst}%): ${currency}${cgst}\n`;
    if (sgst > 0) msg += `SGST (${HOTEL_CONFIG.gst.sgst}%): ${currency}${sgst}\n`;

    // BEFORE (~line 299-301):
    // if (isDelivery) {
    //   msg += `🛵 Delivery Charges: ${currency}${deliveryCharge}\n`;
    // }

    // AFTER:
    // if (isDelivery && !isAddOn) {   // ← only show on first round
    //   msg += `🛵 Delivery Charges: ${currency}${deliveryCharge}\n`;
    // }

    // msg += `*TOTAL: ${currency}${taxedTotal}*\n`;

    if (cgst > 0) msg += `CGST (${HOTEL_CONFIG.gst.cgst}%): ${currency}${cgst}\n`;
    if (sgst > 0) msg += `SGST (${HOTEL_CONFIG.gst.sgst}%): ${currency}${sgst}\n`;
    if (isDelivery && !isAddOn) {
      msg += `🛵 Delivery Charges: ${currency}${deliveryCharge}\n`;
    }

    msg += `*TOTAL: ${currency}${taxedTotal}*\n`;

    if (orderInfo.notes && orderInfo.notes.trim()) {
      msg += `\n📝 *Note:* ${orderInfo.notes.trim()}\n`;
    }

    msg += `\n_Sent via QR Menu_`;

    _previousOrders.push({
      round: _orderRound,
      orderType: orderInfo.type,
      items: entries.map(e => ({ item: e.item, qty: e.qty })),
      total: subtotal, time, date, day,
      name:    orderInfo.name    || null,
      table:   orderInfo.table   || null,
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

  // function placeOrder(orderInfo) {
  //   const { entries, count, subtotal } = getTotals();
  //   if (count === 0) { App.showToast('Please add items first'); return null; }

  //   const currency      = HOTEL_CONFIG.currency;
  //   const now           = new Date();
  //   const time          = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  //   const date          = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  //   const day           = now.toLocaleDateString('en-IN', { weekday: 'long' });
  //   const isDelivery    = orderInfo.type === 'delivery';
  //   const deliveryCharge = isDelivery ? 40 : 0;

  //   const cgstPct    = HOTEL_CONFIG.gst?.enabled ? (HOTEL_CONFIG.gst.cgst / 100) : 0;
  //   const sgstPct    = HOTEL_CONFIG.gst?.enabled ? (HOTEL_CONFIG.gst.sgst / 100) : 0;
  //   const cgst       = Math.round(subtotal * cgstPct);
  //   const sgst       = Math.round(subtotal * sgstPct);
  //   const grandFinal = subtotal + cgst + sgst + deliveryCharge;

  //   const DIV  = '━━━━━━━━━━━━━━━━━━━━━━━━━';
  //   const DIVS = '               ─────────';

  //   let msg = '';

  //   // header
  //   msg += `┌─────────────────────────┐\n`;
  //   msg += `      🍽️ ${HOTEL_CONFIG.hotelName.toUpperCase()}\n`;
  //   msg += `   _Official Order Bill_\n`;
  //   msg += `└─────────────────────────┘\n\n`;

  //   // order details
  //   msg += `📋 *ORDER DETAILS*\n`;
  //   msg += `${DIV}\n`;
  //   msg += `🧾 Bill No     : #${Date.now().toString().slice(-6)}\n`;
  //   msg += `📅 Date        : ${date}\n`;
  //   msg += `⏰ Time        : ${time}\n`;

  //   if (isDelivery) {
  //     msg += `🛵 Type        : Home Delivery\n`;
  //     if (orderInfo.name)    msg += `👤 Customer    : ${orderInfo.name}\n`;
  //     if (orderInfo.mobile)  msg += `📞 Mobile      : ${orderInfo.mobile}\n`;
  //     if (orderInfo.address) msg += `📍 Address     : ${orderInfo.address}\n`;
  //   } else {
  //     msg += `🍽️ Type        : Dine-In\n`;
  //     if (orderInfo.table) msg += `🪑 Table       : ${orderInfo.table}\n`;
  //     if (orderInfo.name)  msg += `👤 Customer    : ${orderInfo.name}\n`;
  //   }
  //   msg += `${DIV}\n\n`;

  //   // items
  //   msg += `🛒 *ITEMS ORDERED*\n`;
  //   msg += `${DIV}\n`;
  //   entries.forEach(({ item, qty }) => {
  //     const dot = item.type === 'veg' ? '🟢' : '🔴';
  //     msg += `${dot} ${item.name}\n`;
  //     msg += `   ${qty} x ${currency}${item.price} = *${currency}${item.price * qty}*\n`;
  //   });
  //   msg += `${DIV}\n\n`;

  //   // bill summary
  //   msg += `💰 *BILL SUMMARY*\n`;
  //   msg += `Sub Total      : ${currency}${subtotal}\n`;
  //   if (cgst > 0) msg += `CGST (${HOTEL_CONFIG.gst.cgst}%)      : ${currency}${cgst}\n`;
  //   if (sgst > 0) msg += `SGST (${HOTEL_CONFIG.gst.sgst}%)      : ${currency}${sgst}\n`;
  //   if (isDelivery) msg += `🛵 Delivery    : ${currency}${deliveryCharge}\n`;
  //   msg += `${DIVS}\n`;
  //   msg += `*GRAND TOTAL   : ${currency}${grandFinal}*\n\n`;

  //   // payment mode
  //   const payMode = isDelivery ? 'UPI / Cash on Delivery' : 'Cash / Card';
  //   msg += `💳 Payment Mode : ${payMode}\n`;
  //   msg += `${DIV}\n`;
  //   msg += `_Thank you for dining at ${HOTEL_CONFIG.hotelName}_ 🙏`;

  //   // notes
  //   if (orderInfo.notes && orderInfo.notes.trim()) {
  //     msg += `\n\n📝 *Note:* ${orderInfo.notes.trim()}`;
  //   }

  //   _previousOrders.push({
  //     round:     _orderRound,
  //     orderType: orderInfo.type,
  //     items:     entries.map(e => ({ item: e.item, qty: e.qty })),
  //     total:     grandFinal,
  //     time, date, day,
  //     name:    orderInfo.name    || null,
  //     table:   orderInfo.table   || null,
  //     address: orderInfo.address || null,
  //   });
  //   _orderRound++;
  //   _persist();

  //   const url = `https://wa.me/${HOTEL_CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  //   window.open(url, '_blank');
  //   clear();

  //   return {
  //     orderType:  orderInfo.type,
  //     table:      orderInfo.table   || null,
  //     address:    orderInfo.address || null,
  //     name:       orderInfo.name    || null,
  //     orderRound: _orderRound - 1,
  //   };
  // }

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
