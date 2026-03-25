import React, { useState } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import CategoryFilter from './components/CategoryFilter';
import ProductList from './components/ProductList';
import CartDrawer from './components/CartDrawer';
import CheckoutPage from './components/CheckoutPage';
import './App.css';

const AppContent = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'checkout'
  const { totalItems } = useCart();

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

  const goToHome = () => {
    setCurrentPage('home');
    // Không xóa giỏ hàng
  };

  const openCart = () => {
    setCurrentPage('home');
    setIsCartOpen(true);
  };

  // Trang thanh toán
  if (currentPage === 'checkout') {
    return (
      <CheckoutPage
        onContinueShopping={goToHome}
        onBackToCart={openCart}
      />
    );
  }

  // Trang chủ
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
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
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;
