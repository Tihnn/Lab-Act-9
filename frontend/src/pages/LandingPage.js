import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    updateCartCount();
  }, []);

  const updateCartCount = () => {
    const sessionId = 'default-session';
    const cart = JSON.parse(localStorage.getItem(`cart_${sessionId}`) || '[]');
    setCartCount(cart.length);
  };

  const handleStartBrowse = () => {
    navigate('/products');
  };

  const handleCategoryClick = (category) => {
    // Require login before browsing categories
    const user = localStorage.getItem('bikeshop_current_user_v1');
    if (!user) {
      navigate('/login', { state: { redirect: `/products?category=${category}` } });
      return;
    }
    navigate(`/products?category=${category}`);
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
  const userInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo">PedalHub</div>
          <nav className="nav-links">
            <button onClick={() => navigate('/products')}>ALL</button>
            <button onClick={() => handleCategoryClick('bicycles')}>BICYCLES</button>
            <button onClick={() => handleCategoryClick('parts')}>PARTS</button>
            <button onClick={() => handleCategoryClick('accessories')}>ACCESSORIES</button>
            <button onClick={() => handleCategoryClick('clothing')}>CLOTHING</button>
          </nav>
          <div className="nav-right">
            {isLoggedIn ? (
              <>
                {!isAdmin && (
                  <div className="cart-icon" onClick={() => navigate('/cart')}>
                    🛒
                    {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                  </div>
                )}
                <div 
                  className={`user-icon ${isAdmin ? 'no-click' : ''}`}
                  onClick={() => !isAdmin && navigate('/profile')}
                  style={{ cursor: isAdmin ? 'default' : 'pointer' }}
                >
                  {userInitial}
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
      <section className="hero-section">
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
