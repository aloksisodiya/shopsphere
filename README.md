# ShopSphere

A full-stack e-commerce app.

- **Frontend:** React 18, Vite, Tailwind CSS 3, React Router
- **Backend:** Java 17, Spring Boot 3.2, Spring Security (JWT)
- **Database:** MongoDB

## Features

- Product catalogue with search and category filters
- Product detail page, shopping cart (persisted in the browser)
- Register / log in with JWT authentication
- Checkout (cash on delivery) and order history, with self-service cancellation
- Admin dashboard: add, edit and delete products; view all orders and update their status
- Server-side price calculation and atomic stock decrement, so clients can't tamper with prices and stock can't go negative
- Demo data (accounts and products) seeded on first run

## Prerequisites

- Java 17+ and Maven 3.8+
- Node.js 18+
- MongoDB, either local or a free MongoDB Atlas cluster. Docker users can run `docker compose up -d` in this folder to start a local MongoDB.

## Run it

**1. Start MongoDB**

```bash
docker compose up -d
```

Or use your own instance and set `MONGODB_URI` (see Configuration below).

**2. Start the backend** (http://localhost:8080)

```bash
cd backend
mvn spring-boot:run
```

**3. Start the frontend** (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. In development, Vite proxies `/api` to the backend, so no extra CORS setup is needed.

## Demo accounts

| Role     | Email                  | Password   |
| -------- | ---------------------- | ---------- |
| Admin    | admin@shopsphere.com   | Admin@123  |
| Customer | user@shopsphere.com    | User@123   |

Change or delete these in `DataSeeder.java` before deploying anywhere public.

## Configuration

Backend (`backend/src/main/resources/application.properties`), overridable with environment variables:

| Variable       | Default                                  | Purpose                                      |
| -------------- | ---------------------------------------- | -------------------------------------------- |
| `MONGODB_URI`  | `mongodb://localhost:27017/shopsphere`   | MongoDB connection string                    |
| `JWT_SECRET`   | development placeholder                  | Signing key for tokens (use 32+ random chars)|
| `CORS_ORIGINS` | `http://localhost:5173`                  | Comma-separated allowed frontend origins     |

Frontend (`frontend/.env`, optional): `VITE_API_URL` is the backend origin for production builds, for example `https://api.example.com`.

## API overview

| Method | Path                         | Access  | Description                    |
| ------ | ---------------------------- | ------- | ------------------------------ |
| POST   | `/api/auth/register`         | Public  | Create account                 |
| POST   | `/api/auth/login`            | Public  | Log in, returns a JWT          |
| GET    | `/api/auth/me`               | User    | Current user                   |
| GET    | `/api/products?q=&category=` | Public  | List / search products         |
| GET    | `/api/products/categories`   | Public  | List categories                |
| GET    | `/api/products/{id}`         | Public  | Product details                |
| POST   | `/api/products`              | Admin   | Create product                 |
| PUT    | `/api/products/{id}`         | Admin   | Update product                 |
| DELETE | `/api/products/{id}`         | Admin   | Delete product                 |
| POST   | `/api/orders`                | User    | Place an order                 |
| GET    | `/api/orders/my`             | User    | Your orders                    |
| POST   | `/api/orders/{id}/cancel`    | User    | Cancel your order (if PLACED)  |
| GET    | `/api/orders`                | Admin   | All orders                     |
| PATCH  | `/api/orders/{id}/status`    | Admin   | Update order status            |

## Project structure

```
shopsphere/
├── docker-compose.yml
├── backend/            Spring Boot API
│   └── src/main/java/com/shopsphere/
│       ├── config/       demo data seeder
│       ├── controller/   auth, products, orders
│       ├── dto/          request/response records
│       ├── exception/    error handling
│       ├── model/        MongoDB documents
│       ├── repository/   Spring Data repositories
│       ├── security/     JWT service, filter, security config
│       └── service/      order logic (stock, totals)
└── frontend/           React app
    └── src/
        ├── api/          fetch wrapper
        ├── components/   navbar, product card, route guard
        ├── context/      auth and cart state
        └── pages/        home, product, cart, checkout, orders, admin, auth
```

## Ideas for next steps

- Online payments (Razorpay or Stripe) in place of cash on delivery
- Image upload for products instead of URLs
- Pagination and sorting on the product list
- Product reviews and ratings
- Automated tests (JUnit with Testcontainers for MongoDB; Vitest for the frontend)
