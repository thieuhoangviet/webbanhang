import React, { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './WishlistPage.css';

const API_BASE = 'http://localhost:8080';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const getThumbnail = (product) => {
  const url = product.images?.[0]?.imageUrl || product.imageUrl;
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
};

const WishlistPage = ({ onNavigate, onBuyNow }) => {
  const { wishlist, removeFromWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <button className="wishlist-back" onClick={() => onNavigate('home')}>← Trang chủ</button>
            <h1>❤️ Sản phẩm yêu thích</h1>
          </div>
          <div className="wishlist-empty">
            <span>🤍</span>
            <p>Bạn chưa có sản phẩm yêu thích nào.</p>
            <button className="wishlist-shop-btn" onClick={() => onNavigate('home')}>
              🛍️ Khám phá sản phẩm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <button className="wishlist-back" onClick={() => onNavigate('home')}>← Tiếp tục mua sắm</button>
          <h1>❤️ Sản phẩm yêu thích ({wishlist.length})</h1>
        </div>

        <div className="wishlist-grid">
          {wishlist.map(product => {
            const thumbnail = getThumbnail(product);
            return (
              <div className="wishlist-card" key={product.id}>
                <div className="wishlist-card-img">
                  {thumbnail ? (
                    <img src={thumbnail} alt={product.name} />
                  ) : (
                    <div className="wishlist-img-placeholder">🛍️</div>
                  )}
                  <button
                    className="wishlist-remove-btn"
                    onClick={() => removeFromWishlist(product.id)}
                    title="Bỏ yêu thích"
                  >
                    ❤️
                  </button>
                </div>
                <div className="wishlist-card-info">
                  <h3>{product.name}</h3>
                  <div className="wishlist-price">
                    <span className="wp-sale">{formatPrice(product.salePrice || product.price)}</span>
                    {product.salePrice && (
                      <span className="wp-original">{formatPrice(product.price)}</span>
                    )}
                  </div>
                  <div className="wishlist-card-actions">
                    <button
                      className="wl-add-cart-btn"
                      onClick={() => addToCart(product)}
                      disabled={product.quantity === 0}
                    >
                      🛒 {product.quantity === 0 ? 'Hết hàng' : 'Thêm giỏ hàng'}
                    </button>
                    <button
                      className="wl-buy-btn"
                      onClick={() => { addToCart(product, 1); onBuyNow(); }}
                      disabled={product.quantity === 0}
                    >
                      ⚡ Mua ngay
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
