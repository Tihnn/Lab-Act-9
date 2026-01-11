import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API - Using localStorage
export const getAllProducts = () => {
  return new Promise((resolve) => {
    const products = JSON.parse(
      localStorage.getItem('bikeshop_products') || 
      '{"bicycles":[],"parts":[],"accessories":[],"clothing":[]}'
    );
    resolve({ data: products });
  });
};

export const getBicycles = () => {
  return new Promise((resolve) => {
    const products = JSON.parse(
      localStorage.getItem('bikeshop_products') || 
      '{"bicycles":[],"parts":[],"accessories":[],"clothing":[]}'
    );
    resolve({ data: products.bicycles });
  });
};

export const getParts = () => {
  return new Promise((resolve) => {
    const products = JSON.parse(
      localStorage.getItem('bikeshop_products') || 
      '{"bicycles":[],"parts":[],"accessories":[],"clothing":[]}'
    );
    resolve({ data: products.parts });
  });
};

export const getAccessories = () => {
  return new Promise((resolve) => {
    const products = JSON.parse(
      localStorage.getItem('bikeshop_products') || 
      '{"bicycles":[],"parts":[],"accessories":[],"clothing":[]}'
    );
    resolve({ data: products.accessories });
  });
};

export const getClothing = () => {
  return new Promise((resolve) => {
    const products = JSON.parse(
      localStorage.getItem('bikeshop_products') || 
      '{"bicycles":[],"parts":[],"accessories":[],"clothing":[]}'
    );
    resolve({ data: products.clothing });
  });
};

// Cart API - Using localStorage
export const getCart = (sessionId = 'default-session') => {
  return new Promise((resolve) => {
    const cart = JSON.parse(localStorage.getItem(`cart_${sessionId}`) || '[]');
    resolve({ data: cart });
  });
};

export const addToCart = (productType, productId, quantity, sessionId = 'default-session') => {
  return new Promise((resolve, reject) => {
    try {
      const cart = JSON.parse(localStorage.getItem(`cart_${sessionId}`) || '[]');
      
      // Get all products
      const allProducts = JSON.parse(
        localStorage.getItem('bikeshop_products') || 
        '{"bicycles":[],"parts":[],"accessories":[],"clothing":[]}'
      );
      
      // Find the product
      let product = null;
      const categoryMap = {
        'bicycle': 'bicycles',
        'part': 'parts',
        'accessory': 'accessories',
        'clothing': 'clothing'
      };
      
      const category = categoryMap[productType];
      if (category) {
        product = allProducts[category].find(p => p.id === productId);
      }
      
      if (!product) {
        reject({ response: { data: { message: 'Product not found' } } });
        return;
      }
      
      // Check if product already in cart
      const existingItemIndex = cart.findIndex(
        item => item.productId === productId && item.productType === productType
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity
        cart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.push({
          id: Date.now(),
          productType,
          productId,
          quantity,
          product
        });
      }
      
      localStorage.setItem(`cart_${sessionId}`, JSON.stringify(cart));
      resolve({ data: cart });
    } catch (error) {
      reject(error);
    }
  });
};

export const updateCartItem = (id, quantity) => {
  return new Promise((resolve, reject) => {
    try {
      const sessionId = 'default-session';
      const cart = JSON.parse(localStorage.getItem(`cart_${sessionId}`) || '[]');
      const itemIndex = cart.findIndex(item => item.id === id);
      
      if (itemIndex >= 0) {
        cart[itemIndex].quantity = quantity;
        localStorage.setItem(`cart_${sessionId}`, JSON.stringify(cart));
        resolve({ data: cart[itemIndex] });
      } else {
        reject({ response: { data: { message: 'Item not found' } } });
      }
    } catch (error) {
      reject(error);
    }
  });
};

export const removeFromCart = (id) => {
  return new Promise((resolve) => {
    const sessionId = 'default-session';
    const cart = JSON.parse(localStorage.getItem(`cart_${sessionId}`) || '[]');
    const updatedCart = cart.filter(item => item.id !== id);
    localStorage.setItem(`cart_${sessionId}`, JSON.stringify(updatedCart));
    resolve({ data: { message: 'Item removed' } });
  });
};

export const clearCart = (sessionId = 'default-session') => {
  return new Promise((resolve) => {
    localStorage.setItem(`cart_${sessionId}`, '[]');
    resolve({ data: { message: 'Cart cleared' } });
  });
};

// Orders API - Using localStorage
export const createOrder = (orderData) => {
  return new Promise((resolve) => {
    // Persist the order and decrement product stock in bikeshop_products
    const orders = JSON.parse(localStorage.getItem('bikeshop_orders') || '[]');

    // Load existing products
    const allProducts = JSON.parse(
      localStorage.getItem('bikeshop_products') ||
      '{"bicycles":[],"parts":[],"accessories":[],"clothing":[]}'
    );

    // If orderData contains items, decrement stock for each
    if (Array.isArray(orderData.items)) {
      const categoryMap = {
        'bicycle': 'bicycles',
        'part': 'parts',
        'accessory': 'accessories',
        'clothing': 'clothing'
      };

      orderData.items.forEach(item => {
        const category = categoryMap[item.productType];
        if (!category) return;
        const productIndex = allProducts[category].findIndex(p => p.id === item.productId);
        if (productIndex >= 0) {
          const existing = allProducts[category][productIndex];
          const currentStock = parseInt(existing.stock || 0, 10) || 0;
          const reduceBy = parseInt(item.quantity || 0, 10) || 0;
          // decrement and clamp to zero
          allProducts[category][productIndex].stock = Math.max(0, currentStock - reduceBy);
        }
      });

      // Save updated products back to localStorage so admin sees the change
      localStorage.setItem('bikeshop_products', JSON.stringify(allProducts));
    }

    const newOrder = {
      ...orderData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    localStorage.setItem('bikeshop_orders', JSON.stringify(orders));
    resolve({ data: newOrder });
  });
};

export const getOrderById = (id) => {
  return new Promise((resolve, reject) => {
    const orders = JSON.parse(localStorage.getItem('bikeshop_orders') || '[]');
    const order = orders.find(o => o.id === parseInt(id));
    if (order) {
      resolve({ data: order });
    } else {
      reject({ response: { data: { message: 'Order not found' } } });
    }
  });
};

export default api;
