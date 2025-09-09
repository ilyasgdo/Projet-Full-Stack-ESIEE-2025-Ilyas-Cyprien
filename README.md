# Quiz Application - Full Stack (Flask + Vue 3)

Application de quiz complète développée avec Flask (API) et Vue 3 (Frontend) dans le cadre du projet ESIEE 2025.

## 🎯 Fonctionnalités

### Front-Office (Public)
- ✅ Page d'accueil avec meilleurs scores
- ✅ Saisie nom du joueur  
- ✅ Interface de questions avec progression
- ✅ Affichage des résultats et classement
- ✅ Navigation fluide avec Vue Router

### Back-Office (Admin)
- ✅ Authentification par mot de passe (`iloveflask`)
- ✅ Gestion complète des questions (CRUD)
- ✅ Upload d'images en base64
- ✅ Suppression des participations
- ✅ Interface admin responsive

## 🛠 Technologies

### Backend
- **Flask 3.1.2** - Framework web Python
- **SQLAlchemy** - ORM pour base de données
- **SQLite** - Base de données
- **PyJWT** - Authentification JWT
- **Flask-CORS** - Support CORS

### Frontend  
- **Vue 3** - Framework JavaScript
- **Vite** - Build tool et dev server
- **Vue Router** - Navigation
- **Tailwind CSS** - Framework CSS
- **Axios** - Client HTTP

## 🚀 Installation et Lancement

### Prérequis
- Python 3.9+
- Node.js LTS
- Docker (optionnel)

### Backend (API)
```bash
cd quiz-api
python -m venv venv
venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
python app.py
```
→ API disponible sur http://localhost:5000

### Frontend (UI)
```bash
cd quiz-ui/quiz-app
npm install
npm run dev
```
→ Interface disponible sur http://localhost:5173

## 🐳 Docker

### Images locales
```bash
# API
cd quiz-api
docker build -t quiz-local-api .
docker run -p 5000:5000 quiz-local-api

# Frontend
cd quiz-ui/quiz-app
docker build -t quiz-local-ui .
docker run -p 3000:80 quiz-local-ui
```

### Images de production
```bash
# API
docker build -t votrehandle/quiz-prod-api .

# Frontend
docker build -t votrehandle/quiz-prod-ui -f Dockerfile.prod .
```

## 📊 API Endpoints

### Publics
- `GET /` - Health check
- `GET /quiz-info` - Infos quiz + scores
- `GET /questions/{id}` - Question par ID
- `GET /questions?position={p}` - Question par position
- `POST /participations` - Soumission réponses

### Authentification
- `POST /login` - Connexion admin

### Admin (JWT requis)
- `POST /questions` - Créer question
- `PUT /questions/{id}` - Modifier question  
- `DELETE /questions/{id}` - Supprimer question
- `DELETE /questions/all` - Supprimer toutes questions
- `DELETE /participations/all` - Supprimer participations

## 🔑 Configuration

### Variables d'environnement
- `SECRET_KEY` - Clé secrète Flask (défaut: dev-secret-key)
- `ADMIN_PASSWORD` - Mot de passe admin (défaut: iloveflask)
- `VITE_API_URL` - URL API pour frontend (défaut: http://localhost:5000)

## 📁 Structure du projet

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
└── quiz-ui/quiz-app/       # Frontend Vue 3
    ├── src/
    │   ├── views/          # Pages Vue
    │   ├── services/       # Services API
    │   └── router/         # Configuration routes
    ├── Dockerfile          # Image Docker dev
    ├── Dockerfile.prod     # Image Docker prod
    └── package.json        # Dépendances npm
```

## 🧪 Tests

### Tests API automatisés
```bash
cd quiz-api
python test_api.py
```

### Tests manuels
1. Démarrer backend et frontend
2. Naviguer sur http://localhost:5173
3. Tester parcours joueur complet
4. Tester interface admin (/admin)

## 📝 Base de données

### Modèle
- **questions** (id, position, title, text, image, timestamps)
- **answers** (id, question_id, text, is_correct)
- **participations** (id, player_name, score, created_at)

### Données d'exemple
L'API initialise automatiquement 3 questions d'exemple au premier démarrage.

## 🎨 Design

Interface utilisant Tailwind CSS avec:
- Design responsive mobile-first
- Palette de couleurs cohérente
- Animations et transitions fluides
- Composants accessibles

## 📋 Validation

- ✅ Endpoints API conformes aux specs
- ✅ Interface utilisateur complète
- ✅ Authentification sécurisée
- ✅ Gestion d'erreurs robuste
- ✅ Images Docker fonctionnelles
- ✅ Tests de validation réussis

## 👥 Équipe

Développé par Ilyas Ghandaoui dans le cadre du projet Full Stack ESIEE 2025.

## 📄 Licence

Projet académique - ESIEE Paris 2025