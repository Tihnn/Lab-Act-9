import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboardPage.css';

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSold: 0,
    totalPendingOrders: 0,
    totalCancelledOrders: 0,
    totalProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

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

    // Load statistics
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      // Get all orders from API
      const ordersResponse = await axios.get('http://localhost:3001/api/orders');
      const orders = ordersResponse.data.data || [];
      
      // Filter only delivered orders
      const deliveredOrders = orders.filter(order => order.status === 'delivered');
      
      // Filter pending orders
      const pendingOrders = orders.filter(order => order.status === 'pending');
      
      // Filter cancelled orders
      const cancelledOrders = orders.filter(order => order.status === 'cancelled');
      
      // Get all products from API
      const productsResponse = await axios.get('http://localhost:3001/api/products');
      const products = productsResponse.data.data;
      const totalProducts = products.bicycles.length + products.parts.length + products.accessories.length + products.clothing.length;
      
      // Calculate total sold products from delivered orders only
      let totalSold = 0;
      deliveredOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            totalSold += item.quantity || 0;
          });
        }
      });
      
      setStats({
        totalSold,
        totalPendingOrders: pendingOrders.length,
        totalCancelledOrders: cancelledOrders.length,
        totalProducts
      });

      // Get recent orders (last 5)
      const recent = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(order => ({
          id: order.id,
          customerName: order.customerName,
          createdAt: order.createdAt,
          status: order.status || 'pending',
          totalAmount: order.totalAmount
        }));
      
      setRecentOrders(recent);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
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
      year: 'numeric' 
    });
  };

  return (
    <div className="admin-dashboard-page">
      {/* Navigation */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo" onClick={() => navigate('/admin/dashboard')}>
            PedalHub <span style={{ color: '#ff6b6b' }}>/ Admin</span>
          </div>
          <nav className="nav-links">
            <button className="active" onClick={() => navigate('/admin/dashboard')}>DASHBOARD</button>
            <button onClick={() => navigate('/admin/products')}>MY PRODUCTS</button>
            <button onClick={() => navigate('/admin/orders')}>ORDERS</button>
          </nav>
          <div className="nav-actions">
            <div className="user-icon no-click">{userInitial}</div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-container">
        <h1 className="dashboard-title">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.totalSold}</h3>
              <p>Total Sold Products</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 7h-4V5l-2-2h-4L8 5v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.totalPendingOrders}</h3>
              <p>Total Pending Orders</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.totalCancelledOrders}</h3>
              <p>Cancelled Orders</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.totalProducts}</h3>
              <p>Total Products</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="recent-orders-section">
          <h2 className="section-title">Recent Orders</h2>
          <div className="orders-table-container">
            {recentOrders.length === 0 ? (
              <div className="empty-state">
                <p>No orders yet</p>
              </div>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customerName}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>₱{(parseFloat(order.totalAmount) || 0).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboardPage;
