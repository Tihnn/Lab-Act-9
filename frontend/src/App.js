import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminMyProductsPage from './pages/AdminMyProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import ProfilePage from './pages/ProfilePage';
import MyPurchasePage from './pages/MyPurchasePage';

// Component to handle admin home redirect
function AdminHomeRedirect() {
  const [isChecking, setIsChecking] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const userStr = localStorage.getItem('bikeshop_current_user_v1');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.isAdmin) {
          setIsAdmin(true);
        }
      } catch (e) {
        // ignore
      }
    }
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return null; // or a loading spinner
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <LandingPage />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<AdminHomeRedirect />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/products" element={<AdminMyProductsPage />} />
        <Route path="/admin/add-product" element={<AdminProductsPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-purchase" element={<MyPurchasePage />} />
      </Routes>
    </Router>
  );
}

export default App;
