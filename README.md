# 🍽️ Hotel QR Menu System
### Mobile-first digital menu with WhatsApp ordering

Zero app install needed. Guest scans a QR → browses → orders via WhatsApp.
Version : 3.3

---

## 📁 COMPLETE FOLDER STRUCTURE

```
hotel-menu/
│
├── index.html                 ← The entire app (open in browser)
│
├── css/
│   └── style.css              ← All styles (CSS variables for theming)
│
├── js/
│   ├── config.js              ← ✏️  EDIT THIS for each hotel
│   ├── app.js                 ← App controller (screens, form, drawer)
│   ├── menu.js                ← Menu rendering engine
│   └── cart.js                ← Cart engine + WhatsApp order builder
│
└── images/
    ├── banner.jpg             ← ✏️  Welcome screen background (portrait ~800×1200px)
    ├── menu-hero.jpg          ← ✏️  Menu page top strip (landscape ~1200×400px)
    ├── logo.png               ← ✏️  Hotel logo in header (transparent PNG ~200×80px)
    ├── favicon.png            ← ✏️  Browser tab icon (64×64px)
    └── menu/
        ├── placeholder.jpg    ← Auto-shown when a food image is missing
        ├── paneer-tikka.jpg   ← ✏️  One file per menu item
        ├── butter-chicken.jpg
        └── … (add all your food photos here)
```

---

## ⚡ QUICK SETUP (3 steps)

### Step 1 — Put images in the right place

| File | Where | Size |
|------|-------|------|
| Welcome banner | `images/banner.jpg` | 800×1200px portrait |
| Menu hero strip | `images/menu-hero.jpg` | 1200×400px landscape |
| Hotel logo | `images/logo.png` | ~200×80px transparent PNG |
| Favicon | `images/favicon.png` | 64×64px |
| Food photos | `images/menu/your-dish.jpg` | 400×400px (square best) |

> **Tip:** Keep each food image under 150 KB. Use [Squoosh.app](https://squoosh.app) — free, in-browser compression.

---

### Step 2 — Edit `js/config.js` (the ONLY file you touch)

```js
hotelName:  "Hotel Sunrise",
tagline:    "Fresh food, served with heart",
currency:   "₹",
whatsapp:   "919876543210",  // Country code + number, no spaces, no +
```

**Enable home delivery and set delivery charge:**
```js
homeDeliveryEnabled: true,
deliveryCharge: 30,   // Charge in your currency — shown on delivery step and bill
```

**Enable GST (optional):**
```js
gst: {
  enabled: true,
  cgst: 5,   // CGST percentage
  sgst: 5,   // SGST percentage
},
```
> Set both to `0` and `enabled: false` to hide GST completely.

**Change colors to match your hotel brand:**
```js
theme: {
  accent:     "#C9A84C",   // Primary color — buttons, active tabs, prices
  accentDark: "#8a6f32",   // Darker shade of accent
  accentText: "#0a0706",   // Text ON accent buttons — use #ffffff for dark accents
}
```

**Ready-made color palettes — copy & paste:**
```
Gold (default):   accent=#C9A84C  accentDark=#8a6f32  accentText=#0a0706
Royal Blue:       accent=#3B6FD4  accentDark=#1e4299  accentText=#ffffff
Forest Green:     accent=#3a7d44  accentDark=#1e5229  accentText=#ffffff
Rose Gold:        accent=#c97d6e  accentDark=#8a4a3e  accentText=#ffffff
Burgundy:         accent=#8B2635  accentDark=#5a1622  accentText=#ffffff
Deep Purple:      accent=#6B3FA0  accentDark=#4a2070  accentText=#ffffff
Ocean Teal:       accent=#0d9488  accentDark=#0a7063  accentText=#ffffff
```

**Add a menu item:**
```js
{
  id:        "s1",                            // Unique ID — NEVER change once live
  name:      "Paneer Tikka",
  price:     320,                             // Number only, no ₹
  desc:      "Grilled cottage cheese with spices",
  img:       "images/menu/paneer-tikka.jpg",  // From project root
  type:      "veg",                           // "veg" or "nveg"
  badge:     "Chef's Pick",                   // Or: "Bestseller" | "New" | "Spicy 🌶️" | ""
  available: true,                            // false = greyed out, can't order
},
```

**Turn off a form field** (e.g. if you don't need mobile number):
```js
guestForm: {
  askName:   true,    // true = show, false = hide
  askMobile: false,   // hidden — guests won't see it
},
```

---

### Step 3 — Open & test

**Option A — Just double-click** `index.html` *(works for testing)*

**Option B — Run a local server** *(recommended, tests images properly)*:
```bash
# Python (built-in on Mac/Linux)
cd hotel-menu
python3 -m http.server 8080
# Then open: http://localhost:8080

# Node.js
npx serve .
```

**Test on your phone:** Connect phone to same WiFi → open `http://YOUR_COMPUTER_IP:8080`

---

## 📱 HOW THE GUEST EXPERIENCE WORKS

```
1. Guest scans QR code at table
2. Welcome screen → enters Name (optional) + Mobile (optional)
3. Browses menu by category → taps + to add items
4. Gold floating bar appears at bottom showing item count + total
5. Taps bar → cart drawer slides up
6. Reviews order + adds special instructions (optional)
7. Taps "Proceed to Order" → chooses Dine-In or Home Delivery
8. Fills in table number (dine-in) or delivery details (delivery)
9. Taps "Send Order via WhatsApp" → WhatsApp opens with pre-filled message
10. Guest hits Send → kitchen/owner receives order
11. Success screen shown
12. Guest can tap "Add More Items" to order again (bread, water, dessert etc.)
    → Additional orders are sent as "Additional Order (Round 2)" so kitchen knows it's an add-on
```

---

## ➕ MULTIPLE ORDER ROUNDS (Re-ordering)

After the first order is placed:
- The **floating cart bar** stays visible, showing "Order 1 placed ✓ · Tap to Generate Bill"
- Guest can keep browsing and add more items
- Second order goes to WhatsApp as **"➕ Additional Order (Round 2)"**
- This makes it clear to kitchen staff it's an add-on to an existing table
- For home delivery, **delivery charge is only applied on the first round** — add-on rounds are free

---

## 🧾 BILL GENERATION

After one or more orders are placed:
- Guest (or staff) taps **"Generate Bill"** from the cart drawer or success screen
- Bill screen shows all rounds, all items, GST breakdown, delivery charge (if any), and grand total
- **Download PDF** — generates a thermal-style receipt PDF (80mm format)
- **Share on WhatsApp** — sends a formatted bill summary to the hotel's WhatsApp number
- Bill totals are consistent: GST is calculated on food subtotal only (delivery charge is not taxed)

---

## 💰 BILLING & GST CALCULATION

The system calculates totals as follows:

```
Food Subtotal  =  sum of all item prices × quantities (across all rounds)
CGST           =  Food Subtotal × CGST%
SGST           =  Food Subtotal × SGST%
Delivery       =  deliveryCharge (first round only, home delivery only)
─────────────────────────────────────────────────────
Grand Total    =  Food Subtotal + CGST + SGST + Delivery
```

> GST is **never** applied on the delivery charge — only on food.

---

## 🏨 DEPLOYING FOR MULTIPLE HOTELS

Each hotel gets its **own folder** — everything else is identical:

```
my-menus/
├── hotel-kinara/          ← Gold theme, Indian menu
├── hotel-sunrise/         ← Blue theme, continental menu
└── hotel-golden-leaf/     ← Green theme, multi-cuisine
```

Copy the entire `hotel-menu/` folder, rename it, then:
1. Replace images in `/images/` and `/images/menu/`
2. Edit `js/config.js` (hotel name, WhatsApp, colors, menu items)
3. Done!

---

## 📤 GOING LIVE (Hosting options)

| Option | Cost | Best for |
|--------|------|----------|
| **Netlify** (netlify.com) | Free | Drag & drop the folder, instant live URL |
| **GitHub Pages** | Free | Push to GitHub, enable Pages |
| **Your web host** | Varies | Upload via FTP/cPanel |
| **Local WiFi only** | Free | Python server on same network as guests |

Once live, generate a QR code for the URL at [qr-code-generator.com](https://www.qr-code-generator.com) and print/display at each table.

---

## 🔧 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Images not loading | Filename must **exactly** match `config.js` — including case. `Paneer-Tikka.jpg` ≠ `paneer-tikka.jpg` |
| WhatsApp not opening | Check `whatsapp` in config: no `+`, no spaces, start with country code. e.g. `"919876543210"` |
| Colors not updating | Hard-refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) |
| Logo not showing | App auto-hides it if image fails — check `images/logo.png` exists with correct name |
| Cart bar disappears after order | Expected behaviour on bill/success screens. Returns when back on menu screen. |
| Back button in delivery step not working | Ensure `showOrderStep` is exported in `app.js` return object and `index.html` calls `App.showOrderStep('stepChoose')` |
| Delivery charge showing ₹0 on round 2 | Ensure `_updateDeliveryTotals()` uses `HOTEL_CONFIG.deliveryCharge` directly, not `isAddOnRound ? 0 : charge` |
| Bill total different from order total | Ensure GST is calculated on `foodOnly` (before delivery is added) in both `_buildBillData()` and `placeOrder()` |
| PDF subtotal incorrect | Ensure `_generatePDF()` uses `d.foodSubtotal` instead of `d.grandTotal - d.deliveryCharge` |

---

## 📐 IMAGE QUICK REFERENCE

| Image | Path | Dimensions | Format | Notes |
|-------|------|-----------|--------|-------|
| Welcome banner | `images/banner.jpg` | 800×1200px | JPG | Portrait, dark areas at bottom work best |
| Menu hero | `images/menu-hero.jpg` | 1200×400px | JPG | Landscape, restaurant/food shot |
| Logo | `images/logo.png` | ~200×80px | PNG | Transparent background preferred |
| Favicon | `images/favicon.png` | 64×64px | PNG | Square, simple icon |
| Food items | `images/menu/*.jpg` | 400×400px | JPG | Square crop, keep under 150KB each |