# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Structure

This is a monorepo of independent React learning projects. Each subdirectory is a standalone Create React App project with its own `node_modules` and `package.json`. There is no root-level package manager.

| Project | Description |
|---------|-------------|
| `realtime-gold/` | Real-time gold price display — React 19 + axios + Tailwind |
| `todo-list/` | Todo list with form validation — React 19 + react-hook-form + Tailwind |
| `users-manage/` | User management app — React 19 + TypeScript + Tailwind |

## Creating a new project

Do NOT run `npm install` from scratch — react-scripts 5 has dependency conflicts with newer TypeScript/ajv versions on Node 20.

Instead: copy an existing working project (e.g. `realtime-gold/`) including `node_modules`, then update `package.json` name and reset `src/App.tsx` to a clean placeholder.

## Commands

All commands must be run from within the project directory (e.g., `cd realtime-gold`):

```bash
npm start                        # Dev server (localhost:3000)
npm run build                    # Production build
npm test -- --watchAll=false     # Run tests once
npm test -- --testPathPattern=App  # Run a single test file
```

## Architecture (both projects)

**Stack:** React 19 + TypeScript (strict mode) + Tailwind CSS, bootstrapped with Create React App.

**Entry flow:** `public/index.html` → `src/index.tsx` → `src/App.tsx` (all logic lives in App.tsx; no routing or sub-components yet).

**Styling:** Tailwind utility classes only — no CSS modules. PostCSS + Autoprefixer via `postcss.config.js`. Custom CSS in `src/App.css` (todo-list) or `src/index.css` (realtime-gold).

**TypeScript:** Strict mode, ES2016 target, `react-jsx` transform (no need to import React in every file), `moduleResolution: "bundler"`.

## Project-specific notes

### realtime-gold
- Fetches gold price from TWSE API (`MI_5MINS`, stock `00636U`) every 10 seconds via `setInterval` inside `useEffect`.
- `getQueryDate()` skips weekends by mapping Saturday/Sunday to the prior Friday.
- Price is derived as the difference between the last two cumulative volume entries in `data.data[*][7]`.
- Two separate `useEffect` hooks: one for data fetching + auto-refresh, one for the countdown timer. Both use `setState(prev => ...)` to avoid stale-closure bugs inside `setInterval`.
- Has a pre-built `build/` directory committed to the repo.

### todo-list
- Purely client-side; no API calls. State lives in `useState<Todo[]>`.
- Form managed by `react-hook-form` with `mode: 'onChange'` (validates on every keystroke).
- Deadline validation runs both in `register`'s `validate` callback and again in `onSubmit` as a safety check.
- Toast notifications dismiss themselves via `setTimeout(() => setErrorToast(''), 3000)`.
