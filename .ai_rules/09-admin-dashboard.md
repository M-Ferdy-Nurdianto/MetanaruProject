# Admin Dashboard Structure

The Admin dashboard is the core of the staff management experience.

## Sections (Tabs)
1. **Dashboard**: Quick overview of recent orders and OTS creation form.
2. **Arsip Pesanan**: Filterable list of all orders (PO and OTS).
3. **Otsu Post**: CMS for managing idol members and their details.
4. **Ekspor Data**: Tooling for generating financial reports.
5. **Kontrol Event**: Settings for global pricing and individual event lifecycle.
6. **Panduan Staff**: Internal documentation for staff operations.

## UI Patterns
- **Sidebar**: Fixed on desktop, collapsible on mobile.
- **Main View**: Scrollable area with glassmorphism cards.
- **Modals**: Used for editing orders, event details, and confirmation.

## Rules
- When adding a new tab, update `TAB_LABELS` and `menuItems`.
- Keep sections in separate files within `pages/admin/components/`.
