package com.shopsphere.controller;

import com.shopsphere.dto.Dtos.ProductRequest;
import com.shopsphere.exception.ApiException;
import com.shopsphere.model.Product;
import com.shopsphere.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository productRepository;
    private final MongoTemplate mongoTemplate;

    public ProductController(ProductRepository productRepository, MongoTemplate mongoTemplate) {
        this.productRepository = productRepository;
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping
    public List<Product> list(@RequestParam(required = false) String q,
                              @RequestParam(required = false) String category) {
        boolean hasQuery = q != null && !q.isBlank();
        boolean hasCategory = category != null && !category.isBlank() && !category.equalsIgnoreCase("all");
        if (hasQuery && hasCategory) {
            return productRepository.findByNameContainingIgnoreCaseAndCategoryIgnoreCase(q.trim(), category);
        }
        if (hasQuery) {
            return productRepository.findByNameContainingIgnoreCase(q.trim());
        }
        if (hasCategory) {
            return productRepository.findByCategoryIgnoreCase(category);
        }
        return productRepository.findAll();
    }

    @GetMapping("/categories")
    public List<String> categories() {
        return mongoTemplate.findDistinct(new org.springframework.data.mongodb.core.query.Query(),
                "category", Product.class, String.class).stream().sorted().toList();
    }

    @GetMapping("/{id}")
    public Product get(@PathVariable String id) {
        return productRepository.findById(id).orElseThrow(() -> ApiException.notFound("Product not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public Product create(@Valid @RequestBody ProductRequest req) {
        return productRepository.save(apply(new Product(), req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Product update(@PathVariable String id, @Valid @RequestBody ProductRequest req) {
        Product product = productRepository.findById(id).orElseThrow(() -> ApiException.notFound("Product not found"));
        return productRepository.save(apply(product, req));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        if (!productRepository.existsById(id)) {
            throw ApiException.notFound("Product not found");
        }
        productRepository.deleteById(id);
    }

    private Product apply(Product product, ProductRequest req) {
        product.setName(req.name().trim());
        product.setDescription(req.description());
        product.setPrice(req.price());
        product.setCategory(req.category().trim());
        product.setImageUrl(req.imageUrl());
        product.setStock(req.stock());
        return product;
    }
}
