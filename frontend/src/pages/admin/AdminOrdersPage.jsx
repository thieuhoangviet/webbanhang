import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminCommon.css';

const API_BASE = 'http://localhost:8080';
const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const STATUS_LABELS = {
  PENDING: '⏳ Chờ xác nhận',
  CONFIRMED: '✅ Đã xác nhận',
  SHIPPING: '🚚 Đang giao',
  DELIVERED: '🎉 Đã giao',
  CANCELLED: '❌ Đã hủy',
};

const AdminOrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/orders/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [token]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    const res = await fetch(`${API_BASE}/api/orders/admin/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === id ? updated : o));
      if (selectedOrder?.id === id) setSelectedOrder(updated);
    }
    setUpdatingId(null);
  };

  if (loading) return <div className="admin-loading">Đang tải...</div>;

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">🛒 Quản lý đơn hàng</h1>
      <div className="orders-split">
        <div className="admin-card">
          <table className="admin-table clickable-rows">
            <thead>
              <tr><th>Mã</th><th>Người nhận</th><th>Tổng tiền</th><th>T.Toán</th><th>Trạng thái</th><th>Ngày đặt</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}
                  className={selectedOrder?.id === o.id ? 'selected-row' : ''}
                  onClick={() => setSelectedOrder(o)}>
                  <td>#{o.id}</td>
                  <td>{o.receiverName}</td>
                  <td>{formatPrice(o.totalAmount)}</td>
                  <td>{o.paymentMethod}</td>
                  <td><span className="status-pill">{o.status}</span></td>
                  <td>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedOrder && (
          <div className="admin-card order-detail-panel">
            <h3>Chi tiết đơn #{selectedOrder.id}</h3>
            <p><strong>Người nhận:</strong> {selectedOrder.receiverName}</p>
            <p><strong>SĐT:</strong> {selectedOrder.receiverPhone}</p>
            <p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}</p>
            <p><strong>Ghi chú:</strong> {selectedOrder.note || '—'}</p>
            <p><strong>Tổng:</strong> {formatPrice(selectedOrder.totalAmount)}</p>

            <div className="order-items-mini">
              {selectedOrder.items?.map(item => (
                <div key={item.id} className="order-item-mini">
                  <span>{item.product?.name}</span>
                  <span>×{item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="status-update">
              <label><strong>Cập nhật trạng thái:</strong></label>
              <div className="status-buttons">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <button key={key}
                    className={`status-btn ${selectedOrder.status === key ? 'active' : ''}`}
                    onClick={() => updateStatus(selectedOrder.id, key)}
                    disabled={updatingId === selectedOrder.id}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
