import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationPanel from '../components/NotificationPanel';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
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
    updateCartCount();
  }, []);

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

  const handleStartBrowse = () => {
    navigate('/products');
  };

  const handleCategoryClick = (category) => {
    // Require login before browsing categories
    const user = localStorage.getItem('bikeshop_current_user_v1');
    if (!user) {
      // redirect back to the requested products view after login
      const redirectPath = category === 'all' ? '/products' : `/products?category=${category}`;
      navigate('/login', { state: { redirect: redirectPath } });
      return;
    }
    if (category === 'all') {
      navigate('/products');
    } else {
      navigate(`/products?category=${category}`);
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
  const isLoggedIn = !!user;
  const isAdmin = user?.isAdmin || false;

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo" onClick={() => navigate('/home')}>
            PedalHub
            {isLoggedIn && (
              <span className="logo-suffix"> / {isAdmin ? 'Admin' : (user?.email || 'User')}</span>
            )}
          </div>
          <nav className="nav-links">
            {/* Categories moved to the right-side nav */}
          </nav>
          <div className="nav-right">
            {isLoggedIn ? (
              <>
                {/* category dropdown placed next to cart */}
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
                      <li onClick={() => { setSelectedCategory('all'); setCategoryOpen(false); handleCategoryClick('all'); }}>ALL</li>
                      <li onClick={() => { setSelectedCategory('bicycles'); setCategoryOpen(false); handleCategoryClick('bicycles'); }}>BICYCLES</li>
                      <li onClick={() => { setSelectedCategory('parts'); setCategoryOpen(false); handleCategoryClick('parts'); }}>PARTS</li>
                      <li onClick={() => { setSelectedCategory('accessories'); setCategoryOpen(false); handleCategoryClick('accessories'); }}>ACCESSORIES</li>
                      <li onClick={() => { setSelectedCategory('clothing'); setCategoryOpen(false); handleCategoryClick('clothing'); }}>CLOTHING</li>
                    </ul>
                  )}
                </div>
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
              </>
            ) : (
              <>
                <div className="user-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <button className="login-btn" onClick={() => navigate('/login')}>Login</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL + '/Background%20bike.jpg'})` }}
      >
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              YOUR JOURNEY
              <br />
              STARTS HERE
            </h1>
            <p className="hero-subtitle">Gear up & Ride out.</p>
            <div className="hero-buttons">
                <button
                  className="start-browse-btn"
                  onClick={isAdmin ? () => navigate('/products') : handleStartBrowse}
                >
                  {isAdmin ? 'My Products' : 'Start Browse'}
                </button>
                {user?.isAdmin && (
                  <button className="admin-btn" onClick={() => navigate('/admin/products')}>
                    Add Product
                  </button>
                )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
