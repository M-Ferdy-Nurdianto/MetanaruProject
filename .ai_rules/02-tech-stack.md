# Tech Stack: Metanaru

Metanaru uses a modern web stack optimized for real-time interaction and high performance.

## Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS + Custom CSS (for complex "Metal" effects).
- **Icons**: Lucide React.
- **Routing**: React Router DOM.
- **Components**: Functional components with Hooks.

## Backend / Database
- **Platform**: Supabase
- **Database**: PostgreSQL (managed by Supabase).
- **Real-time**: Supabase Realtime (Postgres Changes listener).
- **Storage**: Supabase Storage (for member and proof-of-payment images).
- **API**: Node.js / Express (for complex logic and file exports).

## External Services
- **Hosting**: Vercel (Frontend & API).
- **Exports**: ExcelJS and PDF-Lib (via server-side endpoints).
