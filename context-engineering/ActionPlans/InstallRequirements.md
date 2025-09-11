## 4) Install & Requirements Action Plan (Windows)

1. System prerequisites
   - Windows 10/11 updated; enable WSL2 if planning Docker Desktop.
   - Summary: base OS ready.

2. Core tools via Chocolatey
   - Install Chocolatey (admin PowerShell), enable global confirmation.
   - Install: git, python, sqlitebrowser, vscode, postman, postman-cli, nodejs, docker-desktop.
   - Summary: tooling installed uniformly.

3. Git & GitHub
   - Create private repo; clone locally.
   - Configure user/email; add `.gitignore` templates.
   - Summary: version control ready.

4. Backend environment (quiz-api)
   - Create folder; open VS Code workspace.
   - Create venv; activate; `pip install flask flask-cors autopep8`.
   - Freeze deps to `requirements.txt`; add `app.py` hello world; add launch config.
   - Summary: API boots with F5.

5. Frontend environment (quiz-ui)
   - `npm create vue@latest` with Router/ESLint/Prettier.
   - Install Tailwind; install shadcn-vue; basic theme.
   - Create `.env.development` with `VITE_API_URL=http://localhost:5000`.
   - Summary: UI shells, `npm run dev` OK.

6. Postman setup
   - Import provided collection; set base URL variable.
   - Validate endpoints progressively.
   - Summary: tests foundation in place.

7. Docker setup
   - Verify `docker --version` and Desktop running.
   - API Dockerfile (python:alpine + gunicorn), `.dockerignore`.
   - UI multistage Dockerfile (Node→Nginx), `.dockerignore`; prod `VITE_API_URL=/api`.
   - Summary: containers build/run locally.

8. Publish images (later)
   - `docker login`; build `quiz-prod-api` and `quiz-prod-ui` with Docker Hub handle.
   - `docker push` both images.
   - Summary: prod images available.

9. Validation checklist
   - API runs locally; UI runs locally; Postman green; Docker local OK.
   - Commit/push; README quickstart updated.
   - Summary: ready to develop features.

Dependencies
- Python 3.9+, Node LTS, Docker Desktop, Postman CLI optional.

Context notes
- Use venv for all pip installs; request size ≤ 1 Mo.


