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

// Cart API - Using database
export const getCart = async (userId) => {
  // Get current user if userId not provided
  if (!userId) {
    const userStr = localStorage.getItem('bikeshop_current_user_v1');
    if (userStr) {
      const user = JSON.parse(userStr);
      userId = user.id;
    } else {
      return { data: [] };
    }
  }
  
  try {
    const response = await api.get(`/api/cart/${userId}`);
    // Backend returns { success: true, data: [...] }
    return { data: response.data.data || [] };
  } catch (error) {
    console.error('Error fetching cart:', error);
    return { data: [] };
  }
};

export const addToCart = async (productType, productId, quantity) => {
  // Get current user
  const userStr = localStorage.getItem('bikeshop_current_user_v1');
  if (!userStr) {
    throw new Error('User not logged in');
  }
  
  const user = JSON.parse(userStr);
  
  try {
    const response = await api.post('/api/cart/add', {
      userId: user.id,
      productType,
      productId,
      quantity
    });
    // Backend returns { success: true, data: cartItem }
    return { data: response.data.data };
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (id, quantity) => {
  try {
    const response = await api.put(`/api/cart/${id}`, { quantity });
    // Backend returns { success: true, data: cartItem }
    return { data: response.data.data };
  } catch (error) {
    throw error;
  }
};

export const removeFromCart = async (id) => {
  try {
    const response = await api.delete(`/api/cart/${id}`);
    // Backend returns { success: true, data: result }
    return { data: response.data.data };
  } catch (error) {
    throw error;
  }
};

export const clearCart = async (userId) => {
  // Get current user if userId not provided
  if (!userId) {
    const userStr = localStorage.getItem('bikeshop_current_user_v1');
    if (userStr) {
      const user = JSON.parse(userStr);
      userId = user.id;
    }
  }
  
  try {
    const response = await api.delete(`/api/cart/clear/${userId}`);
    // Backend returns { success: true, data: result }
    return { data: response.data.data };
  } catch (error) {
    throw error;
  }
};

export const removeCartItems = async (cartItemIds) => {
  try {
    const response = await api.post('/api/cart/remove-items', { cartItemIds });
    // Backend returns { success: true, data: result }
    return { data: response.data.data };
  } catch (error) {
    throw error;
  }
};

// Orders API - Using database
export const createOrder = async (orderData) => {
  // Get current user
  const userStr = localStorage.getItem('bikeshop_current_user_v1');
  if (!userStr) {
    throw new Error('User not logged in');
  }
  
  const user = JSON.parse(userStr);
  
  try {
    const response = await api.post('/api/orders', {
      ...orderData,
      userId: user.id
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
