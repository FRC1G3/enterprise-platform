# Deployment Insights

## 1. Development, Preview, and Production

Development uses a local developer database. Vercel creates an isolated Preview Deployment for every pull request and a Production Deployment from `main`. Each environment should have separate environment values and, whenever possible, separate databases.

## 2. Environment variables and secrets

`DATABASE_URL` and `JWT_SECRET` are server-only. The secret must contain at least 32 characters, and the database value must be a PostgreSQL URL. `CORS_ALLOWED_ORIGINS` is optional; `NODE_ENV` and optional `VERCEL_ENV` identify the runtime. Configure separate Development, Preview, and Production values in Vercel. Never put credentials in `NEXT_PUBLIC_*`, source control, logs, analytics, or Docker layers.

`lib/env/server.ts` validates configuration with Zod and reports only invalid variable names, never values. Database and JWT configuration reuse it.

## 3. Vercel architecture and deployment choice

Vercel is primary because it provides managed Next.js builds, HTTPS, immutable deployments, previews, runtime logs, and rollback. PostgreSQL is an external durable service. Vercel Git integration deploys pull requests and `main`; GitHub Actions validates but does not deploy.

## 4. Prisma Client generation

`postinstall` runs `prisma generate`. `vercel-build` generates again before migrations and compilation so the production sequence is explicit.

## 5. Production migrations

Vercel runs `prisma generate && prisma migrate deploy && next build`. `migrate deploy` applies checked-in pending migrations. Production never uses `migrate dev` or `db push`. Changes must be backward compatible because application rollback does not undo database migrations.

## 6. Manual demo seeding

Seed data remains separate and never runs during deployment. Stable-key upserts make repeated explicit demo runs reasonably idempotent.

> **Safety warning:** `npm run db:seed` updates demo accounts, passwords, products, and inventory. Confirm `DATABASE_URL` targets the intended disposable demo database. Do not run it casually against Production.

## 7. GitHub Actions CI

CI runs on pull requests and pushes to `main`, with read-only repository permissions and cancellation of outdated branch runs. It uses Node.js 24 LTS, npm caching, `npm ci`, Prisma generation, migration deployment, ESLint, TypeScript, a production build, concurrency verification, and high-severity production dependency auditing.

## 8. PostgreSQL in CI

CI uses a disposable PostgreSQL 17 service with a health check, CI-only URL, and non-production JWT secret. The focused test creates uniquely named temporary records and removes them in `finally`.

## 9. Vercel Preview Deployments

Every pull request receives a Preview Deployment after Git integration is connected. Configure preview-scoped variables, inspect build logs, open `/api/health`, and test authentication and checkout before merging.

## 10. Production deployment

Use the Next.js preset, `npm run vercel-build`, Production-scoped variables, and deploy `main`. Vercel provides HTTPS at its edge.

## 11. Rollback strategy

In Vercel Deployments, select a previously successful deployment and promote or redeploy it. Then verify `/api/health` and critical commerce flows.

## 12. Database migration rollback limitations

Promoting old code does not reverse migrations. Prefer expand-and-contract changes and correct problems with a reviewed forward migration.

## 13. Error boundaries

`app/error.tsx` offers retry and navigation, `app/global-error.tsx` provides a root HTML fallback, and `app/not-found.tsx` provides useful navigation. None display exception text, stacks, or secrets.

## 14. Health monitoring

Unauthenticated `GET /api/health` performs `SELECT 1`, returns only status and an ISO timestamp, uses `no-store`, and responds with `200` or `503`. It never returns SQL errors or credentials and is suitable for uptime polling.

## 15. Web Analytics

Vercel Web Analytics provides aggregate page and traffic analytics. The official App Router component is mounted without custom commerce events.

## 16. Speed Insights and Core Web Vitals

Speed Insights reports field performance. The budget is LCP ≤ 2.5 s, INP ≤ 200 ms, and CLS ≤ 0.1 at the 75th percentile. Preserve Server Components, avoid unnecessary client JavaScript, lazy-load Recharts, optimize images, keep private APIs `no-store`, and revalidate only public catalog data.

## 17. Runtime logs and debugging

Vercel build and runtime logs support debugging. Logs must never contain passwords, JWTs, cookies, URLs with credentials, addresses, carts, or complete customer/order records.

## 18. E-commerce customer data protection

JWTs remain in HTTP-only secure production cookies. Authentication, ownership, and RBAC stay server-enforced. No emails, addresses, order details, JWTs, carts, or customer information are intentionally sent to analytics.

## 19. Inventory consistency and checkout idempotency

Existing serializable transactions, conditional stock updates, database constraints, variant uniqueness, checkout idempotency keys, and exactly-once cancellation restoration remain unchanged. CI applies real migrations and verifies these protections against PostgreSQL.

## 20. Security headers and dependency scanning

The proxy preserves CORS allowlisting, cross-site mutation blocking, private API caching, production HSTS, MIME and frame protections, referrer policy, permissions policy, authentication, and RBAC. A CSP was not added because a safe strict policy for Next.js and Vercel monitoring needs deliberate nonce support; a static policy could break hydration. CI audits production dependencies, and Dependabot opens weekly grouped minor/patch PRs without auto-merge.

## 21. Docker alternative

The multi-stage image generates Prisma Client, builds standalone output, and runs unprivileged without copying `.env`. BuildKit secrets named `database_url` and `jwt_secret` provide build-time configuration without storing it in image layers. Run `prisma migrate deploy` as a separate release job before starting a container. Vercel remains primary.

## 22. Remaining limitations and learning trade-offs

There is no real payment processing, distributed rate-limit store, end-to-end suite, error-tracking vendor, automated backups, multi-region database, WebSockets, uploads, or multi-tenancy. The design favors affordable student infrastructure: Vercel, PostgreSQL, and GitHub Actions. Build-time migration is simple for this assignment, while larger systems often use a separate migration job. Docker adds portability without replacing the optimized Vercel path.
