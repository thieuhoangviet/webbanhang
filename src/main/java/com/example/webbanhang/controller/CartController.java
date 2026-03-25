package com.example.webbanhang.controller;

import com.example.webbanhang.entity.Cart;
import com.example.webbanhang.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    // Tạo giỏ hàng mới → trả về cartId
    @PostMapping
    public ResponseEntity<Cart> createCart() {
        return ResponseEntity.status(HttpStatus.CREATED).body(cartService.createCart());
    }

    // Lấy giỏ hàng
    @GetMapping("/{cartId}")
    public ResponseEntity<Cart> getCart(@PathVariable Long cartId) {
        return ResponseEntity.ok(cartService.getCart(cartId));
    }

    // Thêm sản phẩm vào giỏ
    // Body: { "productId": 1, "quantity": 2 }
    @PostMapping("/{cartId}/items")
    public ResponseEntity<Cart> addItem(
            @PathVariable Long cartId,
            @RequestBody Map<String, Integer> body) {
        Long productId = body.get("productId").longValue();
        int quantity = body.getOrDefault("quantity", 1);
        return ResponseEntity.ok(cartService.addItem(cartId, productId, quantity));
    }

    // Cập nhật số lượng item
    // Body: { "quantity": 3 }
    @PutMapping("/{cartId}/items/{itemId}")
    public ResponseEntity<Cart> updateItem(
            @PathVariable Long cartId,
            @PathVariable Long itemId,
            @RequestBody Map<String, Integer> body) {
        int quantity = body.getOrDefault("quantity", 1);
        return ResponseEntity.ok(cartService.updateItem(cartId, itemId, quantity));
    }

    // Xoá 1 item khỏi giỏ
    @DeleteMapping("/{cartId}/items/{itemId}")
    public ResponseEntity<Cart> removeItem(
            @PathVariable Long cartId,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(cartId, itemId));
    }

    // Xoá toàn bộ giỏ hàng
    @DeleteMapping("/{cartId}")
    public ResponseEntity<Void> clearCart(@PathVariable Long cartId) {
        cartService.clearCart(cartId);
        return ResponseEntity.noContent().build();
    }
}
