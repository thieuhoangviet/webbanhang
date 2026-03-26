import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminCommon.css';

const API_BASE = 'http://localhost:8080';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const AdminDashboardHome = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({ orders: [], products: [], revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/orders/admin/all`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/api/products`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([orders, products]) => {
        const revenue = orders
          .filter(o => o.status !== 'CANCELLED')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        setStats({ orders, products, revenue });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const pendingOrders = stats.orders.filter(o => o.status === 'PENDING').length;
  const lowStock = stats.products.filter(p => p.quantity <= 5).length;

  const statusCounts = stats.orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <div className="admin-loading">Đang tải dữ liệu...</div>;

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">📊 Dashboard Tổng quan</h1>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{formatPrice(stats.revenue)}</div>
          <div className="stat-label">Doanh thu (đã giao)</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.orders.length}</div>
          <div className="stat-label">Tổng đơn hàng</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{pendingOrders}</div>
          <div className="stat-label">Đơn chờ xử lý</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{stats.products.length}</div>
          <div className="stat-label">Tổng sản phẩm</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">⚠️</div>
          <div className="stat-value">{lowStock}</div>
          <div className="stat-label">Sắp hết hàng (≤5)</div>
        </div>
      </div>

      <div className="admin-section-row">
        {/* Order status breakdown */}
        <div className="admin-card">
          <h2 className="admin-card-title">Trạng thái đơn hàng</h2>
          {[
            { key: 'PENDING', label: '⏳ Chờ xác nhận', color: '#f59e0b' },
            { key: 'CONFIRMED', label: '✅ Đã xác nhận', color: '#3b82f6' },
            { key: 'SHIPPING', label: '🚚 Đang giao', color: '#8b5cf6' },
            { key: 'DELIVERED', label: '🎉 Đã giao', color: '#10b981' },
            { key: 'CANCELLED', label: '❌ Đã hủy', color: '#ef4444' },
          ].map(({ key, label, color }) => (
            <div className="status-row" key={key}>
              <span>{label}</span>
              <span className="status-count" style={{ color }}>{statusCounts[key] || 0}</span>
            </div>
          ))}
        </div>

        {/* Latest orders */}
        <div className="admin-card flex-2">
          <h2 className="admin-card-title">5 Đơn hàng gần nhất</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã ĐH</th>
                <th>Người nhận</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {stats.orders.slice(0, 5).map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.receiverName}</td>
                  <td>{formatPrice(o.totalAmount)}</td>
                  <td><span className="status-pill">{o.status}</span></td>
                  <td>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low stock products */}
      {lowStock > 0 && (
        <div className="admin-card">
          <h2 className="admin-card-title">⚠️ Sản phẩm sắp hết hàng</h2>
          <table className="admin-table">
            <thead>
              <tr><th>Sản phẩm</th><th>Giá</th><th>Tồn kho</th></tr>
            </thead>
            <tbody>
              {stats.products.filter(p => p.quantity <= 5).map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td><span style={{ color: p.quantity === 0 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>{p.quantity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardHome;
