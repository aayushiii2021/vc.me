# vc.me frontend

Foundation for the vc.me web UI: **React 19**, **Vite**, **Tailwind CSS v4**, and **shadcn/ui** (Radix Nova). **Light mode only**, with design tokens inspired by [Y Combinator](https://www.ycombinator.com) brand colors and typography.

## Quick start

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Stack

| Layer | Choice |
|--------|--------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix Nova) |
| Icons | Lucide |

## Design system

- **Brand tokens** — `src/styles/yc-tokens.css`  
  Raw YC palette: orange `#ff4000`, neutrals, type scale, spacing, radii.
- **Semantic tokens** — `src/index.css`  
  Maps brand values to shadcn variables (`--primary`, `--muted`, etc.).
- **Layout** — `src/components/layout/app-shell.tsx`  
  Minimal page chrome (header + main). Replace or extend for real routes.

### Adding shadcn components

```bash
npx shadcn@latest add dialog table tabs
```

Aliases in `components.json` point at `src/components` so files land in the right place.

### Path alias

`@/` → `src/` (see `vite.config.ts` and `tsconfig.app.json`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## What to build next

- Routing (e.g. React Router) and feature pages under `src/pages/`
- API client wired to the RocketRide / backend layer
- Replace the demo content in `App.tsx` once routes exist
