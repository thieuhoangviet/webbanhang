import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CheckoutPage.css';

const API_BASE = 'http://localhost:8080';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const PAYMENT_METHODS = [
  { key: 'COD', label: '🚚 Thanh toán khi nhận hàng (COD)', desc: 'Trả tiền mặt khi nhận hàng' },
  { key: 'BANK_TRANSFER', label: '🏦 Chuyển khoản ngân hàng', desc: 'Chuyển khoản trước khi giao' },
  { key: 'MOMO', label: '💜 Ví MoMo', desc: 'Thanh toán qua MoMo' },
  { key: 'VNPAY', label: '💳 VNPay', desc: 'Cổng thanh toán VNPay' },
];

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  SHIPPING: '#8b5cf6',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
};

const STATUS_LABELS = {
  PENDING: '⏳ Chờ xác nhận',
  CONFIRMED: '✅ Đã xác nhận',
  SHIPPING: '🚚 Đang giao',
  DELIVERED: '🎉 Đã giao',
  CANCELLED: '❌ Đã hủy',
};

const CheckoutPage = ({ onContinueShopping, onBackToCart }) => {
  const { cartItems, totalItems, clearAllCart: clearCart } = useCart();
  const { user, token } = useAuth();

  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [form, setForm] = useState({
    receiverName: user?.fullName || '',
    receiverPhone: user?.phone || '',
    addressLine: '',
    ward: '',
    district: '',
    province: '',
    note: '',
  });

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  );

  const shippingFee = totalPrice >= 500000 ? 0 : 30000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.receiverName || !form.receiverPhone || !form.addressLine) {
      setError('Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }
    setLoading(true);
    setError('');

    const shippingAddress = [form.addressLine, form.ward, form.district, form.province]
      .filter(Boolean).join(', ');

    const orderPayload = {
      receiverName: form.receiverName,
      receiverPhone: form.receiverPhone,
      shippingAddress,
      note: form.note,
      paymentMethod,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đặt hàng thất bại!');

      setOrderId(data.id);
      clearCart();
      setStep('success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && step !== 'success') {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-empty">
            <span>🛍️</span>
            <p>Giỏ hàng trống. Hãy thêm sản phẩm trước!</p>
            <button className="continue-btn" onClick={onContinueShopping}>← Tiếp tục mua sắm</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="checkout-page">
        <div className="checkout-success">
          <div className="success-icon">🎉</div>
          <h2>Đặt hàng thành công!</h2>
          <p>Mã đơn hàng: <strong>#{orderId}</strong></p>
          <p>Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.</p>
          <div className="success-actions">
            <button className="pay-btn" onClick={onContinueShopping}>🛍️ Tiếp tục mua sắm</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="checkout-back-btn" onClick={onBackToCart}>← Quay lại giỏ hàng</button>
          <h1 className="checkout-title">🧾 Thanh toán</h1>
        </div>

        <div className="checkout-layout">
          {/* Left: shipping form */}
          <div className="checkout-form-col">
            <form onSubmit={handleSubmit}>
              <div className="checkout-card">
                <h2 className="checkout-section-title">📦 Thông tin giao hàng</h2>
                {!user && (
                  <div className="checkout-guest-note">
                    💡 <strong>Đặt hàng không cần đăng nhập</strong> – hoặc <a href="#login" onClick={(e) => { e.preventDefault(); onContinueShopping(); }}>đăng nhập</a> để quản lý đơn dễ hơn.
                  </div>
                )}
                <div className="form-grid">
                  <div className="form-field">
                    <label>Họ tên người nhận *</label>
                    <input type="text" value={form.receiverName}
                      onChange={(e) => setForm({ ...form, receiverName: e.target.value })}
                      placeholder="Nguyễn Văn A" required />
                  </div>
                  <div className="form-field">
                    <label>Số điện thoại *</label>
                    <input type="tel" value={form.receiverPhone}
                      onChange={(e) => setForm({ ...form, receiverPhone: e.target.value })}
                      placeholder="0912345678" required />
                  </div>
                  <div className="form-field full">
                    <label>Địa chỉ cụ thể *</label>
                    <input type="text" value={form.addressLine}
                      onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                      placeholder="Số nhà, tên đường" required />
                  </div>
                  <div className="form-field">
                    <label>Phường/Xã</label>
                    <input type="text" value={form.ward}
                      onChange={(e) => setForm({ ...form, ward: e.target.value })}
                      placeholder="Phường 1" />
                  </div>
                  <div className="form-field">
                    <label>Quận/Huyện</label>
                    <input type="text" value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      placeholder="Quận 1" />
                  </div>
                  <div className="form-field full">
                    <label>Tỉnh/Thành phố</label>
                    <input type="text" value={form.province}
                      onChange={(e) => setForm({ ...form, province: e.target.value })}
                      placeholder="TP. Hồ Chí Minh" />
                  </div>
                  <div className="form-field full">
                    <label>Ghi chú</label>
                    <textarea value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      placeholder="Ghi chú cho người giao hàng..." rows={2} />
                  </div>
                </div>
              </div>

              <div className="checkout-card">
                <h2 className="checkout-section-title">💳 Phương thức thanh toán</h2>
                <div className="payment-methods">
                  {PAYMENT_METHODS.map((pm) => (
                    <label key={pm.key}
                      className={`payment-option ${paymentMethod === pm.key ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value={pm.key}
                        checked={paymentMethod === pm.key}
                        onChange={() => setPaymentMethod(pm.key)} />
                      <span className="payment-label">{pm.label}</span>
                      <span className="payment-desc">{pm.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && <div className="checkout-error">{error}</div>}

              <button className="pay-btn" type="submit" disabled={loading}>
                {loading ? '⏳ Đang đặt hàng...' : '✅ Xác nhận đặt hàng'}
              </button>
            </form>
          </div>

          {/* Right: order summary */}
          <div className="checkout-summary-col">
            <div className="checkout-card">
              <h2 className="checkout-section-title">🛒 Đơn hàng ({totalItems} sản phẩm)</h2>
              <div className="order-items">
                {cartItems.map((item) => (
                  <div className="order-item-row" key={item.id}>
                    <div className="order-item-name">{item.product.name}</div>
                    <div className="order-item-qty">×{item.quantity}</div>
                    <div className="order-item-price">{formatPrice(item.product.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
              <div className="order-totals">
                <div className="totals-row">
                  <span>Tạm tính</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="totals-row">
                  <span>Phí vận chuyển</span>
                  <span>{shippingFee === 0 ? '🎁 Miễn phí' : formatPrice(shippingFee)}</span>
                </div>
                {shippingFee > 0 && (
                  <div className="shipping-note">Miễn phí ship cho đơn ≥ 500.000đ</div>
                )}
                <div className="totals-row grand-total">
                  <span>Tổng thanh toán</span>
                  <span>{formatPrice(totalPrice + shippingFee)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
