import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './OrdersPage.css';

const API_BASE = 'http://localhost:8080';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
};

const STATUS_LABELS = {
  PENDING: '⏳ Chờ xác nhận',
  CONFIRMED: '✅ Đã xác nhận',
  SHIPPING: '🚚 Đang giao',
  DELIVERED: '🎉 Đã giao',
  CANCELLED: '❌ Đã hủy',
};

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  SHIPPING: '#8b5cf6',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
};

const PAYMENT_LABELS = {
  COD: '🚚 COD',
  BANK_TRANSFER: '🏦 Chuyển khoản',
  MOMO: '💜 MoMo',
  VNPAY: '💳 VNPay',
  PAYPAL: '🔵 PayPal',
  STRIPE: '💙 Stripe',
};

const OrdersPage = ({ onNavigate }) => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/orders/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    setCancelingId(orderId);
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data : o)));
        if (selectedOrder?.id === orderId) setSelectedOrder(data);
        setMessage('Đã hủy đơn hàng thành công!');
        setTimeout(() => setMessage(''), 3000);
      }
    } finally {
      setCancelingId(null);
    }
  };

  if (!token) {
    return (
      <div className="orders-page">
        <div className="orders-login-required">
          <span>🔒</span>
          <p>Vui lòng đăng nhập để xem lịch sử đơn hàng.</p>
          <button className="orders-login-btn" onClick={() => onNavigate('login')}>
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <button className="orders-back-btn" onClick={() => onNavigate('home')}>← Trang chủ</button>
          <h1>📋 Lịch sử đơn hàng</h1>
        </div>

        {message && <div className="orders-message success">{message}</div>}

        {loading ? (
          <div className="orders-loading">Đang tải đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <span>🛍️</span>
            <p>Bạn chưa có đơn hàng nào.</p>
            <button className="orders-login-btn" onClick={() => onNavigate('home')}>Mua sắm ngay</button>
          </div>
        ) : (
          <div className="orders-layout">
            {/* List */}
            <div className="orders-list">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="order-card-top">
                    <span className="order-id">Đơn #{order.id}</span>
                    <span className="order-status" style={{ color: STATUS_COLORS[order.status] }}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <div className="order-card-info">
                    <span>{formatDate(order.createdAt)}</span>
                    <span className="order-total">{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="order-card-items">
                    {order.items?.length} sản phẩm • {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                  </div>
                </div>
              ))}
            </div>

            {/* Detail */}
            {selectedOrder && (
              <div className="order-detail">
                <div className="order-detail-header">
                  <h2>Chi tiết đơn #{selectedOrder.id}</h2>
                  <span className="order-status-badge" style={{ background: STATUS_COLORS[selectedOrder.status] + '20', color: STATUS_COLORS[selectedOrder.status] }}>
                    {STATUS_LABELS[selectedOrder.status]}
                  </span>
                </div>

                <div className="order-detail-section">
                  <h3>📦 Thông tin giao hàng</h3>
                  <p><strong>Người nhận:</strong> {selectedOrder.receiverName}</p>
                  <p><strong>Điện thoại:</strong> {selectedOrder.receiverPhone}</p>
                  <p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}</p>
                  {selectedOrder.note && <p><strong>Ghi chú:</strong> {selectedOrder.note}</p>}
                  <p><strong>Thanh toán:</strong> {PAYMENT_LABELS[selectedOrder.paymentMethod]}</p>
                  {selectedOrder.trackingCode && (
                    <p><strong>Mã vận đơn:</strong> {selectedOrder.trackingCode}</p>
                  )}
                </div>

                <div className="order-detail-section">
                  <h3>🛒 Sản phẩm</h3>
                  <table className="order-items-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Đơn giá</th>
                        <th>SL</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id}>
                          <td>{item.product?.name}</td>
                          <td>{formatPrice(item.price)}</td>
                          <td>{item.quantity}</td>
                          <td>{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="order-detail-total">
                  <span>Tổng thanh toán</span>
                  <span className="order-grand-total">{formatPrice(selectedOrder.totalAmount)}</span>
                </div>

                {selectedOrder.status === 'PENDING' && (
                  <button
                    className="order-cancel-btn"
                    onClick={() => handleCancel(selectedOrder.id)}
                    disabled={cancelingId === selectedOrder.id}
                  >
                    {cancelingId === selectedOrder.id ? 'Đang hủy...' : '❌ Hủy đơn hàng'}
                  </button>
                )}

                <p className="order-created-at">Đặt lúc: {formatDate(selectedOrder.createdAt)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
