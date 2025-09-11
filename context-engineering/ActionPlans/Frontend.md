## 3) Frontend Action Plan (Vue 3 + shadcn-vue)

1. Project bootstrap
   - `npm create vue@latest` → quiz-ui; add Router, ESLint, Prettier.
   - Tailwind setup; install shadcn-vue; base theme.
   - Summary: UI shell ready.

2. Architecture & services
   - Folders: views, components, services, router.
   - `QuizApiService` (axios, baseURL from `VITE_API_URL`).
   - `ParticipationStorageService`, `AuthStorageService` (localStorage).
   - Summary: Infra complete.

3. Layout & navigation
   - Header (Home/Admin), base layout with shadcn components.
   - Summary: App chrome in place.

4. FO features
   - HomePage: fetch `/quiz-info`, show scores.
   - NewQuizPage: name input, save to storage, route → `/questions`.
   - QuestionsManager + QuestionDisplay: flow by position, selection, auto-next.
   - ScorePage: show result after `POST /participations`.
   - Summary: Player journey done.

5. BO features
   - Admin: login (POST /login), token guard.
   - QuestionsList, QuestionAdminDisplay, QuestionEdition + `ImageUpload`.
   - CRUD wired to API; confirms with Dialog.
   - Summary: Admin experience complete.

6. UI/UX
   - shadcn-vue: Card, Table, Form, Input, RadioGroup, Button, Toast, Dialog, Skeleton.
   - A11y: focus states, aria labels, keyboard nav.
   - Summary: Polished UI.

7. Quality
   - ESLint/Prettier on save; handle API errors with toasts.
   - Summary: Stable baseline.

8. Docker
   - Multistage Node→Nginx, `.dockerignore`, `VITE_API_URL=/api` in prod.
   - Summary: Deployable UI.

Dependencies
- Vue 3, vue-router, axios, tailwindcss, shadcn-vue.

Context notes
- Respect ≤ 1 Mo/request (image resizing before upload, preview).


