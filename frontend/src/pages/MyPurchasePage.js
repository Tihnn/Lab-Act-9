import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationPanel from '../components/NotificationPanel';
import './MyPurchasePage.css';

function MyPurchasePage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
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
    const userStr = localStorage.getItem('bikeshop_current_user_v1');
    if (!userStr) {
      navigate('/login');
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.isAdmin) {
        navigate('/admin/dashboard');
        return;
      }
    } catch {
      navigate('/login');
      return;
    }

    loadOrders();
    updateCartCount();
  }, [navigate]);

  useEffect(() => {
    filterOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, orders]);

  const loadOrders = async () => {
    try {
      const userStr = localStorage.getItem('bikeshop_current_user_v1');
      const user = JSON.parse(userStr);
      const response = await axios.get(`http://localhost:3001/api/orders/user/${user.id}`);
      const userOrders = response.data.data || [];
      setOrders(userOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
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

  const filterOrders = () => {
    if (selectedTab === 'all') {
      // Show orders from all statuses: pending, ship, delivered, cancelled
      setFilteredOrders(orders.filter(order => 
        ['pending', 'ship', 'delivered', 'cancelled'].includes(order.status)
      ));
    } else if (selectedTab === 'pending') {
      setFilteredOrders(orders.filter(order => 
        order.status === 'pending'
      ));
    } else if (selectedTab === 'to-ship') {
      setFilteredOrders(orders.filter(order => 
        order.status === 'ship'
      ));
    } else if (selectedTab === 'completed') {
      setFilteredOrders(orders.filter(order => 
        order.status === 'delivered'
      ));
    } else if (selectedTab === 'cancelled') {
      setFilteredOrders(orders.filter(order => order.status === 'cancelled'));
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'status-pending' },
      ship: { label: 'To Ship', className: 'status-shipped' },
      processing: { label: 'Processing', className: 'status-processing' },
      shipped: { label: 'Shipped', className: 'status-shipped' },
      delivered: { label: 'Delivered', className: 'status-delivered' },
      cancelled: { label: 'Cancelled', className: 'status-cancelled' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.className}`}>{config.label}</span>;
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleOrderReceived = async (orderId) => {
    try {
      await axios.put(`http://localhost:3001/api/orders/${orderId}/status`, {
        status: 'delivered'
      });
      // Reload orders to reflect the change
      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to mark order as received');
    }
  };

  const handleCancelOrder = async (orderId) => {
    setCancelOrderId(orderId);
    setShowCancelModal(true);
  };

  const submitCancellationRequest = async () => {
    if (!cancellationReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }
    try {
      await axios.put(`http://localhost:3001/api/orders/${cancelOrderId}/request-cancellation`, {
        reason: cancellationReason
      });
      // Reload orders to reflect the change
      await loadOrders();
      setShowCancelModal(false);
      setCancellationReason('');
      setCancelOrderId(null);
      alert('Cancellation request submitted successfully. Admin will review your request.');
    } catch (error) {
      console.error('Error requesting cancellation:', error);
      alert('Failed to request cancellation');
    }
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancellationReason('');
    setCancelOrderId(null);
  };

  if (loading) {
    return (
      <div className="my-purchase-page">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="my-purchase-page">
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo" onClick={() => navigate('/home')}>
            PedalHub
            {user && (
              <span className="logo-suffix"> / {user.email || 'User'}</span>
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
                  <li className="active" onClick={() => { navigate('/my-purchase'); setAccountDropdownOpen(false); }}>
                    My Purchase
                  </li>
                </ul>
              )}
            </div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="purchase-container">
        <h1 className="purchase-title">My Purchase</h1>

        <div className="tabs-container">
          <button 
            className={`tab ${selectedTab === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTab('all')}
          >
            All
          </button>
          <button 
            className={`tab ${selectedTab === 'pending' ? 'active' : ''}`}
            onClick={() => setSelectedTab('pending')}
          >
            Pending
          </button>
          <button 
            className={`tab ${selectedTab === 'to-ship' ? 'active' : ''}`}
            onClick={() => setSelectedTab('to-ship')}
          >
            To Ship
          </button>
          <button 
            className={`tab ${selectedTab === 'completed' ? 'active' : ''}`}
            onClick={() => setSelectedTab('completed')}
          >
            Completed
          </button>
          <button 
            className={`tab ${selectedTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setSelectedTab('cancelled')}
          >
            Cancelled
          </button>
        </div>

        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 7h-4V5l-2-2h-4L8 5v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z"/>
              </svg>
              <p>No orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-id">Order #{order.id}</div>
                  <div className="order-date">{formatDate(order.createdAt)}</div>
                </div>
                <div className="order-body">
                  <div className="order-items">
                    {order.items && order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-info">
                          <div className="item-name">{item.productName}</div>
                          <div className="item-qty">Qty: {item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-footer">
                    <div className="order-info-row">
                      {(selectedTab === 'to-ship' || (selectedTab === 'all' && order.status === 'ship')) && (
                        <button 
                          className="btn-order-received"
                          onClick={() => handleOrderReceived(order.id)}
                        >
                          Order Received
                        </button>
                      )}
                      {selectedTab === 'pending' && (
                        <button 
                          className="btn-cancel-order"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          Cancel Order
                        </button>
                      )}
                      {selectedTab !== 'to-ship' && selectedTab !== 'pending' && !(selectedTab === 'all' && order.status === 'ship') && getStatusBadge(order.status)}
                      <div className="order-total">₱{(parseFloat(order.totalAmount) || 0).toFixed(2)}</div>
                    </div>
                    <div className="order-actions">
                      <button className="btn-view-details" onClick={() => handleViewOrder(order)}>
                        View Details
                      </button>
                      {order.status === 'cancelled' && (
                        <button className="btn-reorder" onClick={() => {
                          localStorage.setItem('checkout_items', JSON.stringify(order.items.map(item => ({
                            id: item.id || Date.now(),
                            productId: item.productId,
                            productName: item.productName,
                            productType: item.productType,
                            price: item.price,
                            quantity: item.quantity,
                            imageUrl: item.imageUrl
                          }))));
                          navigate('/checkout');
                        }}>
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="order-info-section">
                <div className="info-row">
                  <span className="label">Order ID:</span>
                  <span className="value">#{selectedOrder.id}</span>
                </div>
                <div className="info-row">
                  <span className="label">Status:</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="info-row">
                  <span className="label">Date:</span>
                  <span className="value">{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Payment Method:</span>
                  <span className="value">{selectedOrder.paymentMethod || 'Cash on Delivery'}</span>
                </div>
              </div>

              <div className="customer-info-section">
                <h3>Shipping Information</h3>
                <div className="info-row">
                  <span className="label">Name:</span>
                  <span className="value">{selectedOrder.customerName}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{selectedOrder.customerEmail}</span>
                </div>
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <span className="value">{selectedOrder.customerPhone}</span>
                </div>
                <div className="info-row">
                  <span className="label">Address:</span>
                  <span className="value">{selectedOrder.shippingAddress}</span>
                </div>
                <div className="info-row">
                  <span className="label">Postal Code:</span>
                  <span className="value">{selectedOrder.postalCode}</span>
                </div>
              </div>

              <div className="items-section">
                <h3>Order Items</h3>
                <div className="items-list">
                  {selectedOrder.items && selectedOrder.items.map((item, index) => (
                    <div key={index} className="item-row">
                      <div className="item-details">
                        <span className="item-name">{item.productName}</span>
                        <span className="item-qty">Qty: {item.quantity}</span>
                        <span className="item-price">₱{parseFloat(item.price || 0).toFixed(2)} each</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="total-section">
                <div className="total-row">
                  <span className="total-label">Total Amount:</span>
                  <span className="total-value">₱{(parseFloat(selectedOrder.totalAmount) || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={closeCancelModal}>
          <div className="modal-content cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Order Cancellation</h2>
              <button className="close-btn" onClick={closeCancelModal}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">Please provide a reason for cancelling this order:</p>
              <textarea
                className="cancellation-textarea"
                placeholder="Enter your reason for cancellation..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows="5"
              />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel-action" onClick={closeCancelModal}>Close</button>
              <button className="btn-submit-cancellation" onClick={submitCancellationRequest}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPurchasePage;
