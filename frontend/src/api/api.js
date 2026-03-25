import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const getProducts = () => api.get('/products');
export const getCategories = () => api.get('/categories');
export const getProductsByCategory = (categoryId) => api.get(`/products/category/${categoryId}`);
export const searchProducts = (keyword) => api.get(`/products/search?keyword=${keyword}`);

// Cart APIs
export const createCart = () => api.post('/cart');
export const getCart = (cartId) => api.get(`/cart/${cartId}`);
export const addItemToCart = (cartId, productId, quantity = 1) =>
  api.post(`/cart/${cartId}/items`, { productId, quantity });
export const updateCartItem = (cartId, itemId, quantity) =>
  api.put(`/cart/${cartId}/items/${itemId}`, { quantity });
export const removeCartItem = (cartId, itemId) =>
  api.delete(`/cart/${cartId}/items/${itemId}`);
export const clearCart = (cartId) => api.delete(`/cart/${cartId}`);

// Upload nhiều ảnh (tối đa 4)
export const uploadProductImages = (productId, formData) =>
  api.post(`/products/${productId}/upload-images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
