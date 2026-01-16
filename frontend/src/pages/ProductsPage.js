import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { addToCart } from '../services/api';
import NotificationPanel from '../components/NotificationPanel';
import Toast from '../components/Toast';
import './ProductsPage.css';

function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState({
    bicycles: [],
    parts: [],
    accessories: [],
    clothing: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastTitle, setToastTitle] = useState('');
  const [toastSubtitle, setToastSubtitle] = useState('');
  const [toastIcon, setToastIcon] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [toastPosition, setToastPosition] = useState('center');
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
    // Redirect admin users to their dashboard
    const userStr = localStorage.getItem('bikeshop_current_user_v1');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.isAdmin) {
          navigate('/admin/dashboard');
          return;
        }
      } catch (e) {
        // ignore
      }
    }
    
    loadProducts();
    updateCartCount();
    // honor ?category= query from other pages
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) setSelectedCategory(cat);
  }, []);

  const loadProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/products');
      setProducts(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading products:', error);
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
  const userInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : '';

  const handleAddToCart = async (product, type) => {
    try {
      await addToCart(type, product.id, 1);
      // silently add to cart and update cart count
      updateCartCount();
      setToastType('success');
      setToastIcon('check');
      setToastTitle('Item has been added to your shopping cart');
      setToastSubtitle('');
  setToastPosition('center');
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToastType('error');
      setToastIcon('error');
      setToastTitle('Failed to add to cart');
      setToastSubtitle('Please try again');
  setToastPosition('center');
    }
  };

  const handleEditProduct = (product, type) => {
    // Store product details and type in localStorage for editing
    localStorage.setItem('edit_product', JSON.stringify({ product, type }));
    navigate('/admin/products');
  };

  const renderProductCard = (product, type) => (
    <div key={`${type}-${product.id}`} className="product-card">
      <div className="product-image">
        <img 
          src={product.imageUrl || `https://via.placeholder.com/300x300?text=${product.name}`} 
          alt={product.name}
        />
        {product.stock < 10 && product.stock > 0 && (
          <span className="low-stock-badge">Only {product.stock} left!</span>
        )}
        {product.stock === 0 && (
          <span className="out-of-stock-badge">Out of Stock</span>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description || 'No description'}</p>
        <div className="product-meta">
          {product.brand && <span className="product-brand">{product.brand}</span>}
          {product.category && <span className="product-category">{product.category}</span>}
        </div>
        <div className="product-footer">
          <span className="product-price">₱{parseFloat(product.price).toFixed(2)}</span>
          {isAdmin ? (
            <button 
              className="edit-btn"
              onClick={() => handleEditProduct(product, type)}
            >
              Edit
            </button>
          ) : (
            <div className="product-actions">
              <button 
                className="add-to-cart-icon-btn"
                onClick={() => handleAddToCart(product, type)}
                disabled={product.stock === 0}
                title={product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              >
                🛒
              </button>
              <button 
                className="buy-btn"
                onClick={() => {
                  const item = {
                    id: Date.now(),
                    productId: product.id,
                    productName: product.name,
                    productType: type,
                    price: product.price,
                    quantity: 1,
                    imageUrl: product.imageUrl
                  };
                  localStorage.setItem('checkout_items', JSON.stringify([item]));
                  navigate('/checkout');
                }}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Buy'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const getFilteredProducts = () => {
    let allProducts = [];
    if (selectedCategory === 'all') {
      allProducts = [
        ...products.bicycles.map(p => ({ ...p, type: 'bicycle' })),
        ...products.parts.map(p => ({ ...p, type: 'part' })),
        ...products.accessories.map(p => ({ ...p, type: 'accessory' })),
        ...products.clothing.map(p => ({ ...p, type: 'clothing' })),
      ];
    } else {
      allProducts = products[selectedCategory].map(p => ({ ...p, type: selectedCategory === 'bicycles' ? 'bicycle' : selectedCategory.slice(0, -1) }));
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return allProducts.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.brand && product.brand.toLowerCase().includes(query))
      );
    }

    return allProducts;
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="products-page">
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
            <button onClick={() => navigate('/home')} className="home-btn">
              HOME
            </button>

            <div className="category-dropdown">
              <button
                className="dropdown-toggle"
                onClick={() => setCategoryOpen(prev => !prev)}
                aria-expanded={categoryOpen}
              >
                {selectedCategory === 'all' ? 'CATEGORIES' : selectedCategory.toUpperCase()}
                <span className={`caret ${categoryOpen ? 'open' : ''}`}>▾</span>
              </button>
              {categoryOpen && (
                <ul className="dropdown-menu">
                  <li onClick={() => { setSelectedCategory('all'); setCategoryOpen(false); }}>ALL</li>
                  <li onClick={() => { setSelectedCategory('bicycles'); setCategoryOpen(false); }}>BICYCLES</li>
                  <li onClick={() => { setSelectedCategory('parts'); setCategoryOpen(false); }}>PARTS</li>
                  <li onClick={() => { setSelectedCategory('accessories'); setCategoryOpen(false); }}>ACCESSORIES</li>
                  <li onClick={() => { setSelectedCategory('clothing'); setCategoryOpen(false); }}>CLOTHING</li>
                </ul>
              )}
            </div>
          </nav>
          <div className="nav-actions">
            <input
              type="text"
              placeholder="Search products..."
              className="search-bar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {!isAdmin && (
              <div className="cart-icon" onClick={() => navigate('/cart')}>
                🛒
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </div>
            )}
            <NotificationPanel userId={user?.id} userType={isAdmin ? 'admin' : 'user'} />
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

        <Toast
          title={toastTitle}
          subtitle={toastSubtitle}
          icon={toastIcon}
          type={toastType}
          position={toastPosition}
          onClose={() => { setToastTitle(''); setToastSubtitle(''); setToastIcon(null); }}
        />

      {/* Products Grid */}
      <main className="products-container">
        <h1 className="page-title">
          {selectedCategory === 'all' ? 'All Products' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
        </h1>
        <div className="products-grid">
          {getFilteredProducts().map(product => 
            renderProductCard(product, product.type)
          )}
        </div>
        {getFilteredProducts().length === 0 && (
          <div className="no-products">
            <p>No products available in this category yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProductsPage;
