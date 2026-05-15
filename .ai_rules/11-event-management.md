# Event Management Lifecycle

Events drive the state of the application.

## Statuses
- **Ongoing**: Event is active. Fans can see it in the booking form.
- **Finished**: Event is over. No longer visible to fans.

## Deletion Safety
- Deleting an event is a HIGH-RISK action as it deletes all related orders.
- **Automated Backup**: Before deletion, the system MUST trigger a download of both Excel and PDF reports for that event.
- Use `ConfirmModal` with a warning message before proceeding.

## Lineup Management
- Each event has a unique lineup.
- Lineups determine which members are available for booking and OTS.

## Rules
- Always use `openEventModal` for creating/editing.
- Never allow deletion without the backup trigger.
