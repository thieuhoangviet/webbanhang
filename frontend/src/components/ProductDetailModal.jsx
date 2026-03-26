import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import ProductReviews from './ProductReviews';
import './ProductDetailModal.css';

const BACKEND_URL = 'http://localhost:8080';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
};

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return BACKEND_URL + url;
};

const ProductDetailModal = ({ product, onClose, onBuyNow }) => {
  const { addToCart, loading } = useCart();

  const allImages = product.images && product.images.length > 0
    ? product.images.map(img => img.imageUrl)
    : product.imageUrl ? [product.imageUrl] : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [qty, setQty] = useState(1);

  const activeImage = allImages[activeIndex] ? getImageUrl(allImages[activeIndex]) : null;
  const maxQty = product.quantity || 0;

  const handleQtyChange = (delta) => {
    setQty(prev => Math.min(maxQty, Math.max(1, prev + delta)));
  };

  const handleAddToCart = async () => {
    await addToCart(product, qty);
    onClose();
  };

  const handleBuyNow = async () => {
    await addToCart(product, qty);
    onClose();
    onBuyNow(); // Điều hướng sang trang thanh toán
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-body">
          {/* LEFT: Image gallery */}
          <div className="modal-gallery">
            <div
              className="modal-main-image"
              onClick={() => activeImage && setZoom(true)}
              title={activeImage ? 'Click để zoom' : ''}
            >
              {activeImage ? (
                <img src={activeImage} alt={product.name} />
              ) : (
                <div className="modal-image-placeholder">🛒</div>
              )}
              {activeImage && <span className="zoom-hint">🔍 Zoom</span>}
            </div>

            {allImages.length > 1 && (
              <div className="modal-thumbnails">
                {allImages.map((url, idx) => (
                  <div
                    key={idx}
                    className={`modal-thumb ${idx === activeIndex ? 'active' : ''}`}
                    onClick={() => setActiveIndex(idx)}
                  >
                    <img src={getImageUrl(url)} alt={`Ảnh ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product info */}
          <div className="modal-info">
            <h2 className="modal-product-name">{product.name}</h2>

            {product.category && (
              <span className="modal-category">{product.category.name}</span>
            )}

            <div className="modal-price">{formatPrice(product.price)}</div>

            <div className="modal-stock">
              <span className={product.quantity === 0 ? 'out-of-stock' : 'in-stock'}>
                {product.quantity === 0 ? '❌ Hết hàng' : `✅ Còn ${product.quantity} sản phẩm`}
              </span>
            </div>

            {product.description && (
              <div className="modal-description">
                <h4>Mô tả sản phẩm</h4>
                <p>{product.description}</p>
              </div>
            )}

            <div className="modal-meta">
              <div className="modal-meta-row">
                <span className="meta-label">Ngày thêm</span>
                <span className="meta-value">{formatDate(product.createdAt)}</span>
              </div>
              <div className="modal-meta-row">
                <span className="meta-label">Cập nhật</span>
                <span className="meta-value">{formatDate(product.updatedAt)}</span>
              </div>
              <div className="modal-meta-row">
                <span className="meta-label">Mã SP</span>
                <span className="meta-value">#{product.id}</span>
              </div>
            </div>

            {/* Quantity selector */}
            {maxQty > 0 && (
              <div className="modal-qty-row">
                <span className="modal-qty-label">Số lượng</span>
                <div className="modal-qty-control">
                  <button
                    className="modal-qty-btn"
                    onClick={() => handleQtyChange(-1)}
                    disabled={qty <= 1}
                  >−</button>
                  <span className="modal-qty-value">{qty}</span>
                  <button
                    className="modal-qty-btn"
                    onClick={() => handleQtyChange(1)}
                    disabled={qty >= maxQty}
                  >+</button>
                </div>
                <span className="modal-qty-subtotal">
                  = {formatPrice(product.price * qty)}
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="modal-actions">
              <button
                className="modal-add-to-cart"
                onClick={handleAddToCart}
                disabled={maxQty === 0 || loading}
              >
                🛒 {maxQty === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
              </button>
              <button
                className="modal-buy-now"
                onClick={handleBuyNow}
                disabled={maxQty === 0 || loading}
              >
                ⚡ Mua ngay
              </button>
            </div>

            {/* Reviews */}
            <ProductReviews productId={product.id} />
          </div>
        </div>
      </div>

      {/* Lightbox zoom */}
      {zoom && activeImage && (
        <div className="lightbox" onClick={() => setZoom(false)}>
          <img src={activeImage} alt={product.name} />
          <button className="lightbox-close">✕</button>
        </div>
      )}
    </div>
  );
};

export default ProductDetailModal;
