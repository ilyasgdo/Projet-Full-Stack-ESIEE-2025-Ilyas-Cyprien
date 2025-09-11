## 1) Global Action Plan

1. Requirements consolidation (done)
   - Context7 docs analyzed; PRD created (`PRD.md`).
   - Summary: Scope, API, data model, UI, DS, Docker.

2. Repository structure and environments
   - Create `quiz-api` (Flask/SQLite) and `quiz-ui` (Vue 3/Vite).
   - Add `.gitignore`, linters, formatters, workspace files.
   - Summary: Clean baseline across back/front.

3. Backend foundation (Flask API)
   - App scaffolding, config, DB models/migrations.
   - Endpoints skeletons with contracts.
   - Summary: API reachable, empty data okay.

4. Frontend foundation (Vue 3 + shadcn-vue)
   - Vite app, router, Tailwind + shadcn-vue setup.
   - Base layout, nav, service layer (axios).
   - Summary: UI shell and DS ready.

5. FO features
   - Home (GET /quiz-info), NewQuiz (name), Questions flow, Score page.
   - Summary: Player journey end-to-end.

6. BO features
   - Login (POST /login), Questions list/detail, CRUD, image upload.
   - Summary: Admin complete with token guard.

7. Quality & tests
   - Run Postman collection to green.
   - Lint/format, basic error handling & a11y.
   - Summary: Stability baseline.

8. Docker & deploy
   - Build API/UI local images; prod images with proper `VITE_API_URL`.
   - Push to Docker Hub; finalize README and DB schema doc.
   - Summary: Delivery-ready.

Dependencies
- Front depends on API contracts; mock or feature-flag until API ready.
- Dockerization after features stabilize; iterate as needed.

Context notes
- Keep request sizes ≤ 1 Mo (image resizing).
- Use token Bearer for admin endpoints; store in localStorage (temp).


