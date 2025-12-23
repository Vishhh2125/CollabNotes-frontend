# Multi-Tenant SaaS Notes Management System
# CollabNotes
A full-stack SaaS application for managing notes with multi-tenancy and role-based access control. Built with Node.js (Express) for the backend and React (Vite) for the frontend.

---

## Table of Contents
- [Setup Instructions](#setup-instructions)
- [Architecture Overview](#architecture-overview)
- [Multi-Tenancy Approach](#multi-tenancy-approach)
- [Role-Based Authorization Logic](#role-based-authorization-logic)
- [API Documentation](#api-documentation)

---

## Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (local or cloud instance)

### Backend Setup
1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file based on `.env.example` and set your environment variables (MongoDB URI, JWT secret, etc).
MONGO_URL=""
PORT=""
ACCESS_TOKEN_SECRET=""
REFRESH_TOKEN_SECRET=""

ACCESS_TOKEN_EXPIRY=""
REFRESH_TOKEN_EXPIRY=""
4. Start the backend server:
   ```sh
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend development server:
   ```sh
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser for running locally 

---

## Architecture Overview

- **Backend:** Node.js, Express, MongoDB (Mongoose)
  - Organized by feature: controllers, models, routes, middlewares, utils
  - RESTful API design
- **Frontend:** React (Vite)
  - Component-based structure
  - State management with Redux Toolkit
  - API calls via a centralized `api.js`

**Folder Structure:**
```

## Architecture Overview

<p align="center">
  <img src="../architecture-diagram.png" alt="Multi-Tenant SaaS Notes Management System Architecture" width="600"/>
</p>

**Backend:** Node.js, Express, MongoDB (Mongoose)
  - Organized by feature: controllers, models, routes, middlewares, utils
  - RESTful API design
**Frontend:** React (Vite)
  - Component-based structure
  - State management with Redux Toolkit
  - API calls via a centralized `api.js`

**Folder Structure:**
```
backend/
  controllers/      # Business logic for each resource
  models/           # Mongoose schemas
  routes/           # API endpoints
  middlewares/      # Auth, error handling, etc.
  utils/            # Helpers and response formatting
frontend/
  src/components/   # UI components
  src/features/     # Redux slices
  src/api/          # API utilities
  src/store/        # Redux store setup
```




## Authentication Logic

- **Token-Based Authentication:**
  - Upon login, the backend issues two tokens:
    - **Access Token:**
      - Short-lived JWT used for authenticating API requests.
      - Stored in `localStorage` on the client for persistent authentication across browser sessions.
    - **Refresh Token:**
      - Longer-lived token used to obtain new access tokens when the current one expires.
      - Stored in `sessionStorage` for enhanced security (cleared when the browser/tab is closed).
  - **Flow:**
    1. User logs in and receives both tokens.
    2. Access token is sent with each API request in the `Authorization` header.
    3. When the access token expires, the frontend uses the refresh token (from `sessionStorage`) to request a new access token from the backend.
    4. If the refresh token is invalid or expired, the user is logged out and must re-authenticate.

---

## Role-Based Authorization Logic

- **Roles:**
  - `Owner`: Full access to workspace, can manage members and settings
  - `Admin`: Manage notes and members, but limited workspace settings
  - `Member`: Can create, edit, and view notes
- **Authorization Middleware:**
  - Checks JWT for authentication
  - Verifies user’s role within the current tenant before allowing access to protected routes
  - Example: Only Owners/Admins can invite/remove members; only Members can create notes

---

## API Documentation

### Authentication
- `POST /api/users/register` — Register a new user
- `POST /api/users/login` — Login and receive JWT

### Tenants (Workspaces)
- `POST /api/tenants` — Create a new workspace
- `GET /api/tenants` — List user’s workspaces
- `GET /api/tenants/:id` — Get workspace details
- `PATCH /api/tenants/:id` — Update workspace (Owner/Admin only)
- `DELETE /api/tenants/:id` — Delete workspace (Owner only)

### Tenant Membership
- `POST /api/tenant-memberships/invite` — Invite user to workspace (Owner/Admin)
- `PATCH /api/tenant-memberships/:id/role` — Change member role (Owner/Admin)
- `DELETE /api/tenant-memberships/:id` — Remove member (Owner/Admin)
- `GET /api/tenant-memberships/:tenantId` — List members in a workspace

### Notes
- `POST /api/notes` — Create a note (Member+)
- `GET /api/notes` — List notes in current workspace
- `GET /api/notes/:id` — Get note details
- `PATCH /api/notes/:id` — Update note (Author/Admin/Owner)
- `DELETE /api/notes/:id` — Delete note (Author/Admin/Owner)

### Error Handling
- All API responses follow a consistent format with `success`, `message`, and `data` fields.
- Errors return appropriate HTTP status codes and messages.

---

## Contact
For questions or support, please contact the project maintainer.
