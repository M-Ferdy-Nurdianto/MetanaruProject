# Authentication System

Metanaru uses a simple but effective local-storage based authentication for the Admin panel.

## Implementation
- **Login**: Handled at `/login`.
- **Persistence**: `isAdminAuthenticated: true` is stored in `localStorage`.
- **Guard**: Components (like `Admin.jsx`) check this flag in a `useEffect` hook.

## Credentials
- Credentials are NOT stored in the frontend.
- Future versions will migrate to Supabase Auth for better security.

## Rules
- NEVER remove the auth check from `Admin.jsx`.
- If `isAdminAuthenticated` is false, redirect to `/login` immediately.
- Use `handleLogout` to clear local storage and redirect to home.
