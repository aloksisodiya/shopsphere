package com.shopsphere.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Snapshot of a product at the time the order was placed. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    private String productId;
    private String name;
    private String imageUrl;
    private double price;
    private int quantity;
}
