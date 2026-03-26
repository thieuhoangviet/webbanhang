import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminProductsPage from './AdminProductsPage';
import AdminCategoriesPage from './AdminCategoriesPage';
import AdminOrdersPage from './AdminOrdersPage';
import AdminDashboardHome from './AdminDashboardHome';
import './AdminLayout.css';

const AdminLayout = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="admin-forbidden">
        <h2>🚫 Không có quyền truy cập</h2>
        <p>Trang này chỉ dành cho Admin.</p>
        <button onClick={() => onNavigate('home')}>← Về trang chủ</button>
      </div>
    );
  }

  const tabs = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'products', icon: '📦', label: 'Sản phẩm' },
    { key: 'categories', icon: '🏷️', label: 'Danh mục' },
    { key: 'orders', icon: '🛒', label: 'Đơn hàng' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboardHome />;
      case 'products': return <AdminProductsPage />;
      case 'categories': return <AdminCategoriesPage />;
      case 'orders': return <AdminOrdersPage />;
      default: return <AdminDashboardHome />;
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>⚙️</span>
          <span>Admin Panel</span>
        </div>
        <nav className="admin-nav">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`admin-nav-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="admin-nav-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-goto-store" onClick={() => onNavigate('home')}>
            🛍️ Về trang bán hàng
          </button>
          <button className="admin-logout" onClick={() => { logout(); onNavigate('home'); }}>
            🚪 Đăng xuất
          </button>
        </div>
      </aside>
      <main className="admin-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminLayout;
