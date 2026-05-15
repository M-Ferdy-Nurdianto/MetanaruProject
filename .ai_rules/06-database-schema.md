# Database Schema: Supabase

Metanaru relies on a PostgreSQL database. Key tables:

## `orders`
- `id` (uuid/int): Unique identifier.
- `nickname`: Fan name.
- `contact`: Line/WhatsApp info.
- `payment_method`: cash, transfer, etc.
- `status`: pending, paid, finished.
- `mode`: po (pre-order) or ots (on-the-spot).
- `items` (jsonb): Array of `{member_id, qty}`.
- `public_code`: Short human-readable code (e.g., MET-001).
- `event_id`: Link to `events` table.

## `events`
- `id`: Unique identifier.
- `name`: Event title.
- `event_date`: Date of the event.
- `status`: ongoing, finished.
- `special_prices` (jsonb): Overrides for regular prices.
- `lineup` (jsonb): Array of member names participating.

## `settings`
- `prices`: Global default pricing for solo and group Cheki.

## Rules
- Always use `camelCase` for JSON keys but `snake_case` for database columns.
- Ensure `event_id` is always populated for new orders.
