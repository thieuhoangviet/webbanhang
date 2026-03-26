import React, { useState, useEffect } from 'react';
import ProductFilterSidebar from './ProductFilterSidebar';
import ProductCard from './ProductCard';
import './BrowsePage.css';

const API_BASE = 'http://localhost:8080';

const applyFilters = (products, filters, sortKey) => {
  let filtered = [...products];

  // Price filter
  if (filters.priceMin || filters.priceMax !== Infinity) {
    filtered = filtered.filter(p => {
      const effectivePrice = p.salePrice || p.price;
      return effectivePrice >= filters.priceMin && effectivePrice <= (filters.priceMax || Infinity);
    });
  }

  // Brand filter
  if (filters.brands && filters.brands.length > 0) {
    filtered = filtered.filter(p => p.brand && filters.brands.includes(p.brand));
  }

  // Sort
  switch (sortKey) {
    case 'price_asc':
      filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
      break;
    case 'price_desc':
      filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
      break;
    case 'name_asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      break;
    case 'newest':
    default:
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }

  return filtered;
};

const BrowsePage = ({ selectedCategoryId, onCategoryChange, searchQuery, onBuyNow }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ priceMin: 0, priceMax: Infinity, brands: [], minRating: 0 });
  const [sortKey, setSortKey] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`).then(r => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = `${API_BASE}/api/products`;
    if (searchQuery) {
      url = `${API_BASE}/api/products/search?keyword=${encodeURIComponent(searchQuery)}`;
    } else if (selectedCategoryId) {
      url = `${API_BASE}/api/products?categoryId=${selectedCategoryId}`;
    }
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (selectedCategoryId && !searchQuery) {
          // Filter by category client-side since we fetch all
          fetch(`${API_BASE}/api/products`)
            .then(r => r.json())
            .then(allP => setAllProducts(allP.filter(p => p.category?.id === selectedCategoryId)));
        } else {
          setAllProducts(data);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedCategoryId, searchQuery]);

  const displayProducts = applyFilters(allProducts, filters, sortKey);

  return (
    <div className="browse-page">
      <ProductFilterSidebar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={onCategoryChange}
        onFilterChange={setFilters}
        onSortChange={setSortKey}
        products={allProducts}
      />

      <div className="browse-content">
        <div className="browse-header">
          <span className="browse-count">
            {loading ? 'Đang tải...' : `${displayProducts.length} sản phẩm`}
          </span>
          {searchQuery && (
            <span className="browse-search-label">
              Kết quả tìm kiếm: "<strong>{searchQuery}</strong>"
            </span>
          )}
          {selectedCategoryId && !searchQuery && (
            <span className="browse-search-label">
              Danh mục: <strong>{categories.find(c => c.id === selectedCategoryId)?.name}</strong>
            </span>
          )}
        </div>

        {loading ? (
          <div className="browse-skeleton">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="browse-skeleton-card" />)}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="browse-empty">
            <span>🔍</span>
            <p>Không tìm thấy sản phẩm phù hợp.</p>
          </div>
        ) : (
          <div className="browse-grid">
            {displayProducts.map(product => (
              <ProductCard key={product.id} product={product} onBuyNow={onBuyNow} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
