# PedalHub Backend API

NestJS + TypeScript + MySQL Backend for PedalHub Bike Shop

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Database
Edit the `.env` file with your MySQL credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=activity9_db
PORT=3001
```

### 3. Start the Backend Server
```bash
npm run start:dev
```

The backend will run on http://localhost:3001

## Database Tables

The backend will automatically create these tables in your `activity9_db` database:

- **users** - User accounts (email, password, name, address, etc.)
- **bicycles** - Bicycle products
- **parts** - Bike parts products
- **accessories** - Bike accessories
- **clothing** - Cycling clothing
- **cart_items** - Shopping cart items
- **orders** - Customer orders
- **order_items** - Items in each order

## API Endpoints

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile

### Products
- `GET /api/products` - Get all products
- `POST /api/products/:type` - Create product (type: bicycle, part, accessory, clothing)
- `PUT /api/products/:type/:id` - Update product
- `DELETE /api/products/:type/:id` - Delete product
- `GET /api/products/:type/:id` - Get product by ID

### Cart
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart/:userId` - Get user's cart
- `PUT /api/cart/:cartItemId` - Update cart item quantity
- `DELETE /api/cart/:cartItemId` - Remove item from cart
- `DELETE /api/cart/clear/:userId` - Clear user's cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/user/:userId` - Get user's orders
- `GET /api/orders/:orderId` - Get order by ID
- `PUT /api/orders/:orderId/status` - Update order status

## Features

✅ TypeScript
✅ NestJS Framework
✅ TypeORM for database management
✅ MySQL Database
✅ Auto-create database tables
✅ Password hashing with bcrypt
✅ CORS enabled for frontend
✅ Input validation
✅ Error handling
