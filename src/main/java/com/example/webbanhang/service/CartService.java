package com.example.webbanhang.service;

import com.example.webbanhang.entity.Cart;
import com.example.webbanhang.entity.CartItem;
import com.example.webbanhang.entity.Product;
import com.example.webbanhang.repository.CartItemRepository;
import com.example.webbanhang.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductService productService;

    // Tạo giỏ hàng mới
    public Cart createCart() {
        return cartRepository.save(new Cart());
    }

    // Lấy giỏ hàng theo id
    public Cart getCart(Long cartId) {
        return cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng với id: " + cartId));
    }

    // Thêm sản phẩm vào giỏ hàng
    public Cart addItem(Long cartId, Long productId, int quantity) {
        Cart cart = getCart(cartId);
        Product product = productService.getProductById(productId);

        // Nếu sản phẩm đã có trong giỏ thì tăng số lượng
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            int newQty = existingItem.getQuantity() + quantity;
            // Kiểm tra tổng số lượng (hiện tại + thêm) không vượt tồn kho
            if (newQty > product.getQuantity()) {
                newQty = product.getQuantity(); // Giới hạn tối đa bằng tồn kho
            }
            existingItem.setQuantity(newQty);
            cartItemRepository.save(existingItem);
        } else {
            // Kiểm tra số lượng không vượt tồn kho
            int safeQty = Math.min(quantity, product.getQuantity());
            if (safeQty <= 0) {
                throw new RuntimeException("Sản phẩm đã hết hàng");
            }
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(safeQty)
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        return cartRepository.save(cart);
    }

    // Cập nhật số lượng item
    public Cart updateItem(Long cartId, Long itemId, int quantity) {
        Cart cart = getCart(cartId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy item: " + itemId));

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            // Không vượt quá tồn kho
            int stock = item.getProduct().getQuantity();
            item.setQuantity(Math.min(quantity, stock));
            cartItemRepository.save(item);
        }

        return cartRepository.save(cart);
    }

    // Xoá item khỏi giỏ hàng
    public Cart removeItem(Long cartId, Long itemId) {
        Cart cart = getCart(cartId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy item: " + itemId));
        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        return cartRepository.save(cart);
    }

    // Xoá toàn bộ giỏ hàng
    public void clearCart(Long cartId) {
        Cart cart = getCart(cartId);
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}
