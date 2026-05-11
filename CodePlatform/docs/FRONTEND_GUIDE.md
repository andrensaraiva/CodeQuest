# Frontend Guide

Routes are defined in `src/App.tsx`.

## Pages

Auth:

- `src/features/auth/LandingPage.tsx`
- `src/features/auth/AuthPage.tsx`

Student:

- Dashboard, learning map, module page, lesson page, exercise page, badges, ranking — all in `StudentPages.tsx`.

Teacher:

- Dashboard, classes, class detail, builder, reports — all in `TeacherPages.tsx`.

## State

- **Server state** — TanStack Query.
- **Auth session** — Zustand store in `stores/authStore.ts`. Stores `token`, `refreshToken`, and `user`; persists to `localStorage`.
- **Preferences** — language and theme via `i18n/preferences.tsx`.

## API Client

`api/client.ts` is the single fetch wrapper:

- Adds the bearer token automatically.
- On **401**, attempts a `/auth/refresh` once (with a lock so concurrent calls share one refresh). If refresh succeeds, the original request is retried; otherwise the session is cleared and the user is redirected to `/login`.
- Reads `detail` and `message` from the API's `ProblemDetails` responses.
- Paginated endpoints return `PagedResult<T>` (`items`, `page`, `pageSize`, `totalCount`, `totalPages`).

## Resilience

`components/layout/ErrorBoundary.tsx` wraps the app at the root in `main.tsx`. Uncaught render errors display a recovery screen instead of a blank page.

## Performance

The Monaco editor is loaded with `React.lazy` and `Suspense`, so its chunk only downloads when the student opens an exercise.

## Styling

- Tailwind v4 through `@tailwindcss/vite`.
- Reusable primitives in `components/ui/primitives.tsx`.
- Dark/light themes via CSS custom properties.

## Tests

Vitest + Testing Library + jsdom.

```powershell
npm test          # one-shot
npm run test:watch
```

Setup is in `src/test/setup.ts`. New tests live next to the file under test as `*.test.ts(x)`.
