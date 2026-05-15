# Design System: Metal Core Aesthetics

The "Metal Core" design system is central to Metanaru's identity. It should feel premium, aggressive, yet clean.

## Color Palette
- **Primary**: Deep Red (`#FF0033`, `#C80029`)
- **Background**: Industrial Dark (`#121214`, `#1A1A1D`)
- **Accents**: White/Silver (Glassmorphism), Gold (Special events).

## Visual Elements
- **Glassmorphism**: Use `backdrop-filter: blur(12px)` and subtle white borders (`border-white/10`).
- **Gradients**: Use linear gradients from top-left for buttons (e.g., `from-[#FF0033] to-[#6B0015]`).
- **Texture**: Apply "Metal Noise" and "Metal Grid" overlays to backgrounds.
- **Sheen**: Use a "Metal Sheen" effect (white/transparent gradient) at the top of main containers.

## Typography
- **Titles**: Bold, uppercase, tracking-wider (e.g., `metal-title`).
- **Kickers**: Small, bold, red labels above titles (e.g., `metal-kicker`).
- **Chips**: Small status badges with semi-transparent backgrounds.

## Layout Constraints
1. **Admin Content Margin**: The main content area in `Admin.jsx` MUST use `lg:ml-5` as the gap from the sidebar. This is a specific user preference—DO NOT change it to match the sidebar width.
2. NEVER use generic blue or green unless it's for specific status indicators (success/info).
2. Use `metal-divider` (a thin red/transparent line) instead of standard `<hr>`.
3. Cards should always have a subtle glow on hover.
