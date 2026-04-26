# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run all commands from within this directory (`users-manage/`):

```bash
npm start                                      # Dev server (localhost:3000)
npm run build                                  # Production build
npm test -- --watchAll=false                   # Run tests once
npm test -- --testPathPattern=App              # Run a single test file
```

## Architecture

**Stack:** React 19 + TypeScript (strict mode) + Tailwind CSS, bootstrapped with Create React App.

**Entry flow:** `public/index.html` → `src/index.tsx` → `src/App.tsx`.

**Styling:** Tailwind utility classes only — no CSS modules. PostCSS + Autoprefixer via `postcss.config.js`. Global styles in `src/index.css`.

**TypeScript:** Strict mode, ES2016 target, `react-jsx` transform (no need to import React in every file), `moduleResolution: "bundler"`.

## Project status

`App.tsx` is currently a placeholder. This project is a user management app — functionality is yet to be built.

## Setup note

Do NOT run `npm install` from scratch — react-scripts 5 has dependency conflicts with newer TypeScript/ajv on Node 20. Use the existing `node_modules`.
