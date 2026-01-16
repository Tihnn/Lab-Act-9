import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getOrderById } from '../services/api';
import NotificationPanel from '../components/NotificationPanel';
import './OrderConfirmationPage.css';

function OrderConfirmationPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

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
    loadOrder();
    updateCartCount();
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOrder = async () => {
    try {
      const response = await getOrderById(orderId);
      setOrder(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading order:', error);
      setLoading(false);
    }
  };

  const updateCartCount = async () => {
    try {
      const userStr = localStorage.getItem('bikeshop_current_user_v1');
      if (!userStr) {
        setCartCount(0);
        return;
      }
      const user = JSON.parse(userStr);
      const response = await axios.get(`http://localhost:3001/api/cart/${user.id}`);
      const items = response.data.data || [];
      setCartCount(items.length);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };

  if (loading) {
    return <div className="confirmation-page"><div className="loading">Loading order details...</div></div>;
  }

  if (!order) {
    return (
      <div className="confirmation-page">
        <div className="error-message">
          <h2>Order not found</h2>
          <button onClick={() => navigate('/home')}>Return to Home</button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="confirmation-page">
      {/* Navigation */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo" onClick={() => navigate('/home')}>
            PedalHub
            {(() => {
              const userStr = localStorage.getItem('bikeshop_current_user_v1');
              try {
                const u = userStr ? JSON.parse(userStr) : null;
                return u ? <span className="logo-suffix"> / {u.isAdmin ? 'Admin' : (u.email || 'User')}</span> : null;
              } catch {
                return null;
              }
            })()}
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
            <button className="logout-btn" onClick={() => { localStorage.removeItem('bikeshop_current_user_v1'); navigate('/login'); }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Confirmation Content */}
      <main className="confirmation-container">
        <div className="success-icon">✓</div>
        <h1 className="success-title">Order Confirmed!</h1>
        <p className="success-message">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        <div className="order-details">
          <div className="order-info-section">
            <h2>Order Information</h2>
            <div className="info-row">
              <span className="info-label">Order Number:</span>
              <span className="info-value">#{order.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Order Date:</span>
              <span className="info-value">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className="status-badge">{order.status}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Total Amount:</span>
              <span className="info-value total-amount">₱{parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          <div className="customer-info-section">
            <h2>Shipping Information</h2>
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{order.customerName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{order.customerEmail}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone:</span>
              <span className="info-value">{order.customerPhone}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Address:</span>
              <span className="info-value">{order.shippingAddress}</span>
            </div>
          </div>

          <div className="items-section">
            <h2>Order Items</h2>
            <div className="order-items-list">
              {order.items.map(item => (
                <div key={item.id} className="order-item">
                  <div className="item-details">
                    <h4>{item.productName}</h4>
                    <p className="item-type">{item.productType}</p>
                    <p className="item-quantity">Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ₱{(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrderConfirmationPage;
