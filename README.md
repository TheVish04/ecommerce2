## KalaVPP – Creator Commerce Marketplace

KalaVPP is a full‑stack creator marketplace that lets digital artists and vendors sell products, offer commission services, and manage their business end‑to‑end, while collectors can discover artists, purchase artwork/merch, and track their orders in a modern dashboard experience.

Built by a 2‑person team to demonstrate a real, production‑style marketplace, it includes user, vendor, and admin roles; digital and physical products; commission workflows; payments; and rich artist profiles.

---

## High‑Level Concept

- **Problem**: Creators juggle multiple tools for storefronts, commissions, file delivery, and payments. Buyers struggle to discover trusted artists and manage purchases in one place.
- **Solution**: KalaVPP provides a **single, curated platform** where:
  - Creators can set up a store, publish products and services, receive commissions, and get paid.
  - Collectors can browse a premium marketplace, commission artists, download digital files, and track orders.
  - Admins can oversee categories, users, vendors, products, services, and platform health from an internal dashboard.

---

## Architecture Overview

**Monorepo layout**

- `client/` – React + Vite SPA (public site, dashboards, admin/vendor portals)
- `server/` – Node.js + Express REST API (auth, business logic, payments, email, file uploads)
- MongoDB (via Mongoose) – primary database for all entities (users, vendors, products, services, orders, commissions, wishlist, etc.)

**Client (SPA)**

- **Framework**: React (Vite)
- **Routing**: `react-router-dom`
- **Styling**: Tailwind CSS + custom components (`App.css`, `index.css`)
- **State / Context**:
  - `AuthContext` – authentication state, current user, token handling
  - `CartContext` – cart and checkout state
  - `WishlistContext` – wishlist operations
  - `ThemeContext` – light/dark theming
- **UI / Animation**:
  - `framer-motion` (micro‑interactions and scroll animations)
  - `lucide-react` (icon system)
  - `react-hot-toast` (feedback/notifications)
- **Data Layer**: `axios` instance in `client/src/services/api.js` calling `/api/*` routes.

**Server (API)**

- **Framework**: Express (CommonJS)
- **Database**: MongoDB via `mongoose`
- **Security & Hardening**:
  - `helmet` – security headers
  - `cors` – origin‑whitelist for `vercel.app` + local dev
  - `express-rate-limit` – separate limits for auth and general API
  - Custom error handling (`error.middleware.js`)
- **Auth & Access Control**:
  - JWT‑based authentication (`jsonwebtoken`, `generateToken.js`)
  - Password hashing with `bcryptjs`
  - Role‑based guards (`role.middleware.js`) for admin/vendor/customer routes
- **File & Media**:
  - `multer` + `multer-storage-cloudinary` + `cloudinary` for image uploads (artwork, profile images, etc.)
- **Payments & Orders**:
  - `razorpay` integration (capturing orders and payments)
  - Order, Transaction, and Download access models
- **Email & Communication**:
  - `nodemailer` and `utils/email.js` for verification, password reset, and notifications

---

## Domain Model (Backend)

Key Mongoose models (in `server/models/`):

- **User** – base identity + roles (customer, vendor/artist, admin) and auth fields.
- **Vendor / VendorProfile** – extended profile data for artists (store name, bio, social links, images).
- **Product** – physical and digital products (title, description, images, price, stock/type metadata, category).
- **Service** – commissionable services offered by artists (title, description, delivery time, base price).
- **Commission** – commission requests and lifecycle (client, vendor, service, deadline, status).
- **Order** – checkout, line items, totals, status, and linkage to transactions/downloads.
- **Transaction** – payment records, gateway metadata.
- **Wishlist** – user’s saved items.
- **DownloadAccess** – controls which users may download which digital products.
- **Category** – taxonomy for organizing products/services.
- **PendingRegistration / Booking** – support flows for onboarding and scheduled work (if enabled in routes).

These are exposed through dedicated controllers and routes under `server/controllers/` and `server/routes/`.

---

## Major Features

### 1. Public Marketplace Experience

- **Landing Page** (`LandingPage.jsx`)
  - Hero section explaining the value prop (creator marketplace 2.0).
  - Curated category cards (Fine Art, 3D Models, Merchandise, Commissions).
  - Featured artworks grid with animated glassmorphism UI.
  - Social proof (testimonials, live creators stats).
- **Browsing**
  - Category‑driven browsing for **digital art, photography, music/audio, collectibles, merch, commissions**.
  - Product detail pages with price, stock, and add‑to‑cart.
  - Search/browse pages such as `ShopPage`, `MerchandisePage`, `ServicesPage`, `TShirtsPage`, `ArtistsPage`.

### 2. Artist / Vendor Experience

- **Vendor Dashboard** (`pages/vendor/*`)
  - `VendorDashboard` – at‑a‑glance stats (orders, revenue, active services/commissions).
  - `VendorProducts` & `AddProduct` – CRUD for products, stock + pricing control.
  - `VendorServices` & `AddService` – managing commission offerings with delivery time and base price.
  - `VendorOrders`, `VendorCommissions`, `VendorPayouts` – operational tools for fulfilling work and tracking income.
  - `VendorProfile` – configure store branding, profile image, bio, social and portfolio links.
- **Public Artist Profiles** (`ArtistProfile.jsx`)
  - Rich profile card with avatar/cover, store name, bio, location, links (Instagram, Twitter, portfolio).
  - Public product catalog for that artist.
  - Commission services listing with pricing, delivery time, and “Request Service” actions.

### 3. Customer Experience

- **Auth & Onboarding**
  - `SignupPage`, `LoginPage`, `VerifyEmailPage`.
  - `ForgotPassword` / `ResetPassword` flows using secure email tokens.
- **Shopping Journey**
  - Persistent cart (`CartContext`) with cart UI (`CartPage`).
  - Wishlist functionality (`WishlistContext`, `WishlistPage`).
  - Smooth checkout → Orders and payment via Razorpay.
- **Post‑Purchase**
  - `OrdersPage` + `OrderDetailPage` – full order history and status badges.
  - `DownloadsPage` – list of digital assets available for download post‑purchase.
  - `Dashboard` – personal overview:
    - Stats tiles (total orders, digital downloads, active commissions, pending reviews).
    - Recent orders table with status chips.
    - Active commissions list with deadlines and statuses.
  - `ProfilePage` – account info, addresses, and preferences.

### 4. Admin Experience

Admin routes (`pages/admin/*` and `server/routes/adminRoutes.js` + `adminController.js`) provide:

- **AdminDashboard** – platform KPIs.
- **AdminUsers** – user management (activate, block, assign roles).
- **AdminVendors** – vendor verification and curation.
- **AdminProducts / AdminServices** – high‑level moderation of listings.
- **AdminCategories** – manage categories/taxonomy for the marketplace.
- **AdminOrders / AdminCommissions** – oversight on transactions and work in progress.

All admin APIs are protected by JWT + role middleware.

---

## API Surface (High Level)

All APIs are mounted under `/api/*` in `server/index.js`:

- `/api/auth` – registration, login, email verification, password reset.
- `/api/users` – user profile, user dashboard stats, artist public endpoints.
- `/api/vendor` – vendor setup, vendor dashboard, vendor products/services management.
- `/api/categories` – CRUD for categories.
- `/api/products` – product listing, details, filtering.
- `/api/services` – commission services listing and details.
- `/api/commissions` – create/manage commission requests and status.
- `/api/orders` – checkout, orders, and downloads eligibility.
- `/api/wishlist` – wishlist CRUD.
- `/api/admin` – privileged admin operations.

---

## Tech Stack Summary

- **Frontend**
  - React (Vite)
  - React Router
  - Tailwind CSS
  - Framer Motion
  - Lucide Icons
  - Axios
  - React Hot Toast

- **Backend**
  - Node.js + Express
  - MongoDB + Mongoose
  - JWT auth, bcryptjs
  - Helmet, CORS, rate limiting
  - Cloudinary + Multer for file uploads
  - Razorpay for payments
  - Nodemailer for email flows

---

## Running the Project Locally

### 1. Prerequisites

- Node.js (LTS)
- MongoDB instance (local or cloud, e.g. Atlas)
- Cloudinary account (for image storage)
- Razorpay test keys

### 2. Environment Variables

Create `.env` files for both **server** and **client**.

**Server (`server/.env`) – example keys**

- `PORT=5000`
- `MONGO_URI=...`
- `JWT_SECRET=...`
- `CLOUDINARY_CLOUD_NAME=...`
- `CLOUDINARY_API_KEY=...`
- `CLOUDINARY_API_SECRET=...`
- `RAZORPAY_KEY_ID=...`
- `RAZORPAY_KEY_SECRET=...`
- `SMTP_HOST=...`
- `SMTP_PORT=...`
- `SMTP_USER=...`
- `SMTP_PASS=...`
- `CLIENT_URL=http://localhost:5173`

**Client (`client/.env`) – example keys**

- `VITE_API_URL=http://localhost:5000/api`

### 3. Install Dependencies

From the project root:

```bash
cd server
npm install

cd ../client
npm install
```

### 4. Start Development Servers

In two terminals:

```bash
# Terminal 1 – backend
cd server
npm run dev

# Terminal 2 – frontend
cd client
npm run dev
```

Open the client URL printed by Vite (usually `http://localhost:5173`).

---

## Deployment (Conceptual)

- **Client**: built as a static React SPA via `npm run build` in `client/` and deployed to a static host (e.g. Vercel). CORS is configured to allow the deployed front‑end domain.
- **Server**: deployed as a Node.js service (Render, Railway, etc.) with environment variables set for MongoDB, Cloudinary, Razorpay, and email provider. Health checks are served at `/` (`KalaVPP API`).

---

## How to Demo / Pitch This Project

- **Story**: Position KalaVPP as a **Creator OS** for Indian and global digital artists – one place to monetize products, commissions, and merch.
- **Flow to show in a demo**:
  1. Walk through the **LandingPage** and highlight UI polish and categories.
  2. Sign up as a user, explore **Shop**, add items to **Cart** and **Wishlist**.
  3. Show **Dashboard**, **Orders**, and **Downloads**.
  4. Switch to a **Vendor** account, configure the **VendorProfile**, add a product and a commission service, and show how it appears on the public **ArtistProfile** page.
  5. Log in as **Admin**, quickly tour the admin panels (users, vendors, orders, categories).
- **Key selling points**:
  - Full real‑world architecture: role‑based access, secure REST API, payment integration, media handling.
  - Modern UX with motion, theming, and dashboards.
  - Clean separation of concerns between client and server, ready for scaling into a production product.

---

## Future Enhancements (Ideas)

- In‑app messaging between clients and artists for commissions.
- Review and rating system for products and services.
- Advanced search and discovery (tags, filters, recommendations).
- Analytics dashboards for vendors (revenue over time, top products, conversion funnels).
- Multi‑currency and multi‑language support to deepen global reach.

