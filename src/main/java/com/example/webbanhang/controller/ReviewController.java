package com.example.webbanhang.controller;

import com.example.webbanhang.entity.Review;
import com.example.webbanhang.entity.User;
import com.example.webbanhang.repository.ReviewRepository;
import com.example.webbanhang.service.UserService;
import com.example.webbanhang.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserService userService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getReviewsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewRepository.findByProductIdOrderByCreatedAtDesc(productId));
    }

    @PostMapping("/product/{productId}")
    public ResponseEntity<?> createReview(
            @PathVariable Long productId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        Integer rating = (Integer) body.get("rating");
        String comment = (String) body.get("comment");
        String reviewerName = (String) body.get("reviewerName");

        if (rating == null || rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().body(Map.of("error", "Đánh giá phải từ 1-5 sao!"));
        }

        var product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        Review.ReviewBuilder builder = Review.builder()
                .product(product)
                .rating(rating)
                .comment(comment);

        if (userDetails != null) {
            try {
                User user = userService.getUserByEmail(userDetails.getUsername());
                builder.user(user).reviewerName(user.getFullName());
            } catch (Exception ignored) {}
        } else {
            builder.reviewerName(reviewerName != null ? reviewerName : "Khách");
        }

        Review review = reviewRepository.save(builder.build());
        return ResponseEntity.ok(review);
    }
}
