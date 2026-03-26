import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import './HomePage.css';

const API_BASE = 'http://localhost:8080';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const BANNERS = [
  {
    id: 1,
    title: 'Mua Sắm Thả Ga',
    subtitle: 'Hàng ngàn sản phẩm chất lượng cao với giá tốt nhất',
    cta: 'Khám phá ngay',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '🛍️',
  },
  {
    id: 2,
    title: 'Giao Hàng Miễn Phí',
    subtitle: 'Miễn phí giao hàng cho đơn hàng từ 500.000đ',
    cta: 'Mua ngay',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: '🚚',
  },
  {
    id: 3,
    title: 'Ưu Đãi Đặc Biệt',
    subtitle: 'Giảm giá đến 50% cho sản phẩm nổi bật',
    cta: 'Xem khuyến mãi',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: '🎁',
  },
];

const ProductSection = ({ title, products, onBuyNow, loading }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  if (loading) {
    return (
      <div className="hp-section">
        <h2 className="hp-section-title">{title}</h2>
        <div className="hp-skeleton-row">
          {[1,2,3,4].map(i => <div key={i} className="hp-skeleton-card" />)}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <div className="hp-section">
      <h2 className="hp-section-title">{title}</h2>
      <div className="hp-products-row">
        {products.slice(0, 8).map(product => (
          <div key={product.id} className="hp-product-card-wrapper" onClick={() => setSelectedProduct(product)}>
            <ProductCard product={product} onBuyNow={onBuyNow} />
          </div>
        ))}
      </div>
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuyNow={onBuyNow}
        />
      )}
    </div>
  );
};

const HomePage = ({ onBuyNow, selectedCategoryId, searchQuery }) => {
  const [bannerIdx, setBannerIdx] = useState(0);
  const [featured, setFeatured] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [newest, setNewest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/products/featured`).then(r => r.json()),
      fetch(`${API_BASE}/api/products/bestsellers`).then(r => r.json()),
      fetch(`${API_BASE}/api/products/newest`).then(r => r.json()),
    ])
      .then(([f, b, n]) => { setFeatured(f); setBestsellers(b); setNewest(n); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Auto-advance banner
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIdx(i => (i + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const banner = BANNERS[bannerIdx];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <div className="hero-banner" style={{ background: banner.gradient }}>
        <div className="hero-content">
          <div className="hero-icon">{banner.icon}</div>
          <h1 className="hero-title">{banner.title}</h1>
          <p className="hero-subtitle">{banner.subtitle}</p>
          <button className="hero-cta" onClick={onBuyNow}>{banner.cta}</button>
        </div>
        <div className="hero-indicators">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === bannerIdx ? 'active' : ''}`}
              onClick={() => setBannerIdx(i)}
            />
          ))}
        </div>
      </div>

      {/* Feature strips */}
      <div className="feature-strip">
        {[
          { icon: '🚚', title: 'Miễn phí giao hàng', desc: 'Đơn từ 500K' },
          { icon: '🔄', title: 'Đổi trả dễ dàng', desc: '7 ngày đổi trả' },
          { icon: '🔒', title: 'Thanh toán an toàn', desc: '100% bảo mật' },
          { icon: '🎧', title: 'Hỗ trợ 24/7', desc: 'Luôn sẵn sàng' },
        ].map((f, i) => (
          <div className="feature-item" key={i}>
            <span className="feature-icon">{f.icon}</span>
            <div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Product sections */}
      <div className="home-sections">
        <ProductSection
          title="⭐ Sản phẩm nổi bật"
          products={featured}
          onBuyNow={onBuyNow}
          loading={loading}
        />
        <ProductSection
          title="🔥 Bán chạy nhất"
          products={bestsellers}
          onBuyNow={onBuyNow}
          loading={loading}
        />
        <ProductSection
          title="🆕 Mới nhất"
          products={newest}
          onBuyNow={onBuyNow}
          loading={loading}
        />

        {featured.length === 0 && bestsellers.length === 0 && !loading && (
          <div className="hp-no-featured">
            <p>💡 Hãy vào <strong>Admin → Sản phẩm</strong> để đánh dấu sản phẩm nổi bật hoặc bán chạy!</p>
          </div>
        )}
      </div>

      {/* Newsletter */}
      <div className="newsletter-section">
        <div className="newsletter-content">
          <h2>📧 Đăng ký nhận tin</h2>
          <p>Nhận ngay ưu đãi độc quyền và thông tin sản phẩm mới nhất</p>
          {subscribed ? (
            <div className="newsletter-success">🎉 Cảm ơn bạn đã đăng ký!</div>
          ) : (
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button type="submit">Đăng ký</button>
            </form>
          )}
        </div>
      </div>

      {/* Customer reviews */}
      <div className="reviews-section">
        <h2 className="hp-section-title">💬 Khách hàng nói gì</h2>
        <div className="reviews-grid">
          {[
            { name: 'Nguyễn Thị Lan', rating: 5, text: 'Sản phẩm chất lượng tốt, giao hàng nhanh. Rất hài lòng!', avatar: '👩' },
            { name: 'Trần Văn Minh', rating: 5, text: 'Giá cả hợp lý, mẫu mã đẹp. Sẽ ủng hộ lần sau!', avatar: '👨' },
            { name: 'Lê Thị Hoa', rating: 4, text: 'Shop tư vấn nhiệt tình, hàng đúng như mô tả.', avatar: '👩‍💼' },
          ].map((review, i) => (
            <div className="review-card" key={i}>
              <div className="review-header">
                <span className="review-avatar">{review.avatar}</span>
                <div>
                  <div className="review-name">{review.name}</div>
                  <div className="review-stars">{'⭐'.repeat(review.rating)}</div>
                </div>
              </div>
              <p className="review-text">"{review.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
