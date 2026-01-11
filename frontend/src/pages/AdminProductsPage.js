import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminProductsPage.css';
import Toast from '../components/Toast';

function AdminProductsPage() {
  const navigate = useNavigate();
  const [productType, setProductType] = useState('bicycle');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    brand: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  
  const [toastTitle, setToastTitle] = useState('');
  const [toastSubtitle, setToastSubtitle] = useState('');
  const [toastIcon, setToastIcon] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [toastPosition, setToastPosition] = useState('center');

  // Check if user is admin
  React.useEffect(() => {
    const userStr = localStorage.getItem('bikeshop_current_user_v1');
    if (!userStr) {
      // show a brief toast then navigate to login
      setToastType('error');
      setToastIcon('error');
      setToastTitle('Please login first');
      setToastPosition('center');
      setTimeout(() => navigate('/login'), 800);
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (!user.isAdmin) {
        setToastType('error');
        setToastIcon('error');
        setToastTitle('Access denied. Admin only.');
        setToastPosition('center');
        setTimeout(() => navigate('/'), 800);
      }
    } catch {
      navigate('/login');
    }

    // Check if we're editing a product
    const editData = localStorage.getItem('edit_product');
    if (editData) {
      try {
        const { product, type } = JSON.parse(editData);
        setIsEditMode(true);
        setEditProductId(product.id);
        setProductType(type);
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          stock: product.stock || '',
          brand: product.brand || ''
        });
        setImagePreview(product.imageUrl || '');
        // Clear the edit data
        localStorage.removeItem('edit_product');
      } catch (error) {
        console.error('Error loading edit data:', error);
      }
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
  const userInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : '';

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    // Description is now optional
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';

    // Image validation - required for new products only
    if (!isEditMode && !imageFile && !imagePreview) {
      newErrors.image = 'Product image is required';
    }

    // Price validation
    const price = parseFloat(formData.price);
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(price)) {
      newErrors.price = 'Price must be a valid number';
    } else if (price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    } else if (price > 999999) {
      newErrors.price = 'Price is too high (max: 999,999)';
    }

    // Stock validation
    const stock = parseInt(formData.stock);
    if (!formData.stock) {
      newErrors.stock = 'Stock is required';
    } else if (isNaN(stock)) {
      newErrors.stock = 'Stock must be a valid number';
    } else if (stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    } else if (stock > 99999) {
      newErrors.stock = 'Stock is too high (max: 99,999)';
    } else if (!Number.isInteger(stock)) {
      newErrors.stock = 'Stock must be a whole number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // validation errors are shown inline next to fields; do not show a modal/toast
      return;
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description || '',
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        brand: formData.brand,
        category: productType,
        imageUrl: imagePreview || ''
      };
      
      if (isEditMode && editProductId) {
        // Edit existing product via API
        await axios.put(`http://localhost:3001/api/products/${productType}/${editProductId}`, productData);
        
        setToastType('success');
        setToastIcon('check');
        setToastTitle('Your product is successfully updated');
        setToastSubtitle('');
        setToastPosition('center');
      } else {
        // Add new product via API
        await axios.post(`http://localhost:3001/api/products/${productType}`, productData);
        
        setToastType('success');
        setToastIcon('check');
        setToastTitle(`${formData.name} added successfully!`);
        setToastSubtitle('');
        setToastPosition('center');
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        brand: ''
      });
      setImagePreview('');
      setImageFile(null);
      setErrors({});
      setIsEditMode(false);
      setEditProductId(null);
      
      // Redirect to My Products page after short delay
      setTimeout(() => {
        navigate('/admin/products');
      }, 1000);
    } catch (error) {
      console.error('Error saving product:', error);
      setToastType('error');
      setToastIcon('error');
      setToastTitle('Failed to save product: ' + (error.response?.data?.message || error.message));
      setToastPosition('center');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
        if (!file.type.startsWith('image/')) {
          setToastType('error');
          setToastIcon('error');
          setToastTitle('Please select an image file');
          setToastPosition('center');
          return;
        }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setToastType('error');
        setToastIcon('error');
        setToastTitle('Image size should be less than 5MB');
        setToastPosition('center');
        return;
      }
      
      // Store file reference
      setImageFile(file);
      
      // Clear image error if it exists
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="admin-page">
      {/* Navigation */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo" onClick={() => navigate('/admin/dashboard')}>
            PedalHub <span className="logo-suffix">/ Admin</span>
          </div>
          <nav className="nav-links">
            <button onClick={() => navigate('/admin/dashboard')}>DASHBOARD</button>
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
      <main className="admin-container">
        <div className="admin-card">
          <h1 className="admin-title">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
          
          {/* Product Type Selector */}
          <div className="type-selector">
            <button 
              className={productType === 'bicycle' ? 'active' : ''}
              onClick={() => setProductType('bicycle')}
              disabled={isEditMode}
            >
              Bicycle
            </button>
            <button 
              className={productType === 'part' ? 'active' : ''}
              onClick={() => setProductType('part')}
              disabled={isEditMode}
            >
              Part
            </button>
            <button 
              className={productType === 'accessory' ? 'active' : ''}
              onClick={() => setProductType('accessory')}
              disabled={isEditMode}
            >
              Accessory
            </button>
            <button 
              className={productType === 'clothing' ? 'active' : ''}
              onClick={() => setProductType('clothing')}
              disabled={isEditMode}
            >
              Clothing
            </button>
          </div>

          {/* Product Form */}
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                />
                {errors.name && <span className="error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Brand *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Enter brand name"
                />
                {errors.brand && <span className="error">{errors.brand}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows="3"
              />
              {errors.description && <span className="error">{errors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (₱) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.price && <span className="error">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
                {errors.stock && <span className="error">{errors.stock}</span>}
              </div>
            </div>

            {/* Bicycle specific fields */}
            {productType === 'bicycle' && (
              <div className="form-group">
                <label>Select Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ padding: '8px' }}
                  required={!isEditMode}
                />
                {errors.image && <span className="error">{errors.image}</span>}
              </div>
            )}

            {/* Parts specific fields */}
            {productType === 'part' && (
              <div className="form-group">
                <label>Select Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ padding: '8px' }}
                  required={!isEditMode}
                />
                {errors.image && <span className="error">{errors.image}</span>}
              </div>
            )}

            {/* Accessories specific fields */}
            {productType === 'accessory' && (
              <div className="form-group">
                <label>Select Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ padding: '8px' }}
                  required={!isEditMode}
                />
                {errors.image && <span className="error">{errors.image}</span>}
              </div>
            )}

            {/* Clothing specific fields */}
            {productType === 'clothing' && (
              <div className="form-group">
                <label>Select Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ padding: '8px' }}
                  required={!isEditMode}
                />
                {errors.image && <span className="error">{errors.image}</span>}
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/admin/products')}>
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                {isEditMode ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
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

export default AdminProductsPage;
