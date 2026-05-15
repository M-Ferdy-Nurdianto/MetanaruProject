# Folder Structure: Metanaru

The project is split into `client` (Frontend) and `server` (Backend).

## Client Structure (`/client/src`)
- `/api`: API service functions and base configuration.
- `/components`: Shared UI components (Button, Modal, Loading).
- `/constants`: Global static data (Member lists, pricing defaults).
- `/pages`: Main page components.
  - `/admin`: Dashboard and staff management.
    - `/components`: Specific sub-components for the Admin dashboard.
    - `/hooks`: Custom hooks for admin logic.
- `/supabase`: Supabase client initialization.
- `/utils`: Helper functions (formatting, image processing).

## Server Structure (`/server`)
- `/routes`: Express route handlers.
- `/controllers`: Logic for processing requests.
- `/services`: Integration with external services (ExcelJS).
- `/index.js`: Server entry point.

## Rules
- New features for the Admin page MUST go into `client/src/pages/admin/components/`.
- New global logic MUST go into `client/src/pages/admin/hooks/`.
