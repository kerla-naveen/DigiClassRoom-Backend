# DigiClassRoom - Backend

A RESTful backend for DigiClassRoom — classroom management system (users, courses, assignments, tests, submissions, attendance, meetings, notifications, etc.).  
This repository is built with modern Node.js tooling, uses MongoDB for persistence and follows a layered structure (routes → controllers → services → models).

---

## Table of contents
- Project overview
- Tech stack
- Repository structure (where to look first)
- How requests flow through the app
- Authentication & roles
- Important routes (examples)
- Environment variables (.env example)
- Local setup & run instructions
- Development tips, logging & utilities
- How to get a good understanding of the codebase

---

## Project overview
The backend exposes HTTP JSON APIs to manage users (admin / teacher / student), courses, assignments, tests, marks, submissions, timetables, attendance, meetings and notifications. Many routes are protected by authentication and role-based authorization.

---

## Tech stack
- Node.js (ES Modules)
- Express 5
- MongoDB + Mongoose
- JSON Web Tokens (JWT) for auth
- bcrypt for password hashing
- multer & cloudinary for file uploads/media
- Joi for request validation (where used)
- Winston + morgan for logging
- Nodemailer for sending emails (password resets, notifications)
- axios for external HTTP where needed
- Prettier for formatting, nodemon for development

Dependencies are declared in `package.json` (see `start` and `dev` scripts).

---

## Repository structure — where to start
Key files to open first:
- `src/index.js` — app entry point, loads env and connects DB.
- `src/app.js` — Express app: middleware and route registration.
- `src/db/index.js` — database connection logic (connect to MongoDB).
- `src/config/dotenv.js` — loads environment variables.
- `src/logger.js` — winston logger configuration.
- `src/routes/*.route.js` — route definitions (API surface).
- `src/controllers/*` — controller functions (request handlers).
- `src/models/*` — Mongoose models and schemas.
- `src/middlewares/*` — authorization, authentication, error handling, uploads.
- `src/utils/*` — helpers: Apiresponse, ApiErrorResponse, asyncHandler, etc.

There are also helpful docs and utilities:
- `full_tutorial.md` — high level notes/tutorial for the repo.
- `test-settings.js`, `diagnose-notifications.js` — diagnostic/test utilities.

---

## How an API request flows (high-level)
1. Client sends HTTP request to an endpoint (e.g. `POST /api/v1/student/login`).
2. Express receives request; global middlewares run:
   - parsing (json/urlencoded), static files, morgan logger, custom logger.
3. Route matching in `src/routes/*.route.js`.
4. Route-level middlewares run (e.g., `authenticate`, `authorizeRoles`, input validation, multer upload).
5. Controller executes (in `src/controllers/*`), usually a thin wrapper calling services / models.
6. Controllers call services or Mongoose models (in `src/models/*`) to query / mutate DB.
7. Controller returns response using `Apiresponse` helper or throws an error.
8. Errors bubble to the global error handler (`errorHandler`), which formats `ApiErrorResponse`.
9. Response sent to client.

Helpers used throughout:
- `asyncHandler` wraps async controllers to forward errors.
- `Apiresponse` and `ApiErrorResponse` standardize responses.

---

## Authentication & Roles
- Authentication is JWT-based (access token + likely refresh token pattern).
- There are three primary roles: `admin`, `teacher`, `student`.
- `authenticate` middleware checks the token and attaches `req.user`.
- `authorizeRoles(...)` checks the user role(s) allowed for the route.
- Auth endpoints exist under `/api/v1/admin`, `/api/v1/teacher`, `/api/v1/student` with `register`, `login`, `logout`, `refresh`.

Common protected endpoints:
- Admin-only: user management, notices, admin dashboard stats.
- Teacher & Admin: create/update assignments/tests, grade (marks), view student submissions.
- Student: submit assignments/tests, view own marks, profile and timetable.

---

## Important routes (examples)
All routes are mounted under `/api/v1` in `src/app.js`. Examples:
- Healthcheck: `GET /healthcheck`
- Student auth:
  - `POST /api/v1/student/register`
  - `POST /api/v1/student/login`
  - `POST /api/v1/student/logout`
  - `POST /api/v1/student/refresh`
  - `GET /api/v1/student/me` (protected)
- Teacher auth: `POST /api/v1/teacher/login`, `POST /api/v1/teacher/register`, etc.
- Admin auth & management: `POST /api/v1/admin/login`, user creation, notices:
  - `GET /api/v1/admin/notices` (admin)
  - `POST /api/v1/admin/notices` (admin)
- Courses: `GET/POST /api/v1/courses`
- Assignments: `GET/POST /api/v1/assignments`
- Tests: `GET/POST /api/v1/tests` (see `src/routes/tests.route.js` for role protections)
- Submissions: `POST /api/v1/submissions` (student), `GET /api/v1/submissions/:type/:refId` (teacher/admin)
- Marks: `POST /api/v1/marks` (teacher/admin), `GET /api/v1/marks`
- Password reset & token verification: `POST /api/v1/auth/forgot-password`, `GET /api/v1/auth/verify-token`, `POST /api/v1/auth/reset-password`, `POST /api/v1/auth/change-password` (protected)

Browse `src/routes` to see full list and protections.

---

## .env example
Create a `.env` file in project root (example variables used by the codebase):

MONGODB_URI=mongodb://localhost:27017/digiclassroom
PORT=3001

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECRET=some_cookie_secret

# Cloudinary (if uploads to Cloudinary used)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email (nodemailer) for password reset notifications
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your@user.com
EMAIL_PASS=yourpassword
EMAIL_FROM="DigiClassRoom <no-reply@yourdomain.com>"

# Optional
FRONTEND_BASE_URL=http://localhost:3000

Adjust names to match configuration usage in `src/config` / `src/config/dotenv.js`.

---

## Local setup & run

Prerequisites
- Node.js (v16+ recommended, use current LTS)
- MongoDB (local or remote URI)

Steps
1. Clone the repo:
   git clone https://github.com/kerla-naveen/DigiClassRoom-Backend.git
   cd DigiClassRoom-Backend

2. Install dependencies:
   npm install

3. Create `.env` with the required variables (see example above).

4. Start the app in development:
   npm run dev
   - This runs `nodemon src/index.js`.

   Or for production:
   npm start

5. The server binds to port from `PORT` env var (default 3001). Open `http://localhost:3001/` to check.

Notes:
- Ensure `MONGODB_URI` points to a working MongoDB instance.
- If using Cloudinary ensure those env vars are set before uploading files.

---

## Database & seeding
- No dedicated seed script included; admin/teacher/student can be created using respective register endpoints (or via DB directly).
- Utilities like `test-settings.js` and `diagnose-notifications.js` exist in the repo and can help inspect or validate DB entries; review them before running as they connect to the DB directly.

---

## Logging, error handling & formatting
- Requests are logged with `morgan` and forwarded to a `winston` logger (`src/logger.js`).
- Errors are normalized through a centralized error handler and `ApiErrorResponse`.
- Use `npm run format` to run Prettier.

---

## Development tips & reading path
To understand the code quickly:
1. Open `src/index.js` — how the app starts and DB connects.
2. Open `src/app.js` — global middlewares and routes mounting.
3. Pick one resource to trace end-to-end (e.g., Tests):
   - `src/routes/tests.route.js` → `src/controllers/tests.controller.js` → `src/models/tests.model.js` (or service layer if used)
4. Inspect middlewares: `src/middlewares/authorizeRoles.middleware.js`, `errorHandler`, upload middleware in `src/routes/uploads.route.js`.
5. Review utils: `src/utils/Apiresponse.js`, `src/utils/ApiErrorResponse.js`, `src/utils/asyncHandler.js`.
6. Check `src/db/index.js` for connection and reconnection logic.

---

## Contributing & notes
- Follow existing patterns for controllers (thin controllers calling models/services).
- Use `asyncHandler` wrapper for async controllers.
- Keep response shape consistent using `Apiresponse`.
- Add Joi validations where input is accepted if missing.
- Add unit/integration tests where possible (repo currently has no test suite).