# AI Interaction Rules: Pair Programming

When working with this project, the AI assistant MUST follow these rules:

## Context Awareness
1. **Read Before Writing**: Check the `.ai_rules` directory before making major changes.
2. **Respect Aesthetics**: Always maintain the "Metal Core" design system (see `03-design-system-metal.md`).
3. **Keep it Slim**: If a file exceeds 800 lines, propose a refactoring plan to split it.

## Safety
1. **Don't Overwrite**: Never overwrite values the user has specifically requested to keep.
   - **CRITICAL**: The `main` content margin in `Admin.jsx` must remain `lg:ml-5`. Do not try to "fix" it to match the sidebar width.
2. **Migration First**: For database changes, provide the SQL/Migration plan before applying.
3. **No Placeholders**: Always use real images (via `generate_image`) or actual logic; avoid "TODO" or "lorem ipsum".

## Consistency
- Use Indonesian for user-facing strings (Labels, Toasts, Modals).
- Use English for code (Variables, Functions, Filenames).
- Maintain the established "glassmorphism" CSS classes.
