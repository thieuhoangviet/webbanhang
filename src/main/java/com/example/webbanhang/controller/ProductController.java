package com.example.webbanhang.controller;

import com.example.webbanhang.entity.Product;
import com.example.webbanhang.service.FileStorageService;
import com.example.webbanhang.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword) {
        return ResponseEntity.ok(productService.searchProducts(keyword));
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // Upload 1 ảnh (legacy)
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<?> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            String fileName = fileStorageService.storeFile(file);
            String imageUrl = "/uploads/" + fileName;
            Product updated = productService.updateImageUrl(id, imageUrl);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl, "product", updated));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Không thể lưu file: " + e.getMessage()));
        }
    }

    // Upload tối đa 4 ảnh, ảnh đầu tiên là ảnh chính
    @PostMapping("/{id}/upload-images")
    public ResponseEntity<?> uploadImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) {
        if (files.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng chọn ít nhất 1 ảnh"));
        }
        if (files.size() > 4) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tối đa 4 ảnh"));
        }
        try {
            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile file : files) {
                String fileName = fileStorageService.storeFile(file);
                imageUrls.add("/uploads/" + fileName);
            }
            Product updated = productService.updateImages(id, imageUrls);
            return ResponseEntity.ok(Map.of("imageUrls", imageUrls, "product", updated));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Không thể lưu file: " + e.getMessage()));
        }
    }
}
