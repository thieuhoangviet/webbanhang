package com.example.webbanhang.repository;

import com.example.webbanhang.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByNameContainingIgnoreCase(String keyword);
    
    @Query("SELECT p FROM Product p WHERE p.quantity > 0")
    List<Product> findAvailableProducts();

    List<Product> findByIsFeaturedTrueOrderByCreatedAtDesc();
    List<Product> findByIsBestSellerTrueOrderByCreatedAtDesc();
    List<Product> findTop8ByOrderByCreatedAtDesc();
    List<Product> findByPriceBetween(java.math.BigDecimal min, java.math.BigDecimal max);
    List<Product> findByCategoryIdAndPriceBetween(Long categoryId, java.math.BigDecimal min, java.math.BigDecimal max);
}
