# GearUp — API Integration Documentation

> **Frontend**: Next.js 16 App Router (TypeScript)
> **Backend Base URL**: `https://gear-up-iota.vercel.app`
> **Frontend Live URL**: `https://gearup-frontend-nu.vercel.app`
> **Auth mechanism**: JWT Bearer token (stored in localStorage + secure cookie)

---

## 1. Deployed URLs

| Resource | URL |
|---|---|
| **Frontend (Vercel)** | `https://gearup-frontend-nu.vercel.app` |
| **Backend API (Vercel)** | `https://gear-up-iota.vercel.app` |
| API Health check | `https://gear-up-iota.vercel.app/` |

### Environment Variables

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=https://gear-up-iota.vercel.app
NEXT_PUBLIC_APP_URL=https://gearup-frontend-nu.vercel.app
```

**Backend** (Vercel env):
```
APP_URL=https://gear-up-iota.vercel.app
FRONTEND_URL=https://gearup-frontend-nu.vercel.app
DATABASE_URL=<postgres connection string>
JWT_SECRET=<secret>
SSLCOMMERZ_STORE_ID=bdpro6a4fad3231706
SSLCOMMERZ_STORE_PASSWORD=<password>
SSLCOMMERZ_SANDBOX=true
```

---

## 2. Authentication

### JWT Flow

1. User submits login/register form → backend returns `{ user, token }`
2. Frontend calls `POST /api/auth/set-token` (Next.js internal route) to set a **server-side cookie** with `Secure: true` so the middleware can read it immediately on the next request
3. Token also stored in `localStorage` (`gearup_token`) as a fallback for client-side axios requests
4. Every API request attaches the token: `Authorization: Bearer <token>`
5. On **401** response: axios interceptor clears auth and redirects to `/auth/login?redirect=<path>`

### Why two storage mechanisms

| Storage | Used by | Purpose |
|---|---|---|
| `localStorage` | Axios interceptor (client-side API calls) | Attach `Authorization` header to every request |
| Cookie `gearup_token` | Next.js Middleware (server-side) | Protect dashboard routes before page renders |

### Token Storage (`src/lib/auth-storage.ts`)

```typescript
getToken()       // reads from localStorage → cookie fallback
setToken(token)  // writes to localStorage + document.cookie (with Secure flag on HTTPS)
clearAuth()      // removes token and user from both storages
```

### Internal API Route (`src/app/api/auth/set-token/route.ts`)

```
POST /api/auth/set-token   — sets secure cookie server-side after login/register
DELETE /api/auth/set-token — clears cookie server-side on logout
```

This route exists because `document.cookie` on HTTPS Vercel deployments requires the `Secure` flag, which must be set server-side via `response.cookies.set()` to guarantee the middleware receives it.

### Middleware Route Protection (`src/middleware.ts`)

The middleware reads `gearup_token` from cookies and checks if a **valid, non-expired JWT exists**. Role-based access control is handled client-side by each dashboard layout component.

> **Note:** The backend JWT payload contains `{ userId, iat, exp }` — **no role field**. The middleware only validates token existence and expiry; role enforcement is done by the dashboard layout components using the Zustand auth store.

| Route pattern | Protection | Redirect if denied |
|---|---|---|
| `/dashboard/*` | Valid JWT required | `/auth/login?redirect=<path>` |
| `/auth/*` | Public (no token needed) | — |
| `/gear/*`, `/`, `/payment/*`, `/api/*` | Public | — |

---

## 3. Frontend Route → Backend Endpoint Mapping

| Frontend Page | Key Component(s) | Backend Endpoint | Method | Auth |
|---|---|---|---|---|
| `/` | `HeroSection`, `FeaturedGearSection`, `CategoryChips` | `GET /api/gear`, `GET /api/categories` | GET | Public |
| `/gear` | `GearGrid`, `FilterSidebar` | `GET /api/gear?search=&category=&minPrice=&maxPrice=&sortBy=` | GET | Public |
| `/gear/[id]` | `GearDetails`, `ReviewDialog` | `GET /api/gear/:id`, `GET /api/gear/:id/reviews` | GET | Public |
| `/gear/[id]/checkout` | `RentalCheckout` | `GET /api/gear/:id`, `POST /api/rentals` | GET + POST | Customer |
| `/auth/register` | `RegisterForm` | `POST /api/auth/register` | POST | Public |
| `/auth/login` | `LoginForm` | `POST /api/auth/login` | POST | Public |
| `/dashboard/customer` | `CustomerOverview` | `GET /api/rentals`, `GET /api/payments`, `GET /api/auth/me` | GET | Customer |
| `/dashboard/customer/orders` | `CustomerOrdersPage` | `GET /api/rentals` | GET | Customer |
| `/dashboard/customer/orders/[id]` | `OrderDetailsPage`, `ReviewDialog` | `GET /api/rentals/:id`, `GET /api/gear/:id/reviews` | GET | Customer |
| `/dashboard/customer/orders/[id]/pay` | `PayPage` | `GET /api/rentals/:id`, `POST /api/payments/create` | GET + POST | Customer |
| `/payment/success` | `PaymentSuccessPage` | Reads URL params from SSLCommerz redirect | — | Public |
| `/payment/cancel` | `PaymentCancelPage` | Reads URL params from SSLCommerz redirect | — | Public |
| `/dashboard/customer/payments` | `CustomerPaymentsPage` | `GET /api/payments` | GET | Customer |
| `/dashboard/customer/settings` | `ProfileForm`, `ChangePasswordForm` | `PUT /api/auth/me`, `PATCH /api/auth/change-password` | PUT + PATCH | Customer |
| `/dashboard/provider` | `ProviderOverview` | `GET /api/provider/gear`, `GET /api/provider/orders` | GET | Provider |
| `/dashboard/provider/gear` | `ProviderGearPage` | `GET /api/provider/gear`, `PUT /api/provider/gear/:id`, `DELETE /api/provider/gear/:id` | GET + PUT + DELETE | Provider |
| `/dashboard/provider/gear/new` | `GearForm` | `POST /api/provider/gear` | POST | Provider |
| `/dashboard/provider/gear/[id]/edit` | `GearForm` | `GET /api/provider/gear`, `PUT /api/provider/gear/:id` | GET + PUT | Provider |
| `/dashboard/provider/orders` | `ProviderOrdersPage` | `GET /api/provider/orders`, `PATCH /api/provider/orders/:id` | GET + PATCH | Provider |
| `/dashboard/provider/settings` | `ProfileForm`, `ChangePasswordForm` | `PUT /api/auth/me`, `PATCH /api/auth/change-password` | PUT + PATCH | Provider |
| `/dashboard/admin` | `AdminDashboardPage` | `GET /api/admin/users`, `GET /api/admin/gear`, `GET /api/admin/rentals` | GET | Admin |
| `/dashboard/admin/users` | `AdminUsersPage` | `GET /api/admin/users`, `PATCH /api/admin/users/:id` | GET + PATCH | Admin |
| `/dashboard/admin/gear` | `AdminGearPage` | `GET /api/admin/gear` | GET | Admin |
| `/dashboard/admin/rentals` | `AdminRentalsPage` | `GET /api/admin/rentals`, `GET /api/admin/gear` (provider lookup) | GET | Admin |

---

## 4. API Service Modules (`src/api/`)

### `authApi.ts`

| Function | Method | Endpoint | Payload |
|---|---|---|---|
| `register(data)` | POST | `/api/auth/register` | `{ name, email, password, role, phone?, address? }` |
| `login(data)` | POST | `/api/auth/login` | `{ email, password }` |
| `getMe()` | GET | `/api/auth/me` | — (Bearer token) |
| `updateProfile(data)` | PUT | `/api/auth/me` | `{ name?, email?, phone?, address? }` |
| `changePassword(data)` | PATCH | `/api/auth/change-password` | `{ oldPassword, newPassword }` |

### `gearApi.ts`

| Function | Method | Endpoint | Params |
|---|---|---|---|
| `getAllGear(filters?)` | GET | `/api/gear` | `?search=&category=&minPrice=&maxPrice=&brand=&isAvailable=&sortBy=&page=&limit=` |
| `getGearById(id)` | GET | `/api/gear/:id` | — |
| `getGearReviews(gearId)` | GET | `/api/gear/:id/reviews` | — |
| `getAllCategories()` | GET | `/api/categories` | — |

### `rentalApi.ts`

| Function | Method | Endpoint | Payload |
|---|---|---|---|
| `createRental(data)` | POST | `/api/rentals` | `{ startDate, endDate, gearId }` |
| `getMyRentals()` | GET | `/api/rentals` | — |
| `getRentalById(id)` | GET | `/api/rentals/:id` | — |

### `paymentApi.ts`

| Function | Method | Endpoint | Payload / Notes |
|---|---|---|---|
| `createPayment(data)` | POST | `/api/payments/create` | `{ rentalOrderId, method: 'SSLCOMMERZ'\|'STRIPE' }` → returns `{ gatewayPageURL, transactionId }` |
| `confirmPayment(query)` | POST | `/api/payments/confirm` | `?tran_id=&val_id=&amount=&status=` — also called by SSLCommerz webhook |
| `getPaymentHistory(filters?)` | GET | `/api/payments` | `?status=&method=&page=&limit=` |
| `getPaymentById(id)` | GET | `/api/payments/:id` | — |

> **Important:** Backend returns `gatewayPageURL` (not `gatewayUrl`). The frontend handles both field names: `result.gatewayPageURL ?? result.gatewayUrl`.

### `providerApi.ts`

| Function | Method | Endpoint | Payload / Notes |
|---|---|---|---|
| `createGear(data)` | POST | `/api/provider/gear` | `{ name, description?, brand?, price: Number, stock: Number, images[], categoryId, isAvailable? }` |
| `getProviderGear()` | GET | `/api/provider/gear` | — |
| `updateGear(id, data)` | PUT | `/api/provider/gear/:id` | Same as createGear. `price` and `stock` coerced to `Number()` before sending |
| `deleteGear(id)` | DELETE | `/api/provider/gear/:id` | — |
| `getProviderOrders()` | GET | `/api/provider/orders` | — |
| `updateOrderStatus(id, data)` | PATCH | `/api/provider/orders/:id` | `{ status: RentalStatus }` |

> **Important:** API returns `price` and `stock` as strings. Always use `Number(item.price)` and `Number(item.stock)` before arithmetic or sending back to the API.

### `adminApi.ts`

| Function | Method | Endpoint | Payload |
|---|---|---|---|
| `getAllUsers(filters?)` | GET | `/api/admin/users` | `?role=&search=&isActive=&page=&limit=` |
| `updateUserStatus(id, data)` | PATCH | `/api/admin/users/:id` | `{ isActive: boolean }` |
| `getAllGear()` | GET | `/api/admin/gear` | — (includes `provider` relation) |
| `getAllRentals()` | GET | `/api/admin/rentals` | — (does NOT include `gear.provider` — use `getAllGear()` to cross-reference provider names) |

> **Note:** Admin rentals endpoint does not return provider details nested in gear. The `AdminRentalsPage` cross-references `useAllGearAdmin()` to build a `gearId → providerName` lookup map.

### `reviewApi.ts`

| Function | Method | Endpoint | Payload |
|---|---|---|---|
| `createReview(data)` | POST | `/api/reviews` | `{ rating: 1-5, comment?, gearId }` |

---

## 5. Zod Schema ↔ Backend Schema Matching

| Frontend Schema (`src/lib/validation.ts`) | Backend Route | Key Rules |
|---|---|---|
| `loginSchema` | `POST /api/auth/login` | email (valid format), password (non-empty) |
| `registerSchema` | `POST /api/auth/register` | name (min 2), email, password (min 6 + letter + number), confirmPassword (match), role (CUSTOMER\|PROVIDER), phone? (BD format), address? (max 500) |
| `profileSchema` | `PUT /api/auth/me` | All fields optional |
| `changePasswordSchema` | `PATCH /api/auth/change-password` | oldPassword required, newPassword (min 6), confirmPassword match, new ≠ old |
| `gearItemSchema` | `POST/PUT /api/provider/gear` | name (2–200), price (≥0, coerced to number), stock (int ≥0, coerced), images (1–5 valid URLs), categoryId required, **isAvailable (boolean, optional)** |
| `rentalOrderSchema` | `POST /api/rentals` | startDate, endDate (ISO strings), gearId required |
| `reviewSchema` | `POST /api/reviews` | rating (int 1–5), comment? (max 1000), gearId required |
| `createPaymentSchema` | `POST /api/payments/create` | rentalOrderId required, method (SSLCOMMERZ\|STRIPE) |
| `updateUserStatusSchema` | `PATCH /api/admin/users/:id` | isActive (boolean) |
| `updateOrderStatusSchema` | `PATCH /api/provider/orders/:id` | status (PLACED\|CONFIRMED\|PAID\|PICKED_UP\|RETURNED\|CANCELLED) |

---

## 6. TypeScript Interface ↔ Prisma Model Mapping

| Frontend Interface | Backend Prisma Model | Notes |
|---|---|---|
| `User` | `User` | id, name, email, role (UserRole), phone?, address?, isActive, createdAt, updatedAt |
| `Category` | `Category` | id, name, description?, createdAt, updatedAt |
| `GearItem` | `GearItem` | id, name, description?, brand?, **price (returns as string from API)**, **stock (returns as string)**, images[], isAvailable, providerId, categoryId, createdAt |
| `GearItemWithRelations` | `GearItem` + relations | Includes provider (User), category, reviews[], rentalOrders[] |
| `RentalOrder` | `RentalOrder` | id, startDate, endDate, **totalAmount (returns as string from API)**, status, customerId, gearId, createdAt |
| `RentalOrderWithRelations` | `RentalOrder` + relations | Includes customer, gear (GearItemWithRelations), payment? |
| `Payment` | `Payment` | id, transactionId, rentalOrderId, **amount (returns as string)**, method, status, paidAt?, gatewayResponse?, createdAt |
| `PaymentWithRelations` | `Payment` + relations | Includes rentalOrder |
| `Review` | `Review` | id, rating (Int), comment?, userId, gearId, createdAt |
| `ReviewWithRelations` | `Review` + relations | Includes user, gear |

> **String-to-Number gotcha:** Prisma `Decimal` fields (`price`, `stock`, `totalAmount`, `amount`) are serialized as strings in the JSON response. Always coerce with `Number()` before arithmetic operations or displaying with `.toLocaleString()`.

---

## 7. Payment Flow (SSLCommerz)

```
Customer clicks "Proceed to Pay"
         │
         ▼
POST /api/payments/create
{ rentalOrderId, method: "SSLCOMMERZ" }
         │
         ▼
Backend: upsert Payment record (PENDING) with new transactionId
         (upsert prevents unique constraint error on retry)
Returns { gatewayPageURL, transactionId }
         │
         ▼
Frontend: window.location.href = gatewayPageURL
         │
         ▼
User completes payment on SSLCommerz sandbox
         │
    ┌────┴────┐
    ▼         ▼
 Success   Cancel / Fail
    │         │
    ▼         ▼
Backend POST /api/payments/confirm called by SSLCommerz
Backend validates with SSLCommerz validation API
Backend updates Payment status + RentalOrder status
    │         │
    ▼         ▼
Backend redirects to FRONTEND:
/payment/success          /payment/cancel
?order_id=...&tran_id=... ?order_id=...
    │
    ▼
Frontend success page displays order summary
```

**Key implementation details:**

- Backend `success_url` / `fail_url` / `cancel_url` point to `GET /api/payments/confirm` on the **backend** (SSLCommerz calls these)
- After processing, the backend **redirects** to the **frontend** (`FRONTEND_URL` env var)
- The frontend `/payment/success` page reads `order_id` and `tran_id` from URL params to display the result
- Payment records use `upsert` to handle retries — if a PENDING/FAILED record exists for `rentalOrderId`, it is updated with a new `transactionId` instead of creating a duplicate (avoids unique constraint error)

---

## 8. Known API Quirks & Bug Fixes Applied

| Issue | Root Cause | Fix Applied |
|---|---|---|
| `price`/`stock`/`totalAmount`/`amount` display as concatenated strings | Prisma `Decimal` → JSON string serialization | All arithmetic uses `Number()` coercion; `formatBDT()` utility added |
| Availability toggle does nothing | Backend `gearItemSchema` missing `isAvailable` field | Added `isAvailable: z.boolean().optional()` to backend Zod schema |
| "Unique constraint on rentalOrderId" on payment retry | `prisma.payment.create()` fails when PENDING record exists | Changed to `prisma.payment.upsert()` |
| Dashboard inaccessible after login | JWT payload has `userId` not `role`; old middleware blocked all dashboard access | Middleware rewritten to check token existence only; role auth handled client-side |
| "No gateway URL returned" error | Frontend checked `result.gatewayUrl`; backend returns `result.gatewayPageURL` | Frontend now checks `gatewayPageURL ?? gatewayUrl` |
| Payment redirects to backend JSON instead of frontend | `success_url`/`fail_url` pointed to backend; `confirmPayment` returned JSON | Backend now redirects to `FRONTEND_URL/payment/success` or `/payment/cancel` |
| React error #185 (infinite re-render) | `useAuthActions()` returned new object on every render causing `useEffect` loop | Replaced with individual stable selector hooks (`useLoginAction`, `useLogoutAction`, etc.) |
| Cookie not set on Vercel HTTPS | `document.cookie` without `Secure` flag silently dropped on HTTPS | Added `/api/auth/set-token` Next.js route to set cookie server-side with `Secure: true` |

---

## 9. Error Handling

### API Error Shape

```json
{ "success": false, "message": "Human-readable description", "errorDetails": {} }
```

### Frontend Error Pipeline

```
Axios response interceptor (src/api/axios.ts)
   → Extracts message from response.data.message
   → Maps status codes to fallback messages (401/403/404/409/5xx/timeout/offline)
   → Throws ApiError { message, status, data, errorDetails }
        ↓
TanStack Query onError → toast.error(message)   [async mutations]
        OR
Form catch block → setError() per field          [form submissions]
        ↓
User sees:
  • Sonner toast (top-right, richColors) for API/async errors
  • Red inline text below each field for Zod validation errors
  • Red error banner in form for server-level rejections
  • NetworkStatus component → persistent offline toast
```

### Common Error Scenarios

| Scenario | HTTP | UI Response |
|---|---|---|
| Wrong password | 401 | Inline: "Invalid email or password" on password field |
| Account suspended | 401 | Inline on email field + toast |
| Email already registered | 409 | Inline: "This email is already registered" on email field |
| Gear update with string price | 400 (Zod) | Toast with Zod validation message |
| Payment retry (duplicate) | Handled silently | Upsert prevents 500 — new gateway session created |
| Session expired | 401 | Auto-redirect to `/auth/login?redirect=<path>` |
| Network offline | — | Persistent red toast via `NetworkStatus` component |

---

## 10. State Management

### TanStack Query (`src/providers/QueryProvider.tsx`)

- `staleTime: 60s`, `gcTime: 5min`, `retry: 1`, `refetchOnWindowFocus: false`
- Optimistic updates: `useUpdateGear` (provider inventory toggle), `useUpdateOrderStatus` (provider orders), `useUpdateUserStatus` (admin users)

### Zustand Auth Store (`src/store/authStore.ts`)

```typescript
// Stable individual selector hooks — use these, NOT useAuthActions()
useUser()              // User | null
useIsAuthenticated()   // boolean
useAuthLoading()       // boolean
useHasHydrated()       // boolean
useLoginAction()       // (token, user) => void
useLogoutAction()      // () => void
useSetUserAction()     // (user) => void
useCheckAuthAction()   // () => Promise<void>
useHydrateAction()     // () => void
```

> **Important:** `useAuthActions()` is deprecated — it returns a new object reference on every render causing infinite `useEffect` loops. Always use the individual hooks above.

---

## 11. Test Credentials

| Role | Email | Password | Dashboard URL |
|---|---|---|---|
| **Admin** | `admin@gearup.com` | `admin123` | `/dashboard/admin` |
| **Provider** | `rahman@gearup.com` | `provider123` | `/dashboard/provider` |
| **Provider** | `hossain@gearup.com` | `provider123` | `/dashboard/provider` |
| **Customer** | `akter@gearup.com` | `customer123` | `/dashboard/customer` |

---

## 12. Project Structure (Key Directories)

```
src/
├── api/              # Axios instance + API service modules
│   ├── axios.ts      # Base instance, interceptors, ApiError class
│   ├── authApi.ts    # Auth endpoints
│   ├── gearApi.ts    # Gear + categories
│   ├── rentalApi.ts  # Rental orders
│   ├── paymentApi.ts # Payments + SSLCommerz
│   ├── providerApi.ts# Provider gear CRUD + orders
│   ├── adminApi.ts   # Admin management
│   └── reviewApi.ts  # Reviews
├── app/
│   ├── api/auth/set-token/route.ts  # Server-side cookie setter
│   ├── auth/                        # Login, Register pages
│   ├── dashboard/
│   │   ├── admin/                   # Admin dashboard
│   │   ├── customer/                # Customer dashboard
│   │   └── provider/                # Provider dashboard
│   ├── gear/                        # Browse + details + checkout
│   └── payment/                     # Success + cancel result pages
├── components/
│   ├── auth/         # LoginForm, RegisterForm, ProtectedRoute
│   ├── gear/         # GearCard, GearGrid, FilterSidebar
│   ├── layout/       # Navbar, Footer, NetworkStatus
│   ├── provider/     # GearForm
│   ├── review/       # ReviewDialog, StarPicker
│   └── ui/           # Button, Input, Badge, Table, Skeleton, Toast, etc.
├── hooks/            # TanStack Query custom hooks
├── lib/
│   ├── auth-storage.ts  # localStorage + cookie token management
│   ├── utils.ts         # cn(), formatDate(), formatBDT(), buildQueryParams()
│   └── validation.ts    # All Zod schemas
├── middleware.ts     # Route protection (token existence check)
├── providers/        # QueryProvider, AuthProvider
├── store/            # Zustand authStore
└── types/            # TypeScript interfaces matching Prisma schema
```
