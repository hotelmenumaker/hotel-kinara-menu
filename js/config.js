/**
 * ╔══════════════════════════════════════════════════════╗
 * ║          HOTEL KINARA — CONFIGURATION FILE           ║
 * ║  Edit ONLY this file to customise for any hotel.     ║
 * ║  Images are loaded from Unsplash (requires internet) ║
 * ╚══════════════════════════════════════════════════════╝
 */

const HOTEL_CONFIG = {

  /* ─────────────── HOTEL IDENTITY ─────────────── */
  hotelName:    "Hotel Kinara",
  tagline:      "Authentic flavours, served with love",
  currency:     "₹",
  whatsapp:     "919284885146",   // Replace: 91 + 10-digit mobile. e.g. "919876543210"

  homeDeliveryEnabled: true,
  deliveryCharge: 30,
  googleMapsLink: "https://maps.google.com",

  gst: {
    enabled: true,
    cgst: 0,   // percentage
    sgst: 0,   // percentage
  },

  /* ─────────────── IMAGES (Unsplash CDN — requires internet) ─────────────── */
  images: {
    welcomeBanner: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=1200&fit=crop&auto=format&q=80",
    menuHero:      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop&auto=format&q=80",
    logo:          "images/logo.png",      // keep your own logo
    favicon:       "images/favicon.png",   // keep your own favicon
  },

  /* ─────────────── THEME COLORS ─────────────── */
  theme: {
    accent:       "#C9A84C",
    accentDark:   "#8a6f32",
    accentText:   "#0a0706",
    bgColor:      "#0a0a0a",
    surfaceColor: "#111111",
    borderColor:  "#2a2a2a",
    textPrimary:  "#F2EDE0",
    textMuted:    "#a09880",
  },

  /* ─────────────── GUEST FORM (welcome screen — name + mobile only) ─────────────── */
  guestForm: {
    askName:   true,
    askMobile: true,
    askTable:  false,   // Table is now captured in the order flow, not here
  },

  /* ─────────────── MENU ─────────────── */
  menu: [
    {
      category: "Starters",
      icon: "🥗",
      subcategories: [
        {
          name: "Vegetarian",
          items: [
            { id: "s1", name: "Paneer Tikka",     price: 320, desc: "Tender cottage cheese marinated in yoghurt & spices, grilled in tandoor", img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=400&fit=crop&auto=format&q=80", type: "veg",  badge: "Chef's Pick",  available: true },
            { id: "s2", name: "Hara Bhara Kebab", price: 260, desc: "Crispy spinach & pea patties with mint chutney",                          img: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=400&fit=crop&auto=format&q=80", type: "veg",  badge: "",            available: true },
            { id: "s3", name: "Crispy Corn",       price: 220, desc: "Golden fried sweet corn tossed with herbs & chillies",                    img: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=400&fit=crop&auto=format&q=80", type: "veg",  badge: "Popular",      available: true },
          ],
        },
        {
          name: "Non-Vegetarian",
          items: [
            { id: "s4", name: "Chicken Tikka", price: 420, desc: "Juicy chicken marinated overnight & char-grilled",                    img: "https://images.unsplash.com/photo-1598515213692-eb2a6e1b38fe?w=400&h=400&fit=crop&auto=format&q=80", type: "nveg", badge: "Bestseller", available: true },
            { id: "s5", name: "Seekh Kebab",   price: 380, desc: "Minced lamb with ginger, garlic & aromatic spices on skewers",        img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=400&fit=crop&auto=format&q=80", type: "nveg", badge: "",           available: true },
          ],
        },
      ],
    },
    {
      category: "Main Course",
      icon: "🍛",
      subcategories: [
        {
          name: "Vegetarian",
          items: [
            { id: "m1", name: "Paneer Butter Masala", price: 380, desc: "Cottage cheese in rich tomato-cashew gravy with cream",              img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=400&fit=crop&auto=format&q=80", type: "veg", badge: "Popular",      available: true },
            { id: "m2", name: "Dal Makhani",          price: 320, desc: "Slow-cooked black lentils with butter & cream, smoked finish",       img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop&auto=format&q=80", type: "veg", badge: "Chef's Pick",  available: true },
            { id: "m3", name: "Kadai Paneer",         price: 360, desc: "Paneer & peppers in bold freshly ground kadai masala",               img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop&auto=format&q=80", type: "veg", badge: "",            available: true },
            { id: "m4", name: "Palak Paneer",         price: 340, desc: "Velvety spinach gravy with fresh cottage cheese",                    img: "https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=400&h=400&fit=crop&auto=format&q=80", type: "veg", badge: "",            available: true },
          ],
        },
        {
          name: "Non-Vegetarian",
          items: [
            { id: "m5", name: "Butter Chicken",   price: 480, desc: "Classic murgh makhani in velvety tomato-cream sauce",          img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=400&fit=crop&auto=format&q=80", type: "nveg", badge: "Bestseller", available: true },
            { id: "m6", name: "Mutton Rogan Josh", price: 560, desc: "Slow-braised mutton in Kashmiri spices, deeply aromatic",      img: "https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=400&h=400&fit=crop&auto=format&q=80", type: "nveg", badge: "Signature",  available: true },
          ],
        },
      ],
    },
    {
      category: "Breads & Rice",
      icon: "🫓",
      subcategories: [
        {
          name: "Breads",
          items: [
            { id: "b1", name: "Butter Roti",    price: 40, desc: "Soft whole wheat roti brushed with butter",                  img: "https://images.unsplash.com/photo-1565180606934-ec9c7f5e5f62?w=400&h=400&fit=crop&auto=format&q=80", type: "veg", badge: "",         available: true },
            { id: "b2", name: "Garlic Naan",    price: 80, desc: "Leavened bread baked in tandoor with garlic butter",         img: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400&h=400&fit=crop&auto=format&q=80", type: "veg", badge: "Popular",  available: true },
            { id: "b3", name: "Laccha Paratha", price: 70, desc: "Layered whole wheat flatbread, flaky and buttery",           img: "https://images.unsplash.com/photo-1600628421055-4d30de868b8f?w=400&h=400&fit=crop&auto=format&q=80", type: "veg", badge: "",         available: true },
          ],
        },
        {
          name: "Rice",
          items: [
            { id: "r1", name: "Steamed Rice",    price: 120, desc: "Plain long-grain basmati rice, perfectly cooked",                       img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&auto=format&q=80", type: "veg",  badge: "",            available: true },
            { id: "r2", name: "Jeera Rice",      price: 160, desc: "Fragrant basmati tossed with cumin & ghee",                             img: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=400&h=400&fit=crop&auto=format&q=80", type: "veg",  badge: "",            available: true },
            { id: "r3", name: "Veg Biryani",     price: 320, desc: "Aromatic basmati with seasonal vegetables & whole spices",              img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=400&fit=crop&auto=format&q=80", type: "veg",  badge: "Popular",      available: true },
            { id: "r4", name: "Chicken Biryani", price: 400, desc: "Dum-cooked basmati with tender chicken & caramelised onions",           img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=400&fit=crop&auto=format&q=80", type: "nveg", badge: "Bestseller",   available: true },
          ],
        },
      ],
    },
    {
      category: "Desserts",
      icon: "🍮",
      subcategories: [
        {
          name: "All",
          items: [
            { id: "d1", name: "Gulab Jamun",   price: 140, desc: "Soft milk-solid dumplings in rose-cardamom sugar syrup",    img: "https://images.unsplash.com/photo-1666530038873-2a9c3e5e8a7c?w=400&h=400&fit=crop&auto=format&q=80", type: "veg", badge: "Popular",     available: true },
            { id: "d2", name: "Kulfi Falooda", price: 180, desc: "Dense Indian ice cream over vermicelli & rose syrup",       img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop&auto=format&q=80", type: "veg", badge: "",           available: true },
            { id: "d3", name: "Warm Brownie",  price: 220, desc: "Belgian chocolate brownie with vanilla ice cream",          img: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=400&fit=crop&auto=format&q=80", type: "veg", badge: "Chef's Pick", available: true },
          ],
        },
      ],
    },
    {
      category: "Beverages",
      icon: "🥤",
      subcategories: [
        {
          name: "All",
          items: [
            { id: "v1", name: "Water Bottle (1L)", price: 30,  desc: "Chilled packaged mineral water",                          img: "https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400&h=400&fit=crop&auto=format&q=80", type: "veg", badge: "",            available: true },
            { id: "v2", name: "Mango Lassi",       price: 120, desc: "Chilled blended mango with creamy yoghurt",               img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop&auto=format&q=80", type: "veg", badge: "",            available: true },
            { id: "v3", name: "Masala Chai",       price: 60,  desc: "Spiced milk tea with ginger, cardamom & cloves",          img: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400&h=400&fit=crop&auto=format&q=80", type: "veg", badge: "",            available: true },
            { id: "v4", name: "Fresh Lime Soda",   price: 90,  desc: "House-pressed lime with soda, sweet or salted",           img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=400&fit=crop&auto=format&q=80", type: "veg", badge: "Refreshing",  available: true },
          ],
        },
      ],
    },
  ],
};
