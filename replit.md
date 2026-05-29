# OneTune

A futuristic glass music OS — Apple Music meets VisionOS aesthetic. Discover and play music from iTunes and Deezer in a beautiful dark glass UI.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, wouter routing, TanStack Query, Zustand (player store), Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Music sources: iTunes Search API + Deezer API (no key needed)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Frontend: `artifacts/onetune/src/`
  - Pages: `Home`, `Search`, `Library`, `Playlists`, `PlaylistDetail`, `Profile`, `Login`
  - Components: `GlassSidebar`, `FloatingPlayer`, `TrackCard`, `AppLayout`
  - Player state: `src/store/player.ts` (Zustand)
- API server: `artifacts/api-server/src/routes/music.ts` — iTunes + Deezer search
- DB schema: `lib/db/src/schema/`
- OpenAPI contract: `lib/api-spec/openapi.yaml`
- Generated hooks: `lib/api-client-react/src/generated/api.ts`

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → React Query hooks + Zod schemas
- Music data from two sources: iTunes (no key, 30s previews) + Deezer (no key, 30s previews), merged per request
- Auth: localStorage-based (`onetune_user` key) — no backend auth
- Player audio: HTML5 `<audio>` element in FloatingPlayer, controlled by Zustand store
- No Supabase integration available on this platform; using Replit-managed PostgreSQL

## Product

- Login / Create Account screen with the OneTune logo
- Home: Hero banner + Trending Songs (horizontal scroll) + Popular Artists (circular) + Popular Albums + Recently Played
- Search: searches iTunes + Deezer simultaneously, shows Tracks / Artists / Albums sections
- Library: saved tracks with heart button on every TrackCard
- Playlists: create/manage playlists, add tracks from any TrackCard
- Profile: display name editing, listening stats, top artists chart, logout
- Floating Player: collapsed pill + fullscreen modal, like button, volume

## User preferences

- Colors: `#222222` background, `#ff006b` primary (neon pink), `#ff390d` secondary (neon orange)
- Glass OS / VisionOS aesthetic throughout
- Logo: `attached_assets/dotcom_one_(4)_1780057221014.png`

## Gotchas

- When adding new API routes, add them to `lib/api-spec/openapi.yaml` first, then run codegen
- Static/specific routes in music.ts must come before `/:id` wildcard route
- Restart the API server workflow after changing `artifacts/api-server/src/routes/`
- The Vite HMR may show stale errors after codegen — restart the web workflow to clear them

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
