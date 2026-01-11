# 🚀 Quick Start Guide - BikeShop E-Commerce

## Prerequisites
- Node.js (v14 or higher)
- MySQL Server running
- npm or yarn package manager

## Step-by-Step Setup

### 1️⃣ Database Setup (Required First!)

Make sure MySQL is running, then create the database:

```sql
CREATE DATABASE activity9_db;
```

**Important**: Update `backend/.env` if your MySQL credentials are different:
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=YOUR_PASSWORD_HERE
DB_DATABASE=activity9_db
PORT=3001
```

### 2️⃣ Start Backend Server

Open a terminal in VS Code:

```powershell
cd "c:\Users\ADMIN\Desktop\LABACT 9\backend"
npm run start:dev
```

✅ Wait until you see: "Backend server is running on http://localhost:3001"
✅ Tables will be auto-created in the database

### 3️⃣ Start Frontend Application

Open a NEW terminal (don't close the backend terminal):

```powershell
cd "c:\Users\ADMIN\Desktop\LABACT 9\frontend"
npm start
```

✅ Browser will automatically open to http://localhost:3000
✅ You should see the BikeShop landing page

### 4️⃣ Add Sample Products (Optional)

You can add products in two ways:

**Option A: Using the API directly**
- Use Postman or similar tool
- Import data from `sample-data.js`
- POST to: http://localhost:3001/products/bicycles (etc.)

**Option B: Create a simple seeding script**
The backend will accept POST requests to create products.

## 🎯 Testing the Application

1. **Landing Page**: http://localhost:3000
   - Click "Start Browse" button

2. **Products Page**: http://localhost:3000/products
   - Browse products by category
   - Add items to cart

3. **Cart Page**: Click cart icon
   - Update quantities
   - Remove items
   - Proceed to checkout

4. **Checkout**: Fill in shipping information
   - Place order
   - View confirmation

## 📡 API Endpoints

Backend API runs on: http://localhost:3001

- GET /products - All products
- GET /products/bicycles - Bicycles only
- POST /products/bicycles - Create bicycle
- GET /cart?sessionId=default-session - View cart
- POST /cart - Add to cart
- POST /orders - Create order

## 🛠️ Development Commands

**Backend:**
```powershell
npm run start:dev    # Development mode with hot reload
npm run build        # Build for production
npm run start:prod   # Run production build
```

**Frontend:**
```powershell
npm start           # Development server
npm run build       # Build for production
npm test            # Run tests
```

## ❗ Troubleshooting

**Backend won't start:**
- Check if MySQL is running
- Verify database `activity9_db` exists
- Check `.env` file credentials

**Frontend won't connect to backend:**
- Make sure backend is running on port 3001
- Check browser console for errors
- Verify CORS is enabled in backend

**Port already in use:**
- Backend: Change PORT in `.env` file
- Frontend: Change port when prompted or set PORT=3002 in environment

## 📁 Project Structure

```
LABACT 9/
├── backend/
│   ├── src/
│   │   ├── controllers/    # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── entities/       # Database models
│   │   └── dto/           # Request/response schemas
│   └── .env               # Configuration
│
├── frontend/
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── services/      # API calls
│   │   └── App.js         # Main app
│   └── public/
│
└── README.md              # Full documentation
```

## 🎨 Features Implemented

✅ Beautiful landing page with hero section
✅ Product catalog with categories
✅ Shopping cart with quantity management
✅ Checkout process with form validation
✅ Order confirmation page
✅ Stock validation and management
✅ Responsive design
✅ MySQL database integration
✅ RESTful API with NestJS
✅ TypeScript backend

## 📝 Notes

- The database tables are created automatically via TypeORM
- Session IDs are used for guest checkout
- Stock is validated on add-to-cart and checkout
- All prices stored with 2 decimal precision

## 🆘 Need Help?

Check the main README.md for detailed documentation and API reference.

---

**Happy Coding! 🚴‍♂️**
