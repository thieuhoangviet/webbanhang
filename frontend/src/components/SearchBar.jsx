import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

const API_BASE = 'http://localhost:8080';

const SearchBar = ({ onSearch }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSug(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchSuggestions = (keyword) => {
    if (!keyword || keyword.length < 2) {
      setSuggestions([]);
      setShowSug(false);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/api/products/search?keyword=${encodeURIComponent(keyword)}`)
      .then(r => r.json())
      .then(data => {
        setSuggestions(data.slice(0, 6));
        setShowSug(data.length > 0);
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  };

  const handleInput = (e) => {
    const value = e.target.value;
    setInputValue(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleSelect = (product) => {
    setInputValue(product.name);
    setShowSug(false);
    onSearch(product.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSug(false);
    if (inputValue.trim()) onSearch(inputValue.trim());
  };

  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    setShowSug(false);
    onSearch('');
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
  const getThumb = (p) => {
    const url = p.images?.[0]?.imageUrl || p.imageUrl;
    if (!url) return null;
    return url.startsWith('http') ? url : `${API_BASE}${url}`;
  };

  return (
    <div className="searchbar-wrapper" ref={wrapperRef}>
      <form className="searchbar-form" onSubmit={handleSubmit}>
        <span className="searchbar-icon">🔍</span>
        <input
          type="text"
          className="searchbar-input"
          placeholder="Tìm kiếm sản phẩm..."
          value={inputValue}
          onChange={handleInput}
          onFocus={() => inputValue.length >= 2 && suggestions.length > 0 && setShowSug(true)}
          autoComplete="off"
        />
        {inputValue && (
          <button type="button" className="searchbar-clear" onClick={handleClear}>×</button>
        )}
        <button type="submit" className="searchbar-submit">Tìm</button>
      </form>

      {showSug && (
        <div className="searchbar-suggestions">
          {loading && <div className="sug-loading">Đang tìm...</div>}
          {!loading && suggestions.map(p => {
            const thumb = getThumb(p);
            return (
              <div key={p.id} className="sug-item" onClick={() => handleSelect(p)}>
                {thumb ? (
                  <img src={thumb} alt={p.name} className="sug-thumb" />
                ) : (
                  <div className="sug-thumb-placeholder">🛍️</div>
                )}
                <div className="sug-info">
                  <span className="sug-name">{p.name}</span>
                  <span className="sug-price">{formatPrice(p.salePrice || p.price)}</span>
                </div>
                {p.category && (
                  <span className="sug-cat">{p.category.name}</span>
                )}
              </div>
            );
          })}
          {!loading && suggestions.length > 0 && (
            <div className="sug-see-all" onClick={handleSubmit}>
              Xem tất cả kết quả cho "<strong>{inputValue}</strong>"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
