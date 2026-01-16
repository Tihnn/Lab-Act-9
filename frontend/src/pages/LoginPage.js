import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginAlert, setLoginAlert] = useState('');
  const [loginErrors, setLoginErrors] = useState({ email: false, password: false });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    password: '',
    confirmPassword: ''
  });
  const [registerAlert, setRegisterAlert] = useState('');
  const [registerErrors, setRegisterErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    address: false,
    postalCode: false,
    password: false,
    confirmPassword: false
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Ensure it starts with 63
    let phoneDigits = digits;
    if (!phoneDigits.startsWith('63')) {
      phoneDigits = '63' + phoneDigits;
    }
    
    // Format as 63+ xxx-xxx-xxxx
    if (phoneDigits.length <= 2) {
      return phoneDigits;
    } else if (phoneDigits.length <= 5) {
      return `${phoneDigits.slice(0, 2)}+ ${phoneDigits.slice(2)}`;
    } else if (phoneDigits.length <= 8) {
      return `${phoneDigits.slice(0, 2)}+ ${phoneDigits.slice(2, 5)}-${phoneDigits.slice(5)}`;
    } else {
      return `${phoneDigits.slice(0, 2)}+ ${phoneDigits.slice(2, 5)}-${phoneDigits.slice(5, 8)}-${phoneDigits.slice(8, 12)}`;
    }
  };

  const handleCategoryClick = () => {
    alert('Please login or register first to browse categories');
  };

  const clearAlertLater = (setter, ms = 3500) => setTimeout(() => setter(''), ms);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginAlert('');
    setLoginErrors({ email: false, password: false });

    if (!loginData.email || !loginData.password) {
      setLoginAlert('Please enter your email and password');
      setLoginErrors({
        email: !loginData.email,
        password: !loginData.password
      });
      clearAlertLater(setLoginAlert);
      return;
    }

    if (loginData.email && !loginData.email.includes('@')) {
      setLoginAlert('Invalid credentials. Please check your email and password.');
      setLoginErrors({ email: true, password: false });
      clearAlertLater(setLoginAlert);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/users/login', {
        email: loginData.email,
        password: loginData.password
      });

      if (response.data.success) {
        const user = response.data.data;
        localStorage.setItem('bikeshop_current_user_v1', JSON.stringify(user));
        const redirectTo = user.isAdmin ? (location.state?.redirect || '/admin/dashboard') : (location.state?.redirect || '/home');
        navigate(redirectTo);
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginAlert('Invalid credentials. Please check your email and password.');
      setLoginErrors({ email: true, password: true });
      clearAlertLater(setLoginAlert);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterAlert('');
    setRegisterErrors({
      firstName: false,
      lastName: false,
      email: false,
      password: false,
      confirmPassword: false
    });

    if (!registerData.firstName || !registerData.lastName || !registerData.email || !registerData.phone || !registerData.address || !registerData.postalCode || !registerData.password) {
      setRegisterAlert('Please fill in all fields');
      setRegisterErrors({
        firstName: !registerData.firstName,
        lastName: !registerData.lastName,
        email: !registerData.email,
        phone: !registerData.phone,
        address: !registerData.address,
        postalCode: !registerData.postalCode,
        password: !registerData.password,
        confirmPassword: !registerData.confirmPassword
      });
      clearAlertLater(setRegisterAlert);
      return;
    }

    const emailVal = (registerData.email || '').trim().toLowerCase();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      setRegisterAlert('Please enter a valid email address');
      setRegisterErrors(prev => ({ ...prev, email: true }));
      clearAlertLater(setRegisterAlert, 4000);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterAlert('Passwords do not match');
      setRegisterErrors(prev => ({ ...prev, password: true, confirmPassword: true }));
      clearAlertLater(setRegisterAlert);
      return;
    }

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    if (!pwdRegex.test(registerData.password)) {
      setRegisterAlert('Password must be at least 8 characters and include upper, lower, number and symbol');
      setRegisterErrors(prev => ({ ...prev, password: true }));
      clearAlertLater(setRegisterAlert, 4500);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/users/register', {
        email: emailVal,
        password: registerData.password,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        phone: registerData.phone.replace(/\D/g, ''),
        address: registerData.address,
        postalCode: registerData.postalCode,
        isAdmin: false
      });

      if (response.data.success) {
        const user = response.data.data;
        localStorage.setItem('bikeshop_current_user_v1', JSON.stringify(user));
        navigate('/home');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      if (errorMsg.includes('Email already registered')) {
        setRegisterAlert('An account with this email already exists. Please login.');
        setRegisterErrors(prev => ({ ...prev, email: true }));
      } else {
        setRegisterAlert(errorMsg);
      }
      clearAlertLater(setRegisterAlert);
    }
  };

  return (
    <div className="auth-page">
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo">PedalHub</div>
          <div className="nav-spacer" />
          <div className="user-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
      </header>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </div>

          {activeTab === 'login' && (
            <form className="auth-form" onSubmit={handleLogin} noValidate>
              <h1 className="auth-brand">PedalHub</h1>
              {loginAlert && <div className="form-alert">{loginAlert}</div>}

              <input
                type="text"
                placeholder="Enter your email"
                className={`auth-input ${loginErrors.email ? 'error' : ''}`}
                value={loginData.email}
                onChange={(e) => {
                  setLoginData({ ...loginData, email: e.target.value });
                  setLoginErrors(prev => ({ ...prev, email: false }));
                }}
              />

              <div className="password-input-wrapper">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Password"
                  className={`auth-input ${loginErrors.password ? 'error' : ''}`}
                  value={loginData.password}
                  onChange={(e) => {
                    setLoginData({ ...loginData, password: e.target.value });
                    setLoginErrors(prev => ({ ...prev, password: false }));
                  }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showLoginPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              <button type="submit" className="auth-button">Login</button>
            </form>
          )}

          {activeTab === 'register' && (
            <form className="auth-form" onSubmit={handleRegister} noValidate>
              <h1 className="auth-brand">Create account</h1>
              {registerAlert && <div className="form-alert">{registerAlert}</div>}

              <input
                type="text"
                placeholder="First name"
                className={`auth-input ${registerErrors.firstName ? 'error' : ''}`}
                value={registerData.firstName}
                onChange={(e) => {
                  setRegisterData({ ...registerData, firstName: e.target.value });
                  setRegisterErrors(prev => ({ ...prev, firstName: false }));
                }}
              />

              <input
                type="text"
                placeholder="Last name"
                className={`auth-input ${registerErrors.lastName ? 'error' : ''}`}
                value={registerData.lastName}
                onChange={(e) => {
                  setRegisterData({ ...registerData, lastName: e.target.value });
                  setRegisterErrors(prev => ({ ...prev, lastName: false }));
                }}
              />

              <input
                type="text"
                placeholder="Enter your Email"
                className={`auth-input ${registerErrors.email ? 'error' : ''}`}
                value={registerData.email}
                onChange={(e) => {
                  setRegisterData({ ...registerData, email: e.target.value });
                  setRegisterErrors(prev => ({ ...prev, email: false }));
                }}
              />

              <input
                type="tel"
                placeholder="63+ xxx-xxx-xxxx"
                className={`auth-input ${registerErrors.phone ? 'error' : ''}`}
                value={registerData.phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setRegisterData({ ...registerData, phone: formatted });
                  setRegisterErrors(prev => ({ ...prev, phone: false }));
                }}
              />

              <input
                type="text"
                placeholder="Address (e.g., 123 Main St, City, State)"
                className={`auth-input ${registerErrors.address ? 'error' : ''}`}
                value={registerData.address}
                onChange={(e) => {
                  setRegisterData({ ...registerData, address: e.target.value });
                  setRegisterErrors(prev => ({ ...prev, address: false }));
                }}
              />

              <input
                type="text"
                placeholder="Postal code"
                className={`auth-input ${registerErrors.postalCode ? 'error' : ''}`}
                value={registerData.postalCode}
                onChange={(e) => {
                  setRegisterData({ ...registerData, postalCode: e.target.value });
                  setRegisterErrors(prev => ({ ...prev, postalCode: false }));
                }}
              />

              <div className="password-input-wrapper">
                <input
                  type={showRegisterPassword ? "text" : "password"}
                  placeholder="Password"
                  className={`auth-input ${registerErrors.password ? 'error' : ''}`}
                  value={registerData.password}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, password: e.target.value });
                    setRegisterErrors(prev => ({ ...prev, password: false }));
                  }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showRegisterPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              <div className="password-input-wrapper">
                <input
                  type={showRegisterConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className={`auth-input ${registerErrors.confirmPassword ? 'error' : ''}`}
                  value={registerData.confirmPassword}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, confirmPassword: e.target.value });
                    setRegisterErrors(prev => ({ ...prev, confirmPassword: false }));
                  }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showRegisterConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              <button type="submit" className="auth-button">Register</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
