# Real-time Synchronization

Metanaru uses Supabase Realtime to keep the dashboard updated without refreshing.

## Implementation
- **Subscription**: The `Admin` component subscribes to the `orders` table.
- **Events**: Listens for `*` (INSERT, UPDATE, DELETE).
- **Callback**: Triggers `refreshOrders()` when a change is detected.

## UI Feedback
- When a new order arrives, a toast notification displays "X PO baru & Y OTS baru!".
- A polling fallback is active every 30 seconds to ensure consistency if the websocket drops.

## Rules
- Subscription should be cleaned up on component unmount.
- Only notify "New" orders if the change was an `INSERT`.
- Use a `Ref` (`orderIdsRef`) to track which orders have already been seen/notified.
