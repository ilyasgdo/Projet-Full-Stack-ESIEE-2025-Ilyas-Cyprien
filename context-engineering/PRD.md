## PRD — Application Quiz (Vue 3 + shadcn-vue, API Flask/SQLite)

### 1) Contexte et objectif

- **But**: livrer une application web de quiz complète avec un Front-Office (participation publique) et un Back-Office (administration) conforme aux exigences fournies.
- **Stack imposée**: API REST Python Flask + base SQLite, Front Vue 3 (Vite). Containerisation Docker. Code versionné sur GitHub.
- **Contraintes clés**:
  - Toutes les requêtes à l’API ≤ 1 Mo (images incluses).
  - TDD via collection Postman fournie: 100% des tests verts.
  - Livraison: 2 images Docker (API et UI), schéma BDD, accès admin (mot de passe: `iloveflask`).

### 2) Personas et rôles

- **Joueur** (public): participe au quiz sans compte, voit les meilleurs scores, obtient son score et classement.
- **Administrateur** (privé): s’authentifie via mot de passe, gère le catalogue de questions/réponses et images.

### 3) Périmètre fonctionnel

#### 3.1 Front-Office (public)
- Barre de navigation: lien Home, lien Admin.
- Home:
  - CTA « Participer ».
  - Liste des meilleurs scores (tri décroissant).
- Démarrage du quiz:
  - Saisie du nom du joueur.
  - Démarrer le quiz (redirige vers la première question).
- Questions (4 choix, 1 seule bonne réponse):
  - Titre, image (optionnelle), énoncé, 4 réponses exclusives.
  - Bouton « Suivant » ou passage auto après sélection.
- Résultat:
  - Score obtenu.
  - Classement vs. participations passées (meilleurs scores actualisés).
  - Bouton « Retour Home ».

#### 3.2 Back-Office (authentifié)
- Connexion admin par mot de passe, bouton « Déconnexion » global.
- Liste des questions:
  - Bouton « Créer une question ».
  - Items cliquables vers le détail.
- Détail question:
  - Bouton « Éditer » et « Supprimer » (retour liste).
  - Titre, énoncé, image, 4 réponses avec marqueur de la bonne.
- Édition question:
  - Champs Position (unique et cohérente), Titre, Intitulé, Upload image + preview.
  - 4 réponses (intitulé + checkbox bonne réponse, 1 seule vraie autorisée).
  - Sauvegarder / Annuler.
- Opérations globales (protégées): supprimer toutes les questions, supprimer toutes les participations.

### 4) API REST (Flask) — Contrat fonctionnel

Base URL configurable côté UI via `VITE_API_URL`.

- Public:
  - `GET /quiz-info` → { size, scores[]: { playerName, score, date(dd/MM/yyyy hh:mm:ss) } }
  - `GET /questions/{id}` → { question: { id, title, position, text, image(b64), possibleAnswers[]: { id, text, isCorrect } } }
  - `GET /questions?position={p}` → même payload que ci-dessus
  - `POST /participations` body { player_name, answers[] (positions) } → { answersSummaries[], playerName, score }
- Auth:
  - `POST /login` body { password } → { token }
- Admin (Bearer token):
  - `POST /questions` body { title, text, image(b64), position, possibleAnswers[]: { text, isCorrect } } → { id }
  - `PUT /questions/{id}` body { title, text, image(b64), position, possibleAnswers[] } → 204
  - `DELETE /questions/{id}` → 204
  - `DELETE /questions/all` → 204
  - `DELETE /participations/all` → 204

Notes contractuelles:
- Position est un entier positif, unique par question, avec décalage automatique si collision.
- Une seule réponse correcte par question (validation back requise).
- Corps JSON, statuts HTTP conformes à la spec.

### 5) Modèle de données (SQLite)

- `questions`
  - id (PK, int)
  - position (int, unique, not null)
  - title (text, not null)
  - text (text, not null)
  - image (text, nullable, stocke b64)
  - created_at (datetime), updated_at (datetime)
- `answers`
  - id (PK)
  - question_id (FK questions.id)
  - text (text, not null)
  - is_correct (boolean, not null)
  - contrainte: une seule `is_correct = 1` par `question_id`
- `participations`
  - id (PK)
  - player_name (text, not null)
  - score (int, not null)
  - created_at (datetime, not null)
- `participation_answers` (optionnel pour audit)
  - id (PK)
  - participation_id (FK)
  - question_id (FK)
  - selected_answer_id (FK answers.id)
  - is_correct (boolean)
- Auth simple:
  - Mot de passe admin fixe côté serveur via env (par défaut `iloveflask`).
  - Sessions/token: table `admin_sessions` (id, token, created_at, expires_at) ou token ephemeral en mémoire (au choix, hors scope Postman si non requis).

### 6) Architecture Front (Vue 3, Vite, Composition API)

- **Dépendances clés**:
  - `vue`, `vue-router`, `axios`.
  - `tailwindcss` + **shadcn-vue** (design system).
- **Structure** (indicative):
  - `src/`
    - `views/` → `HomePage.vue`, `NewQuizPage.vue`, `QuestionsManager.vue`, `QuestionDisplay.vue`, `ScorePage.vue`, `Admin.vue`, `QuestionsList.vue`, `QuestionAdminDisplay.vue`, `QuestionEdition.vue`
    - `components/` → UI atomiques (wrappers shadcn), `ImageUpload.vue`
    - `services/` → `QuizApiService.js`, `ParticipationStorageService.js`, `AuthStorageService.js`
    - `router/` → `index.js`
- **Routes**:
  - `/` → HomePage
  - `/new-quiz` → NewQuizPage
  - `/questions` → QuestionsManager
  - `/score` → ScorePage
  - `/admin` → Admin (login + modes: list/display/edit)
- **Etat & stockage**:
  - Pas de store global obligatoire. `ref` + services suffisent.
  - `localStorage`: `playerName`, `lastScore`, `adminToken` (+ expiration simple).
- **Erreurs & UX**:
  - Toasts (shadcn-vue) pour succès/erreur réseau.
  - Empty states et spinners (Skeleton/Spinner shadcn-vue).

### 7) Design System — shadcn-vue (avec Tailwind)

- **Motivation**: cohérence, accessibilité, vélocité via composants prédéfinis.
- **Intégration**: Tailwind configuré avec presets shadcn-vue.
- **Composants pressentis**:
  - Layout/nav: `NavigationMenu`, `Button`, `Separator`.
  - Home: `Card`, `Table`/`ScrollArea` pour scores.
  - Formulaires: `Input`, `Label`, `Button`, `Form`, `Toast`.
  - Quiz: `Card`, `RadioGroup` + `RadioGroupItem`, `Progress`, `Button`.
  - Admin: `DataTable` (ou `Table`), `Dialog` (confirms), `Textarea`, `Checkbox`, `Tabs` si besoin.
  - Médias: `Skeleton`/`Spinner`, composant custom `ImageUpload`.
- **Thème**: palette discrète, dark mode optionnel (préférence système), focus visibles.
- **Accessibilité**: rôles ARIA, contrastes AA, focus trap dans `Dialog`.

### 8) Règles métier principales

- Une seule bonne réponse par question; validation UI et back.
- Position unique et continue (le back peut réaligner en cas d’insertion).
- Score = nombre de bonnes réponses (entier) sur N.
- Tri des meilleurs scores décroissant; date au format `dd/MM/yyyy hh:mm:ss` (côté API).

### 9) Sécurité

- Auth admin par mot de passe → `POST /login` → token Bearer.
- Stockage token en `localStorage` (clé `adminToken`), expiration simple (p.ex. 24–48h) si géré côté back.
- CORS activé pour dev; en prod, UI et API sous même domaine via reverse-proxy.

### 10) Performance et sobriété

- ≤ 1 Mo par requête: 
  - Compression client d’images avant b64 (dimensionnement côté UI),
  - Limiter la taille des images (p.ex. ≤ 200–400 Ko chacune),
  - Pagination/limitation des scores renvoyés si volumétrie.
- Shadcn-vue + Tailwind: tree-shaking et purge CSS.

### 11) Tests et qualité

- Exécuter la collection Postman fournie → 100% OK.
- Lint: ESLint + Prettier (front). `autopep8` côté Python.
- Tests manuels UI: chemins principaux FO/BO, erreurs réseau, images manquantes.

### 12) Déploiement (Docker)

- **API** (Flask + Gunicorn): Dockerfile alpine, installation deps via `requirements.txt`, `FLASK_APP=app.py`, `CMD gunicorn ... :5000`.
- **UI** (Vue build + Nginx): multistage Node lts-alpine → build `dist` → Nginx.
- **Environnements**:
  - Dev: `VITE_API_URL=http://localhost:5000`.
  - Prod: `VITE_API_URL=/api` (servi derrière reverse-proxy).
- Publication: Docker Hub (2 images), tags clairs (`prod`, `latest`).

### 13) Livrables attendus

- Repo GitHub privé (inviter: raphael.escure@esiee.fr, simon.budin@esiee.fr).
- 2 images Docker de prod (UI et API) publiées sur Docker Hub.
- Schéma du modèle de base de données (image/mermaid/SQL).
- Mot de passe admin: `iloveflask` + mode de configuration (env).

### 14) Jalons (indicatifs)

- J1–J2: Setup back (endpoints skeleton) + setup UI + DS shadcn-vue.
- J3: FO Home/NewQuiz + `GET /quiz-info`.
- J4: Questions flow (`GET /questions?position`) + résultat + `POST /participations`.
- J5: Admin login + liste + détail.
- J6: Admin création/édition/suppression.
- J7: Finition, a11y, tests Postman 100%, Docker local.
- J8: Publication Docker Hub + revue finale + documentation.

### 15) Hors scope

- Multi-langue, multi-quiz, multi-admin avancé.
- Analytics détaillées.
- CDN médias; stockage binaire d’images (utilisation b64 simplifiée).

### 16) Questions ouvertes

- Limiter le nombre d’entrées de scores renvoyées par `GET /quiz-info` ? (p.ex. top 50)
- Expiration/renouvellement du token admin: nécessaire pour l’évaluation ?
- Politique d’upload d’image: taille max, formats, redimensionnement UI.

### 17) Références (extraits Context7)

- Cahier des charges (exigences fonctionnelles/techniques/livraison)
- Présentation fonctionnelle du FO
- Présentation fonctionnelle de l’Admin
- Définitions de l’API Python (contrat endpoints)
- Guides d’installation, structure front, services, et dockerisation


