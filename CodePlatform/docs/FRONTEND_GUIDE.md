# Frontend Guide

Routes are defined in `src/App.tsx`.

Auth:

- `src/features/auth/LandingPage.tsx`
- `src/features/auth/AuthPage.tsx`

Student:

- Dashboard, learning map, module page, lesson page, exercise page, badges, ranking in `StudentPages.tsx`.

Teacher:

- Dashboard, classes, class detail, builder, reports in `TeacherPages.tsx`.

State:

- API server state uses TanStack Query.
- Auth token/user persist through Zustand in `stores/authStore.ts`.

Styling:

- Tailwind v4 through `@tailwindcss/vite`.
- Reusable primitives live in `components/ui/primitives.tsx`.
