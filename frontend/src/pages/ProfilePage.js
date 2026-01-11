import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ProfilePage.css';
import Toast from '../components/Toast';

function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toastTitle, setToastTitle] = useState('');
  const [toastSubtitle, setToastSubtitle] = useState('');
  const [toastIcon, setToastIcon] = useState(null);
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const userStr = localStorage.getItem('bikeshop_current_user_v1');
    if (!userStr) {
      navigate('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      // Don't allow admin to access this page (they can't edit their profile)
      if (user.isAdmin) {
        navigate('/');
        return;
      }
      
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      // If navigated with edit state (e.g., from 'My Account'), enable editing immediately
      if (location.state && location.state.edit && !user.isAdmin) {
        setIsEditing(true);
      }
    } catch {
      navigate('/login');
    }
  }, [navigate]);

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
  const userInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = true;
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = true;
    }
    if (!formData.email.trim()) {
      newErrors.email = true;
    } else if (!formData.email.endsWith('@gmail.com')) {
      newErrors.email = true;
    }

    // Password validation only if user is trying to change password
    if (formData.currentPassword || formData.newPassword || formData.confirmNewPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = true;
      }
      if (!formData.newPassword) {
        newErrors.newPassword = true;
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword = true;
      }
      
      const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
      if (formData.newPassword && !pwdRegex.test(formData.newPassword)) {
        newErrors.newPassword = true;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setToastType('error');
      setToastIcon('error');
      setToastTitle('Please fix the errors in the form');
      setToastSubtitle('');
      return;
    }

    try {
      const currentUser = getUserInfo();
      const registered = JSON.parse(localStorage.getItem('bikeshop_registered_users') || '[]');
      const userIndex = registered.findIndex(u => u.id === currentUser.id);

      if (userIndex === -1) {
        setToastType('error');
        setToastIcon('error');
        setToastTitle('User not found');
        setToastSubtitle('');
        return;
      }

      // Check if trying to change password
      if (formData.currentPassword) {
        if (registered[userIndex].password !== formData.currentPassword) {
          setToastType('error');
          setToastIcon('error');
          setToastTitle('Current password is incorrect');
          setToastSubtitle('');
          setErrors(prev => ({ ...prev, currentPassword: true }));
          return;
        }
      }

      // Check if email is being changed and if it's already taken
      if (formData.email.toLowerCase() !== currentUser.email.toLowerCase()) {
        const emailExists = registered.find((u, idx) => 
          idx !== userIndex && u.email && u.email.toLowerCase() === formData.email.toLowerCase()
        );
        if (emailExists) {
          setToastType('error');
          setToastIcon('error');
          setToastTitle('Email already in use');
          setToastSubtitle('Please use a different email');
          setErrors(prev => ({ ...prev, email: true }));
          return;
        }
      }

      // Update user data
      const updatedUser = {
        ...registered[userIndex],
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email.toLowerCase(),
        username: formData.email.toLowerCase(),
        password: formData.newPassword || registered[userIndex].password
      };

      registered[userIndex] = updatedUser;
      localStorage.setItem('bikeshop_registered_users', JSON.stringify(registered));
      localStorage.setItem('bikeshop_current_user_v1', JSON.stringify(updatedUser));

      setToastType('success');
      setToastIcon('check');
      setToastTitle('Profile updated successfully');
      setToastSubtitle('');
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
      
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      console.error('Error updating profile:', error);
      setToastType('error');
      setToastIcon('error');
      setToastTitle('Failed to update profile');
      setToastSubtitle('Please try again');
    }
  };

  const handleCancel = () => {
    const user = getUserInfo();
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    setIsEditing(false);
    setErrors({});
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      {/* Navigation */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo" onClick={() => navigate('/')}>
            PedalHub
            {user && (
              <span className="logo-suffix"> / {user.isAdmin ? 'Admin' : (user.email || 'User')}</span>
            )}
          </div>
          <nav className="nav-links">
            <button onClick={() => navigate('/')}>HOME</button>
            <button onClick={() => navigate('/products')}>PRODUCTS</button>
            <button onClick={() => navigate('/cart')}>CART</button>
          </nav>
          <div className="nav-actions">
            <button className="account-button" onClick={() => navigate('/profile')}>
              <span className="account-text">My Account</span>
            </button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {userInitial}
            </div>
            <h1 className="profile-name">{user.firstName} {user.lastName}</h1>
            <p className="profile-email">{user.email}</p>
          </div>

          <form onSubmit={handleSave} className="profile-form">
            <div className="form-columns">
              {/* Left Column - Personal Information */}
              <div className="form-column">
                <h2 className="section-title">Personal Information</h2>
                
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={errors.firstName ? 'error' : ''}
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={errors.lastName ? 'error' : ''}
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">Email must be @gmail.com</span>}
                </div>
              </div>

              {/* Right Column - Change Password */}
              <div className="form-column">
                <h2 className="section-title">Change Password</h2>
                
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter current password to change"
                      disabled={!isEditing}
                      className={errors.currentPassword ? 'error' : ''}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      disabled={!isEditing}
                    >
                      {showCurrentPassword ? (
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
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="New password"
                      disabled={!isEditing}
                      className={errors.newPassword ? 'error' : ''}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={!isEditing}
                    >
                      {showNewPassword ? (
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
                  {errors.newPassword && (
                    <span className="error-text">Must be 8+ chars with upper, lower, number & symbol</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      disabled={!isEditing}
                      className={errors.confirmNewPassword ? 'error' : ''}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={!isEditing}
                    >
                      {showConfirmPassword ? (
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
                  {errors.confirmNewPassword && (
                    <span className="error-text">Passwords do not match</span>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </main>

      <Toast
        title={toastTitle}
        subtitle={toastSubtitle}
        icon={toastIcon}
        type={toastType}
        onClose={() => { setToastTitle(''); setToastSubtitle(''); setToastIcon(null); }}
      />
    </div>
  );
}

export default ProfilePage;
