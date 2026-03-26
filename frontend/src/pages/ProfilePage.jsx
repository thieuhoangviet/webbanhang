import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const API_BASE = 'http://localhost:8080';

const ProfilePage = ({ onNavigate }) => {
  const { user, token, updateProfile, changePassword, logout } = useAuth();
  const [tab, setTab] = useState('profile'); // 'profile' | 'password' | 'addresses'
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ receiverName: '', phone: '', addressLine: '', ward: '', district: '', province: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === 'addresses' && token) {
      fetch(`${API_BASE}/api/users/me/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then(setAddresses)
        .catch(console.error);
    }
  }, [tab, token]);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(profileForm);
      showMsg('success', 'Cập nhật thông tin thành công!');
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMsg('error', 'Mật khẩu xác nhận không khớp!');
      return;
    }
    setLoading(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      showMsg('success', 'Đổi mật khẩu thành công!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/api/users/me/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newAddress),
    });
    if (res.ok) {
      const addr = await res.json();
      setAddresses([...addresses, addr]);
      setNewAddress({ receiverName: '', phone: '', addressLine: '', ward: '', district: '', province: '' });
      showMsg('success', 'Đã thêm địa chỉ!');
    }
  };

  const handleDeleteAddress = async (id) => {
    await fetch(`${API_BASE}/api/users/me/addresses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <span>👤</span>
            <div className="profile-name">{user?.fullName}</div>
            <div className="profile-email">{user?.email}</div>
            {user?.role === 'ADMIN' && <span className="profile-badge">Admin</span>}
          </div>
          <nav className="profile-nav">
            <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>👤 Thông tin cá nhân</button>
            <button className={tab === 'password' ? 'active' : ''} onClick={() => setTab('password')}>🔒 Đổi mật khẩu</button>
            <button className={tab === 'addresses' ? 'active' : ''} onClick={() => setTab('addresses')}>📍 Địa chỉ giao hàng</button>
            <button onClick={() => onNavigate('home')}>🛍️ Tiếp tục mua sắm</button>
            <button className="logout-btn" onClick={handleLogout}>🚪 Đăng xuất</button>
          </nav>
        </div>

        <div className="profile-content">
          {message.text && (
            <div className={`profile-message ${message.type}`}>{message.text}</div>
          )}

          {tab === 'profile' && (
            <div className="profile-section">
              <h2>Thông tin cá nhân</h2>
              <form className="profile-form" onSubmit={handleUpdateProfile}>
                <div className="auth-field">
                  <label>Họ và tên</label>
                  <input type="text" value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} />
                </div>
                <div className="auth-field">
                  <label>Email</label>
                  <input type="email" value={user?.email} disabled />
                </div>
                <div className="auth-field">
                  <label>Số điện thoại</label>
                  <input type="tel" value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                </div>
                <button className="auth-btn" type="submit" disabled={loading}>
                  💾 Lưu thay đổi
                </button>
              </form>
            </div>
          )}

          {tab === 'password' && (
            <div className="profile-section">
              <h2>Đổi mật khẩu</h2>
              <form className="profile-form" onSubmit={handleChangePassword}>
                <div className="auth-field">
                  <label>Mật khẩu hiện tại</label>
                  <input type="password" value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
                </div>
                <div className="auth-field">
                  <label>Mật khẩu mới</label>
                  <input type="password" value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required />
                </div>
                <div className="auth-field">
                  <label>Xác nhận mật khẩu mới</label>
                  <input type="password" value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
                </div>
                <button className="auth-btn" type="submit" disabled={loading}>🔒 Đổi mật khẩu</button>
              </form>
            </div>
          )}

          {tab === 'addresses' && (
            <div className="profile-section">
              <h2>Địa chỉ giao hàng</h2>
              {addresses.length === 0 && <p className="no-data">Chưa có địa chỉ nào.</p>}
              <div className="address-list">
                {addresses.map((addr) => (
                  <div className="address-card" key={addr.id}>
                    <div><strong>{addr.receiverName}</strong> — {addr.phone}</div>
                    <div>{addr.addressLine}, {addr.ward}, {addr.district}, {addr.province}</div>
                    <button className="address-delete" onClick={() => handleDeleteAddress(addr.id)}>🗑️ Xóa</button>
                  </div>
                ))}
              </div>
              <h3>Thêm địa chỉ mới</h3>
              <form className="profile-form" onSubmit={handleAddAddress}>
                {[
                  { key: 'receiverName', label: 'Họ tên người nhận', placeholder: 'Nguyễn Văn A' },
                  { key: 'phone', label: 'Số điện thoại', placeholder: '0912345678' },
                  { key: 'addressLine', label: 'Số nhà, tên đường', placeholder: '123 Đường ABC' },
                  { key: 'ward', label: 'Phường/Xã', placeholder: 'Phường 1' },
                  { key: 'district', label: 'Quận/Huyện', placeholder: 'Quận 1' },
                  { key: 'province', label: 'Tỉnh/Thành phố', placeholder: 'TP. Hồ Chí Minh' },
                ].map(({ key, label, placeholder }) => (
                  <div className="auth-field" key={key}>
                    <label>{label}</label>
                    <input type="text" placeholder={placeholder} value={newAddress[key]}
                      onChange={(e) => setNewAddress({ ...newAddress, [key]: e.target.value })} />
                  </div>
                ))}
                <button className="auth-btn" type="submit">📍 Thêm địa chỉ</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
