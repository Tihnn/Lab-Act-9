import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, removeCartItems } from '../services/api';
import NotificationPanel from '../components/NotificationPanel';
import './CheckoutPage.css';

function CheckoutPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    postalCode: '',
    paymentMethod: '',
  });

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Ensure it starts with 63
    let phoneDigits = digits;
    if (!phoneDigits.startsWith('63')) {
      phoneDigits = '63' + phoneDigits;
    }
    
    // Format as 63+ xxx-xxx-xxxx
    if (phoneDigits.length <= 2) {
      return phoneDigits;
    } else if (phoneDigits.length <= 5) {
      return `${phoneDigits.slice(0, 2)}+ ${phoneDigits.slice(2)}`;
    } else if (phoneDigits.length <= 8) {
      return `${phoneDigits.slice(0, 2)}+ ${phoneDigits.slice(2, 5)}-${phoneDigits.slice(5)}`;
    } else {
      return `${phoneDigits.slice(0, 2)}+ ${phoneDigits.slice(2, 5)}-${phoneDigits.slice(5, 8)}-${phoneDigits.slice(8, 12)}`;
    }
  };

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
    // Auto-fill form with user data
    const userStr = localStorage.getItem('bikeshop_current_user_v1');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setFormData({
          customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          customerEmail: user.email || '',
          customerPhone: user.phone ? formatPhoneNumber(user.phone) : '',
          shippingAddress: user.address || '',
          postalCode: user.postalCode || '',
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCart = async () => {
    try {
      // Get selected items from localStorage (set by CartPage)
      const checkoutItems = localStorage.getItem('checkout_items');
      if (checkoutItems) {
        const items = JSON.parse(checkoutItems);
        setCartItems(items);
      } else {
        // Fallback: if no selected items, redirect to cart
        navigate('/cart');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading cart:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'customerPhone' ? formatPhoneNumber(value) : value;
    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!formData.paymentMethod) {
      alert('Please select a payment method before placing your order.');
      return;
    }

    setSubmitting(true);
    
    try {
      const total = calculateTotal();
      const orderData = {
        ...formData,
        totalAmount: total,
        items: cartItems.map(item => ({
          productType: item.productType,
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        })),
      };

      const response = await createOrder(orderData);
      
      // Remove only the ordered items from the cart
      const cartItemIds = cartItems.map(item => item.id);
      await removeCartItems(cartItemIds);
      
      // Clear selected items from localStorage
      localStorage.removeItem('checkout_items');
      navigate(`/order-confirmation/${response.data.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || 'Failed to create order. Please try again.');
      setSubmitting(false);
    }
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
    return <div className="checkout-page"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="checkout-page">
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

      {/* Checkout Content */}
      <main className="checkout-container">
        <h1 className="page-title">Checkout</h1>

        <div className="checkout-content">
          {/* Checkout Form */}
          <div className="checkout-form-section">
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="section-header">
                <h2>Shipping Information</h2>
                <button
                  type="button"
                  className="edit-shipping-btn"
                  onClick={() => setIsEditingShipping(!isEditingShipping)}
                >
                  {isEditingShipping ? 'Cancel Edit' : 'Edit Info'}
                </button>
              </div>
              
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                  disabled={!isEditingShipping}
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  required
                  placeholder="john@example.com"
                  disabled={!isEditingShipping}
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  required
                  placeholder="63+ xxx-xxx-xxxx"
                  disabled={!isEditingShipping}
                />
              </div>

              <div className="form-group">
                <label>Shipping Address *</label>
                <textarea
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder="123 Main St, City, State"
                  disabled={!isEditingShipping}
                />
              </div>

              <div className="form-group">
                <label>Postal Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                  placeholder="12345"
                  disabled={!isEditingShipping}
                />
              </div>

              <div className="payment-method-section">
                <h2>Payment Method</h2>
                <p className="payment-subtitle">Select your preferred payment method *</p>
                
                <div className="payment-options">
                  <label className={`payment-option ${formData.paymentMethod === 'ewallet' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ewallet"
                      checked={formData.paymentMethod === 'ewallet'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-content">
                      <span className="payment-icon">{'\uD83D\uDCF1'}</span>
                      <div className="payment-info">
                        <span className="payment-title">Payment Center / E-Wallet</span>
                        <span className="payment-desc">Pay via GCash, PayMaya, or other e-wallets</span>
                      </div>
                    </div>
                  </label>

                  <label className={`payment-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-content">
                      <span className="payment-icon">💳</span>
                      <div className="payment-info">
                        <span className="payment-title">Credit / Debit Card</span>
                        <span className="payment-desc">Pay securely with your card</span>
                      </div>
                    </div>
                  </label>

                  <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-content">
                      <span className="payment-icon">💵</span>
                      <div className="payment-info">
                        <span className="payment-title">Cash on Delivery</span>
                        <span className="payment-desc">Pay when you receive your order</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" className="submit-order-btn" disabled={submitting}>
                {submitting ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <div className="order-summary">
              <h2>Order Summary</h2>
              
              <div className="order-items">
                {cartItems.map(item => (
                  <div key={item.id} className="order-item">
                    <div className="order-item-info">
                      <h4>{item.productName}</h4>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <div className="order-item-price">
                      ₱{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₱{calculateTotal().toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="summary-row">
                  <span>Tax:</span>
                  <span>₱0.00</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₱{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CheckoutPage;
