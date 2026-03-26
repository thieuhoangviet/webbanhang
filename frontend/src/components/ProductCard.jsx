import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductDetailModal from './ProductDetailModal';
import './ProductCard.css';

const BACKEND_URL = 'http://localhost:8080';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return BACKEND_URL + imageUrl;
};

// Lấy ảnh đầu tiên từ images array hoặc fallback sang imageUrl
const getThumbnail = (product) => {
  if (product.images && product.images.length > 0) {
    return getImageUrl(product.images[0].imageUrl);
  }
  return getImageUrl(product.imageUrl);
};

const ProductCard = ({ product, onBuyNow }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [showDetail, setShowDetail] = useState(false);

  const thumbnail = getThumbnail(product);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleBuyNow = async (e) => {
    e.stopPropagation();
    await addToCart(product, 1);
    if (onBuyNow) onBuyNow();
  };

  return (
    <>
      <div className="product-card" onClick={() => setShowDetail(true)}>
        <div className="product-image">
          {thumbnail ? (
            <img src={thumbnail} alt={product.name} />
          ) : (
            <div className="product-image-placeholder">
              <span>🛒</span>
            </div>
          )}
          {product.images && product.images.length > 1 && (
            <span className="image-count-badge">+{product.images.length - 1} ảnh</span>
          )}
          {product.salePrice && (
            <span className="sale-badge">SALE</span>
          )}
          <button
            className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
            title={isInWishlist(product.id) ? 'Bỏ yêu thích' : 'Yêu thích'}
          >
            {isInWishlist(product.id) ? '❤️' : '🤍'}
          </button>
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          {product.description && (
            <p className="product-description">{product.description}</p>
          )}
          <div className="product-meta">
            <div className="price-block">
              <span className="product-price">{formatPrice(product.salePrice || product.price)}</span>
              {product.salePrice && (
                <span className="original-price">{formatPrice(product.price)}</span>
              )}
            </div>
            <span className={`product-stock ${product.quantity === 0 ? 'out-of-stock' : ''}`}>
              {product.quantity === 0 ? 'Hết hàng' : `Còn ${product.quantity}`}
            </span>
          </div>
          <div className="card-actions">
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
            >
              {product.quantity === 0 ? 'Hết hàng' : '🛒 Thêm vào giỏ'}
            </button>
            <button
              className="buy-now-btn"
              onClick={handleBuyNow}
              disabled={product.quantity === 0}
            >
              ⚡ Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {showDetail && (
        <ProductDetailModal
          product={product}
          onClose={() => setShowDetail(false)}
          onBuyNow={onBuyNow}
        />
      )}
    </>
  );
};

export default ProductCard;
