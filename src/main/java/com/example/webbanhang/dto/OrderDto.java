package com.example.webbanhang.dto;

import lombok.Data;
import java.util.List;

public class OrderDto {

    @Data
    public static class CreateOrderRequest {
        private String receiverName;
        private String receiverPhone;
        private String shippingAddress;
        private String note;
        private String paymentMethod; // COD, BANK_TRANSFER, etc.

        // Optional: items if creating without cart (guest)
        private List<OrderItemRequest> items;
    }

    @Data
    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
    }
}
