# Nova Store Enterprise Platform

Nova Store is a full-stack e-commerce platform built to demonstrate enterprise backend integration patterns with Next.js App Router, PostgreSQL, Prisma, JWT authentication, secure API routes, Server Actions, SWR caching, optimistic updates, audit logging, analytics, and role-based administration.

The platform includes both a customer storefront and a protected administration interface.

## Chosen Platform

The selected domain is:

**E-commerce Platform — Shopify-style**

This domain was selected because it provides multiple business-critical workflows that require reliable backend integration:

- Product catalog management
- Inventory tracking
- Customer registration and authentication
- Shopping cart management
- Checkout and order processing
- Administrative order management
- User and role management
- Revenue and product analytics
- Audit history and security monitoring

The project focuses on protecting customer data, preventing unauthorized administrative access, maintaining inventory consistency, and providing traceable business operations.

## Core Features

### Customer Experience

Customers can:

- Register and log in
- Browse and filter products
- View product details
- Select product sizes and colors
- Add products to a persistent cart
- Update quantities with optimistic UI
- Remove cart items
- Complete checkout
- Create orders
- View order history
- View individual order details
- View account details and saved customer information
- Log out securely

### Administration

Administrators can:

- Access a protected dashboard
- View live revenue and order metrics
- View analytics for 7, 30, or 90 days
- Create, edit, search, filter, and delete products
- Manage inventory and reserved stock
- Search and filter orders
- Update order and payment statuses
- Cancel orders and restore inventory
- Search and manage users
- Change user roles
- Activate or deactivate accounts
- View audit activity
- Filter activity by action, entity, user, status, and date
- Load activity history with cursor-based infinite scrolling

## Technology Stack

### Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- SWR
- Recharts
- Next.js Image
- React Server Components
- Client Components where interaction is required

### Backend

- Next.js Route Handlers
- Next.js Server Actions
- PostgreSQL
- Prisma ORM
- Zod validation
- JWT authentication with `jose`
- Password hashing with `bcryptjs`

### Reliability and Security

- HTTP-only session cookies
- Role-based access control
- Protected routes and API endpoints
- Zod request validation
- Database transactions
- Inventory consistency checks
- Rate limiting
- CORS origin validation
- Cross-site mutation protection
- Security response headers
- Audit logging
- Session refresh
- Request timeouts
- SWR retry and revalidation
- Optimistic cart updates with rollback

## Architecture Overview

```text
Browser
  |
  |-- Public pages
  |     |-- Product catalog
  |     |-- Product details
  |     |-- Login and registration
  |
  |-- Protected customer pages
  |     |-- Cart
  |     |-- Checkout
  |     |-- Profile
  |     |-- Order history
  |
  |-- Protected admin pages
        |-- Dashboard
        |-- Analytics
        |-- Products
        |-- Orders
        |-- Inventory
        |-- Users
        |-- Activity logs
                |
                v
Next.js Application
  |
  |-- Proxy
  |     |-- Route protection
  |     |-- CORS
  |     |-- Security headers
  |     |-- Cross-site mutation checks
  |
  |-- Route Handlers
  |     |-- Authentication API
  |     |-- Product API
  |     |-- Cart API
  |     |-- Order API
  |     |-- Inventory API
  |     |-- Admin API
  |
  |-- Server Actions
  |     |-- Product creation
  |     |-- Product updates
  |
  |-- Service Layer
  |     |-- Business rules
  |     |-- Authorization
  |     |-- Transactions
  |     |-- Serialization
  |     |-- Audit logging
  |
  v
Prisma ORM
  |
  v
PostgreSQL
```

## Main Data Models

### User

Stores:

- Name and email
- Password hash
- Role
- Account status
- Contact information
- Shipping address
- Created and updated timestamps

User roles:

- `USER`
- `ADMIN`

### Product

Stores:

- Name
- Slug
- Description
- Price
- Original price
- Category
- SKU
- Main and additional images
- Colors
- Sizes
- Rating and review count
- Featured, new, and active states

### Inventory

Stores:

- Total quantity
- Reserved quantity
- Product relationship
- Created and updated timestamps

Available inventory is calculated as:

```text
available quantity = total quantity - reserved quantity
```

### Cart and CartItem

Each authenticated user has a persistent database-backed cart.

Cart items store:

- Product
- Quantity
- Selected color
- Selected size
- A deterministic variant key

Totals are calculated by the server and include:

- Item count
- Subtotal
- Shipping
- Discount
- Total

Exact variants are unique per cart at the database level. Cart add and update operations run in Serializable transactions with up to three retries for PostgreSQL serialization conflicts. Stock validation sums every size and color for the product, while different variants remain separate cart lines. Changing a line to an existing exact variant merges the quantities safely.

### Order and OrderItem

Orders store a permanent checkout snapshot:

- Customer contact information
- Shipping address
- Order status
- Payment status
- Payment method
- Subtotal
- Shipping
- Discount
- Total
- Notes

Order items store product names, prices, images, selected variants, and quantities at the time of purchase.

This prevents historical orders from changing when a product is later edited.

### ActivityLog

Stores traceable platform operations:

- User
- Action
- Entity
- Entity ID
- Description
- IP address
- Status
- Metadata
- Timestamp

### RateLimitBucket

Stores database-backed request counters for protected operations such as login attempts and order creation.

## API Routes

### Authentication

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a customer |
| POST | `/api/auth/login` | Authenticate and create a session |
| POST | `/api/auth/logout` | Delete the session |
| GET | `/api/auth/me` | Return the authenticated user and refresh the session when needed |

### Products

| Method | Route | Access |
|---|---|---|
| GET | `/api/products` | Public |
| POST | `/api/products` | Admin |
| GET | `/api/products/[id]` | Public |
| PUT | `/api/products/[id]` | Admin |
| DELETE | `/api/products/[id]` | Admin |

### Cart

| Method | Route | Access |
|---|---|---|
| GET | `/api/cart` | Authenticated user |
| POST | `/api/cart/items` | Authenticated user |
| PATCH | `/api/cart/items/[id]` | Cart owner |
| DELETE | `/api/cart/items/[id]` | Cart owner |

### Orders

| Method | Route | Access |
|---|---|---|
| GET | `/api/orders` | Authenticated user |
| POST | `/api/orders` | Authenticated user |
| GET | `/api/orders/[id]` | Order owner |
| GET | `/api/admin/orders` | Admin |
| GET | `/api/admin/orders/[id]` | Admin |
| PATCH | `/api/admin/orders/[id]` | Admin |

### Inventory

| Method | Route | Access |
|---|---|---|
| GET | `/api/inventory` | Admin |
| GET | `/api/inventory/[id]` | Admin |
| PATCH | `/api/inventory/[id]` | Admin |

### Users

| Method | Route | Access |
|---|---|---|
| GET | `/api/admin/users` | Admin |
| GET | `/api/admin/users/[id]` | Admin |
| PATCH | `/api/admin/users/[id]` | Admin |

### Analytics and Activity

| Method | Route | Access |
|---|---|---|
| GET | `/api/admin/analytics` | Admin |
| GET | `/api/admin/activity` | Admin |

## Authentication Architecture

The platform uses JWT authentication implemented without an external authentication framework.

Authentication flow:

1. The user submits login credentials.
2. Zod validates the request.
3. The server verifies the password hash.
4. A signed JWT is created.
5. The JWT is stored in an HTTP-only cookie.
6. Protected APIs read and verify the cookie.
7. The current user is loaded from PostgreSQL.
8. Role and account status are checked.
9. Sessions are refreshed when they approach expiration.

The JWT cookie is:

- HTTP-only
- SameSite `lax`
- Secure in production
- Unavailable to browser JavaScript

Normal sessions last one day. Remembered sessions last seven days.

## Authorization

Authentication verifies who the user is.

Authorization determines what the user can do.

Examples:

- Public users can view products.
- Authenticated customers can manage only their own carts and orders.
- Administrators can manage products, inventory, orders, users, analytics, and activity history.
- A normal user receives `403 Forbidden` when accessing an admin API.
- An unauthenticated request receives `401 Unauthorized`.

The system also prevents:

- An administrator from removing their own admin access
- Deactivating the final active administrator
- Customers from viewing another customer's orders
- Cart items from being modified by another user

## Product Server Actions

Product creation and editing use Server Actions.

The form provides:

- Native form submission
- Server-side validation
- Client-side validation
- Pending state
- Field-level errors
- Success and failure states
- Rate limiting
- Audit logging
- Cache revalidation

This design supports progressive enhancement because the form uses the native `action` mechanism rather than depending only on a custom client-side fetch request.

## Cart Optimistic Updates

Cart quantity changes and item removal use SWR optimistic updates.

The interaction flow is:

1. The UI updates immediately.
2. The request is sent to the server.
3. The server validates ownership and stock.
4. The cache is replaced with the server response.
5. When the request fails, SWR restores the previous cart automatically.

This improves perceived speed without sacrificing server validation.

## Checkout and Inventory Consistency

Order creation is executed inside a Prisma transaction.

The transaction:

1. Loads the customer's cart.
2. Confirms the cart is not empty.
3. Confirms each product is active.
4. Confirms sufficient available inventory.
5. Calculates authoritative totals.
6. Decrements inventory conditionally.
7. Creates the order.
8. Creates order items.
9. Clears the cart.
10. Updates the customer's saved address.
11. Writes an activity log.

If any operation fails, the complete transaction is rolled back.

Order totals are never trusted from the client.

Checkout requests require a UUID `Idempotency-Key` header. The browser keeps one key for the current checkout intent, and the database uniquely scopes it to the authenticated user. A replay returns the existing order without decrementing inventory, clearing the cart, or writing the order activity twice. New orders return `201`; replays return `200` with `Idempotency-Replayed: true`.

## Order Cancellation

When an administrator cancels an order:

- Product inventory is restored
- A paid order is automatically marked as refunded when appropriate
- The operation is written to the activity log
- A cancelled order cannot be reopened
- A delivered order cannot be cancelled

Cancellation first performs an atomic expected-state transition inside a Serializable transaction. Only the transaction that changes the order to `CANCELLED` restores inventory and writes the successful audit record. Order statuses follow a forward-only graph: pending orders may be confirmed, processed, or cancelled; confirmed orders may be processed or cancelled; processing orders may be shipped or cancelled; shipped orders may be delivered; delivered and cancelled orders are terminal.

## Data Fetching and Caching

SWR is used for client-side server data.

Implemented behaviors include:

- Shared cache
- Request deduplication
- Revalidation on focus
- Revalidation after reconnecting
- Controlled retry for safe GET requests
- Loading and validation states
- Optimistic mutation
- Rollback on failure
- Infinite scrolling for activity history

Sensitive APIs use private, no-store cache headers.

React Server Components are used when interactive client state is unnecessary.

## Activity Infinite Scrolling

The activity API uses cursor-based pagination instead of page-number offsets.

Each response includes:

- Items
- Total matching count
- Next cursor
- Whether more results exist
- Available filter values

The browser uses `IntersectionObserver` to request the next page when the user approaches the bottom of the list.

A manual `Load more` button is also available.

## Rate Limiting

Database-backed rate limiting protects critical operations.

Policies include:

- Login attempts
- Registration
- Order creation
- Administrative mutations

Rate-limit responses use:

```text
HTTP 429 Too Many Requests
Retry-After
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
```

Rate-limit identifiers are hashed before being stored.

## CORS and Request Protection

The root `proxy.ts` file implements:

- Allowed-origin checking
- CORS response headers
- OPTIONS preflight handling
- Cross-site mutation blocking
- Protected-page redirects
- Private API cache policies
- Security headers

Configured origins are read from:

```env
CORS_ALLOWED_ORIGINS=
```

Multiple origins can be separated with commas.

## Security Headers

Responses include headers such as:

- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Strict-Transport-Security` in production

## Analytics

The admin dashboard calculates live data from PostgreSQL.

Metrics include:

- Revenue
- Number of orders
- Number of customers
- Number of active products
- Average order value
- Sales trend
- Customer growth
- Sales by category
- Top-selling products
- Order status distribution
- Low-stock products
- Recent platform activity

Analytics can be filtered by:

- Last 7 days
- Last 30 days
- Last 90 days

Chart components are dynamically loaded to reduce the initial JavaScript bundle.

## Project Structure

```text
enterprise-platform/
├── app/
│   ├── actions/
│   ├── admin/
│   ├── api/
│   ├── cart/
│   ├── checkout/
│   ├── login/
│   ├── orders/
│   ├── products/
│   ├── profile/
│   ├── register/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── cart/
│   ├── dashboard/
│   ├── layout/
│   ├── orders/
│   ├── products/
│   └── ui/
├── hooks/
├── lib/
│   ├── auth/
│   ├── contexts/
│   ├── security/
│   ├── services/
│   └── swr/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── schemas/
├── types/
├── proxy.ts
├── prisma.config.ts
├── next.config.ts
├── package.json
├── PLATFORM-INSIGHTS.md
└── README.md
```

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/enterprise_platform?schema=public"

JWT_SECRET="replace-this-with-a-random-secret-containing-at-least-32-characters"

CORS_ALLOWED_ORIGINS="http://localhost:3000"
```

Never commit the real `.env` file.

Use `.env.example` as the public template.

The `JWT_SECRET` value in `.env.example` is only a placeholder. Replace it with a real secret containing at least 32 characters before running the application.

## Local Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Create the PostgreSQL database

Example database name:

```text
enterprise_platform
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and insert the local PostgreSQL connection information.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Apply migrations

For local development:

```bash
npx prisma migrate dev
```

For an existing production build:

```bash
npx prisma migrate deploy
```

Migration `20260723090000_concurrency_and_idempotency_protection` backfills and deduplicates cart variant identities without losing quantities, adds checkout idempotency, adds numeric PostgreSQL CHECK constraints, and adds stable-ordering indexes. Existing data should be checked before deployment; `scripts/preflight-concurrency-migration.mjs` performs the non-destructive numeric preflight.

### 6. Seed development data

```bash
npx tsx prisma/seed.ts
```

### 7. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Development Demo Accounts

These accounts are created only by the development seed script.

### Customer

```text
Email: user@novastore.com
Password: password123
```

### Administrator

```text
Email: admin@novastore.com
Password: admin123
```

These credentials must not be used in production.

## Available Commands

Start the development server:

```bash
npm run dev
```

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Start the production server after building:

```bash
npm run start
```

Generate Prisma Client:

```bash
npx prisma generate
```

Check migration state:

```bash
npx prisma migrate status
```

Open Prisma Studio:

```bash
npx prisma studio
```

## Manual Quality Checks

Before submission, verify:

### Authentication

- Registration creates a user
- Login creates an HTTP-only cookie
- Invalid credentials return `401`
- Normal users cannot access admin routes
- Inactive users cannot log in
- Logout clears user and cart state
- `/api/auth/me` returns the current user

### Products

- Product search and filters work
- Admin creation works through a Server Action
- Admin editing works
- Product deletion works
- Duplicate SKU and slug conflicts return proper errors

### Cart

- Products can be added from the catalog
- Products can be added from the detail page
- Header quantity updates
- Quantity changes are optimistic
- Failed mutations roll back
- Cart data remains after refresh

### Checkout

- Checkout shows only real cart items
- Empty carts cannot create an order
- Totals are calculated on the server
- Inventory decreases after ordering
- Cart is cleared after ordering
- The created order opens correctly

### Orders

- Customers see only their own orders
- Administrators see all orders
- Order status filters work
- Cancellation restores inventory
- Paid cancellation updates payment status to refunded

### Administration

- Inventory can be updated
- Reserved quantity cannot exceed total quantity
- Users can be filtered
- User roles and statuses can be updated
- The final active administrator is protected
- Dashboard and analytics show real database data

### Security

- Login rate limiting returns `429`
- Invalid CORS origins return `403`
- CORS preflight returns `204`
- Private APIs use no-store caching
- Audit records contain action, entity, status, and IP information

## Automated Quality Commands

Run before every final commit:

```bash
npm run lint
npm run build
```

Both commands must finish without errors.

## Current Scope and Limitations

This is an educational enterprise integration project, not a production payment platform.

Current limitations:

- Mock card payment does not contact a real payment provider
- Product images use external URLs instead of file uploads
- No email verification
- No password reset flow
- No two-factor authentication
- No real shipping provider
- No tax engine
- No webhook integrations
- No WebSocket notification system
- No product recommendation engine
- No automated test suite yet
- Database rate limiting is suitable for the project scope but a distributed production platform would normally use a shared high-speed store
- Audit logs are viewable but do not yet have archival or retention policies

## Possible Production Improvements

Future development could add:

- Stripe or another payment provider
- Email verification and password recovery
- Two-factor authentication
- Redis-based distributed rate limiting
- Background job processing
- Payment and shipping webhooks
- File upload and malware scanning
- Product recommendations
- Real-time administrative notifications
- Structured application monitoring
- Automated unit, integration, and end-to-end tests
- Database backups and disaster recovery
- Audit retention policies
- Containerized deployment
- CI/CD workflows

## Conclusion

Nova Store demonstrates how an e-commerce application can combine customer workflows with enterprise backend patterns.

The platform includes secure authentication, protected APIs, reliable transactions, server-side validation, persistent carts, order and inventory consistency, optimistic interfaces, audit history, analytics, rate limiting, CORS protection, session refresh, and role-based administration.

The project is designed to show not only that a feature works, but also how it remains secure, traceable, and consistent when multiple backend operations interact.
