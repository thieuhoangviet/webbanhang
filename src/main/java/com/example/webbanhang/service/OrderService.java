package com.example.webbanhang.service;

import com.example.webbanhang.dto.OrderDto;
import com.example.webbanhang.entity.*;
import com.example.webbanhang.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public Order createOrder(String email, OrderDto.CreateOrderRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Order.PaymentMethod paymentMethod = Order.PaymentMethod.COD;
        if (req.getPaymentMethod() != null) {
            try {
                paymentMethod = Order.PaymentMethod.valueOf(req.getPaymentMethod());
            } catch (IllegalArgumentException ignored) {}
        }

        Order order = Order.builder()
                .user(user)
                .receiverName(req.getReceiverName())
                .receiverPhone(req.getReceiverPhone())
                .shippingAddress(req.getShippingAddress())
                .note(req.getNote())
                .paymentMethod(paymentMethod)
                .status(Order.Status.PENDING)
                .build();

        BigDecimal total = BigDecimal.ZERO;

        if (req.getItems() != null) {
            for (OrderDto.OrderItemRequest itemReq : req.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + itemReq.getProductId()));

                if (product.getQuantity() < itemReq.getQuantity()) {
                    throw new RuntimeException("Sản phẩm \"" + product.getName() + "\" không đủ hàng!");
                }

                OrderItem item = OrderItem.builder()
                        .order(order)
                        .product(product)
                        .quantity(itemReq.getQuantity())
                        .price(product.getPrice())
                        .build();

                order.getItems().add(item);
                total = total.add(product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity())));

                // Deduct stock
                product.setQuantity(product.getQuantity() - itemReq.getQuantity());
                productRepository.save(product);
            }
        }

        order.setTotalAmount(total);
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public Order getOrderById(Long id, String email) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Không có quyền xem đơn hàng này");
        }
        return order;
    }

    @Transactional
    public Order cancelOrder(Long id, String email) {
        Order order = getOrderById(id, email);
        if (order.getStatus() != Order.Status.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng đang chờ xử lý!");
        }
        // Restore stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantity());
            productRepository.save(product);
        }
        order.setStatus(Order.Status.CANCELLED);
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Order updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        order.setStatus(Order.Status.valueOf(status));
        return orderRepository.save(order);
    }
}
