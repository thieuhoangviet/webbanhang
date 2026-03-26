import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const RegisterPage = ({ onNavigate }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password, form.phone);
      onNavigate('home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🛍️</div>
        <h1 className="auth-title">Đăng ký tài khoản</h1>
        <p className="auth-subtitle">Tham gia cộng đồng mua sắm của chúng tôi!</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Họ và tên *</label>
            <input type="text" placeholder="Nguyễn Văn A" value={form.fullName} onChange={update('fullName')} required />
          </div>
          <div className="auth-field">
            <label>Email *</label>
            <input type="email" placeholder="your@email.com" value={form.email} onChange={update('email')} required />
          </div>
          <div className="auth-field">
            <label>Số điện thoại</label>
            <input type="tel" placeholder="0912345678" value={form.phone} onChange={update('phone')} />
          </div>
          <div className="auth-field">
            <label>Mật khẩu *</label>
            <input type="password" placeholder="Ít nhất 6 ký tự" value={form.password} onChange={update('password')} required />
          </div>
          <div className="auth-field">
            <label>Xác nhận mật khẩu *</label>
            <input type="password" placeholder="Nhập lại mật khẩu" value={form.confirmPassword} onChange={update('confirmPassword')} required />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Đang đăng ký...' : '✅ Tạo tài khoản'}
          </button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản?{' '}
          <button className="auth-link" onClick={() => onNavigate('login')}>
            Đăng nhập
          </button>
        </div>
        <div className="auth-footer">
          <button className="auth-link" onClick={() => onNavigate('home')}>
            ← Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
