# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Development server
npm run build    # Production build
npm test         # Run tests (watch mode)
npm test -- --watchAll=false  # Run tests once
```

## Architecture

React 19 + TypeScript + Tailwind CSS app bootstrapped with Create React App. The project is a work-in-progress real-time gold price display.

**Entry flow:** `public/index.html` → `src/index.tsx` (mounts React root) → `src/App.tsx` (main component)

**Styling:** Tailwind utility classes only — no CSS modules or styled-components. Tailwind is imported via directives in `src/index.css` and processed through PostCSS/Autoprefixer.

**TypeScript:** Strict mode enabled (`tsconfig.json`), targeting ES2016, using `react-jsx` transform (no need to import React in every file).

**Testing:** `@testing-library/react` + Jest via react-scripts. No tests written yet.
