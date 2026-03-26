import React, { useState, useEffect } from 'react';
import './ProductFilterSidebar.css';

const SORT_OPTIONS = [
  { key: 'newest', label: '🆕 Mới nhất' },
  { key: 'price_asc', label: '💰 Giá tăng dần' },
  { key: 'price_desc', label: '💰 Giá giảm dần' },
  { key: 'name_asc', label: '🔤 A → Z' },
];

const PRICE_RANGES = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 100.000đ', min: 0, max: 100000 },
  { label: '100K - 500K', min: 100000, max: 500000 },
  { label: '500K - 2tr', min: 500000, max: 2000000 },
  { label: '2tr - 5tr', min: 2000000, max: 5000000 },
  { label: 'Trên 5tr', min: 5000000, max: Infinity },
];

const ProductFilterSidebar = ({
  categories = [],
  selectedCategoryId,
  onCategoryChange,
  onFilterChange,
  onSortChange,
  products = [], // Pass in full product list to derive brands
}) => {
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [sortKey, setSortKey] = useState('newest');
  const [isOpen, setIsOpen] = useState(false); // mobile toggle

  // Derive brands from products
  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  const emitFilters = (newPriceRange, newBrands, newMinRating) => {
    onFilterChange?.({
      priceMin: newPriceRange.min,
      priceMax: newPriceRange.max,
      brands: newBrands,
      minRating: newMinRating,
    });
  };

  const handlePriceRange = (range) => {
    setPriceRange(range);
    emitFilters(range, selectedBrands, minRating);
  };

  const handleBrandToggle = (brand) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(newBrands);
    emitFilters(priceRange, newBrands, minRating);
  };

  const handleRating = (rating) => {
    const newRating = minRating === rating ? 0 : rating;
    setMinRating(newRating);
    emitFilters(priceRange, selectedBrands, newRating);
  };

  const handleSort = (key) => {
    setSortKey(key);
    onSortChange?.(key);
  };

  const handleReset = () => {
    setPriceRange({ min: 0, max: Infinity });
    setSelectedBrands([]);
    setMinRating(0);
    setSortKey('newest');
    onFilterChange?.({ priceMin: 0, priceMax: Infinity, brands: [], minRating: 0 });
    onSortChange?.('newest');
    onCategoryChange?.(null);
  };

  const activeFilterCount =
    (priceRange.max !== Infinity || priceRange.min > 0 ? 1 : 0) +
    selectedBrands.length +
    (minRating > 0 ? 1 : 0);

  return (
    <>
      {/* Mobile toggle */}
      <button className="filter-mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        🔽 Bộ lọc {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
      </button>

      <div className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="filter-header">
          <span className="filter-title">🔍 Bộ lọc</span>
          {activeFilterCount > 0 && (
            <button className="filter-reset-btn" onClick={handleReset}>Xóa lọc</button>
          )}
        </div>

        {/* Sort */}
        <div className="filter-section">
          <h3>Sắp xếp</h3>
          <div className="sort-options">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                className={`sort-btn ${sortKey === opt.key ? 'active' : ''}`}
                onClick={() => handleSort(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        {categories.length > 0 && (
          <div className="filter-section">
            <h3>Danh mục</h3>
            <div className="category-filter-list">
              <button
                className={`cat-filter-btn ${!selectedCategoryId ? 'active' : ''}`}
                onClick={() => onCategoryChange?.(null)}
              >
                🏠 Tất cả
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`cat-filter-btn ${selectedCategoryId === cat.id ? 'active' : ''}`}
                  onClick={() => onCategoryChange?.(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price range */}
        <div className="filter-section">
          <h3>Khoảng giá</h3>
          <div className="price-ranges">
            {PRICE_RANGES.map((range, i) => (
              <button
                key={i}
                className={`price-btn ${priceRange.min === range.min && priceRange.max === range.max ? 'active' : ''}`}
                onClick={() => handlePriceRange(range)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Brands */}
        {brands.length > 0 && (
          <div className="filter-section">
            <h3>Thương hiệu</h3>
            <div className="brand-list">
              {brands.map(brand => (
                <label key={brand} className="brand-item">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Rating */}
        <div className="filter-section">
          <h3>Đánh giá tối thiểu</h3>
          <div className="rating-filter">
            {[4, 3, 2, 1].map(r => (
              <button
                key={r}
                className={`rating-btn ${minRating === r ? 'active' : ''}`}
                onClick={() => handleRating(r)}
              >
                {'⭐'.repeat(r)} trở lên
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductFilterSidebar;
