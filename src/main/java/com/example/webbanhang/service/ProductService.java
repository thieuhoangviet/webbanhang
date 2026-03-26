package com.example.webbanhang.service;

import com.example.webbanhang.entity.Product;
import com.example.webbanhang.entity.ProductImage;
import com.example.webbanhang.repository.ProductImageRepository;
import com.example.webbanhang.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public List<Product> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    public List<Product> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueOrderByCreatedAtDesc();
    }

    public List<Product> getBestSellers() {
        return productRepository.findByIsBestSellerTrueOrderByCreatedAtDesc();
    }

    public List<Product> getNewestProducts() {
        return productRepository.findTop8ByOrderByCreatedAtDesc();
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setSalePrice(productDetails.getSalePrice());
        product.setBrand(productDetails.getBrand());
        product.setIsFeatured(productDetails.getIsFeatured() != null ? productDetails.getIsFeatured() : false);
        product.setIsBestSeller(productDetails.getIsBestSeller() != null ? productDetails.getIsBestSeller() : false);
        product.setQuantity(productDetails.getQuantity());
        product.setImageUrl(productDetails.getImageUrl());
        product.setCategory(productDetails.getCategory());
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));
        productRepository.deleteById(id);
    }

    public Product updateImageUrl(Long id, String imageUrl) {
        Product product = getProductById(id);
        product.setImageUrl(imageUrl);
        return productRepository.save(product);
    }

    // Upload nhiều ảnh (tối đa 4), ảnh đầu tiên là ảnh chính
    public Product updateImages(Long productId, List<String> imageUrls) {
        Product product = getProductById(productId);

        // Xóa ảnh cũ
        productImageRepository.deleteByProductId(productId);
        product.getImages().clear();

        // Thêm ảnh mới theo thứ tự
        for (int i = 0; i < imageUrls.size(); i++) {
            ProductImage img = ProductImage.builder()
                    .product(product)
                    .imageUrl(imageUrls.get(i))
                    .sortOrder(i)
                    .build();
            product.getImages().add(img);
        }

        // Cập nhật imageUrl chính (ảnh đầu tiên)
        if (!imageUrls.isEmpty()) {
            product.setImageUrl(imageUrls.get(0));
        }

        return productRepository.save(product);
    }
}
