# Qrious - Full Stack (Flask + Vue 3)

Application de quiz développée avec Flask (API) et Vue 3 (Frontend) pour le projet ESIEE 2025.

## Fonctionnalités

### Front-Office
- Page d'accueil avec meilleurs scores
- Saisie nom du joueur  
- Interface de questions avec progression
- Affichage des résultats et classement

### Back-Office
- Authentification par mot de passe (`iloveflask`)
- Gestion des questions (CRUD)
- Upload d'images en base64
- Suppression des participations
- Support LaTeX pour équations mathématiques

## Support LaTeX

Utilisation de `$...$` pour les équations inline et `$$...$$` pour les équations en bloc.
Rendu avec KaTeX.

## Technologies

### Backend
- Flask 3.1.2
- SQLAlchemy
- SQLite
- PyJWT
- Flask-CORS

### Frontend  
- Vue 3
- Vite
- Vue Router
- Tailwind CSS
- Axios
- KaTeX

## Installation

### Prérequis
- Python 3.9+
- Node.js LTS

### Backend
```bash
cd quiz-api
python -m venv venv
venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd quiz-ui
npm install
npm run dev
```

## Docker

```bash
# API
cd quiz-api
docker build -t quiz-api .
docker run -p 5000:5000 quiz-api

# Frontend
cd quiz-ui
docker build -t quiz-ui .
docker run -p 3000:80 quiz-ui
```

## API Endpoints

### Publics
- `GET /` - Health check
- `GET /quiz-info` - Infos quiz + scores
- `GET /questions/{id}` - Question par ID
- `GET /questions?position={p}` - Question par position
- `POST /participations` - Soumission réponses

### Authentification
- `POST /login` - Connexion admin

### Admin (JWT requis)
- `GET /questions/all` - Liste toutes les questions (pour administration)
- `POST /questions` - Créer question
- `PUT /questions/{id}` - Modifier question  
- `DELETE /questions/{id}` - Supprimer question
- `DELETE /questions/all` - Supprimer toutes questions
- `DELETE /participations/all` - Supprimer participations

## Configuration

Variables d'environnement:
- `SECRET_KEY` (défaut: dev-secret-key)
- `ADMIN_PASSWORD` (défaut: iloveflask)
- `VITE_API_URL` (défaut: http://localhost:5000)

## Structure du projet

```
├── context-engineering/     # Documentation et plans
│   ├── ActionPlans/         # Plans d'action détaillés
│   ├── PRD.md              # Product Requirements Document
│   └── ProgressLog.md      # Journal de progression
├── quiz-api/               # Backend Flask
│   ├── models.py           # Modèles SQLAlchemy
│   ├── auth.py             # Authentification JWT
│   ├── app.py              # Application principale
│   ├── Dockerfile          # Image Docker
│   └── requirements.txt    # Dépendances Python
└── quiz-ui/                # Frontend Vue 3
    ├── src/
    │   ├── views/          # Pages Vue
    │   ├── services/       # Services API
    │   └── router/         # Configuration routes
    ├── Dockerfile          # Image Docker dev
    ├── Dockerfile.prod     # Image Docker prod
    └── package.json        # Dépendances npm
```

## Tests

```bash
cd quiz-ui
npm test
```

Tests unitaires avec Vitest couvrant les services et composants principaux.

## Base de données

### Modèle
- **questions**: id, position, title, text, image (base64), created_at, updated_at
- **answers**: id, question_id, text, is_correct, order
- **participations**: id, player_name, score, created_at
- **admin_sessions**: id, token, created_at, expires_at

Relations: 1 question → N answers (cascade delete)

Stockage: SQLite dans `instance/quiz.db`