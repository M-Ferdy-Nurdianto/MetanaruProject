# Coding Standards

To maintain a clean and scalable codebase, follow these rules:

## Component Structure
1. **Separation of Concerns**: Keep logic in hooks and UI in components.
2. **File Size**: Aim for < 400 lines per file. If a file grows too large, split it.
3. **Naming**: PascalCase for components (`AdminPage.jsx`), camelCase for helpers and hooks (`useAuth.js`).
4. **Fragments**: Use `<> ... </>` instead of unnecessary `<div>` wrappers.

## React Patterns
- Use `useCallback` for functions passed to child components to prevent unnecessary re-renders.
- Use `useMemo` for expensive calculations (like filtering large order lists).
- Prefer functional state updates: `setCount(prev => prev + 1)`.

## Props
- Destructure props in the component signature.
- Use default parameters for optional props.
- Provide clear naming for event handlers (e.g., `onOrderUpdate`).
