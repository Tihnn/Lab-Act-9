import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminOrdersPage.css';

function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const userStr = localStorage.getItem('bikeshop_current_user_v1');
    if (!userStr) {
      navigate('/login');
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (!user.isAdmin) {
        navigate('/');
        return;
      }
    } catch {
      navigate('/login');
      return;
    }

    loadOrders();
  }, [navigate]);

  const loadOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/orders');
      const allOrders = response.data.data || [];
      // Sort by most recent first
      const sorted = allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
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
  const userInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : '';

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

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:3001/api/orders/${orderId}/status`, {
        status: newStatus
      });
      // Reload orders after status update
      await loadOrders();
      // Update selected order if modal is open
      if (selectedOrder && selectedOrder.id === orderId) {
        const response = await axios.get(`http://localhost:3001/api/orders/${orderId}`);
        setSelectedOrder(response.data.data);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }
    try {
      await axios.delete(`http://localhost:3001/api/orders/${orderId}`);
      // Close modal if the deleted order was open
      if (selectedOrder && selectedOrder.id === orderId) {
        closeModal();
      }
      // Reload orders after deletion
      await loadOrders();
      alert('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    }
  };

  return (
    <div className="admin-orders-page">
      {/* Navigation */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo" onClick={() => navigate('/admin/dashboard')}>
            PedalHub <span style={{ color: '#ff6b6b' }}>/ Admin</span>
          </div>
          <nav className="nav-links">
            <button onClick={() => navigate('/admin/dashboard')}>DASHBOARD</button>
            <button onClick={() => navigate('/admin/products')}>MY PRODUCTS</button>
            <button className="active" onClick={() => navigate('/admin/orders')}>ORDERS</button>
          </nav>
          <div className="nav-actions">
            <div className="user-icon no-click">{userInitial}</div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="orders-container">
        <h1 className="orders-title">All Orders</h1>

        {/* Orders Table */}
        <div className="orders-card">
          {orders.length === 0 ? (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 7h-4V5l-2-2h-4L8 5v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z"/>
              </svg>
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Date</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className="order-id">#{order.id}</td>
                      <td>{order.customerName}</td>
                      <td>{order.customerEmail}</td>
                      <td>{order.customerPhone}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td className="amount">₱{(parseFloat(order.totalAmount) || 0).toFixed(2)}</td>
                      <td>
                        <select 
                          className={`status-select status-${order.status || 'pending'}`}
                          value={order.status || 'pending'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn-view" onClick={() => handleViewOrder(order)}>
                          View Details
                        </button>
                        <button className="btn-delete" onClick={() => handleDeleteOrder(order.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Order Details Modal */}
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
                  <select 
                    className={`status-select status-${selectedOrder.status || 'pending'}`}
                    value={selectedOrder.status || 'pending'}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="info-row">
                  <span className="label">Date:</span>
                  <span className="value">{formatDate(selectedOrder.createdAt)}</span>
                </div>
              </div>

              <div className="customer-info-section">
                <h3>Customer Information</h3>
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
              </div>

              <div className="items-section">
                <h3>Order Items</h3>
                <div className="items-list">
                  {selectedOrder.items && selectedOrder.items.map((item, index) => (
                    <div key={index} className="item-row">
                      <div className="item-details">
                        <span className="item-name">{item.productName}</span>
                        <span className="item-qty">Qty: {item.quantity}</span>
                      </div>
                      <span className="item-price">₱{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
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
    </div>
  );
}

export default AdminOrdersPage;
