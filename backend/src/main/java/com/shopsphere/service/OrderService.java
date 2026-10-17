package com.shopsphere.service;

import com.shopsphere.dto.Dtos.OrderItemRequest;
import com.shopsphere.dto.Dtos.OrderRequest;
import com.shopsphere.exception.ApiException;
import com.shopsphere.model.Order;
import com.shopsphere.model.OrderItem;
import com.shopsphere.model.OrderStatus;
import com.shopsphere.model.Product;
import com.shopsphere.model.User;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.UserRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository,
                        UserRepository userRepository, MongoTemplate mongoTemplate) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.mongoTemplate = mongoTemplate;
    }

    /**
     * Places an order. Prices always come from the database (never from the client), and stock is
     * decremented atomically per product. If any line fails, earlier decrements are restored.
     */
    public Order place(String email, OrderRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        // Merge duplicate lines for the same product
        Map<String, Integer> quantities = new LinkedHashMap<>();
        for (OrderItemRequest item : request.items()) {
            quantities.merge(item.productId(), item.quantity(), Integer::sum);
        }

        List<OrderItem> items = new ArrayList<>();
        Map<String, Integer> reserved = new LinkedHashMap<>();
        try {
            for (Map.Entry<String, Integer> entry : quantities.entrySet()) {
                Product product = productRepository.findById(entry.getKey())
                        .orElseThrow(() -> ApiException.notFound("Product not found: " + entry.getKey()));
                int qty = entry.getValue();

                long modified = mongoTemplate.updateFirst(
                        Query.query(Criteria.where("id").is(product.getId()).and("stock").gte(qty)),
                        new Update().inc("stock", -qty),
                        Product.class).getModifiedCount();
                if (modified == 0) {
                    throw ApiException.badRequest("Not enough stock for \"" + product.getName() + "\"");
                }
                reserved.put(product.getId(), qty);

                items.add(OrderItem.builder()
                        .productId(product.getId())
                        .name(product.getName())
                        .imageUrl(product.getImageUrl())
                        .price(product.getPrice())
                        .quantity(qty)
                        .build());
            }

            double total = items.stream().mapToDouble(i -> i.getPrice() * i.getQuantity()).sum();
            Order order = Order.builder()
                    .userId(user.getId())
                    .userEmail(user.getEmail())
                    .items(items)
                    .total(Math.round(total * 100.0) / 100.0)
                    .status(OrderStatus.PLACED)
                    .shippingAddress(request.shippingAddress().trim())
                    .createdAt(Instant.now())
                    .build();
            return orderRepository.save(order);
        } catch (RuntimeException ex) {
            reserved.forEach(this::restoreStock);
            throw ex;
        }
    }

    public List<Order> myOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public List<Order> allOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public Order cancelOwn(String email, String orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> ApiException.notFound("Order not found"));
        if (!order.getUserEmail().equals(email)) {
            throw ApiException.notFound("Order not found");
        }
        if (order.getStatus() != OrderStatus.PLACED) {
            throw ApiException.badRequest("Only orders that have not shipped can be cancelled");
        }
        return updateStatus(orderId, OrderStatus.CANCELLED);
    }

    public Order updateStatus(String orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> ApiException.notFound("Order not found"));
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw ApiException.badRequest("A cancelled order cannot be changed");
        }
        if (status == OrderStatus.CANCELLED) {
            order.getItems().forEach(i -> restoreStock(i.getProductId(), i.getQuantity()));
        }
        order.setStatus(status);
        return orderRepository.save(order);
    }

    private void restoreStock(String productId, int qty) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("id").is(productId)),
                new Update().inc("stock", qty),
                Product.class);
    }
}
