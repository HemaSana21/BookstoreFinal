# BookStore — MERN Stack

A full-stack online bookstore built with MongoDB, Express, React and Node.js, supporting three
actors as specified in the project scope: User (reader/customer), Seller and Admin.

## Actors & Roles

| Actor  | Can do |
|--------|--------|
| User   | Register/login, browse & search books, cart, wishlist, checkout, order history, reviews, track reading progress on a personal "shelf" |
| Seller | Register (pending admin approval), login, list/edit/remove their own books, manage inventory, view & fulfil orders for their own books, sales dashboard |
| Admin  | Login (no public signup), approve/block sellers, manage users, override/remove any book listing, manage all orders, platform-wide dashboard |

## Project Structure

```
server/
  config/
    connect.js          # MongoDB connection
    seed.js              # Seeds demo data for all 3 roles
  controllers/
    UsersController.js   # User: register/login/profile/order-history/forgot-password/shelf
    SellerControllers.js # Seller: register/login/profile/books/orders/stats
    AdminControllers.js  # Admin: login/user-mgmt/seller-mgmt/book-mgmt/dashboard
    bookController.js    # Public catalog reads (search/filter/detail)
    authorController.js, cartController.js, categoryController.js,
    orderController.js, reviewController.js, wishlistController.js
  middleware/
    authMiddleware.js    # Single JWT verifier that resolves user/seller/admin
    upload.js
  models/
    Admin/Admin.js
    Seller/Seller.js
    Users/User.js
    Book.js, Author.js, Category.js, Inventory.js, Interaction.js,
    Cart.js, Order.js, Review.js, Wishlist.js
  routes/
    adminRoutes.js, sellerRoutes.js, userRoutes.js,
    bookRoutes.js, authorRoutes.js, categoryRoutes.js, cartRoutes.js,
    wishlistRoutes.js, orderRoutes.js, reviewRoutes.js
  server.js

client/src/
  Admin/     Ahome, Alogin, Anavbar, Asignup, items, Seller, Users, Orders
  Seller/    Shome, Slogin, Snavbar, Ssignup, Addbook, MyProducts, Book, List.css, Orders, Profile
  User/      Uhome, Login, Signup, Uitem, Products, Cart, Checkout, MyOrders,
             OrderItem, Wishlist, Profile, ForgotPassword
  Components/ Home, Footer, Navbar, BookCard, ProtectedRoute, NotFound
  context/   AuthContext (all 3 roles), CartContext
```

## Data Model Notes

- User <-> Book (M:M): tracked via the Interaction collection (reading status/progress), separate
  from Review (rating + comment).
- Book <-> Author (M:M) and Book <-> Category (M:M): modeled as ref-arrays on Book
  (authors, categories) - the idiomatic MongoDB equivalent of a join table, rather than a
  physical WrittenBy/CategorizedAs collection.
- Book <-> Inventory (1:M): Inventory holds quantity/location/condition batches per book;
  Book.stock is a synced aggregate for fast reads on the catalog/cart/checkout path.
- Seller <-> Book (1:M) and User <-> Order (1:M) are direct refs.
- Order line items carry their own seller + fulfillmentStatus, so a single order spanning
  multiple sellers' books can be fulfilled independently by each seller.

## Getting Started

```bash
# Backend
cd server
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, etc.
npm run seed            # optional: seeds users, sellers, admin, books, reviews
npm run dev

# Frontend
cd client
npm install
npm start
```

### Seeded logins (after npm run seed)
- Admin: admin@bookstore.com / Admin@12345
- Seller (approved): seller1@example.com / Seller@123
- Seller (pending approval): seller-pending@example.com / Seller@123
- User: user1@example.com / Password@123

## API Overview

- POST /api/users/register, /login, /forgot-password, /reset-password/:token
- GET/PUT /api/users/me, /profile, /order-history, /interactions
- POST /api/sellers/register, /login
- GET/PUT /api/sellers/me, /profile, /stats, /my-products, /orders
- POST/PUT/DELETE /api/sellers/books[/:id]
- POST /api/admin/login, /create (admin-only)
- GET /api/admin/users, /sellers, /books, /stats
- PUT /api/admin/sellers/:id/approve, /block
- GET /api/books, /api/books/:id (public catalog)
- GET /api/authors, /api/categories
- /api/cart/*, /api/wishlist/*, /api/orders/*, /api/reviews/*

See server/routes/*.js for the complete, authoritative list.
