# Error Handling and Debugging

A robust system requires clear feedback.

## Frontend Errors
- Use `try/catch` blocks for all async operations.
- Display errors using `showToast(message, 'error')`.
- Log the full error to the console for staff to inspect if needed.

## Backend Errors
- Return appropriate HTTP status codes (400 for validation, 500 for system error).
- Include a descriptive `error` message in the JSON response.

## Debugging Tips
- Check the `Network` tab in DevTools for API response bodies.
- Verify Supabase connection via the `supabase` client instance.
- Check `localStorage` for `admin_filter` and `adminActiveTab` state persistence.

## Rules
- Don't let the UI crash; use Error Boundaries or conditional rendering.
- Always provide a "Retry" or "Close" path for failed modals.
