# ✨ Priya Studio - Official Website

A luxury, handcrafted, responsive e-commerce showcase website designed specifically for **Priya Studio**, featuring **Resin Art**, **Handcrafted Botanical Jewellery**, and **Custom Aesthetic T-Shirts**.

---

## 🌟 Key Features

1. **🌓 Dark Mode & Light Mode Toggle**:
   - One-click toggle button on the header with smooth transition.
   - Automatically remembers user preference in `localStorage`.
   - Beautiful custom dark palette with warm terracotta & amber glow accents.

2. **📋 Proper Navigation Menu**:
   - Sticky Glassmorphism Header with blur effect.
   - Smooth navigation: **Home**, **Resin Art**, **Jewellery**, **T-Shirts**, **Custom Orders**, **About Us**, **FAQ**, and **Contact**.
   - Mobile-responsive sliding drawer menu with hamburger button.

3. **🎨 3 Curated Core Categories**:
   - **Resin Art**: Ocean Wave Wooden Platters, Amethyst Geode Wall Clocks, Botanical Pressed Coasters, Varmala/Wedding Flower Preservation Frames, Gold Leaf Bookmarks.
   - **Handcrafted Jewellery**: Real Dried Flower Pendants, Baroque Pearl Chokers, Miniature Wildflower Earrings, Celestial Moonstone Rings, Initial Charms.
   - **Aesthetic T-Shirts**: 240 GSM Heavyweight Oversized Studio Tees, Botanical Line-Art Embroidered Tees, Vintage Japanese Wave Prints, Custom Personalized Tees.

4. **🛍️ Interactive Shopping Cart & WhatsApp Checkout**:
   - Slide-out Cart Drawer with product quantity increment/decrement.
   - Dynamic Free Shipping Progress Bar (unlocked on orders above ₹999).
   - Promo code coupon system (e.g., `PRIYA10` for 10% off).
   - **"Quick Order on WhatsApp"**: Automatically formats the entire cart into a neat WhatsApp message with product names, variants, quantities, price, and customer address prompt!

5. **🔍 Live Filters & Search**:
   - Instant category filtering (All, Resin Art, Jewellery, T-Shirts, Bestsellers).
   - Real-time search by keyword.
   - Sort by Featured, Price (Low to High / High to Low), or Rating.

6. **👁️ Quick View Modal**:
   - Inspect product details, choose variants/sizes, and add to bag instantly.

7. **💌 Custom Commissions & Flower Preservation Form**:
   - Direct form to submit custom order requirements (Varmala preservation, custom wall clocks, personalized tees) straight to WhatsApp.

---

## 🚀 How to Run the Website

You don't need to install Node or Python! 

1. Go to your folder: `C:\Users\LENOVO\Documents\New folder\`
2. Double-click on **`index.html`** or right-click and choose **"Open with Google Chrome"** (or Microsoft Edge).
3. The website will immediately run in full glory!

---

## ⚙️ How to Customize

- **Change WhatsApp Number / Studio Info**:
  Open `js/products.js` and edit the `STUDIO_CONFIG` object at the bottom:
  ```javascript
  const STUDIO_CONFIG = {
    name: 'Priya Studio',
    phone: '917567259570', // Put your real 10-digit WhatsApp number with country code (e.g. 91...)
    email: 'contact@priyastudio.com',
    ...
  };
  ```

- **Add or Edit Products & T-Shirt Photos**:
  Open `js/products.js` to change photos, prices, or titles. For the 3 T-shirts, find `black-vintage-graphic-tshirt`, `black-vintage-headphone-graphic-tshirt`, and `brown-graphic-tshirt` and replace the `image:` property with your image URL or local path (e.g. `images/my-tshirt.jpg`):
  ```javascript
  {
    id: 'black-vintage-graphic-tshirt',
    image: 'images/your-tshirt-photo.jpg', // Put your photo path here
    price: 350,
    ...
  }
  ```

- **Change Colors or Fonts**:
  Open `css/style.css` and customize CSS variables in `:root` and `[data-theme="dark"]`.
