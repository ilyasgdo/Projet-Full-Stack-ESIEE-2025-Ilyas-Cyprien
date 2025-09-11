## 2) Backend Action Plan (Flask/SQLite)

1. Project setup
   - Create `quiz-api` with venv, Flask, Flask-CORS, autopep8.
   - Files: `app.py`, `requirements.txt`, `.gitignore`, VSCode launch.
   - Summary: API boots locally.

2. DB schema & models
   - Tables: questions, answers, participations, participation_answers (optional), admin_sessions (optional).
   - Use SQLAlchemy or raw sqlite3; seed minimal data.
   - Summary: Persistent store ready.

3. Auth
   - `POST /login` with env password; mint short-lived token (memory or table).
   - Decorator to require Bearer for admin routes.
   - Summary: Admin security OK.

4. Public endpoints
   - `GET /quiz-info` (size + sorted scores).
   - `GET /questions/{id}` and `GET /questions?position=p`.
   - `POST /participations` compute score and store.
   - Summary: FO consumption complete.

5. Admin endpoints
   - `POST /questions`, `PUT /questions/{id}` (validate 1 correct),
     `DELETE /questions/{id}`, `DELETE /questions/all`, `DELETE /participations/all`.
   - Maintain unique sequential positions (shift on insert/update).
   - Summary: CRUD OK.

6. Validation & limits
   - JSON schema or manual checks; reject >1 Mo payloads; verify image b64 size.
   - Summary: Contracts enforced.

7. Logging & errors
   - Structured error responses; gunicorn-ready logging.
   - Summary: Operability improved.

8. Docker
   - Dockerfile (python:alpine, gunicorn), `.dockerignore`.
   - Local run and tests; publish `quiz-prod-api`.
   - Summary: Deployment path.

Dependencies
- Python 3.9+, sqlite; Postman collection for verification.

Context notes
- Keep date format `dd/MM/yyyy hh:mm:ss`; single correct answer enforced.


