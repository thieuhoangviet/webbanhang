import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminCommon.css';

const API_BASE = 'http://localhost:8080';
const DEFAULT_FORM = { name: '', description: '' };

const AdminCategoriesPage = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const loadCategories = () => {
    fetch(`${API_BASE}/api/categories`)
      .then(r => r.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  };

  useEffect(loadCategories, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    try {
      if (editingId) {
        await fetch(`${API_BASE}/api/categories/${editingId}`, {
          method: 'PUT', headers, body: JSON.stringify(form),
        });
        showMsg('success', 'Đã cập nhật danh mục!');
      } else {
        await fetch(`${API_BASE}/api/categories`, {
          method: 'POST', headers, body: JSON.stringify(form),
        });
        showMsg('success', 'Đã thêm danh mục!');
      }
      setShowForm(false);
      loadCategories();
    } catch {
      showMsg('error', 'Có lỗi xảy ra!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa danh mục này? Sản phẩm trong danh mục sẽ không bị xóa.')) return;
    await fetch(`${API_BASE}/api/categories/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    showMsg('success', 'Đã xóa danh mục!');
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  if (loading) return <div className="admin-loading">Đang tải...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">🏷️ Quản lý danh mục</h1>
        <button className="admin-add-btn" onClick={openAdd}>+ Thêm danh mục</button>
      </div>

      {message.text && <div className={`admin-message ${message.type}`}>{message.text}</div>}

      {showForm && (
        <div className="admin-form-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-form-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h3>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-field">
                <label>Tên danh mục *</label>
                <input type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Mô tả</label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="form-actions">
                <button type="button" className="admin-cancel-btn" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="admin-save-btn">
                  {editingId ? '💾 Lưu' : '➕ Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>#</th><th>Tên danh mục</th><th>Mô tả</th><th>Ngày tạo</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                <td><strong>{cat.name}</strong></td>
                <td>{cat.description || '—'}</td>
                <td>{cat.createdAt ? new Date(cat.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                <td>
                  <button className="admin-edit-btn" onClick={() => openEdit(cat)}>✏️</button>
                  <button className="admin-delete-btn" onClick={() => handleDelete(cat.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
