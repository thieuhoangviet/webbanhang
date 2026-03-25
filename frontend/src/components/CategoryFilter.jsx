import React, { useEffect, useState } from 'react';
import { getCategories } from '../api/api';
import './CategoryFilter.css';

const CategoryFilter = ({ selectedCategoryId, onSelectCategory }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="category-filter">
      <button
        className={`category-btn ${!selectedCategoryId ? 'active' : ''}`}
        onClick={() => onSelectCategory(null)}
      >
        Tất cả
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`category-btn ${selectedCategoryId === cat.id ? 'active' : ''}`}
          onClick={() => onSelectCategory(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
