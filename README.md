# EASY!Cook (Official_Easycook)

A full‑stack web app for discovering, rating, commenting, and organizing recipes, with a small admin area. Built with React + Vite (client) and Express + PostgreSQL (server), deployed to Vercel.

---

## TL;DR — What this project does

- Visitors browse and search recipes, filter by category/diet/difficulty, and view details.
- Members can sign up, log in, rate/comment, favorite recipes, and manage shopping lists.
- Admins can manage members and recipes.

Security highlights

- Auth via HTTP‑only cookie (JWT), no token stored in JS.
- CSRF protection via double‑submit cookie + X‑CSRF‑Token header.
- CORS restricted to known origins, credentials enabled.
- SQL queries parameterized to prevent injections.

---

## Tech Stack

- Client: Vite + React + TypeScript, shadcn/ui for dashBoard, Sonner toasts
- Server: Express + TypeScript, PostgreSQL (pg), JWT, cookie‑parser, CORS
- Tests: Jest, ts‑jest, Supertest
- Hosting: Vercel (serverless handler + static client)

---

## Repository layout

```
Official_Easycook/
├─ client/                # React app
│  ├─ src/
│  │  ├─ components/     # UI components (Admin, Account, Recipe, etc.)
│  │  ├─ context/        # UserContext (session state)
│  │  ├─ hooks/          # Reusable hooks
│  │  ├─ lib/            # csrf helper, utils
│  │  ├─ pages/          # Page routes
│  │  └─ types/          # Frontend types
│  └─ ... Vite configs
├─ server/                # Express API
│  ├─ src/
│  │  ├─ app.ts          # App setup (CORS, cookies, CSRF, parsers, router)
│  │  ├─ router.ts       # Route registration
│  │  └─ modules/        # Feature folders (user, recipe, list, etc.)
│  ├─ database/          # pg Pool client, schema.sql
│  ├─ tests/             # Jest + Supertest specs
│  └─ vercel.json        # Serverless export config
└─ README.md
```

---

## How auth and CSRF work

- On login, the server sets an HTTP‑only cookie `token` containing a JWT (id, isAdmin). The cookie is Secure and SameSite per environment (see below). JavaScript cannot read it; the browser automatically sends it.
- On any safe GET (e.g., `/session`), the server issues a readable `csrfToken` cookie. For POST/PATCH/DELETE, the client reads this cookie and echoes it in the `X-CSRF-Token` header. The server verifies cookie value vs header.
- The client must always use `credentials: "include"` so cookies are sent.

Key endpoints

- GET `/session` → 200 with `{ authenticated, userId?, isAdmin?, user? }` (never 401). Use this to bootstrap session.
- POST `/login` → sets auth cookie, returns JSON for compatibility; client should not store tokens.
- POST `/logout` → clears auth cookie.
- Member routes `/member/*` require auth; admin routes `/admin/*` require `isAdmin` in JWT.

SameSite guidance

- Same site (same domain): `SameSite=Strict|Lax` is fine.
- Cross‑site (client and API on different sites, e.g., Vercel): use `SameSite=None; Secure` for the auth cookie.

---

## Environment variables

Create `server/.env` (and `server/.env.sample` for reference):

- `DATABASE_URL` — Postgres connection string (Supabase pooler works well on Vercel)
- `JWT_SECRET` — secret for signing JWTs
- `CLIENT_URL` — your local client origin (e.g., http://localhost:5173) for CORS
- `NODE_ENV` — development | production

Create `client/.env`:

- `VITE_API_URL` — base URL for the API (e.g., http://localhost:3310 in dev, your Vercel API in prod)

---

## Running locally

- Server: from `server/`
  - Install: `npm install`
  - Dev: `npm run dev` (watches src/main)
  - Tests: `npm test` or `npm test -- --coverage`
- Client: from `client/`
  - Install: `npm install`
  - Dev: `npm run dev` (Vite on 5173 by default)

Make sure CORS in server matches your client origin and that client fetches use `credentials: "include"`.

---

## Scripts (server)

- `npm run dev` — start server in watch mode
- `npm run start` — run server
- `npm run check-types` — TypeScript check
- `npm test` — run Jest tests (ts‑jest)

---

## Testing strategy

- Unit/integration tests use Supertest against the Express app; DB calls are mocked (no real DB).
- CSRF tests fetch `/session` for the csrfToken cookie, then set header+cookie for unsafe requests.
- Admin middleware tests ensure non‑admins get 403.

Where to add more tests

- Ingredient/List/Ustensil controllers for basic GET/validation paths
- Member flows: login success (cookie set), signup chain, forbidden delete
- Recipe writes: add/update + 404 branch

Run coverage

- `npm test -- --coverage` in `server/` prints lines/branches and highlights missing areas.

---

## API overview (selected)

Public

- GET `/unity`, `/diet`, `/category`
- GET `/recipe` (filters via query: `category`, `diet`, `difficulty`)
- GET `/recipe/detail/:id`, `/recipe/search/:id`, `/recipe/category/:id`, `/recipe/diet/:id`, `/recipe/time/:id`
- GET `/accueil/category`
- GET `/session` — session status
- POST `/signup`, `/login`, `/logout`

Member (auth required)

- GET `/member` — token check (use `/session` for bootstrapping)
- PATCH `/member` — update profile
- GET `/member/:id/profile`, `/member/:id/favorite`, `/member/:id/comments`, `/member/:id/registeredlist`
- POST `/member/:id/list` — add shopping list
- DELETE `/member/:id` — delete account
- POST `/member/rate/recipe`, `/member/comment/recipe`, `/member/favorite/recipe`

Admin (isAdmin required)

- GET `/admin/member`, `/admin/recipes`
- POST `/admin/recipe`, PATCH `/admin/recipe/:id`, DELETE `/admin/:id`

Note: All unsafe methods require `X-CSRF-Token` header matching the `csrfToken` cookie and must include credentials.

---

## Client code conventions

- Always use `credentials: "include"` for authenticated routes.
- For POST/PATCH/DELETE, include `X-CSRF-Token` from `client/src/lib/csrf.ts`.
- Prefer a small API client wrapper (get/post/patch/delete) to remove fetch duplication.
- Keep `UserContext` slim: session flags and current user; don’t store tokens.

---

## Server code conventions

- Middlewares
  - `checkToken` — verifies JWT from header or cookie and sets `req.userId`.
  - `checkTokenAdmin` — verifies JWT and enforces `isAdmin`.
  - `csrfProtection` — issues csrf cookie on GET; validates header vs cookie on write methods.
- Repositories use parameterized SQL only. Avoid string concatenation.
- Use an async handler wrapper pattern to reduce try/catch noise (optional improvement).

---

## Deployment notes (Vercel)

- Server: ensure the `api/index.ts` or serverless entry points are wired (already present).
- Cookies: cross‑site requires `SameSite=None; Secure` for the auth cookie.
- CORS: set exact allowed origins via env in `app.ts`.
- Environment variables must be configured in Vercel (Server and Client projects separately).

---

## Troubleshooting

- 401 on first load: Use `/session` (public) to check status instead of `/member` (protected).
- CORS errors: verify `CLIENT_URL` and `VITE_API_URL` match origins and that `credentials: true` is set on both client and server.
- CSRF 403: ensure you GET `/session` first (to receive `csrfToken` cookie) and then send `X-CSRF-Token` for unsafe methods.
- DB connection errors in tests: tests mock DB; ensure you didn’t remove mocks; avoid hitting real DB in CI.

### Auth & CSRF: Issues Encountered and Fixes

This project went through a few real‑world friction points while integrating cookie auth + CSRF, especially on mobile browsers. Summary of the problems and the concrete fixes applied:

1. Mobile POST actions (comment / favorite / rate) failing:

- Symptom: On some mobile browsers the user appeared logged in (token stored) but POSTs returned 403 (CSRF) or 401.
- Root cause 1: Some mobile environments blocked or stripped the non‑HTTP‑only `csrfToken` cookie (SameSite or cross‑site limitations), so the client could not echo `X-CSRF-Token`.
- Root cause 2: The client originally sent `userId` explicitly in the body; if local state had not yet populated (e.g. race on `/session`) it sent `null`, generating inconsistent server behavior and potential 401.
- Fixes:
  - Server `csrfProtection` now bypasses CSRF validation when a Bearer token is supplied in `Authorization` (Bearer tokens are not auto‑attached by browsers, so they are not CSRF‑able; this is a standard pattern for mixed cookie / token fallback scenarios).
  - Server comment/favorite/rate endpoints now trust `req.userId` injected by JWT middleware instead of a `userId` field in the JSON body (prevents spoofing and removes null issues).
  - Client removed `userId` from those request bodies and always includes `Authorization: Bearer <token>` when a fallback token exists (while still using `credentials: "include"` so cookies work where available).

2. Comment textarea not clearing on mobile after submit:

- Symptom: The text visually stayed even though state reset.
- Cause: Uncontrolled `<textarea>` (no `value` binding) so DOM value lived outside React state.
- Fix: Made the textarea controlled (`value={commentText}`), ensuring clearing state updates the UI consistently across browsers.

3. Intermittent 401 vs 403 confusion:

- 401 (Unauthorized) now consistently indicates missing/invalid JWT.
- 403 (CSRF) previously happened for legitimate authenticated actions without header; after bearer bypass change, 403 should only occur when neither valid CSRF pair nor bearer exists.

4. Diagnosing steps now recommended:

- Check network request: Does it have `Authorization: Bearer ...` or the `csrfToken` cookie + `X-CSRF-Token` header? At least one path must be valid.
- If bearer missing: verify localStorage still has `authToken` and login flow stored it.
- If cookie path failing: ensure origin is whitelisted in CORS and cookie `SameSite=None; Secure` in production cross‑site scenarios.
- Call `GET /session` to (re)issue CSRF cookie/header before the first unsafe action.

5. Security rationale for bearer CSRF bypass:

- CSRF exploits the browser auto‑sending credentials. A manually added bearer header from JS is not auto‑attached cross‑site, so an attacker site cannot forge it; thus CSRF protection can be relaxed for those requests. (Still keep rate limiting / auth checks.)

6. Future hardening ideas:

- Enforce one path: either fully cookie (session) or fully bearer (API), to simplify mental model.
- Rotate JWT secret periodically; include iat/exp and maybe refresh token flow if sessions lengthen.
- Add server-side logging that distinguishes CSRF failures vs auth failures explicitly in structured logs.

Implementation references:

- CSRF middleware change: added early return when `Authorization: Bearer` header is present on unsafe methods.
- Recipe action handlers: now derive `userId` solely from `req.userId`.

With these adjustments, mobile users relying on bearer tokens (due to cookie restrictions) can perform write actions without CSRF friction, while standard desktop flows still benefit from cookie + CSRF defense.

---

## Maintenance checklist

- Security: rotate `JWT_SECRET` if needed; audit dependencies quarterly.
- Cookies: confirm `SameSite` settings after domain/hosting changes.
- Tests: keep coverage over ~70% statements / 60% branches for server; add tests for new endpoints.
- Docs: update this README when changing auth, CSRF, or routes.

---

## Roadmap (suggested)

- Input validation with Zod on all write endpoints
- Small API client in the frontend to centralize fetch concerns
- Transactions for multi‑step recipe writes
- React Query for data caching (recipes, lists, favorites)
- Centralized config (cookie, CORS, env) in `server/src/config`

---

## License

Internal project. Add license terms here if you plan to open‑source.
