import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationPanel from '../components/NotificationPanel';
import './AdminOrdersPage.css';

function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [receivedFilter, setReceivedFilter] = useState('all');

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const loadOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/orders');
      const allOrders = response.data.data || [];
      // Sort by most recent first
      const sorted = allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
      applyFilter(sorted, receivedFilter);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
      setFilteredOrders([]);
    }
  };

  const applyFilter = (ordersList, filter) => {
    if (filter === 'received') {
      setFilteredOrders(ordersList.filter(order => order.status === 'delivered'));
    } else if (filter === 'not-received') {
      setFilteredOrders(ordersList.filter(order => order.status === 'ship'));
    } else if (filter === 'cancellation-requests') {
      setFilteredOrders(ordersList.filter(order => order.cancellationRequested === true));
    } else if (filter === 'cancelled') {
      setFilteredOrders(ordersList.filter(order => order.status === 'cancelled'));
    } else {
      // Show only pending orders in 'all' view
      setFilteredOrders(ordersList.filter(order => order.status === 'pending'));
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

  const handleConfirmCancellation = async (orderId) => {
    if (!window.confirm('Are you sure you want to confirm this cancellation request?')) {
      return;
    }
    try {
      await axios.put(`http://localhost:3001/api/orders/${orderId}/confirm-cancellation`);
      // Reload orders after confirmation
      await loadOrders();
      alert('Cancellation confirmed successfully');
    } catch (error) {
      console.error('Error confirming cancellation:', error);
      alert('Failed to confirm cancellation');
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
            <button onClick={() => navigate('/home')}>HOME</button>
            <button onClick={() => navigate('/admin/dashboard')}>DASHBOARD</button>
            <button onClick={() => navigate('/admin/products')}>MY PRODUCTS</button>
            <button className="active" onClick={() => navigate('/admin/orders')}>ORDERS</button>
          </nav>
          <div className="nav-actions">
            <NotificationPanel userId={1} userType="admin" />
            <div className="user-icon no-click">{userInitial}</div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="orders-container">
        <h1 className="orders-title">Orders Management</h1>

        {/* Tabs Section */}
        <div className="tabs-container">
          <button 
            className={`tab ${receivedFilter === 'all' ? 'active' : ''}`}
            onClick={() => {
              setReceivedFilter('all');
              applyFilter(orders, 'all');
            }}
          >
            Pending Orders
          </button>
          <button 
            className={`tab ${receivedFilter === 'received' ? 'active' : ''}`}
            onClick={() => {
              setReceivedFilter('received');
              applyFilter(orders, 'received');
            }}
          >
            Item Received
          </button>
          <button 
            className={`tab ${receivedFilter === 'not-received' ? 'active' : ''}`}
            onClick={() => {
              setReceivedFilter('not-received');
              applyFilter(orders, 'not-received');
            }}
          >
            Not Received
          </button>
          <button 
            className={`tab ${receivedFilter === 'cancellation-requests' ? 'active' : ''}`}
            onClick={() => {
              setReceivedFilter('cancellation-requests');
              applyFilter(orders, 'cancellation-requests');
            }}
          >
            Cancellation Requests
            {orders.filter(o => o.cancellationRequested).length > 0 && (
              <span className="tab-badge">{orders.filter(o => o.cancellationRequested).length}</span>
            )}
          </button>
          <button 
            className={`tab ${receivedFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => {
              setReceivedFilter('cancelled');
              applyFilter(orders, 'cancelled');
            }}
          >
            Cancelled Orders
          </button>
        </div>

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
                    {receivedFilter === 'cancellation-requests' ? (
                      <th>Cancellation Reason</th>
                    ) : receivedFilter === 'cancelled' ? (
                      <th>Cancellation Reason</th>
                    ) : (
                      <th>Status</th>
                    )}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td className="order-id">#{order.id}</td>
                      <td>{order.customerName}</td>
                      <td>{order.customerEmail}</td>
                      <td>{order.customerPhone}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td className="amount">₱{(parseFloat(order.totalAmount) || 0).toFixed(2)}</td>
                      <td>
                        {receivedFilter === 'received' ? (
                          <span className="status-text status-delivered">Received</span>
                        ) : receivedFilter === 'not-received' ? (
                          <span className="status-text status-shipped">Ship</span>
                        ) : receivedFilter === 'cancellation-requests' ? (
                          <span className="cancellation-reason">{order.cancellationReason || 'No reason provided'}</span>
                        ) : receivedFilter === 'cancelled' ? (
                          <span className="cancellation-reason">{order.cancellationReason || 'No reason provided'}</span>
                        ) : order.status === 'cancelled' ? (
                          <span className="status-text status-cancelled">Cancelled</span>
                        ) : order.status === 'delivered' ? (
                          <span className="status-text status-delivered">Delivered</span>
                        ) : (
                          <select 
                            className={`status-select status-${order.status || 'pending'}`}
                            value={order.status || 'pending'}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={order.status === 'ship'}
                          >
                            <option value="pending">Pending</option>
                            <option value="ship">Ship</option>
                          </select>
                        )}
                      </td>
                      <td>
                        {receivedFilter === 'cancellation-requests' ? (
                          <button className="btn-confirm" onClick={() => handleConfirmCancellation(order.id)}>
                            Confirm Cancellation
                          </button>
                        ) : receivedFilter === 'cancelled' ? (
                          <button className="btn-view" onClick={() => handleViewOrder(order)}>
                            View Details
                          </button>
                        ) : (
                          <>
                            <button className="btn-view" onClick={() => handleViewOrder(order)}>
                              View Details
                            </button>
                            <button className="btn-delete" onClick={() => handleDeleteOrder(order.id)}>
                              Delete
                            </button>
                          </>
                        )}
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
                  {receivedFilter === 'received' ? (
                    <span className="status-text status-delivered">Received</span>
                  ) : receivedFilter === 'not-received' ? (
                    <span className="status-text status-shipped">Not Received</span>
                  ) : (
                    <select 
                      className={`status-select status-${selectedOrder.status || 'pending'}`}
                      value={selectedOrder.status || 'pending'}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      disabled={selectedOrder.status === 'ship' || selectedOrder.status === 'cancelled'}
                    >
                      <option value="pending">Pending</option>
                      <option value="ship">Ship</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}
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
