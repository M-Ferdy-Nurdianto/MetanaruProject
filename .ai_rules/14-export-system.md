# Export System: Reports

Generating financial and operational reports is a key administrative task.

## Formats
1. **Excel (.xlsx)**: Detailed row-by-row data for accounting.
2. **PDF (.pdf)**: Formal, ready-to-print report summary.

## Workflow
- Triggered by the `handleExport` function.
- Sends a request to `/api/orders/export/:type/:eventId`.
- Server processes the request and returns a `Blob`.
- Frontend creates a temporary URL and triggers a browser download.

## Rules
- Filenames should follow: `METANARU_Report_EventName.type`.
- Disable the export button (`exportingId === eventId`) during the process to prevent double triggers.
- Revoke the Object URL after download to prevent memory leaks.
