import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { getProducts, getProductsByCategory, searchProducts } from '../api/api';
import './ProductList.css';

const ProductList = ({ selectedCategoryId, searchQuery, onBuyNow }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        if (searchQuery && searchQuery.trim() !== '') {
          res = await searchProducts(searchQuery);
        } else if (selectedCategoryId) {
          res = await getProductsByCategory(selectedCategoryId);
        } else {
          res = await getProducts();
        }
        setProducts(res.data);
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategoryId, searchQuery]);

  if (loading) {
    return (
      <div className="product-list-state">
        <div className="spinner"></div>
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-list-state error">
        <span>⚠️</span>
        <p>{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="product-list-state">
        <span>📦</span>
        <p>Không có sản phẩm nào.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onBuyNow={onBuyNow} />
      ))}
    </div>
  );
};

export default ProductList;
