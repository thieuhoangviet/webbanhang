package com.example.webbanhang.repository;

import com.example.webbanhang.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
}
