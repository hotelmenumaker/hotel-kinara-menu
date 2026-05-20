/**
 * ╔══════════════════════════════════════════════════════╗
 * ║          HOTEL KINARA — CONFIGURATION FILE           ║
 * ║  Edit ONLY this file to customise for any hotel.     ║
 * ║  All images go in the /images/ folder.               ║
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
  /* ─────────────── IMAGES (all from /images/ folder) ─────────────── */
  images: {
    welcomeBanner: "images/banner.jpg",
    menuHero:      "images/menu-hero.jpg",
    logo:          "images/logo.png",
    favicon:       "images/favicon.png",
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
            { id: "s1", name: "Paneer Tikka", price: 320, desc: "Tender cottage cheese marinated in yoghurt & spices, grilled in tandoor", img: "images/menu/paneer-tikka.jpg", type: "veg", badge: "Chef's Pick", available: true },
            { id: "s2", name: "Hara Bhara Kebab", price: 260, desc: "Crispy spinach & pea patties with mint chutney", img: "images/menu/hara-bhara-kebab.jpg", type: "veg", badge: "", available: true },
            { id: "s3", name: "Crispy Corn", price: 220, desc: "Golden fried sweet corn tossed with herbs & chillies", img: "images/menu/crispy-corn.jpg", type: "veg", badge: "Popular", available: true },
          ],
        },
        {
          name: "Non-Vegetarian",
          items: [
            { id: "s4", name: "Chicken Tikka", price: 420, desc: "Juicy chicken marinated overnight & char-grilled", img: "images/menu/chicken-tikka.jpg", type: "nveg", badge: "Bestseller", available: true },
            { id: "s5", name: "Seekh Kebab", price: 380, desc: "Minced lamb with ginger, garlic & aromatic spices on skewers", img: "images/menu/seekh-kebab.jpg", type: "nveg", badge: "", available: true },
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
            { id: "m1", name: "Paneer Butter Masala", price: 380, desc: "Cottage cheese in rich tomato-cashew gravy with cream", img: "images/menu/paneer-butter-masala.jpg", type: "veg", badge: "Popular", available: true },
            { id: "m2", name: "Dal Makhani", price: 320, desc: "Slow-cooked black lentils with butter & cream, smoked finish", img: "images/menu/dal-makhani.jpg", type: "veg", badge: "Chef's Pick", available: true },
            { id: "m3", name: "Kadai Paneer", price: 360, desc: "Paneer & peppers in bold freshly ground kadai masala", img: "images/menu/kadai-paneer.jpg", type: "veg", badge: "", available: true },
            { id: "m4", name: "Palak Paneer", price: 340, desc: "Velvety spinach gravy with fresh cottage cheese", img: "images/menu/palak-paneer.jpg", type: "veg", badge: "", available: true },
          ],
        },
        {
          name: "Non-Vegetarian",
          items: [
            { id: "m5", name: "Butter Chicken", price: 480, desc: "Classic murgh makhani in velvety tomato-cream sauce", img: "images/menu/butter-chicken.jpg", type: "nveg", badge: "Bestseller", available: true },
            { id: "m6", name: "Mutton Rogan Josh", price: 560, desc: "Slow-braised mutton in Kashmiri spices, deeply aromatic", img: "images/menu/rogan-josh.jpg", type: "nveg", badge: "Signature", available: true },
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
            { id: "b1", name: "Butter Roti", price: 40, desc: "Soft whole wheat roti brushed with butter", img: "images/menu/butter-roti.jpg", type: "veg", badge: "", available: true },
            { id: "b2", name: "Garlic Naan", price: 80, desc: "Leavened bread baked in tandoor with garlic butter", img: "images/menu/garlic-naan.jpg", type: "veg", badge: "Popular", available: true },
            { id: "b3", name: "Laccha Paratha", price: 70, desc: "Layered whole wheat flatbread, flaky and buttery", img: "images/menu/laccha-paratha.jpg", type: "veg", badge: "", available: true },
          ],
        },
        {
          name: "Rice",
          items: [
            { id: "r1", name: "Steamed Rice", price: 120, desc: "Plain long-grain basmati rice, perfectly cooked", img: "images/menu/steamed-rice.jpg", type: "veg", badge: "", available: true },
            { id: "r2", name: "Jeera Rice", price: 160, desc: "Fragrant basmati tossed with cumin & ghee", img: "images/menu/jeera-rice.jpg", type: "veg", badge: "", available: true },
            { id: "r3", name: "Veg Biryani", price: 320, desc: "Aromatic basmati with seasonal vegetables & whole spices", img: "images/menu/veg-biryani.jpg", type: "veg", badge: "Popular", available: true },
            { id: "r4", name: "Chicken Biryani", price: 400, desc: "Dum-cooked basmati with tender chicken & caramelised onions", img: "images/menu/chicken-biryani.jpg", type: "nveg", badge: "Bestseller", available: true },
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
            { id: "d1", name: "Gulab Jamun", price: 140, desc: "Soft milk-solid dumplings in rose-cardamom sugar syrup", img: "images/menu/gulab-jamun.jpg", type: "veg", badge: "Popular", available: true },
            { id: "d2", name: "Kulfi Falooda", price: 180, desc: "Dense Indian ice cream over vermicelli & rose syrup", img: "images/menu/kulfi-falooda.jpg", type: "veg", badge: "", available: true },
            { id: "d3", name: "Warm Brownie", price: 220, desc: "Belgian chocolate brownie with vanilla ice cream", img: "images/menu/brownie.jpg", type: "veg", badge: "Chef's Pick", available: true },
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
            { id: "v1", name: "Water Bottle (1L)", price: 30, desc: "Chilled packaged mineral water", img: "images/menu/water-bottle.jpg", type: "veg", badge: "", available: true },
            { id: "v2", name: "Mango Lassi", price: 120, desc: "Chilled blended mango with creamy yoghurt", img: "images/menu/mango-lassi.jpg", type: "veg", badge: "", available: true },
            { id: "v3", name: "Masala Chai", price: 60, desc: "Spiced milk tea with ginger, cardamom & cloves", img: "images/menu/masala-chai.jpg", type: "veg", badge: "", available: true },
            { id: "v4", name: "Fresh Lime Soda", price: 90, desc: "House-pressed lime with soda, sweet or salted", img: "images/menu/lime-soda.jpg", type: "veg", badge: "Refreshing", available: true },
          ],
        },
      ],
    },
  ],
};
