# DevelopmentTooling

This document describes the development tooling configured for this project.

## Build & Development

- **Dev server**: `npm run dev` (Astro dev server on localhost:4321)
- **Production build**: `npm run build`
- **Preview**: `npm run preview`

## Linting & Formatting

- **Lint**: `npm run lint` (runs ESLint + Prettier)
- **Format**: `npm run format` (auto-fix with Prettier)
- **Type check**: `npm run type-check` (TypeScript compilation check)

## Pre-commit Hooks

Husky runs on every commit:

- ESLint checks for JS/TS/Astro files
- Prettier formats all tracked files

## Link Checking

Run `npx blc http://localhost:4321` after starting dev server to check for broken links.

## CI/CD

- Pushes to `main` trigger GitHub Actions deployment
- No PR workflow yet — development happens directly on `main`

## Environment Variables

Copy `.env.local.example` to `.env.local` to set custom values.
