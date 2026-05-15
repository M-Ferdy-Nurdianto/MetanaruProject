# OTS (On-The-Spot) Order System

OTS orders are created by staff at the booth during events.

## Workflow
1. Staff selects an **Event**.
2. Staff enters the **Fan's Nickname** and **Contact**.
3. Staff selects the **Idol Member** from the dynamic lineup.
4. System calculates the price based on global/special settings.
5. Order is saved with `status: paid` and `mode: ots`.

## Validation
- The member selection MUST match the event's `lineup`.
- Nickname and at least one member selection are required.

## Rules
- Use `toggleMember` and `decrementMember` helpers for selection.
- Clear the form immediately after a successful save.
- Trigger a "Success" toast with the fan's nickname.
