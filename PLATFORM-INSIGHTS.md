# Platform Insights

## 1. Project Overview

For this project, I selected an e-commerce platform inspired by Shopify-style product, inventory, customer, and order workflows.

My main goal was not only to build a store interface. The larger goal was to understand how a frontend communicates with a secure backend while maintaining authentication, authorization, data consistency, performance, and traceability.

The final platform contains a customer storefront and a protected administration dashboard.

## 2. Why I Selected E-commerce

E-commerce is a useful domain for learning enterprise backend integration because several related operations must remain consistent.

For example, creating an order affects:

- The authenticated customer
- The shopping cart
- Product prices
- Inventory
- Order items
- Shipping information
- Payment status
- Activity history
- Dashboard analytics

A failure in one step can create incorrect inventory, duplicate orders, incorrect totals, or lost customer data.

This made e-commerce a suitable domain for practicing transactions, validation, authorization, caching, optimistic UI, and audit logging.

## 3. Main Domain Entities

The primary entities are:

- Users
- Products
- Inventory
- Carts
- Cart items
- Orders
- Order items
- Activity logs
- Rate-limit buckets

I learned that the database model should represent business relationships rather than only the visible interface.

For example, an order item stores a product snapshot. It does not depend only on the current product row because a product name, image, or price may change after an order is created.

## 4. Layered Architecture

The project uses a layered structure:

```text
Page or component
    ↓
API route or Server Action
    ↓
Authentication and validation
    ↓
Service layer
    ↓
Prisma
    ↓
PostgreSQL
```

The service layer contains business rules instead of placing all logic inside route files.

This separation made the project easier to reason about because:

- Routes handle HTTP behavior
- Zod handles input validation
- Authentication guards handle identity and permissions
- Services handle business operations
- Prisma handles database communication
- Serializers convert database values into frontend-safe objects

## 5. Server Components and Client Components

I used Server Components when the page could load data directly on the server without browser interaction.

Examples include:

- Order detail pages
- Admin dashboard
- Admin order detail pages

I used Client Components when browser state and interaction were required.

Examples include:

- Product filters
- Cart updates
- Checkout form
- Admin search interfaces
- Analytics period selection
- Activity infinite scrolling

I learned that making every component a Client Component increases browser JavaScript and removes some of the benefits of the App Router.

## 6. REST API Design

The project uses REST-style Route Handlers.

Examples:

```text
GET    /api/products
POST   /api/products
GET    /api/products/[id]
PUT    /api/products/[id]
DELETE /api/products/[id]
```

Other domain APIs follow the same pattern for carts, orders, inventory, users, analytics, and activity.

I learned to use HTTP status codes consistently:

- `200` for successful reads and updates
- `201` for created resources
- `204` for CORS preflight
- `400` for invalid input
- `401` for missing or invalid authentication
- `403` for insufficient permissions
- `404` for missing resources
- `409` for business conflicts
- `429` for rate limits
- `500` for unexpected server failures

## 7. Request Validation

The platform validates incoming data with Zod.

Validation exists for:

- Authentication
- Product creation and updates
- Cart items
- Checkout
- Admin order filters
- Inventory changes
- User management
- Analytics periods
- Activity filters

Client validation improves user experience, but server validation remains the authoritative security boundary.

I learned that TypeScript types disappear at runtime. Zod is needed because external input cannot be trusted only because the project is written in TypeScript.

## 8. Authentication

The authentication system is implemented with signed JWTs.

The token contains:

- User ID
- Email
- Role
- Remember-me state
- Issued time
- Expiration time

The JWT is stored in an HTTP-only cookie.

This protects the token from normal browser JavaScript access.

The `/api/auth/me` endpoint verifies the token and loads the current user from PostgreSQL. This is important because user role and account status can change after the token was originally issued.

## 9. Authentication and Authorization

Authentication answers:

```text
Who is this user?
```

Authorization answers:

```text
Is this user permitted to perform this operation?
```

The system contains separate checks for:

- Any authenticated user
- Administrator access
- Ownership of a cart
- Ownership of an order
- Active account state

I learned that hiding an admin button in the interface is not authorization. The API and service layer must also reject unauthorized requests.

## 10. Session Refresh

Normal sessions and remembered sessions use different lifetimes.

The application periodically calls `/api/auth/me`.

The session is also checked when:

- The browser tab receives focus
- Internet connectivity returns
- The configured interval passes

When the JWT approaches expiration, the server creates a fresh token.

I learned that automatic session refresh should happen on a trusted server endpoint rather than exposing token operations to client-side JavaScript.

## 11. Password Protection

Passwords are never stored directly.

The authentication service stores a password hash and compares login input against the hash.

I also learned that development seed credentials must be clearly separated from production credentials.

Demo passwords are acceptable for local testing but must never be reused in a deployed production system.

## 12. Role Management

The platform contains `USER` and `ADMIN` roles.

Administrative user management includes additional safety rules:

- An admin cannot remove their own administrative access
- The final active administrator cannot be deactivated or demoted
- Inactive accounts cannot authenticate

These rules protect the platform from accidentally losing all administrative access.

## 13. SWR Data Fetching

SWR manages browser-side server data.

It provides:

- Shared caching
- Request deduplication
- Focus revalidation
- Reconnect revalidation
- Loading state
- Validation state
- Controlled retry
- Mutation
- Infinite loading

Compared with manually writing every request in `useEffect`, SWR provides a more consistent data lifecycle.

I learned that server state and local component state are different concepts. Server state can become stale and needs a cache and revalidation strategy.

## 14. Sensitive Data Caching

Not all data should be cached in the same way.

Public product data can be revalidated.

Sensitive data such as:

- Current user
- Cart
- Orders
- Admin users
- Inventory
- Activity logs

uses private or no-store response policies.

I learned that performance optimization must not expose one user's private data to another user through shared caching.

## 15. Optimistic UI

The cart uses optimistic updates.

When a customer increases quantity or removes a product, the interface changes immediately.

The actual process is:

1. SWR stores the previous state.
2. The interface displays the predicted state.
3. The request is sent.
4. The server validates stock and ownership.
5. The server result becomes the final cache.
6. A failure restores the previous state.

Optimistic UI is useful when the expected operation is likely to succeed and can be safely rolled back.

It should not replace server validation.

## 16. Server Actions

Product creation and product editing use Server Actions.

This taught me the difference between Route Handlers and Server Actions.

Route Handlers are useful for:

- REST APIs
- External clients
- Explicit HTTP methods
- Reusable JSON endpoints

Server Actions are useful for:

- Application-owned form submissions
- Direct server processing
- Progressive enhancement
- Returning form states
- Revalidating application routes

The product form still validates data on the server, checks admin permissions, applies rate limiting, and writes audit records.

## 17. Progressive Enhancement

The product form uses the native form action mechanism.

JavaScript enhances the experience with:

- Pending state
- Client-side checks
- Image preview
- Field errors
- Success messages
- Client navigation

The fundamental submission path is still connected to a server action.

I learned that accessibility and reliability improve when the core form behavior does not depend completely on custom browser-side request code.

## 18. Cart Ownership

Each cart belongs to one user.

Cart update and deletion APIs accept cart-item IDs, not product IDs.

The server verifies that the requested cart item belongs to the authenticated user.

This prevents a customer from modifying another customer's cart by guessing an ID.

Each exact color-and-size combination also has a deterministic, non-null variant key. A database unique constraint prevents duplicate exact variants, while different variants keep separate cart-item IDs. When an update collides with an existing variant, the service merges quantities inside the same transaction.

## 19. Server-Authoritative Cart Totals

The server calculates:

- Item count
- Subtotal
- Shipping
- Discount
- Total

The client displays these values but does not define the final amount.

I learned that prices and financial totals must not be trusted from browser input because browser requests can be modified.

Cart mutations use Serializable Prisma transactions with a bounded three-attempt retry for PostgreSQL serialization conflicts. Validation still sums the product quantity across every variant, so concurrent size or color requests cannot both commit above available stock.

## 20. Checkout Transaction

Order creation is the most important transaction in the project.

The server transaction:

1. Loads the cart and products
2. Verifies available stock
3. Calculates totals
4. Conditionally decrements inventory
5. Creates the order
6. Creates order-item snapshots
7. Clears the cart
8. Saves customer shipping information
9. Creates an activity record

When one step fails, Prisma rolls back all steps.

I learned that database transactions are necessary when several writes represent one business operation.

Checkout also requires a user-scoped UUID idempotency key. The key has a database unique constraint, and a repeated request returns the existing order rather than repeating inventory, cart, or audit writes.

## 21. Race Conditions and Inventory

Two customers could attempt to order the same final product unit.

Checking the stock once and then updating it later is not enough.

The inventory update uses a condition requiring sufficient quantity at update time.

If the conditional update does not modify exactly one record, the order fails with a stock conflict.

This reduces the risk of overselling during concurrent requests.

Serializable retry is limited to Prisma `P2034` transaction conflicts. Validation, stock, authentication, and other business errors are not retried.

## 22. Order Snapshots

Order items store:

- Product name
- Product image
- Unit price
- Selected size
- Selected color
- Quantity
- Line total

This data is copied at checkout time.

I learned that historical business records should remain stable even when the original product changes later.

## 23. Order Status Rules

Order administration includes business rules.

Examples:

- Cancelled orders cannot be reopened
- Delivered orders cannot be cancelled
- Status changes follow an explicit forward-only transition graph
- Cancelling restores inventory exactly once through an atomic expected-state transition
- Cancelling a paid order sets payment status to refunded
- Refunded orders cannot be moved back to paid

The interface alone does not enforce these rules. They are enforced in the service layer.

## 24. Audit Logging

The activity log records important operations such as:

- Login
- Failed login
- Registration
- Logout
- Product creation
- Product update
- Product deletion
- Order creation
- Order status update
- Inventory update
- User role or status update
- Rate-limit events

Each record can include:

- User
- Action
- Entity
- Entity ID
- Description
- IP address
- Result status
- Metadata
- Timestamp

I learned that audit logging is different from normal debugging logs.

Debugging logs help developers diagnose errors. Audit logs explain who performed a business or security operation.

## 25. Infinite Scrolling

Activity logs use cursor pagination.

Offset pagination can become inefficient and can produce duplicates or missing entries when new records are inserted during navigation.

Cursor pagination continues after a known record ID.

The interface uses `IntersectionObserver` to load more activity automatically and also provides a manual button.

## 26. Rate Limiting

Critical endpoints are rate limited.

The project protects:

- Login
- Registration
- Order creation
- Admin mutations

A rate-limit bucket stores:

- Hashed identifier
- Count
- Window start
- Expiration time

I learned that rate limiting should protect expensive or sensitive operations without unnecessarily blocking normal browsing.

A large distributed production system would usually use a shared service such as Redis rather than depending only on the main relational database.

## 27. CORS

CORS decides which browser origins can access the API.

The platform:

- Reads allowed origins from the environment
- Returns CORS response headers
- Handles OPTIONS requests
- Rejects disallowed origins
- Allows credentials only for approved origins

I learned that CORS is a browser security mechanism, not a replacement for authentication.

An approved origin still needs valid authentication and authorization.

## 28. Cross-Site Mutation Protection

The proxy rejects unsafe cross-site mutations.

Unsafe methods include:

- POST
- PUT
- PATCH
- DELETE

This adds protection for cookie-authenticated endpoints.

SameSite cookies and origin checks work together to reduce cross-site request risks.

## 29. Security Headers

The proxy adds security headers that restrict:

- MIME type guessing
- Framing
- Referrer leakage
- Camera, microphone, and geolocation access
- Cross-origin window access

Production responses also use HSTS.

I learned that security is created by several layers rather than one feature.

## 30. Network Reliability

GET requests use:

- Timeouts
- Revalidation
- Controlled retries
- Reconnect recovery

Mutation requests use timeouts but are not automatically repeated.

This is important because automatically retrying an order request could accidentally create duplicate orders.

I learned that retry policy should depend on whether an operation is safe and idempotent.

## 31. Error Handling

The application handles errors at different levels:

- Zod field errors
- Authentication errors
- Authorization errors
- Resource-not-found errors
- Business conflict errors
- Rate-limit errors
- Network timeout errors
- Unexpected server errors

The interface shows useful messages without exposing database internals.

The server logs unexpected errors for development.

## 32. Dashboard Analytics

Analytics are calculated from real PostgreSQL records.

The platform calculates:

- Revenue
- Orders
- Customer growth
- Average order value
- Category revenue
- Top products
- Status distribution
- Low-stock products

Cancelled orders are excluded from revenue calculations where appropriate.

I learned that analytics definitions must be explicit. A metric is not meaningful unless the system defines which records are included.

## 33. Performance Decisions

Performance improvements include:

- Server Components
- SWR request deduplication
- Dynamic loading of chart components
- Image optimization
- Pagination
- Cursor-based infinite loading
- Controlled cache policies
- Database filtering
- Aggregated analytics queries

The Recharts bundle is loaded only when the analytics interface needs it.

## 34. Database Indexing

Indexes are useful for frequently queried fields such as:

- Email
- Product slug
- SKU
- Order number
- User relationships
- Activity creation time
- Stable activity and order ordering by creation time and ID
- Rate-limit expiration

I learned that indexes improve reads but also increase storage and write cost. They should be added according to actual query patterns.

## 35. PostgreSQL and Prisma

Prisma provides:

- Typed database queries
- Relations
- Transactions
- Migrations
- Generated model types
- Decimal handling
- Aggregate queries
- Grouping

PostgreSQL provides durable relational storage and transaction support.

Migration `20260723090000_concurrency_and_idempotency_protection` adds cart variant and checkout idempotency uniqueness, numeric CHECK constraints, safe legacy variant merging, and stable-ordering indexes.

I learned that generated types improve development safety, but business rules still need explicit service code.

## 36. Development Challenges

Important challenges included:

### Replacing mock data

The initial interface contained mock products, users, orders, activity, and analytics.

Each section had to be connected to PostgreSQL without breaking the existing interface.

### Cart identity

The delete route requires a cart-item ID, not a product ID.

This distinction was important because one product can appear as a cart line with selected variants.

The final design preserves those line IDs while using a deterministic variant key to prevent duplicate exact variants.

### Checkout consistency

Checkout needed one transaction so inventory, order records, and cart clearing could not become partially completed.

It also needed a database-backed idempotency key so concurrent delivery of the same checkout intent creates one order.

### Role changes

A JWT can contain an older role after an administrator updates the user.

The `/api/auth/me` endpoint now compares the database user with the token and refreshes the session identity when needed.

### Type inference

Prisma cursor pagination required separate query branches for cursor and non-cursor calls so TypeScript could infer valid arguments.

### Hydration warning

A hydration warning was caused by a browser extension adding attributes to the HTML body before React hydration. Testing in an extension-free browser session confirmed it was not application data mismatch.

## 37. Testing Strategy

I manually tested:

- Successful and failed login
- Registration
- Logout
- User and admin authorization
- Product CRUD
- Cart add, update, and delete
- Persistent cart loading
- Checkout
- Inventory decrement
- Order history
- Order cancellation
- Inventory restoration
- User activation and deactivation
- Analytics period changes
- Activity filters
- Infinite scrolling
- CORS allowed and blocked origins
- Login rate limiting
- Session endpoint
- ESLint
- Production build
- Focused safe concurrency verification for cart stock, variant merging, checkout idempotency, and exactly-once cancellation

The project should later add automated tests.

Important automated test categories would be:

- Unit tests for business calculations
- Integration tests for services
- API authorization tests
- Transaction tests
- End-to-end checkout tests
- Security regression tests

## 38. Security and User Experience Balance

Security controls should not make the platform unusable.

Examples of this balance include:

- HTTP-only cookies protect tokens without requiring the user to manage them
- Session refresh avoids unnecessary repeated logins
- Optimistic cart updates improve responsiveness
- Rate limits protect sensitive operations without limiting normal product browsing
- Specific validation messages help users correct input
- Admin restrictions protect the platform from accidental lockout

## 39. Current Limitations

The current project does not include:

- Real payment processing
- Email verification
- Password recovery
- Two-factor authentication
- Webhook processing
- WebSocket notifications
- File upload
- Malware scanning
- Shipping carrier integration
- Tax calculation
- Recommendation engine
- Distributed caching
- Automated test suite
- Production monitoring service
- Audit retention policy

These were not necessary to demonstrate the core enterprise backend integration patterns selected for this project.

## 40. Future Improvements

A production version could add:

- Stripe payments
- Payment idempotency keys
- Redis rate limiting
- Queue-based email and webhook processing
- Background order workflows
- Signed image uploads
- Automated inventory alerts
- OpenTelemetry monitoring
- Error tracking
- Database backups
- CI/CD
- Docker
- Kubernetes
- Unit, integration, and end-to-end testing
- Multi-region deployment
- Recommendation services

## 41. What I Learned

During this project, I learned how to:

- Design an enterprise-style backend structure
- Model e-commerce data
- Build REST APIs
- Use Server Actions
- Validate untrusted input
- Build JWT authentication
- Use HTTP-only cookies
- Refresh sessions
- Implement role-based authorization
- Protect user-owned resources
- Use Prisma transactions
- Prevent inventory inconsistency
- Build persistent carts
- Build optimistic UI
- Use SWR caching and retry
- Create cursor pagination
- Build audit trails
- Implement rate limiting
- Configure CORS
- Apply security headers
- Create real analytics
- Lazy-load large components
- Separate HTTP logic from business logic
- Test API status codes and permissions

## Conclusion

The most important lesson from this project is that enterprise backend integration is not only about connecting a form to a database.

A reliable system must consider:

- Who is making the request
- Whether that user has permission
- Whether the input is valid
- Whether multiple writes must succeed together
- Whether concurrent requests can create conflicts
- Whether cached information is safe and current
- Whether failed operations can be retried
- Whether important actions are traceable
- Whether the interface remains responsive
- Whether security controls are enforced on the server

Nova Store demonstrates these ideas through a complete e-commerce workflow from product browsing to administration, checkout, inventory, analytics, and audit history.
