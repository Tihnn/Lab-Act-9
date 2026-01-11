import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart } from '../services/api';
import './CartPage.css';
import Toast from '../components/Toast';

function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastTitle, setToastTitle] = useState('');
  const [toastSubtitle, setToastSubtitle] = useState('');
  const [toastIcon, setToastIcon] = useState(null);
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await getCart();
      setCartItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading cart:', error);
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, newQuantity);
      loadCart();
      // show a quick confirmation
      setToastType('success');
      setToastIcon('check');
      setToastTitle('Cart updated');
      setToastSubtitle('Your cart has been updated');
    } catch (error) {
      console.error('Error updating cart:', error);
      setToastType('error');
      setToastIcon('error');
      setToastTitle('Failed to update quantity');
      setToastSubtitle('Please try again');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      loadCart();
      setToastType('success');
      setToastIcon('check');
      setToastTitle('Item removed');
      setToastSubtitle('Item has been removed from your cart');
    } catch (error) {
      console.error('Error removing item:', error);
      setToastType('error');
      setToastIcon('error');
      setToastTitle('Failed to remove item');
      setToastSubtitle('Please try again');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      return total + (parseFloat(price) * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setToastType('error');
      setToastIcon('error');
      setToastTitle('Your cart is empty');
      setToastSubtitle('Add items to proceed to checkout');
      return;
    }
    navigate('/checkout');
  };

  const handleLogout = () => {
    localStorage.removeItem('bikeshop_current_user_v1');
    navigate('/login');
  };

  const getUserInfo = () => {
    const userStr = localStorage.getItem('bikeshop_current_user_v1');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  };

  const user = getUserInfo();
  const isAdmin = user?.isAdmin || false;
  const userInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';

  if (loading) {
    return <div className="cart-page"><div className="loading">Loading cart...</div></div>;
  }

  return (
    <div className="cart-page">
      {/* Navigation */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo" onClick={() => navigate('/')}>
            PedalHub
            {user && (
              <span className="logo-suffix"> / {isAdmin ? 'Admin' : (user.email || 'User')}</span>
            )}
          </div>
          <nav className="nav-links">
            <button onClick={() => navigate('/')}>HOME</button>
            <button onClick={() => navigate('/products')}>CONTINUE SHOPPING</button>
          </nav>
          <div className="nav-actions">
            <button className="account-button" onClick={() => navigate('/profile', { state: { edit: true } })}>
              <span className="account-text">My Account</span>
            </button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Cart Content */}
      <main className="cart-container">
        <h1 className="page-title">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button className="continue-shopping-btn" onClick={() => navigate('/products')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map(item => {
                const product = item.product || {};
                const productName = product.name || item.productName || 'Unknown Product';
                const productImage = product.image || item.image || 'https://via.placeholder.com/100';
                const productPrice = product.price || item.price || 0;
                const productType = item.productType || 'Product';
                
                return (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <img src={productImage} alt={productName} />
                    </div>
                    <div className="item-info">
                      <h3>{productName}</h3>
                      <p className="item-type">{productType}</p>
                      <p className="unit-price">₱{parseFloat(productPrice).toFixed(2)} each</p>
                    </div>
                    <div className="item-quantity">
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <div className="item-price">
                      <span className="price-label">Total:</span>
                      <span className="price-value">₱{(parseFloat(productPrice) * item.quantity).toFixed(2)}</span>
                    </div>
                    <button className="remove-btn" onClick={() => handleRemoveItem(item.id)}>
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₱{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₱{calculateTotal().toFixed(2)}</span>
              </div>
              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>
      <Toast
        title={toastTitle}
        subtitle={toastSubtitle}
        icon={toastIcon}
        type={toastType}
        onClose={() => { setToastTitle(''); setToastSubtitle(''); setToastIcon(null); }}
      />
    </div>
  );
}

export default CartPage;
