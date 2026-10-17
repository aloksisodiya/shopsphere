package com.shopsphere.config;

import com.shopsphere.model.Product;
import com.shopsphere.model.Role;
import com.shopsphere.model.User;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/** Seeds demo accounts and products on first run (only when the collections are empty). */
@Component
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, ProductRepository productRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(User.builder().name("Admin").email("admin@shopsphere.com")
                    .password(passwordEncoder.encode("Admin@123")).role(Role.ADMIN).build());
            userRepository.save(User.builder().name("Demo User").email("user@shopsphere.com")
                    .password(passwordEncoder.encode("User@123")).role(Role.USER).build());
            log.info("Seeded demo users: admin@shopsphere.com / Admin@123 and user@shopsphere.com / User@123");
        }

        if (productRepository.count() == 0) {
            productRepository.saveAll(List.of(
                    p("Wireless Noise-Cancelling Headphones", "Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.", 2999, "Electronics", "headphones", 40),
                    p("Smart Fitness Watch", "Heart-rate tracking, GPS, sleep monitoring and 7-day battery.", 4499, "Electronics", "smartwatch", 25),
                    p("Portable Bluetooth Speaker", "Waterproof speaker with deep bass and 12 hours of playtime.", 1999, "Electronics", "speaker", 60),
                    p("Mechanical Keyboard", "Hot-swappable switches, RGB backlight and a compact 75% layout.", 3499, "Electronics", "keyboard", 30),
                    p("Classic Denim Jacket", "Medium-wash denim jacket with a comfortable relaxed fit.", 2499, "Fashion", "jacket", 35),
                    p("Everyday Running Shoes", "Lightweight, breathable running shoes with responsive cushioning.", 3299, "Fashion", "shoes", 50),
                    p("Leather Bi-fold Wallet", "Slim genuine-leather wallet with RFID protection and six card slots.", 899, "Fashion", "wallet", 80),
                    p("Polarized Sunglasses", "UV400 polarized lenses in a lightweight metal frame.", 1299, "Fashion", "sunglasses", 45),
                    p("Ceramic Coffee Mug Set", "Set of four 350 ml stoneware mugs, microwave and dishwasher safe.", 799, "Home", "mugs", 70),
                    p("Adjustable LED Desk Lamp", "Touch-controlled lamp with three colour temperatures and USB charging.", 1499, "Home", "lamp", 40),
                    p("Cotton Throw Blanket", "Soft woven throw blanket, 130 x 170 cm, machine washable.", 1199, "Home", "blanket", 55),
                    p("The Pragmatic Programmer", "A classic guide to software craftsmanship, 20th anniversary edition.", 749, "Books", "book", 100)
            ));
            log.info("Seeded demo products");
        }
    }

    private Product p(String name, String description, double price, String category, String seed, int stock) {
        return Product.builder()
                .name(name)
                .description(description)
                .price(price)
                .category(category)
                // Placeholder photos; replace with your own image URLs from the admin page
                .imageUrl("https://picsum.photos/seed/" + seed + "/600/600")
                .stock(stock)
                .build();
    }
}
