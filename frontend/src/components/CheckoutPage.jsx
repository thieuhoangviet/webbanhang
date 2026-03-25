import React from 'react';
import { useCart } from '../context/CartContext';
import './CheckoutPage.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const CheckoutPage = ({ onContinueShopping, onBackToCart }) => {
  const { cartItems, totalItems } = useCart();

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  );

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <button className="checkout-back-btn" onClick={onBackToCart}>
            ← Quay lại giỏ hàng
          </button>
          <h1 className="checkout-title">🧾 Xác nhận đơn hàng</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="checkout-empty">
            <span>🛍️</span>
            <p>Giỏ hàng trống. Hãy thêm sản phẩm trước!</p>
            <button className="continue-btn" onClick={onContinueShopping}>
              ← Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            {/* Order table */}
            <div className="checkout-card">
              <h2 className="checkout-section-title">Sản phẩm đặt mua</h2>
              <table className="checkout-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Sản phẩm</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="td-stt">{index + 1}</td>
                      <td className="td-name">{item.product.name}</td>
                      <td className="td-price">{formatPrice(item.product.price)}</td>
                      <td className="td-qty">{item.quantity}</td>
                      <td className="td-total">{formatPrice(item.product.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="checkout-summary-card">
              <div className="summary-row">
                <span>Tổng sản phẩm:</span>
                <span>{totalItems} sản phẩm</span>
              </div>
              <div className="summary-row total-row">
                <span>Tổng thanh toán:</span>
                <span className="summary-total">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="checkout-actions">
              <button className="continue-btn" onClick={onContinueShopping}>
                🛍️ Tiếp tục mua sắm
              </button>
              <button className="pay-btn">
                💳 Xác nhận thanh toán
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
