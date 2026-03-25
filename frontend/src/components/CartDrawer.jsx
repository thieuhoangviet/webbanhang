import React from 'react';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const CartDrawer = ({ isOpen, onClose, onCheckout }) => {
  const { cartItems, updateItem, removeItem, totalItems, loading } = useCart();

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleQuantityChange = (itemId, newQty) => {
    if (newQty < 1) {
      removeItem(itemId);
    } else {
      updateItem(itemId, newQty);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="cart-drawer-header">
          <h2>🛒 Giỏ hàng <span className="cart-count">({totalItems})</span></h2>
          <button className="cart-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <span>🛍️</span>
              <p>Giỏ hàng trống</p>
            </div>
          ) : (
            <table className="cart-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Sản phẩm</th>
                  <th>Đơn giá</th>
                  <th>Số lượng</th>
                  <th>Thành tiền</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="cart-stt">{index + 1}</td>
                    <td className="cart-product-name">{item.product.name}</td>
                    <td className="cart-unit-price">{formatPrice(item.product.price)}</td>
                    <td className="cart-qty">
                      <div className="qty-control">
                        <button
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={loading}
                        >−</button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={loading || item.quantity >= item.product.quantity}
                          title={item.quantity >= item.product.quantity ? 'Đã đạt tối đa tồn kho' : ''}
                        >+</button>
                      </div>
                    </td>
                    <td className="cart-subtotal">
                      {formatPrice(item.product.price * item.quantity)}
                    </td>
                    <td>
                      <button
                        className="cart-remove-btn"
                        onClick={() => removeItem(item.id)}
                        title="Xóa"
                      >🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total">
              <span>Tổng cộng:</span>
              <span className="cart-total-price">{formatPrice(totalPrice)}</span>
            </div>
            <button className="checkout-btn" onClick={onCheckout}>
              💳 Thanh toán
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
