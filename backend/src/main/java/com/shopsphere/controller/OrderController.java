package com.shopsphere.controller;

import com.shopsphere.dto.Dtos.OrderRequest;
import com.shopsphere.dto.Dtos.StatusRequest;
import com.shopsphere.model.Order;
import com.shopsphere.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Order place(Authentication auth, @Valid @RequestBody OrderRequest request) {
        return orderService.place(auth.getName(), request);
    }

    @GetMapping("/my")
    public List<Order> mine(Authentication auth) {
        return orderService.myOrders(auth.getName());
    }

    @PostMapping("/{id}/cancel")
    public Order cancel(Authentication auth, @PathVariable String id) {
        return orderService.cancelOwn(auth.getName(), id);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Order> all() {
        return orderService.allOrders();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Order updateStatus(@PathVariable String id, @Valid @RequestBody StatusRequest request) {
        return orderService.updateStatus(id, request.status());
    }
}
