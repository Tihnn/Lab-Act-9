# 🎯 HOW TO RUN THE PROJECT

Follow these steps in order to run the BikeShop E-Commerce application.

## 📋 Prerequisites Checklist

- [ ] MySQL Server is installed and running
- [ ] Node.js (v14+) is installed
- [ ] All dependencies are installed (done ✅)

---

## 🚀 Step-by-Step Instructions

### STEP 1: Prepare the Database

1. **Open MySQL** (MySQL Workbench, phpMyAdmin, or MySQL CLI)

2. **Create the database:**
   ```sql
   CREATE DATABASE activity9_db;
   ```

3. **Verify the database was created:**
   ```sql
   SHOW DATABASES;
   ```

4. **Update credentials (if needed):**
   - Edit `backend/.env` file
   - Change DB_USERNAME and DB_PASSWORD if your MySQL has different credentials

---

### STEP 2: Start the Backend Server

1. **Open Terminal #1** in VS Code (Ctrl + `)

2. **Navigate to backend folder:**
   ```powershell
   cd "c:\Users\ADMIN\Desktop\LABACT 9\backend"
   ```

3. **Start the server:**
   ```powershell
   npm run start:dev
   ```

4. **Wait for this message:**
   ```
   🚀 Backend server is running on http://localhost:3001
   ```

5. **✅ IMPORTANT: Keep this terminal running!**

---

### STEP 3: Start the Frontend Application

1. **Open Terminal #2** in VS Code (Click the + icon to create new terminal)

2. **Navigate to frontend folder:**
   ```powershell
   cd "c:\Users\ADMIN\Desktop\LABACT 9\frontend"
   ```

3. **Start the React app:**
   ```powershell
   npm start
   ```

4. **The browser will automatically open to:**
   ```
   http://localhost:3000
   ```

5. **You should see the BikeShop landing page!**

6. **✅ IMPORTANT: Keep this terminal running too!**

---

### STEP 4: Add Sample Products (Optional but Recommended)

1. **Open Terminal #3** (new terminal)

2. **Make sure backend is running** (from Step 2)

3. **Run the seeder script:**
   ```powershell
   cd "c:\Users\ADMIN\Desktop\LABACT 9"
   npm run seed
   ```

4. **You should see:**
   ```
   🌱 Starting database seeding...
   📦 Adding bicycles...
     ✅ Added: Mountain Bike Pro
     ✅ Added: Road Racer Elite
     ✅ Added: City Cruiser
   ...
   ✨ Database seeding completed!
   ```

5. **Now refresh the products page to see the items!**

---

## 🎮 Testing the Application

### 1. Landing Page
- **URL:** http://localhost:3000
- **Test:** Click the "Start Browse" button
- **Expected:** Navigate to products page

### 2. Products Page
- **URL:** http://localhost:3000/products
- **Test:** 
  - Browse products
  - Filter by category (Bicycles, Parts, Accessories, Clothing)
  - Click "Add to Cart" on any product
- **Expected:** See success message and cart count increase

### 3. Shopping Cart
- **Test:** Click the cart icon (🛒) in navigation
- **Expected:** See cart items
- **Actions:**
  - Update quantities with +/- buttons
  - Remove items
  - Click "Proceed to Checkout"

### 4. Checkout
- **Test:** Fill in the form with:
  - Full Name: John Doe
  - Email: john@example.com
  - Phone: +1 234 567 8900
  - Address: 123 Main St, City, State, ZIP
- **Click:** "Place Order"
- **Expected:** Navigate to order confirmation

### 5. Order Confirmation
- **Expected:** See order details, order number, and success message
- **Actions:**
  - Click "Continue Shopping" → back to products
  - Click "Return to Home" → back to landing page

---

## 🛠️ Troubleshooting Guide

### Problem: Backend won't start
**Error:** "Cannot connect to MySQL"
**Solution:**
1. Check if MySQL is running
2. Verify database `activity9_db` exists
3. Check credentials in `backend/.env`

### Problem: Frontend can't connect to backend
**Error:** "Network Error" or "CORS error"
**Solution:**
1. Make sure backend is running on port 3001
2. Check backend terminal for errors
3. Restart both servers

### Problem: Seeder fails
**Error:** "ECONNREFUSED" or "Cannot POST"
**Solution:**
1. Make sure backend is running first
2. Wait for backend to fully start
3. Try running seed script again

### Problem: Port already in use
**Error:** "Port 3000/3001 is already in use"
**Solution:**
- **For backend:** Change PORT in `backend/.env`
- **For frontend:** Type 'y' when prompted to use different port

### Problem: Products not showing
**Solution:**
1. Check if seeder ran successfully
2. Open MySQL and check if tables have data:
   ```sql
   USE activity9_db;
   SELECT * FROM bicycles;
   ```
3. Check backend terminal for errors

---

## 📊 Database Structure

After running the backend, these tables are auto-created:

- `bicycles` - Bicycle products
- `parts` - Bicycle parts
- `accessories` - Accessories
- `clothing` - Cycling apparel
- `cart_items` - Shopping cart items
- `orders` - Customer orders
- `order_items` - Order line items

To view in MySQL:
```sql
USE activity9_db;
SHOW TABLES;
```

---

## 🔌 API Testing (Optional)

You can test the API directly using:

### Get all products:
```
GET http://localhost:3001/products
```

### Get bicycles:
```
GET http://localhost:3001/products/bicycles
```

### Add to cart:
```
POST http://localhost:3001/cart
Body: {
  "productType": "bicycle",
  "productId": 1,
  "quantity": 1,
  "sessionId": "test-session"
}
```

---

## 📝 Summary

**Three terminals running:**
1. ✅ Backend (port 3001)
2. ✅ Frontend (port 3000)
3. ⚪ Seeder (run once, then close)

**URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/products

---

## 🎉 You're All Set!

The application should now be fully functional. Enjoy testing your BikeShop E-Commerce system!

**Navigation flow:**
```
Landing Page (/)
    ↓ [Start Browse]
Products Page (/products)
    ↓ [Add to Cart]
Cart Page (/cart)
    ↓ [Proceed to Checkout]
Checkout Page (/checkout)
    ↓ [Place Order]
Order Confirmation (/order-confirmation/:id)
```

---

**Questions or Issues?** Check the main README.md for more details!
