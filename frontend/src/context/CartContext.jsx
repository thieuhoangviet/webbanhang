import React, { createContext, useContext, useState, useEffect } from 'react';
import { createCart, addItemToCart, removeCartItem, updateCartItem, clearCart as clearCartApi } from '../api/api';

const CartContext = createContext();

const CART_ID_KEY = 'cart_id';

export const CartProvider = ({ children }) => {
  const [cartId, setCartId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Khởi tạo giỏ hàng khi load app
  useEffect(() => {
    const initCart = async () => {
      try {
        let savedCartId = localStorage.getItem(CART_ID_KEY);
        if (!savedCartId) {
          const res = await createCart();
          savedCartId = res.data.id;
          localStorage.setItem(CART_ID_KEY, savedCartId);
        }
        setCartId(Number(savedCartId));
      } catch (err) {
        console.error('Không thể khởi tạo giỏ hàng:', err);
      }
    };
    initCart();
  }, []);

  const addToCart = async (product, quantity = 1) => {
    if (!cartId) return;
    setLoading(true);
    try {
      const res = await addItemToCart(cartId, product.id, quantity);
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error('Lỗi thêm vào giỏ:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    if (!cartId) return;
    try {
      const res = await removeCartItem(cartId, itemId);
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error('Lỗi xóa item:', err);
    }
  };

  const updateItem = async (itemId, quantity) => {
    if (!cartId) return;
    try {
      const res = await updateCartItem(cartId, itemId, quantity);
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error('Lỗi cập nhật:', err);
    }
  };

  const clearAllCart = async () => {
    if (!cartId) return;
    try {
      await clearCartApi(cartId);
      setCartItems([]);
    } catch (err) {
      console.error('Lỗi xóa giỏ hàng:', err);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeItem, updateItem, clearAllCart, totalItems, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
