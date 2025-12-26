# Guide de Déploiement - Quiz Application

## Comment ça marche ?

### Le Pipeline en 4 étapes

```
   VOUS                    GITHUB                 DOCKER HUB              MINIKUBE
    │                         │                       │                      │
    │  git push main          │                       │                      │
    ├────────────────────────►│                       │                      │
    │                         │                       │                      │
    │                    Tests + Build Docker         │                      │
    │                         ├──────────────────────►│                      │
    │                         │                       │                      │
    │                         │                 auto-deploy.sh               │
    │                         │                       ├─────────────────────►│
    │                         │                       │  kubectl restart     │
    │                         │                       │                      │
    │◄─────────────────────────────────────────────────────────────────────────
    │           Application mise à jour automatiquement !
```

---

## Première Installation (une seule fois)

### 1. Prérequis

```bash
# Installer Docker Desktop (télécharger sur docker.com)
# Puis installer les outils CLI :
brew install minikube kubectl
```

### 2. Configurer GitHub Secrets

Allez sur : https://github.com/ilyasgdo/Projet-Full-Stack-ESIEE-2025-Ilyas-Cyprien/settings/secrets/actions

Ajoutez ces deux secrets :
- `DOCKERHUB_USERNAME` = `ssssssss3`
- `DOCKERHUB_TOKEN` = votre token Docker Hub

### 3. Lancer le Cluster

```bash
# Démarrer Docker Desktop d'abord !

# Puis lancer le setup complet :
./scripts/start-cd.sh
```

### 4. Activer le Déploiement Automatique

Dans un **nouveau terminal** :
```bash
./scripts/auto-deploy.sh
```

> ⚠️ Laissez ce terminal ouvert ! Il surveille Docker Hub pour les nouvelles images.

---

## Utilisation Quotidienne

### Déployer une Modification

```bash
# 1. Modifiez votre code
# 2. Commitez et pushez
git add .
git commit -m "feat: mon changement"
git push origin main

# 3. C'est tout ! Le reste est automatique :
#    - GitHub Actions teste et build
#    - Docker Hub reçoit les nouvelles images
#    - auto-deploy.sh redéploie sur Minikube
```

### Accéder à l'Application

```bash
minikube service quiz-frontend --url
# Exemple: http://127.0.0.1:54327
```

---

## Commandes Utiles

| Action | Commande |
|--------|----------|
| Voir les pods | `kubectl get pods -l app=quiz` |
| Logs backend | `kubectl logs -l component=backend -f` |
| Logs frontend | `kubectl logs -l component=frontend -f` |
| Redéployer manuellement | `kubectl rollout restart deployment/quiz-frontend` |
| Dashboard K8s | `minikube dashboard` |
| Arrêter Minikube | `minikube stop` |

---

## Dépannage

### Les pods ne démarrent pas ?

```bash
# Vérifier le status
kubectl describe pod -l app=quiz

# Vérifier les images
kubectl get pods -o jsonpath='{.items[*].spec.containers[*].image}'
```

### L'auto-deploy ne détecte pas les changements ?

1. Vérifiez que GitHub Actions a réussi : https://github.com/.../actions
2. Vérifiez que le watcher tourne : `ps aux | grep auto-deploy`
3. Relancez le watcher : `./scripts/auto-deploy.sh`

### Docker Desktop ne démarre pas ?

Redémarrez votre Mac et relancez Docker Desktop depuis les Applications.

---

## Fichiers Importants

```
📁 Projet
├── 📁 .github/workflows/
│   └── ci-cd.yml          ← Pipeline GitHub Actions
├── 📁 k8s/
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── configmap.yaml
│   └── secrets.yaml
├── 📁 scripts/
│   ├── start-cd.sh        ← Setup initial
│   ├── auto-deploy.sh     ← Watcher auto-déploiement
│   └── deploy.sh          ← Déploiement manuel
└── 📁 docs/
    ├── CICD-ARCHITECTURE.md ← Documentation technique
    └── DEPLOYMENT-GUIDE.md  ← Ce guide
```

---

*Dernière mise à jour: 26 décembre 2025*
