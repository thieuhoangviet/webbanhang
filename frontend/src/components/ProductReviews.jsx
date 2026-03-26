import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './ProductReviews.css';

const API_BASE = 'http://localhost:8080';

const StarRating = ({ rating, interactive = false, onRate }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`star ${star <= (interactive ? (hovered || rating) : rating) ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate && onRate(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '';

const ProductReviews = ({ productId }) => {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ rating: 0, comment: '', reviewerName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/reviews/product/${productId}`)
      .then(r => r.json())
      .then(setReviews)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) { setError('Vui lòng chọn số sao!'); return; }
    setSubmitting(true);
    setError('');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/reviews/product/${productId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          rating: form.rating,
          comment: form.comment,
          reviewerName: user ? user.fullName : form.reviewerName,
        }),
      });

      if (res.ok) {
        const newReview = await res.json();
        setReviews(prev => [newReview, ...prev]);
        setForm({ rating: 0, comment: '', reviewerName: '' });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Có lỗi xảy ra!');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="reviews-loading">Đang tải đánh giá...</div>;

  return (
    <div className="product-reviews">
      <div className="reviews-header">
        <h3>💬 Đánh giá sản phẩm</h3>
        {reviews.length > 0 && (
          <div className="reviews-summary">
            <span className="avg-rating">{avgRating}</span>
            <StarRating rating={Math.round(Number(avgRating))} />
            <span className="review-count">({reviews.length} đánh giá)</span>
          </div>
        )}
      </div>

      {/* Write review form */}
      <div className="write-review">
        <h4>Viết đánh giá của bạn</h4>
        {submitted && <div className="review-success">🎉 Cảm ơn bạn đã đánh giá!</div>}
        {error && <div className="review-error">{error}</div>}
        <form onSubmit={handleSubmit} className="review-form">
          <div className="review-field">
            <label>Đánh giá *</label>
            <StarRating rating={form.rating} interactive onRate={(s) => setForm({ ...form, rating: s })} />
          </div>

          {!user && (
            <div className="review-field">
              <label>Tên của bạn</label>
              <input type="text" placeholder="Nguyễn Văn A"
                value={form.reviewerName}
                onChange={e => setForm({ ...form, reviewerName: e.target.value })} />
            </div>
          )}

          <div className="review-field">
            <label>Nhận xét</label>
            <textarea rows={3} placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })} />
          </div>

          <button type="submit" className="review-submit-btn" disabled={submitting}>
            {submitting ? '⌛ Đang gửi...' : '📝 Gửi đánh giá'}
          </button>
        </form>
      </div>

      {/* Reviews list */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="no-reviews">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
        ) : (
          reviews.map(review => (
            <div className="review-item" key={review.id}>
              <div className="review-item-header">
                <span className="reviewer-name">👤 {review.reviewerName || 'Khách'}</span>
                <StarRating rating={review.rating} />
                <span className="review-date">{formatDate(review.createdAt)}</span>
              </div>
              {review.comment && <p className="review-comment">{review.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
