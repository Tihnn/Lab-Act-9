import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const userInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'A';

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // validation errors are shown inline next to fields; do not show a modal/toast
      return;
    }

    try {
      const categoryKey = productType === 'bicycle' ? 'bicycles' : 
                         productType === 'part' ? 'parts' :
                         productType === 'accessory' ? 'accessories' : 'clothing';
      
      // Get existing products from localStorage
      const allProducts = JSON.parse(localStorage.getItem('bikeshop_products') || '{"bicycles":[],"parts":[],"accessories":[],"clothing":[]}');
      
      if (isEditMode && editProductId) {
        // Edit existing product
        const productIndex = allProducts[categoryKey].findIndex(p => p.id === editProductId);
        if (productIndex !== -1) {
          allProducts[categoryKey][productIndex] = {
            ...allProducts[categoryKey][productIndex],
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            brand: formData.brand,
            imageUrl: imagePreview || allProducts[categoryKey][productIndex].imageUrl
          };
          
          localStorage.setItem('bikeshop_products', JSON.stringify(allProducts));
          setToastType('success');
          setToastIcon('check');
          setToastTitle('Your product is successfully updated');
          setToastSubtitle('');
          setToastPosition('center');
        }
      } else {
        // Add new product
        const payload = {
          id: Date.now(), // Generate unique ID
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          brand: formData.brand,
          imageUrl: imagePreview || undefined
        };

    allProducts[categoryKey].push(payload);
    localStorage.setItem('bikeshop_products', JSON.stringify(allProducts));
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
      setErrors({});
      setIsEditMode(false);
      setEditProductId(null);
      
      // Redirect to products page after short delay
      setTimeout(() => {
        navigate('/products');
      }, 1000);
    } catch (error) {
      console.error('Error saving product:', error);
      setToastType('error');
      setToastIcon('error');
      setToastTitle('Failed to save product: ' + error.message);
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
          <div className="logo" onClick={() => navigate('/')}>PedalHub Admin</div>
          <nav className="nav-links">
            <button onClick={() => navigate('/')}>HOME</button>
            <button onClick={() => navigate('/products')}>PRODUCTS</button>
            <button className="active">{isEditMode ? 'EDIT PRODUCT' : 'ADD PRODUCT'}</button>
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
                />
                {imagePreview && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Parts specific fields */}
            {productType === 'part' && (
              <div className="form-group">
                <label>Select Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ padding: '8px' }}
                />
                {imagePreview && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Accessories specific fields */}
            {productType === 'accessory' && (
              <div className="form-group">
                <label>Select Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ padding: '8px' }}
                />
                {imagePreview && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Clothing specific fields */}
            {productType === 'clothing' && (
              <div className="form-group">
                <label>Select Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ padding: '8px' }}
                />
                {imagePreview && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/products')}>
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
