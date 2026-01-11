import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import Toast from '../components/Toast';

function ProfilePage() {
  const navigate = useNavigate();
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
          <div className="logo" onClick={() => navigate('/')}>PedalHub</div>
          <nav className="nav-links">
            <button onClick={() => navigate('/')}>HOME</button>
            <button onClick={() => navigate('/products')}>PRODUCTS</button>
            <button onClick={() => navigate('/cart')}>CART</button>
          </nav>
          <div className="nav-actions">
            <div className="user-icon active">{userInitial}</div>
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

          <div className="profile-content">
            <div className="profile-section-header">
              <h2>Personal Information</h2>
              {!isEditing && (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="profile-form">
              <div className="form-row">
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

              {isEditing && (
                <>
                  <div className="divider">
                    <span>Change Password (Optional)</span>
                  </div>

                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter current password to change"
                      className={errors.currentPassword ? 'error' : ''}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="New password"
                        className={errors.newPassword ? 'error' : ''}
                      />
                      {errors.newPassword && (
                        <span className="error-text">Must be 8+ chars with upper, lower, number & symbol</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmNewPassword"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        className={errors.confirmNewPassword ? 'error' : ''}
                      />
                      {errors.confirmNewPassword && (
                        <span className="error-text">Passwords do not match</span>
                      )}
                    </div>
                  </div>
                </>
              )}

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
