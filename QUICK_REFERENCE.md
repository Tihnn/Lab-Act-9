# 🚴 BikeShop E-Commerce - Quick Reference Card

## 🎯 What You Have

✅ **Complete E-Commerce System**
- Landing page that matches your design
- Products browsing with categories
- Shopping cart functionality
- Checkout process
- Order confirmation

✅ **Technology Stack**
- Frontend: ReactJS
- Backend: NestJS + TypeScript
- Database: MySQL (activity9_db)

---

## ⚡ Quick Commands

### Start Backend:
```powershell
cd backend
npm run start:dev
```
**URL:** http://localhost:3001

### Start Frontend:
```powershell
cd frontend
npm start
```
**URL:** http://localhost:3000

### Seed Database (Optional):
```powershell
npm run seed
```

---

## 📂 Key Files

**Frontend Pages:**
- `frontend/src/pages/LandingPage.js` - Home page
- `frontend/src/pages/ProductsPage.js` - Product catalog
- `frontend/src/pages/CartPage.js` - Shopping cart
- `frontend/src/pages/CheckoutPage.js` - Checkout form
- `frontend/src/pages/OrderConfirmationPage.js` - Order success

**Backend API:**
- `backend/src/controllers/` - API endpoints
- `backend/src/services/` - Business logic
- `backend/src/entities/` - Database models

**Configuration:**
- `backend/.env` - Database settings

---

## 🗄️ Database Tables

1. `bicycles` - Bicycle products
2. `parts` - Bike parts
3. `accessories` - Accessories
4. `clothing` - Apparel
5. `cart_items` - Shopping cart
6. `orders` - Orders
7. `order_items` - Order details

**Auto-created** when you start the backend!

---

## 🌐 URLs

| Page | URL |
|------|-----|
| Landing | http://localhost:3000 |
| Products | http://localhost:3000/products |
| Cart | http://localhost:3000/cart |
| Checkout | http://localhost:3000/checkout |
| API | http://localhost:3001 |

---

## 🔑 Important Endpoints

```
GET  /products                  - All products
GET  /products/bicycles         - Bicycles only
POST /products/bicycles         - Add bicycle
GET  /cart?sessionId=xxx        - View cart
POST /cart                      - Add to cart
POST /orders                    - Place order
```

---

## ✨ Features Implemented

**Frontend:**
- ✅ Landing page (matches your design)
- ✅ Product categories
- ✅ Add to cart
- ✅ Shopping cart management
- ✅ Checkout form
- ✅ Order confirmation

**Backend:**
- ✅ CRUD for all products
- ✅ Cart management
- ✅ Order processing
- ✅ Stock validation
- ✅ Price validation

---

## 🐛 Troubleshooting

**Backend won't start:**
```powershell
# Check MySQL is running
# Create database: CREATE DATABASE activity9_db;
# Update backend/.env with correct credentials
```

**Frontend can't connect:**
```powershell
# Make sure backend is running on port 3001
# Check for CORS errors in browser console
```

**No products showing:**
```powershell
# Run the seeder: npm run seed
# Or add products via API
```

---

## 📚 Documentation

- `README.md` - Complete documentation
- `HOW_TO_RUN.md` - Running instructions
- `FEATURES.md` - All features list
- `QUICK_START.md` - Quick start guide
- `QUICK_REFERENCE.md` - This file

---

## 🎨 Design Colors

- **Primary:** #ff6b6b (Coral/Red)
- **Background:** #000000 (Black)
- **Text:** #ffffff (White)
- **Light:** #f5f5f5 (Gray)

---

## 📊 Default Configuration

```
Database: activity9_db
DB Host: localhost
DB Port: 3306
DB User: root
DB Pass: (empty)

Backend Port: 3001
Frontend Port: 3000
```

---

## 🎯 Testing Flow

1. Open http://localhost:3000
2. Click "Start Browse"
3. Browse products by category
4. Add items to cart
5. Click cart icon
6. Update quantities
7. Click "Proceed to Checkout"
8. Fill in form and submit
9. View order confirmation

---

## 💡 Tips

- Keep both terminals running (backend + frontend)
- Run seeder to add sample products
- Check MySQL for data verification
- Use browser DevTools for debugging
- Backend has auto-reload on file changes
- Frontend has hot-reload

---

## 🆘 Need More Help?

Check these files for detailed information:
1. `HOW_TO_RUN.md` - Step-by-step guide
2. `README.md` - Full documentation
3. `FEATURES.md` - Complete feature list

---

**Last Updated:** January 2026
**Version:** 1.0.0
