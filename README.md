<<<<<<< HEAD
# Lab-Act-9
=======
# BikeShop E-Commerce System

A complete e-commerce system for bicycle shop with products, shopping cart, and orders functionality.

## Tech Stack

- **Frontend**: ReactJS
- **Backend**: Node.js + NestJS + TypeScript
- **Database**: MySQL (activity9_db)

## Project Structure

```
LABACT 9/
├── backend/          # NestJS API server
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── services/       # Business logic
│   │   ├── entities/       # Database entities
│   │   ├── dto/           # Data transfer objects
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env
│   └── package.json
│
└── frontend/         # React application
    ├── src/
    │   ├── pages/          # Page components
    │   ├── services/       # API services
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Database Tables

The system automatically creates the following tables:
- **bicycles** - Bicycle products with specifications
- **parts** - Bicycle parts and components
- **accessories** - Bicycle accessories
- **clothing** - Cycling apparel
- **cart_items** - Shopping cart items
- **orders** - Customer orders
- **order_items** - Order line items

## Features

### Backend API
- ✅ CRUD operations for all product categories
- ✅ Shopping cart management
- ✅ Order processing with stock validation
- ✅ Automatic stock updates on order placement
- ✅ Price and stock validation

### Frontend UI
- ✅ Landing page with hero section
- ✅ Products page with category filtering
- ✅ Add to cart functionality
- ✅ Shopping cart page
- ✅ Checkout process
- ✅ Order confirmation page

## Setup Instructions

### 1. Database Setup

Make sure you have MySQL installed and running. Create the database:

```sql
CREATE DATABASE activity9_db;
```

Update the `.env` file in the backend folder if needed:
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=activity9_db
PORT=3001
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run start:dev
```

The backend server will run on http://localhost:3001

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

The frontend application will run on http://localhost:3000

## API Endpoints

### Products
- `GET /products` - Get all products
- `GET /products/bicycles` - Get all bicycles
- `GET /products/parts` - Get all parts
- `GET /products/accessories` - Get all accessories
- `GET /products/clothing` - Get all clothing
- `POST /products/bicycles` - Create bicycle
- `PUT /products/bicycles/:id` - Update bicycle
- `DELETE /products/bicycles/:id` - Delete bicycle

### Cart
- `GET /cart?sessionId=` - Get cart items
- `POST /cart` - Add item to cart
- `PUT /cart/:id` - Update cart item quantity
- `DELETE /cart/:id` - Remove item from cart
- `DELETE /cart?sessionId=` - Clear cart

### Orders
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create new order
- `PUT /orders/:id/status` - Update order status

## Usage

1. **Browse Products**: Click "Start Browse" on the landing page
2. **Add to Cart**: Select products and click "Add to Cart"
3. **View Cart**: Click the cart icon in the navigation
4. **Checkout**: Proceed to checkout and fill in shipping information
5. **Place Order**: Submit the order and view confirmation

## Sample Data

To add sample products, you can use the following API calls (via Postman or similar):

```json
POST http://localhost:3001/products/bicycles
{
  "name": "Mountain Bike Pro",
  "description": "Professional mountain bike for tough terrains",
  "price": 1299.99,
  "brand": "Trek",
  "type": "Mountain",
  "frameSize": "Large",
  "color": "Blue",
  "stock": 10,
  "imageUrl": "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400"
}
```

## Development

- Backend runs in watch mode: Changes auto-reload
- Frontend runs with hot reload: Changes reflect immediately

## Notes

- The database tables are auto-created using TypeORM synchronize feature
- Cart uses session IDs for guest checkout
- Stock is validated on both add-to-cart and checkout
- Orders automatically reduce product stock

## License

MIT
>>>>>>> d874444 (FRONTEND)
