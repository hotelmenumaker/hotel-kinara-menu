/**
 * ╔══════════════════════════════════════════════════════╗
 * ║          HOTEL KINARA — CONFIGURATION FILE           ║
 * ║  Edit ONLY this file to customise for any hotel.     ║
 * ║  All images go in the /images/ folder.               ║
 * ╚══════════════════════════════════════════════════════╝
 */

const HOTEL_CONFIG = {

  /* ─────────────── HOTEL IDENTITY ─────────────── */
  hotelName: "Hotel Kinara",
  tagline: "Authentic flavours, served with love",
  currency: "₹",
  whatsapp: "919284885146",   // Replace: 91 + 10-digit mobile. e.g. "919876543210"

  homeDeliveryEnabled: true,
  deliveryCharge: 30,
  // deliveryOrderWindow: 10,   // minutes — additional rounds allowed within this time
  // REPLACE WITH:
  deliveryOrderWindow: 10,   // minutes — additional rounds allowed within this time
  cancellationWindow: 10,    // minutes — order can be cancelled within this time
  allowAdditionalRounds: {
    dineIn: true,   // dine-in can always add more rounds
    delivery: true,   // delivery additional rounds controlled by window above
  },
  googleMapsLink: "https://maps.google.com",

  gst: {
    enabled: true,
    cgst: 5,   // percentage
    sgst: 5,   // percentage
  },
  /* ─────────────── IMAGES (all from /images/ folder) ─────────────── */
  images: {
    welcomeBanner: "images/banner.jpg",
    menuHero: "images/menu-hero.jpg",
    logo: "images/logo.png",
    favicon: "images/favicon.png",
  },

  /* ─────────────── THEME COLORS ─────────────── */
  theme: {
    accent: "#C9A84C",
    accentDark: "#8a6f32",
    accentText: "#0a0706",
    bgColor: "#0a0a0a",
    surfaceColor: "#111111",
    borderColor: "#2a2a2a",
    textPrimary: "#F2EDE0",
    textMuted: "#a09880",
  },

  /* ─────────────── GUEST FORM (welcome screen — name + mobile only) ─────────────── */
  guestForm: {
    askName: true,
    askMobile: true,
    askTable: false,   // Table is now captured in the order flow, not here
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
            {
              id: "s1", name: "Paneer Tikka", price: 320,
              desc: "Tender cottage cheese marinated in yoghurt & spices, grilled in tandoor",
              img: "https://img.freepik.com/premium-photo/juicy-tandoori-paneer-tikka-white-background-paneer-tikka-image-photography_1020697-118609.jpg?w=2000?w=400&q=80",
              type: "veg", badge: "Chef's Pick", available: true
            },
            {
              id: "s2", name: "Hara Bhara Kebab", price: 260,
              desc: "Crispy spinach & pea patties with mint chutney",
              img: "https://i0.wp.com/www.cookingfromheart.com/wp-content/uploads/2017/06/Hara-Bhara-Kabab-2.jpg?resize=1024%2C680?w=400&q=80",
              type: "veg", badge: "", available: true
            },
            {
              id: "s3", name: "Crispy Corn", price: 220,
              desc: "Golden fried sweet corn tossed with herbs & chillies",
              img: "https://www.kuchpakrahahai.in/wp-content/uploads/2021/09/Crispy-Corn-Barbeque-Style-414x518.jpg?w=400&q=80",
              type: "veg", badge: "Popular", available: true
            },
          ],
        },
        {
          name: "Non-Vegetarian",
          items: [
            {
              id: "s4", name: "Chicken Tikka", price: 420,
              desc: "Juicy chicken marinated overnight & char-grilled",
              img: "https://recipes.net/wp-content/uploads/2023/05/air-fryer-chicken-tikka-recipe_dbe252db9a567a504d0553178f269750-768x768.jpeg?w=400&q=80",
              type: "nveg", badge: "Bestseller", available: true
            },
            {
              id: "s5", name: "Seekh Kebab", price: 380,
              desc: "Minced lamb with ginger, garlic & aromatic spices on skewers",
              img: "https://static.vecteezy.com/system/resources/thumbnails/034/935/477/small_2x/juicy-skewered-seekh-kababs-a-mouthwatering-blend-of-spices-and-grilled-goodness-ai-generated-photo.jpg?w=400&q=80",
              type: "nveg", badge: "", available: true
            },
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
            {
              id: "m1", name: "Paneer Butter Masala", price: 380,
              desc: "Cottage cheese in rich tomato-cashew gravy with cream",
              img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80",
              type: "veg", badge: "Popular", available: true
            },
            {
              id: "m2", name: "Dal Makhani", price: 320,
              desc: "Slow-cooked black lentils with butter & cream, smoked finish",
              img: "https://tse3.mm.bing.net/th/id/OIP.sRCj9O7ggfASPKTWDKdW8gHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
              type: "veg", badge: "Chef's Pick", available: true
            },
            {
              id: "m3", name: "Kadai Paneer", price: 360,
              desc: "Paneer & peppers in bold freshly ground kadai masala",
              img: "https://tse4.mm.bing.net/th/id/OIP.jN3ke1QddOmOzaknm0_HRwHaJ1?rs=1&pid=ImgDetMain&o=7&rm=3",
              type: "veg", badge: "", available: true
            },
            {
              id: "m4", name: "Palak Paneer", price: 340,
              desc: "Velvety spinach gravy with fresh cottage cheese",
              img: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=80",
              type: "veg", badge: "", available: true
            },
          ],
        },
        {
          name: "Non-Vegetarian",
          items: [
            {
              id: "m5", name: "Butter Chicken", price: 480,
              desc: "Classic murgh makhani in velvety tomato-cream sauce",
              img: "https://dishesbylina.com/wp-content/uploads/2025/12/butter-chicken.png?w=400&q=80",
              type: "nveg", badge: "Bestseller", available: true
            },
            {
              id: "m6", name: "Mutton Rogan Josh", price: 560,
              desc: "Slow-braised mutton in Kashmiri spices, deeply aromatic",
              img: "https://tse2.mm.bing.net/th/id/OIP.e5rhS3LwatOwGTOZ85MiawHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
              type: "nveg", badge: "Signature", available: true
            },
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
            {
              id: "b1", name: "Butter Roti", price: 40,
              desc: "Soft whole wheat roti brushed with butter",
              img: "https://img.freepik.com/premium-photo/butter-roti-isolated-rustic-wooden-background-selective-focus_726363-629.jpg?w=400&q=80",
              type: "veg", badge: "", available: true
            },
            {
              id: "b2", name: "Garlic Naan", price: 80,
              desc: "Leavened bread baked in tandoor with garlic butter",
              img: "https://recipepioneer.com/wp-content/uploads/2025/02/recipe_image_1_20250226_150318.jpg",
              type: "veg", badge: "Popular", available: true
            },
            {
              id: "b3", name: "Laccha Paratha", price: 70,
              desc: "Layered whole wheat flatbread, flaky and buttery",
              img: "https://th.bing.com/th/id/R.eadbbb333fcad5ed52d243776eb526f2?rik=IOU1iaggTgWLNw&riu=http%3a%2f%2fwww.scratchingcanvas.com%2fwp-content%2fuploads%2f2019%2f04%2fLaccha-Paratha-Easy.3.jpg&ehk=1ranWtFqTUN9VdIP7wNwa16raecDM0pgmYdhhjC%2fmko%3d&risl=&pid=ImgRaw&r=0",
              type: "veg", badge: "", available: true
            },
          ],
        },
        {
          name: "Rice",
          items: [
            {
              id: "r1", name: "Steamed Rice", price: 120,
              desc: "Plain long-grain basmati rice, perfectly cooked",
              img: "https://izzycooking.com/wp-content/uploads/2021/04/Rice-Cooker-Basmati-Rice-768x1152.jpg",
              type: "veg", badge: "", available: true
            },
            {
              id: "r2", name: "Jeera Rice", price: 160,
              desc: "Fragrant basmati tossed with cumin & ghee",
              img: "https://i.pinimg.com/736x/99/ed/15/99ed15e2f27a7be75e71c0b72204a31a.jpg",
              type: "veg", badge: "", available: true
            },
            {
              id: "r3", name: "Veg Biryani", price: 320,
              desc: "Aromatic basmati with seasonal vegetables & whole spices",
              img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80",
              type: "veg", badge: "Popular", available: true
            },
            {
              id: "r4", name: "Chicken Biryani", price: 400,
              desc: "Dum-cooked basmati with tender chicken & caramelised onions",
              img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80",
              type: "nveg", badge: "Bestseller", available: true
            },
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
            {
              id: "d1", name: "Gulab Jamun", price: 140,
              desc: "Soft milk-solid dumplings in rose-cardamom sugar syrup",
              img: "https://as2.ftcdn.net/v2/jpg/08/94/76/25/1000_F_894762571_KXz2mTpbcjHRGMg48iiU4CnI9v7La4EN.jpg?w=400&q=80",
              type: "veg", badge: "Popular", available: true
            },
            {
              id: "d2", name: "Kulfi Falooda", price: 180,
              desc: "Dense Indian ice cream over vermicelli & rose syrup",
              img: "https://i.pinimg.com/736x/e7/87/5d/e7875dac22797f2e677dfa0b06d3a113.jpg",
              type: "veg", badge: "", available: true
            },
            {
              id: "d3", name: "Warm Brownie", price: 220,
              desc: "Belgian chocolate brownie with vanilla ice cream",
              img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80",
              type: "veg", badge: "Chef's Pick", available: true
            },
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
            {
              id: "v1", name: "Water Bottle (1L)", price: 30,
              desc: "Chilled packaged mineral water",
              img: "https://tse4.mm.bing.net/th/id/OIP.BuorxbVrnUUH9Ffrn4Mk1wHaIF?w=1200&h=1310&rs=1&pid=ImgDetMain&o=7&rm=3",
              type: "veg", badge: "", available: true
            },
            {
              id: "v2", name: "Mango Lassi", price: 120,
              desc: "Chilled blended mango with creamy yoghurt",
              img: "https://bakeoutsidethelines.com/wp-content/uploads/2025/08/mango-smoothie-recipe.webp",
              type: "veg", badge: "", available: true
            },
            {
              id: "v3", name: "Masala Chai", price: 60,
              desc: "Spiced milk tea with ginger, cardamom & cloves",
              img: "https://i.pinimg.com/originals/d2/f4/4e/d2f44e914953834cd4784f8497f8bee6.jpg",
              type: "veg", badge: "", available: true
            },
            {
              id: "v4", name: "Fresh Lime Soda", price: 90,
              desc: "House-pressed lime with soda, sweet or salted",
              img: "https://static.vecteezy.com/system/resources/previews/030/673/650/non_2x/product-shots-of-diet-coke-lime-high-quality-4k-free-photo.jpg",
              type: "veg", badge: "Refreshing", available: true
            },
          ],
        },
      ],
    },
  ],
};
