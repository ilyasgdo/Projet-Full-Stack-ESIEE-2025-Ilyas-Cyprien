# Architecture CI/CD - Qrious Quiz Application

## Vue d'ensemble

Cette documentation décrit l'architecture complète de Continuous Integration et Continuous Deployment (CI/CD) mise en place pour l'application Qrious Quiz, utilisant GitHub Actions, Docker Hub et Kubernetes (Minikube).

## Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         POSTE DE DÉVELOPPEMENT (Local)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────────────┐   │
│  │   VS Code    │  │  Git Client  │  │         Terminal / Scripts           │   │
│  │              │  │              │  │  • start-cd.sh                       │   │
│  │  Édition du  │  │  git add     │  │  • auto-deploy.sh                    │   │
│  │    code      │  │  git commit  │  │  • kubectl apply                     │   │
│  └──────────────┘  │  git push    │  └──────────────────────────────────────┘   │
│                    └──────┬───────┘                                             │
└───────────────────────────│─────────────────────────────────────────────────────┘
                            │
                            │ 1. git push origin main
                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ☁️ GITHUB                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         Dépôt Code Source                                │   │
│  │  ilyasgdo/Projet-Full-Stack-ESIEE-2025-Ilyas-Cyprien                     │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                            │                                                    │
│                            │ 2. Trigger Webhook                                 │
│                            ▼                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                      GitHub Actions (Runner Ubuntu)                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │  Checkout   │─▶│   Tests     │─▶│Build Docker │─▶│  Push Docker    │  │   │
│  │  │    Code     │  │  Unitaires  │  │   Images    │  │    Hub          │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                            │
                            │ 3. docker push
                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ☁️ DOCKER HUB                                      │
│  ┌────────────────────────────────┐  ┌────────────────────────────────────┐     │
│  │   ssssssss3/quiz-api:latest    │  │   ssssssss3/quiz-ui:latest         │     │
│  │   (Backend Flask + Gunicorn)   │  │   (Frontend Vue + Nginx)           │     │
│  └────────────────────────────────┘  └────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────────┘
                            │
                            │ 4. docker pull (via auto-deploy.sh ou kubectl)
                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         ☸️ CLUSTER MINIKUBE (Local)                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         Kubernetes API Server                            │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         Namespace: default                               │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────┐      ┌─────────────────────────────────┐    │   │
│  │  │ Service: quiz-frontend  │      │    Service: quiz-backend        │    │   │
│  │  │ Type: NodePort (:30080) │      │    Type: ClusterIP (:5000)      │    │   │
│  │  └───────────┬─────────────┘      └──────────────┬──────────────────┘    │   │
│  │              │                                   │                       │   │
│  │              ▼                                   ▼                       │   │
│  │  ┌─────────────────────────┐      ┌─────────────────────────────────┐    │   │
│  │  │ Deployment: Frontend    │      │    Deployment: Backend          │    │   │
│  │  │ Replicas: 2             │─────▶│    Replicas: 2                  │    │   │
│  │  │ Image: quiz-ui:latest   │ HTTP │    Image: quiz-api:latest       │    │   │
│  │  └─────────────────────────┘      └──────────────┬──────────────────┘    │   │
│  │                                                  │                       │   │
│  │  ┌─────────────────────────┐                     │                       │   │
│  │  │ ConfigMap: quiz-config  │◀────────────────────┤                       │   │
│  │  │ • FLASK_ENV=production  │                     │                       │   │
│  │  └─────────────────────────┘                     │                       │   │
│  │                                                  │                       │   │
│  │  ┌─────────────────────────┐                     │                       │   │
│  │  │ Secret: quiz-secrets    │◀────────────────────┘                       │   │
│  │  │ • SECRET_KEY            │                                             │   │
│  │  │ • ADMIN_PASSWORD        │                                             │   │
│  │  └─────────────────────────┘                                             │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Composants du Pipeline

### 1. GitHub Actions Workflow

**Fichier:** `.github/workflows/ci-cd.yml`

Le workflow s'exécute automatiquement à chaque push sur `main` ou `master`.

#### Jobs:

| Job | Description | Runner |
|-----|-------------|--------|
| `test` | Exécute les tests unitaires frontend (Vitest) | ubuntu-latest |
| `build-and-push` | Construit et pousse les images Docker multi-arch | ubuntu-latest |

#### Étapes du build:

```yaml
1. Checkout          → Clone le code source
2. Setup Node.js     → Configure Node.js 20 avec cache npm
3. Install deps      → npm ci (installation propre)
4. Run tests         → npm run test:run (63 tests Vitest)
5. Docker Login      → Authentification Docker Hub
6. Setup QEMU        → Émulation multi-architecture
7. Setup Buildx      → Builder Docker avancé
8. Build Backend     → linux/amd64 + linux/arm64
9. Build Frontend    → linux/amd64 + linux/arm64
10. Push to Hub      → Tags: latest + SHA commit
```

### 2. Images Docker

| Image | Base | Architecture | Contenu |
|-------|------|--------------|---------|
| `quiz-api` | python:3.9-alpine | amd64/arm64 | Flask + Gunicorn |
| `quiz-ui` | nginx:alpine | amd64/arm64 | Vue 3 + Nginx (proxy) |

#### Dockerfile.k8s (Frontend)
```dockerfile
# Build stage - compile Vue.js avec Vite
FROM node:lts-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage - serveur Nginx avec proxy API
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Configuration Nginx pour proxy vers quiz-backend:5000
```

### 3. Kubernetes Manifests

**Répertoire:** `k8s/`

| Fichier | Type | Description |
|---------|------|-------------|
| `configmap.yaml` | ConfigMap | Variables d'environnement non sensibles |
| `secrets.yaml` | Secret | Credentials encodés en base64 |
| `backend-deployment.yaml` | Deployment + Service | API Flask avec ClusterIP |
| `frontend-deployment.yaml` | Deployment + Service | Frontend Nginx avec NodePort |

#### Architecture des Pods:

```
┌────────────────────────────────┐
│       quiz-frontend pods       │
│  ┌──────────────────────────┐  │
│  │         Nginx            │  │
│  │  Port 80 → NodePort 30080│  │
│  │                          │  │
│  │  / → fichiers statiques  │  │
│  │  /api/* → proxy backend  │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
              │ HTTP
              ▼
┌────────────────────────────────┐
│       quiz-backend pods        │
│  ┌──────────────────────────┐  │
│  │      Gunicorn + Flask    │  │
│  │  Port 5000 → ClusterIP   │  │
│  │  4 workers               │  │
│  │                          │  │
│  │  SQLite dans /app        │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

---

## Scripts de Déploiement

### `scripts/start-cd.sh`
Script principal pour initialiser l'environnement complet:
1. Configure Minikube (4GB RAM, 2 CPUs)
2. Déploie tous les manifests Kubernetes
3. Affiche l'URL d'accès

### `scripts/setup-minikube.sh`
Configuration Minikube optimisée pour Mac M4:
```bash
minikube start --driver=docker --memory=4096 --cpus=2
minikube addons enable metrics-server
minikube addons enable dashboard
```

### `scripts/deploy.sh`
Applique les manifests Kubernetes et attend le rollout complet.

### `scripts/auto-deploy.sh`
Watcher qui surveille Docker Hub toutes les 60 secondes:
- Détecte les nouveaux digests d'image
- Redémarre automatiquement les deployments
- Permet le CD automatique après push

---

## Workflow Complet

```
Développeur                 GitHub                  Docker Hub              Minikube
    │                          │                        │                      │
    │  1. git push main        │                        │                      │
    │─────────────────────────▶│                        │                      │
    │                          │                        │                      │
    │                          │  2. CI: Tests          │                      │
    │                          │──────────────          │                      │
    │                          │                        │                      │
    │                          │  3. Build Images       │                      │
    │                          │──────────────────────▶│                      │
    │                          │                        │                      │
    │                          │                        │  4. auto-deploy.sh   │
    │                          │                        │  détecte changement  │
    │                          │                        │─────────────────────▶│
    │                          │                        │                      │
    │                          │                        │  5. kubectl rollout  │
    │                          │                        │  restart             │
    │                          │                        │─────────────────────▶│
    │                          │                        │                      │
    │  6. Accès app via        │                        │                      │
    │  http://localhost:30080  │                        │                      │
    │◀─────────────────────────────────────────────────────────────────────────│
```

---

## Configuration Requise

### Secrets GitHub

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Nom d'utilisateur Docker Hub |
| `DOCKERHUB_TOKEN` | Token d'accès Docker Hub |

### Prérequis Locaux (Mac M4)

| Outil | Version | Installation |
|-------|---------|--------------|
| Docker Desktop | 4.x+ | [docker.com](https://docker.com) |
| Minikube | 1.37+ | `brew install minikube` |
| kubectl | 1.34+ | `brew install kubectl` |

---

## Commandes Utiles

### Démarrage
```bash
# Setup complet (une seule fois)
./scripts/start-cd.sh

# Lancer le watcher auto-deploy (nouveau terminal)
./scripts/auto-deploy.sh
```

### Monitoring
```bash
# Status des pods
kubectl get pods -l app=quiz

# Logs backend
kubectl logs -l component=backend -f

# Logs frontend
kubectl logs -l component=frontend -f

# Dashboard Kubernetes
minikube dashboard
```

### Redéploiement Manuel
```bash
# Forcer le redéploiement
kubectl rollout restart deployment/quiz-backend
kubectl rollout restart deployment/quiz-frontend

# Voir le status du rollout
kubectl rollout status deployment/quiz-backend
```

### Accès Application
```bash
# Obtenir l'URL du frontend
minikube service quiz-frontend --url
```

---

## Sécurité

| Élément | Protection |
|---------|------------|
| Secrets K8s | Encodés base64, montés en variables d'env |
| Docker Hub | Token d'accès (pas de mot de passe) |
| GitHub Actions | OIDC, secrets chiffrés |
| Admin API | JWT avec expiration |

---

## Évolutions Futures

1. **Base de données externe** : Migration SQLite → PostgreSQL managé
2. **Ingress Controller** : Remplacer NodePort par Ingress + TLS
3. **Helm Charts** : Packager les manifests K8s
4. **ArgoCD** : GitOps pour synchronisation automatique
5. **Monitoring** : Prometheus + Grafana

---

*Dernière mise à jour: 26 décembre 2025*
