import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminCommon.css';

const API_BASE = 'http://localhost:8080';
const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

const DEFAULT_FORM = { name: '', description: '', price: '', quantity: '', categoryId: '' };

const AdminProductsPage = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileRef = useRef();

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const loadData = () => {
    Promise.all([
      fetch(`${API_BASE}/api/products`).then(r => r.json()),
      fetch(`${API_BASE}/api/categories`).then(r => r.json()),
    ]).then(([p, c]) => { setProducts(p); setCategories(c); }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setImageFiles([]);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      quantity: product.quantity,
      categoryId: product.category?.id || '',
    });
    setImageFiles([]);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
      category: form.categoryId ? { id: parseInt(form.categoryId) } : null,
    };

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    try {
      let res, data;
      if (editingId) {
        res = await fetch(`${API_BASE}/api/products/${editingId}`, {
          method: 'PUT', headers, body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`${API_BASE}/api/products`, {
          method: 'POST', headers, body: JSON.stringify(body),
        });
      }
      data = await res.json();
      const productId = data.id;

      // Upload images if any
      if (imageFiles.length > 0 && productId) {
        const fd = new FormData();
        imageFiles.forEach(f => fd.append('files', f));
        await fetch(`${API_BASE}/api/products/${productId}/upload-images`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
      }

      showMsg('success', editingId ? 'Đã cập nhật sản phẩm!' : 'Đã thêm sản phẩm!');
      setShowForm(false);
      loadData();
    } catch (err) {
      showMsg('error', 'Có lỗi xảy ra!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    await fetch(`${API_BASE}/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    showMsg('success', 'Đã xóa sản phẩm!');
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Đang tải...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">📦 Quản lý sản phẩm</h1>
        <button className="admin-add-btn" onClick={openAdd}>+ Thêm sản phẩm</button>
      </div>

      {message.text && <div className={`admin-message ${message.type}`}>{message.text}</div>}

      <div className="admin-search-row">
        <input className="admin-search" type="text" placeholder="🔍 Tìm kiếm sản phẩm..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <span className="admin-count">{filtered.length} sản phẩm</span>
      </div>

      {showForm && (
        <div className="admin-form-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-form-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-field">
                <label>Tên sản phẩm *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Giá *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min="0" step="1000" />
                </div>
                <div className="form-field">
                  <label>Số lượng *</label>
                  <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required min="0" />
                </div>
              </div>
              <div className="form-field">
                <label>Danh mục</label>
                <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">-- Không có danh mục --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Mô tả</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="form-field">
                <label>Ảnh sản phẩm (tối đa 4)</label>
                <input type="file" multiple accept="image/*" ref={fileRef}
                  onChange={e => setImageFiles(Array.from(e.target.files).slice(0, 4))} />
                {imageFiles.length > 0 && <span className="file-count">{imageFiles.length} ảnh đã chọn</span>}
              </div>
              <div className="form-actions">
                <button type="button" className="admin-cancel-btn" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="admin-save-btn">
                  {editingId ? '💾 Lưu thay đổi' : '➕ Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>#</th><th>Ảnh</th><th>Tên sản phẩm</th><th>Giá</th><th>Kho</th><th>Danh mục</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {filtered.map(product => {
              const imgUrl = product.images?.[0]?.imageUrl || product.imageUrl;
              return (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>
                    {imgUrl ? (
                      <img src={imgUrl.startsWith('http') ? imgUrl : `${API_BASE}${imgUrl}`}
                        alt={product.name} className="admin-product-thumb" />
                    ) : <span className="no-image">—</span>}
                  </td>
                  <td className="product-name-cell">{product.name}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>
                    <span style={{ color: product.quantity === 0 ? '#ef4444' : product.quantity <= 5 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                      {product.quantity}
                    </span>
                  </td>
                  <td>{product.category?.name || '—'}</td>
                  <td>
                    <button className="admin-edit-btn" onClick={() => openEdit(product)}>✏️</button>
                    <button className="admin-delete-btn" onClick={() => handleDelete(product.id)}>🗑️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductsPage;
