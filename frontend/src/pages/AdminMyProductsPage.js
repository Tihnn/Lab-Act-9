import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationPanel from '../components/NotificationPanel';
import './AdminMyProductsPage.css';
import Toast from '../components/Toast';

function AdminMyProductsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [allProductsData, setAllProductsData] = useState({
    bicycles: [],
    parts: [],
    accessories: [],
    clothing: []
  });
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

  const loadProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/products');
      const allProducts = response.data.data;
      
      // Store all products data for counts
      setAllProductsData(allProducts);
      
      if (activeCategory === 'all') {
        // Combine all products with their category type
        const combined = [
          ...allProducts.bicycles.map(p => ({ ...p, categoryType: 'bicycle' })),
          ...allProducts.parts.map(p => ({ ...p, categoryType: 'part' })),
          ...allProducts.accessories.map(p => ({ ...p, categoryType: 'accessory' })),
          ...allProducts.clothing.map(p => ({ ...p, categoryType: 'clothing' }))
        ];
        setProducts(combined);
      } else {
        // Map activeCategory to the correct key
        const categoryMap = {
          'bicycles': 'bicycles',
          'parts': 'parts',
          'accessories': 'accessories',
          'clothing': 'clothing'
        };
        setProducts(allProducts[categoryMap[activeCategory]] || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setToastType('error');
      setToastIcon('error');
      setToastTitle('Failed to load products');
      setToastPosition('center');
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

  const handleEdit = (product) => {
    // If we're in 'all' view, use the product's categoryType, otherwise derive from activeCategory
    const type = activeCategory === 'all' ? product.categoryType : activeCategory.slice(0, -1);
    localStorage.setItem('edit_product', JSON.stringify({ product, type }));
    navigate('/admin/add-product');
  };

  const handleDelete = async (productId, categoryType) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:3001/api/products/${categoryType}/${productId}`);
        
        setToastType('success');
        setToastIcon('check');
        setToastTitle('Product deleted successfully!');
        setToastPosition('center');
        
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setToastType('error');
        setToastIcon('error');
        setToastTitle('Failed to delete product');
        setToastPosition('center');
      }
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
            <button onClick={() => navigate('/admin/dashboard')}>HOME</button>
            <button onClick={() => navigate('/admin/dashboard')}>DASHBOARD</button>
            <button className="active" onClick={() => navigate('/admin/products')}>MY PRODUCTS</button>
            <button onClick={() => navigate('/admin/orders')}>ORDERS</button>
          </nav>
          <div className="nav-actions">
            <NotificationPanel userId={1} userType="admin" />
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
            className={activeCategory === 'all' ? 'active' : ''}
            onClick={() => setActiveCategory('all')}
          >
            All Products ({allProductsData.bicycles.length + allProductsData.parts.length + allProductsData.accessories.length + allProductsData.clothing.length})
          </button>
          <button 
            className={activeCategory === 'bicycles' ? 'active' : ''}
            onClick={() => setActiveCategory('bicycles')}
          >
            Bicycles ({allProductsData.bicycles.length})
          </button>
          <button 
            className={activeCategory === 'parts' ? 'active' : ''}
            onClick={() => setActiveCategory('parts')}
          >
            Parts ({allProductsData.parts.length})
          </button>
          <button 
            className={activeCategory === 'accessories' ? 'active' : ''}
            onClick={() => setActiveCategory('accessories')}
          >
            Accessories ({allProductsData.accessories.length})
          </button>
          <button 
            className={activeCategory === 'clothing' ? 'active' : ''}
            onClick={() => setActiveCategory('clothing')}
          >
            Clothing ({allProductsData.clothing.length})
          </button>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {products.length === 0 ? (
            <div className="empty-state">
              <p>No products in this category yet.</p>
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
                  {product.stock <= 9 && product.stock > 0 && (
                    <span className="low-stock-badge">{product.stock} stock left</span>
                  )}
                  {product.stock === 0 && (
                    <span className="out-of-stock-badge">Out of Stock</span>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-brand">{product.brand}</p>
                  {activeCategory === 'all' && product.categoryType && (
                    <span className="category-badge">
                      {product.categoryType === 'bicycle' ? 'Bicycle' :
                       product.categoryType === 'part' ? 'Part' :
                       product.categoryType === 'accessory' ? 'Accessory' : 'Clothing'}
                    </span>
                  )}
                  <p className="product-description">{product.description || 'No description'}</p>
                  <div className="product-details">
                    <span className="product-price">₱{parseFloat(product.price).toFixed(2)}</span>
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
                  <button className="btn-delete" onClick={() => handleDelete(product.id, product.categoryType)}>
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
