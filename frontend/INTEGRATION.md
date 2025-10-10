# Frontend-Backend Integration Guide

## 🎯 Overview

The frontend has been successfully integrated with the FastAPI backend. Authentication now uses real JWT tokens and all user data comes from the MySQL database.

## 🔐 Authentication Flow

### 1. Login Process

```typescript
// User enters credentials in login form
// components/auth/login-form.tsx calls:
await login({ email, password })

// This:
// 1. Sends POST to http://localhost:8000/auth/login
// 2. Receives JWT token
// 3. Saves token to localStorage
// 4. Updates global auth context
// 5. Redirects based on user role (superadmin/profesor/alumno)
```

### 2. Protected Routes

All dashboard routes are protected using the `AuthProvider` context:

```typescript
// contexts/auth-context.tsx
// - Checks authentication on route change
// - Redirects to /login if not authenticated
// - Provides user state globally
```

To protect a specific page, wrap it with `ProtectedRoute`:

```typescript
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      {/* Your page content */}
    </ProtectedRoute>
  )
}
```

## 📁 API Client Structure

```
lib/api/
├── client.ts       # Base API request handler
├── auth.ts         # Authentication endpoints
├── users.ts        # User management endpoints
└── index.ts        # Central exports
```

### Using the API

```typescript
import { login, getCurrentUser, getUsers, createUser } from "@/lib/api"

// Login
const result = await login({ email, password })

// Get current user profile
const profile = await getCurrentUser()

// Get list of users (RBAC applied by backend)
const users = await getUsers(page, size)

// Create user (superadmin only)
const newUser = await createUser({
  email: "new@example.com",
  password: "password123",
  full_name: "New User",
  role_id: 3
})
```

## 🔑 Token Management

Tokens are automatically managed:

- **Saved** on successful login
- **Attached** to all API requests via `Authorization: Bearer <token>`
- **Removed** on logout
- **Stored** in localStorage

```typescript
import { saveToken, removeToken, getToken, isAuthenticated } from "@/lib/api"

// Check if user is logged in
if (isAuthenticated()) {
  // User has valid token
}
```

## 🎭 Role-Based Access Control (RBAC)

The backend enforces RBAC on all endpoints:

| Role | Permissions |
|------|-------------|
| **superadmin** | Full access to all users and resources |
| **profesor** | Can view all users, manage own courses, manage students in own courses |
| **alumno** | Can only view own profile |

The frontend receives role information and routes accordingly:

```typescript
// After login, user is redirected based on role:
switch (user.role) {
  case "superadmin":
    router.push("/superadmin/dashboard")
    break
  case "profesor":
    router.push("/profesor/slices")
    break
  case "alumno":
    router.push("/alumno/slices")
    break
}
```

## 🌐 Environment Configuration

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

This variable is used by the API client to construct all requests.

## 🧪 Testing the Integration

### 1. Start the Backend

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

### 3. Test Login

1. Navigate to http://localhost:3000/login
2. Enter credentials:
   - **Admin**: admin@pucp.edu.pe / password
   - **Profesor**: profesor@pucp.edu.pe / password
   - **Alumno**: alumno@pucp.edu.pe / password
3. You will be redirected to the appropriate dashboard based on your role
4. The JWT token is saved and will be used for all subsequent API calls

### 4. Test Protected Routes

- Try accessing `/superadmin/dashboard` without logging in → redirected to `/login`
- Login as `alumno` and try to access `/superadmin/dashboard` → redirected to `/alumno/slices`

## 🛠️ Adding New API Endpoints

### Backend (FastAPI)

1. Add endpoint in `backend/app/users/routes.py` (or create new module)
2. Add RBAC using `Depends(require_role(['superadmin']))`

### Frontend (Next.js)

1. Add TypeScript function in `lib/api/<module>.ts`:

```typescript
export async function getNewResource(): Promise<ApiResponse<ResourceType>> {
  return apiRequest<ResourceType>('/resources/new')
}
```

2. Export from `lib/api/index.ts`
3. Use in components:

```typescript
import { getNewResource } from "@/lib/api"

const data = await getNewResource()
```

## 🐛 Debugging

### Check Token

```typescript
import { getToken } from "@/lib/api"
console.log('Current token:', getToken())
```

### Check Auth State

```typescript
import { useAuth } from "@/contexts/auth-context"

function MyComponent() {
  const { user, loading } = useAuth()
  console.log('Current user:', user)
  console.log('Loading:', loading)
}
```

### View API Calls

All API calls are logged to the browser console with:
- Request URL
- Request method
- Response status
- Response data/errors

## 📝 TypeScript Types

All API responses are fully typed:

```typescript
interface User {
  id: string
  email: string
  full_name: string
  role: string
  role_id: number
  status: string
  created_at: string
  updated_at: string | null
}

interface ApiResponse<T> {
  ok: boolean
  data?: T
  error?: string
}
```

## 🔄 Refresh User Data

```typescript
import { useAuth } from "@/contexts/auth-context"

function MyComponent() {
  const { refreshUser } = useAuth()
  
  const handleUpdate = async () => {
    // Update user data...
    await refreshUser() // Refresh user in context
  }
}
```

## ✅ Next Steps

Now that the integration is complete, you can:

1. ✅ **Test login flow** - Try all three user roles
2. ✅ **Update user management pages** - Use API functions instead of mock data
3. ✅ **Add error boundaries** - Handle API errors gracefully
4. ✅ **Add loading states** - Show spinners while data loads
5. ✅ **Implement course management** - Connect course endpoints
6. ✅ **Add slice management** - Connect slice endpoints

All API calls now go through the real backend with proper authentication and authorization! 🎉
