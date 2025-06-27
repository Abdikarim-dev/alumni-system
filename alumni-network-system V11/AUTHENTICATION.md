# Authentication & Route Protection System

## Overview
The alumni network system now has comprehensive authentication and route protection implemented to handle user sessions properly and prevent unauthorized access.

## Key Components

### 1. Route Guard (`components/auth/route-guard.tsx`)
- **Purpose**: Protects pages by checking authentication status and user roles
- **Features**:
  - Checks if user is authenticated
  - Validates user roles (admin, moderator, alumni)
  - Redirects unauthorized users to login
  - Shows loading state during authentication checks
  - Waits for Redux rehydration from localStorage

### 2. Enhanced Login Form (`components/auth/login-form.tsx`)
- **Purpose**: Handles user authentication with proper state management
- **Features**:
  - Saves token and user data to localStorage
  - Updates Redux store with authentication state
  - Redirects based on user role after login
  - Prevents already authenticated users from seeing login form
  - Shows loading state during redirects

### 3. Login Page Protection (`app/auth/login/page.tsx`)
- **Purpose**: Redirects already authenticated users away from login page
- **Features**:
  - Checks authentication status on page load
  - Redirects authenticated users to appropriate dashboard
  - Shows loading state during redirect

### 4. API Configuration (`lib/api.ts`)
- **Purpose**: Handles API authentication and token management
- **Features**:
  - Automatically includes Bearer token in API requests
  - Handles 401 errors by logging out users
  - Redirects to login page on authentication failures
  - Prevents redirect loops

### 5. Auth Slice (`lib/slices/authSlice.ts`)
- **Purpose**: Manages authentication state in Redux
- **Features**:
  - Stores user data and token
  - Handles login/logout actions
  - Rehydrates state from localStorage
  - Clears localStorage on logout

## Protected Routes

### Admin Routes (Require admin role)
- `/admin/dashboard` - Admin dashboard with system overview
- `/admin/users` - User management interface
- `/admin/events` - Event management
- `/admin/announcements` - Announcement management
- `/admin/jobs` - Job management

### General Routes (Require any authenticated user)
- `/dashboard` - Main user dashboard
- `/events` - Events listing
- `/profile` - User profile management

### Public Routes (No authentication required)
- `/auth/login` - Login page (redirects if authenticated)
- `/auth/register` - Registration page
- `/auth/forgot-password` - Password reset

## Authentication Flow

### 1. Initial Page Load
```
1. App starts → Redux Provider initializes
2. Redux Provider checks localStorage for token/user
3. If found, dispatches setAuthFromStorage action
4. Route Guard checks authentication status
5. If authenticated, renders protected content
6. If not authenticated, redirects to login
```

### 2. Login Process
```
1. User submits login form
2. API call to /auth/login endpoint
3. On success:
   - Save token and user to localStorage
   - Update Redux store with setAuthFromStorage
   - Redirect based on user role:
     - admin → /admin/dashboard
     - moderator → /moderator/dashboard  
     - alumni → /dashboard
4. On failure, show error message
```

### 3. Logout Process
```
1. User clicks logout OR API returns 401
2. Dispatch logout action
3. Clear token and user from localStorage
4. Clear Redux auth state
5. Redirect to /auth/login
```

### 4. API Request Authentication
```
1. API request initiated
2. baseQuery prepareHeaders runs
3. Gets token from Redux state
4. Adds Authorization: Bearer {token} header
5. If API returns 401:
   - Dispatch logout action
   - Redirect to login page
```

## Role-Based Access Control

### Admin Users
- Can access all admin routes
- Can manage users, events, announcements, jobs
- Full system access

### Moderator Users  
- Can access moderator routes
- Limited admin functionality
- Cannot access user management

### Alumni Users
- Can access general user routes
- Cannot access admin/moderator routes
- Standard user functionality

## Security Features

1. **Token Expiration Handling**: Automatic logout on expired tokens
2. **Route Protection**: Prevents unauthorized access to protected routes
3. **Role Validation**: Ensures users can only access appropriate content
4. **Secure Storage**: Uses localStorage for token persistence
5. **Redirect Prevention**: Prevents redirect loops and unauthorized access
6. **Loading States**: Proper loading indicators during auth checks

## Environment Setup

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Usage Examples

### Protecting a Page
```tsx
import { RouteGuard } from "@/components/auth/route-guard"

export default function ProtectedPage() {
  return (
    <RouteGuard requiredRole="admin">
      <AdminContent />
    </RouteGuard>
  )
}
```

### Accessing User Data
```tsx
import { useSelector } from "react-redux"
import { type RootState } from "@/lib/store"

function UserProfile() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  
  if (!isAuthenticated) return null
  
  return <div>Welcome, {user?.firstName}!</div>
}
```

## Troubleshooting

### Common Issues

1. **"User logged out immediately after login"**
   - Check if backend API is running
   - Verify NEXT_PUBLIC_API_URL in .env.local
   - Check browser console for 401 errors

2. **"Infinite loading on protected pages"**
   - Check Redux rehydration timing
   - Verify localStorage has token and user data
   - Check RouteGuard timeout settings

3. **"Can access admin pages as regular user"**
   - Verify RouteGuard requiredRole prop
   - Check user role in Redux state
   - Ensure API returns correct user role

### Debug Steps

1. Check Redux DevTools for auth state
2. Check localStorage for token/user data
3. Check Network tab for API requests
4. Check Console for error messages
5. Verify backend API responses