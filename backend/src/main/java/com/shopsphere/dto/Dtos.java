package com.shopsphere.dto;

import com.shopsphere.model.OrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public final class Dtos {
    private Dtos() {}

    public record RegisterRequest(
            @NotBlank String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, message = "Password must be at least 6 characters") String password) {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record AuthResponse(String token, String id, String name, String email, String role) {}

    public record ProductRequest(
            @NotBlank String name,
            String description,
            @Positive(message = "Price must be greater than 0") double price,
            @NotBlank String category,
            String imageUrl,
            @Min(value = 0, message = "Stock cannot be negative") int stock) {}

    public record OrderItemRequest(@NotBlank String productId, @Min(1) int quantity) {}

    public record OrderRequest(
            @NotEmpty(message = "Order must contain at least one item") List<@Valid OrderItemRequest> items,
            @NotBlank(message = "Shipping address is required") String shippingAddress) {}

    public record StatusRequest(@NotNull OrderStatus status) {}
}
