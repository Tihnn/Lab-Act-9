import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminMyProductsPage.css';
import Toast from '../components/Toast';

function AdminMyProductsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('bicycles');
  const [products, setProducts] = useState([]);
  const [toastTitle, setToastTitle] = useState('');
  const [toastSubtitle, setToastSubtitle] = useState('');
  const [toastIcon, setToastIcon] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [toastPosition, setToastPosition] = useState('center');

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

    loadProducts();
  }, [navigate, activeCategory]);

  const loadProducts = () => {
    const allProducts = JSON.parse(localStorage.getItem('bikeshop_products') || '{"bicycles":[],"parts":[],"accessories":[],"clothing":[]}');
    setProducts(allProducts[activeCategory] || []);
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
  const userInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'A';

  const handleEdit = (product) => {
    localStorage.setItem('edit_product', JSON.stringify({ product, type: activeCategory.slice(0, -1) }));
    navigate('/admin/add-product');
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const allProducts = JSON.parse(localStorage.getItem('bikeshop_products') || '{"bicycles":[],"parts":[],"accessories":[],"clothing":[]}');
      allProducts[activeCategory] = allProducts[activeCategory].filter(p => p.id !== productId);
      localStorage.setItem('bikeshop_products', JSON.stringify(allProducts));
      
      setToastType('success');
      setToastIcon('check');
      setToastTitle('Product deleted successfully!');
      setToastPosition('center');
      
      loadProducts();
    }
  };

  const getCategoryType = (category) => {
    const types = {
      'bicycles': 'bicycle',
      'parts': 'part',
      'accessories': 'accessory',
      'clothing': 'clothing'
    };
    return types[category];
  };

  return (
    <div className="admin-products-page">
      {/* Navigation */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo" onClick={() => navigate('/admin/dashboard')}>
            PedalHub <span style={{ color: '#ff6b6b' }}>/ Admin</span>
          </div>
          <nav className="nav-links">
            <button onClick={() => navigate('/admin/dashboard')}>DASHBOARD</button>
            <button className="active" onClick={() => navigate('/admin/products')}>MY PRODUCTS</button>
            <button onClick={() => navigate('/admin/orders')}>ORDERS</button>
          </nav>
          <div className="nav-actions">
            <div className="user-icon no-click">{userInitial}</div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="products-container">
        <div className="products-header">
          <h1 className="products-title">My Products</h1>
          <button className="add-product-btn" onClick={() => navigate('/admin/add-product')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add New Product
          </button>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          <button 
            className={activeCategory === 'bicycles' ? 'active' : ''}
            onClick={() => setActiveCategory('bicycles')}
          >
            Bicycles ({products.length > 0 && activeCategory === 'bicycles' ? products.length : JSON.parse(localStorage.getItem('bikeshop_products') || '{"bicycles":[]}').bicycles.length})
          </button>
          <button 
            className={activeCategory === 'parts' ? 'active' : ''}
            onClick={() => setActiveCategory('parts')}
          >
            Parts ({products.length > 0 && activeCategory === 'parts' ? products.length : JSON.parse(localStorage.getItem('bikeshop_products') || '{"parts":[]}').parts.length})
          </button>
          <button 
            className={activeCategory === 'accessories' ? 'active' : ''}
            onClick={() => setActiveCategory('accessories')}
          >
            Accessories ({products.length > 0 && activeCategory === 'accessories' ? products.length : JSON.parse(localStorage.getItem('bikeshop_products') || '{"accessories":[]}').accessories.length})
          </button>
          <button 
            className={activeCategory === 'clothing' ? 'active' : ''}
            onClick={() => setActiveCategory('clothing')}
          >
            Clothing ({products.length > 0 && activeCategory === 'clothing' ? products.length : JSON.parse(localStorage.getItem('bikeshop_products') || '{"clothing":[]}').clothing.length})
          </button>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {products.length === 0 ? (
            <div className="empty-state">
              <p>No products in this category yet.</p>
              <button className="add-first-btn" onClick={() => navigate('/admin/add-product')}>
                Add Your First Product
              </button>
            </div>
          ) : (
            products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-brand">{product.brand}</p>
                  <p className="product-description">{product.description}</p>
                  <div className="product-details">
                    <span className="product-price">₱{product.price?.toFixed(2)}</span>
                    <span className="product-stock">Stock: {product.stock}</span>
                  </div>
                </div>
                <div className="product-actions">
                  <button className="btn-edit" onClick={() => handleEdit(product)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(product.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Toast
        title={toastTitle}
        subtitle={toastSubtitle}
        icon={toastIcon}
        type={toastType}
        position={toastPosition}
        onClose={() => { setToastTitle(''); setToastSubtitle(''); setToastIcon(null); }}
      />
    </div>
  );
}

export default AdminMyProductsPage;
