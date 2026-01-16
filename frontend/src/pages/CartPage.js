import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../services/api';
import NotificationPanel from '../components/NotificationPanel';
import './CartPage.css';
import Toast from '../components/Toast';

function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toastTitle, setToastTitle] = useState('');
  const [toastSubtitle, setToastSubtitle] = useState('');
  const [toastIcon, setToastIcon] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountDropdownOpen && !event.target.closest('.account-dropdown')) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [accountDropdownOpen]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await getCart();
      // Ensure cartItems is always an array
      const items = response.data || [];
      setCartItems(Array.isArray(items) ? items : []);
      setCartCount(items.length);
      setLoading(false);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
      setCartCount(0);
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, newQuantity);
      loadCart();
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

  const handleDeleteAllCart = async () => {
    if (cartItems.length === 0) return;
    
    if (!window.confirm('Are you sure you want to delete all items from your cart?')) {
      return;
    }

    try {
      await clearCart();
      loadCart();
      setSelectedItems([]);
      setToastType('success');
      setToastIcon('check');
      setToastTitle('Cart cleared');
      setToastSubtitle('All items have been removed from your cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
      setToastType('error');
      setToastIcon('error');
      setToastTitle('Failed to clear cart');
      setToastSubtitle('Please try again');
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  const calculateTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => {
        const price = item.price || 0;
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
    if (selectedItems.length === 0) {
      setToastType('error');
      setToastIcon('error');
      setToastTitle('No items selected');
      setToastSubtitle('Please select items to checkout');
      return;
    }
    // Store selected items for checkout
    const itemsToCheckout = cartItems.filter(item => selectedItems.includes(item.id));
    localStorage.setItem('checkout_items', JSON.stringify(itemsToCheckout));
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

  if (loading) {
    return <div className="cart-page"><div className="loading">Loading cart...</div></div>;
  }

  return (
    <div className="cart-page">
      {/* Navigation */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo" onClick={() => navigate('/home')}>
            PedalHub
            {user && (
              <span className="logo-suffix"> / {isAdmin ? 'Admin' : (user.email || 'User')}</span>
            )}
          </div>
          <nav className="nav-links">
            <button onClick={() => navigate('/home')}>HOME</button>
            <button onClick={() => navigate('/products')}>CONTINUE SHOPPING</button>
          </nav>
          <div className="nav-actions">
            <div className="cart-icon" onClick={() => navigate('/cart')}>
              🛒
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </div>
            <NotificationPanel userId={user?.id} userType="user" />
            <div className="account-dropdown">
              <button 
                className="account-button" 
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              >
                <span className="account-text">My Account</span>
                <span className={`caret ${accountDropdownOpen ? 'open' : ''}`}>▾</span>
              </button>
              {accountDropdownOpen && (
                <ul className="account-dropdown-menu">
                  <li onClick={() => { navigate('/profile', { state: { edit: true } }); setAccountDropdownOpen(false); }}>
                    Profile
                  </li>
                  <li onClick={() => { navigate('/my-purchase'); setAccountDropdownOpen(false); }}>
                    My Purchase
                  </li>
                </ul>
              )}
            </div>
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
              <div className="select-all-container">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                  onChange={handleSelectAll}
                  className="cart-checkbox"
                />
                <label htmlFor="select-all" className="select-all-label">
                  Select All ({selectedItems.length} of {cartItems.length} selected)
                </label>
                <button 
                  className="delete-all-btn" 
                  onClick={handleDeleteAllCart}
                  disabled={selectedItems.length !== cartItems.length || cartItems.length === 0}
                >
                  Delete All
                </button>
              </div>
              {cartItems.map(item => {
                const productName = item.productName || 'Unknown Product';
                const productImage = item.imageUrl || 'https://via.placeholder.com/100';
                const productPrice = item.price || 0;
                const productType = item.productType || 'Product';
                
                return (
                  <div key={item.id} className="cart-item">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="cart-checkbox"
                    />
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
