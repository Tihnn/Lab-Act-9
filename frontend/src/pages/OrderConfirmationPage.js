import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrderById } from '../services/api';
import './OrderConfirmationPage.css';

function OrderConfirmationPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

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

  if (loading) {
    return <div className="confirmation-page"><div className="loading">Loading order details...</div></div>;
  }

  if (!order) {
    return (
      <div className="confirmation-page">
        <div className="error-message">
          <h2>Order not found</h2>
          <button onClick={() => navigate('/')}>Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      {/* Navigation */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo" onClick={() => navigate('/')}>PedalHub</div>
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

        <div className="action-buttons">
          <button className="primary-btn" onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
          <button className="secondary-btn" onClick={() => navigate('/')}>
            Return to Home
          </button>
        </div>
      </main>
    </div>
  );
}

export default OrderConfirmationPage;
