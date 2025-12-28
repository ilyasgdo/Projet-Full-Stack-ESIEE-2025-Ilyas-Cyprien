# Qrious - Full Stack (Flask + Vue 3)

[![CI/CD Pipeline](https://github.com/ilyasgdo/Projet-Full-Stack-ESIEE-2025-Ilyas-Cyprien/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/ilyasgdo/Projet-Full-Stack-ESIEE-2025-Ilyas-Cyprien/actions/workflows/ci-cd.yml)

> **Projet Cloud Native DevOps - ESIEE Paris 2025**
> 
> 👤 **Auteurs**: Ilyas GDOU & Cyprien
> 
> 🎓 **Filière**: Data Engineering / DevOps
> 
> 📅 **Année académique**: 2024-2025
> 
> 🏫 **École**: ESIEE Paris

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

## CI/CD Pipeline

### Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Local Dev      │────▶│  GitHub Actions │────▶│  Docker Hub     │
│  (git push)     │     │  (Test & Build) │     │  (Images)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────────────────────────────┐
│  Browser        │────▶│  Minikube Cluster (Local)               │
│                 │     │  ┌─────────┐      ┌─────────────────┐   │
│                 │     │  │Frontend │─────▶│Backend + SQLite │   │
│                 │     │  │NodePort │      │ClusterIP        │   │
│                 │     │  └─────────┘      └─────────────────┘   │
└─────────────────┘     └─────────────────────────────────────────┘
```

### Configuration GitHub Actions

1. **Créer les secrets GitHub** dans Settings → Secrets → Actions:
   - `DOCKERHUB_USERNAME`: Votre nom d'utilisateur Docker Hub
   - `DOCKERHUB_TOKEN`: Token d'accès Docker Hub (créer sur hub.docker.com)

2. **Le workflow s'exécute automatiquement** lors d'un push sur `main`/`master`:
   - ✅ Tests unitaires frontend (Vitest)
   - 🐳 Build images Docker (backend + frontend)
   - 📤 Push vers Docker Hub

### Déploiement Kubernetes (Minikube)

#### Prérequis
```bash
# macOS (M4 compatible)
brew install minikube kubectl
# Docker Desktop doit être installé et démarré
```

#### Setup Minikube
```bash
# Script automatique (recommandé)
./scripts/setup-minikube.sh

# Ou manuellement
minikube start --driver=docker --memory=4096 --cpus=2
```

#### Déploiement Application
```bash
# Définir le username Docker Hub
export DOCKERHUB_USERNAME="votre-username"

# Déployer
./scripts/deploy.sh

# Accéder à l'application
minikube service quiz-frontend --url
```

#### Commandes Utiles
```bash
# Status des pods
kubectl get pods -l app=quiz

# Logs backend
kubectl logs -l component=backend

# Dashboard Kubernetes
minikube dashboard

# Redémarrer un déploiement
kubectl rollout restart deployment/quiz-backend
kubectl rollout restart deployment/quiz-frontend
```

## Structure du Projet

```
├── .github/workflows/     # CI/CD GitHub Actions
│   └── ci-cd.yml         # Pipeline principal
├── k8s/                   # Manifests Kubernetes
│   ├── configmap.yaml    # Configuration non-sensible
│   ├── secrets.yaml      # Secrets (à personnaliser)
│   ├── backend-deployment.yaml
│   └── frontend-deployment.yaml
├── scripts/               # Scripts de déploiement
│   ├── setup-minikube.sh # Configuration Minikube M4
│   └── deploy.sh         # Déploiement K8s
├── quiz-api/              # Backend Flask
│   ├── app.py            # Application principale
│   ├── Dockerfile        # Image Docker
│   └── requirements.txt  # Dépendances Python
└── quiz-ui/               # Frontend Vue 3
    ├── src/              # Code source Vue
    ├── Dockerfile        # Image Docker
    └── package.json      # Dépendances npm
```