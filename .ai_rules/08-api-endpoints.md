# API Endpoints

The API is hosted alongside the server.

## Base URL
- Development: `http://localhost:5000/api`
- Production: Defined in `.env` (Vercel).

## Main Endpoints
- `GET /orders`: Fetch all orders.
- `POST /orders`: Create a new order (PO or OTS).
- `PATCH /orders/:id`: Update order status.
- `GET /orders/events`: Fetch all events.
- `POST /orders/events`: Create a new event.
- `GET /orders/export/excel/:eventId`: Download Excel report.
- `GET /orders/export/pdf/:eventId`: Download PDF report.

## Rules
- Always use `fetch` with error handling.
- Display a toast notification on API failure.
- Set `Content-Type: application/json` for POST/PATCH requests.
