import React, { useState } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import CategoryFilter from './components/CategoryFilter';
import ProductList from './components/ProductList';
import CartDrawer from './components/CartDrawer';
import CheckoutPage from './components/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

const AppContent = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(inputValue);
    setSelectedCategoryId(null);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSearchQuery('');
    setInputValue('');
  };

  const goToCheckout = () => {
    setIsCartOpen(false);
    setCurrentPage('checkout');
  };

  const goToHome = () => setCurrentPage('home');
  const openCart = () => { setCurrentPage('home'); setIsCartOpen(true); };

  // Page routing
  if (currentPage === 'checkout') {
    return <CheckoutPage onContinueShopping={goToHome} onBackToCart={openCart} />;
  }
  if (currentPage === 'login') {
    return <LoginPage onNavigate={setCurrentPage} />;
  }
  if (currentPage === 'register') {
    return <RegisterPage onNavigate={setCurrentPage} />;
  }
  if (currentPage === 'profile') {
    return <ProfilePage onNavigate={setCurrentPage} />;
  }

  // Home page
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand" onClick={goToHome} style={{ cursor: 'pointer' }}>
          <span className="header-icon">🛍️</span>
          <h1>Web Bán Hàng</h1>
        </div>
        <div className="header-right">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm sản phẩm..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="search-btn">🔍</button>
          </form>

          {/* Auth nav */}
          <div className="header-auth">
            {user ? (
              <div className="user-menu">
                <button className="user-btn" onClick={() => setCurrentPage('profile')}>
                  👤 {user.fullName?.split(' ').pop()}
                </button>
                <button className="logout-btn-header" onClick={() => { logout(); goToHome(); }}>
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="auth-btns">
                <button className="login-btn-header" onClick={() => setCurrentPage('login')}>
                  Đăng nhập
                </button>
                <button className="register-btn-header" onClick={() => setCurrentPage('register')}>
                  Đăng ký
                </button>
              </div>
            )}
          </div>

          <div
            className="cart-icon-wrapper"
            onClick={() => setIsCartOpen(true)}
            title="Giỏ hàng"
          >
            <span className="cart-icon">🛒</span>
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <CategoryFilter
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleCategorySelect}
        />
        <ProductList
          selectedCategoryId={selectedCategoryId}
          searchQuery={searchQuery}
          onBuyNow={goToCheckout}
        />
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={goToCheckout}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
