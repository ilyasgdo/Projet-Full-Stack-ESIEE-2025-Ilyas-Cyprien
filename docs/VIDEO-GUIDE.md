# 🎬 Guide pour la Vidéo Démonstrative

Ce guide vous aidera à créer la vidéo démonstrative requise pour le projet.

## 📋 Contenu Requis

La vidéo doit montrer :
1. **Le pipeline CI/CD en action** (GitHub Actions)
2. **Le déploiement sur Minikube**
3. **L'application fonctionnelle** (opérations CRUD)

## ⏱️ Durée Recommandée

**2-5 minutes** - Soyez concis et allez à l'essentiel.

---

## 🎥 Scénario Suggéré

### Partie 1 : Présentation du Projet (30 sec)

```
"Bonjour, je suis [Nom] et voici le projet Qrious Quiz, 
une application Full Stack avec Flask et Vue 3, 
déployée avec un pipeline CI/CD sur Kubernetes local."
```

**Montrer :**
- Le README.md sur GitHub
- La structure du projet

---

### Partie 2 : Pipeline CI/CD (1 min)

**Actions à réaliser :**

1. **Faire un petit changement dans le code** (ex: modifier un commentaire)
   ```bash
   # Modifier un fichier
   git add .
   git commit -m "Demo: minor update"
   git push origin main
   ```

2. **Montrer GitHub Actions**
   - Aller sur GitHub → Actions
   - Montrer les jobs qui s'exécutent :
     - ✅ Frontend Tests (Vitest)
     - ✅ Backend Tests (Pytest)
     - 🐳 Build and Push Docker Images

3. **Montrer Docker Hub**
   - Les images `quiz-api` et `quiz-ui` mises à jour

---

### Partie 3 : Déploiement Minikube (1 min)

**Actions à réaliser :**

```bash
# Démarrer Minikube (si pas déjà fait)
./scripts/start-cd.sh

# Voir les pods
kubectl get pods -l app=quiz

# Obtenir l'URL
minikube service quiz-frontend --url
```

**Montrer :**
- Le cluster Minikube démarré
- Les pods en Running
- L'auto-deploy watcher (optionnel)
  ```bash
  ./scripts/auto-deploy.sh
  ```

---

### Partie 4 : Application Fonctionnelle (1-2 min)

**Démontrer les opérations CRUD :**

1. **READ** - Afficher la page d'accueil avec les questions existantes

2. **LOGIN** - Se connecter en admin
   - Mot de passe : `iloveflask`

3. **CREATE** - Créer une nouvelle question
   - Remplir le formulaire
   - Sauvegarder

4. **UPDATE** - Modifier une question existante
   - Changer le titre ou le texte
   - Sauvegarder

5. **DELETE** - Supprimer une question

6. **Participation** - Faire un quiz complet
   - Répondre aux questions
   - Voir le score final
   - Voir le classement mis à jour

---

### Partie 5 : Conclusion (15 sec)

```
"Nous avons vu un pipeline CI/CD complet : 
du git push aux tests automatiques, 
au build Docker, 
jusqu'au déploiement automatique sur Kubernetes. 
Merci !"
```

---

## 🛠️ Outils de Capture Vidéo

### Windows
- **OBS Studio** (gratuit) - [obsproject.com](https://obsproject.com)
- **Xbox Game Bar** (intégré) - `Win + G`
- **ShareX** (gratuit) - [getsharex.com](https://getsharex.com)

### macOS
- **QuickTime Player** (intégré) - Fichier → Nouvelle capture d'écran
- **OBS Studio** (gratuit)

### Linux
- **OBS Studio** (gratuit)
- **SimpleScreenRecorder** (gratuit)

---

## 📝 Checklist Avant Enregistrement

- [ ] Minikube est démarré et fonctionne
- [ ] L'application est accessible via le navigateur
- [ ] GitHub Actions a des builds récents à montrer
- [ ] Docker Hub a les images visibles
- [ ] Fermer les onglets/fenêtres non pertinents
- [ ] Désactiver les notifications
- [ ] Préparer les commandes à taper (copier/coller prêt)

---

## 📤 Format de Livraison

- **Format recommandé** : MP4 (H.264)
- **Résolution** : 1080p ou 720p
- **Taille max** : ~100 MB

**Où mettre la vidéo :**
1. Upload sur YouTube (non listé) et mettre le lien dans le README
2. Ou upload sur Google Drive / OneDrive avec lien partageable
3. Ou utiliser un service comme Loom

---

## 📎 Ajouter le Lien Vidéo au README

Une fois la vidéo uploadée, ajoutez au README :

```markdown
## 🎬 Vidéo Démonstrative

[![Demo Video](https://img.shields.io/badge/Video-Démonstration-red?style=for-the-badge&logo=youtube)](VOTRE_LIEN_VIDEO)

[📺 Voir la vidéo de démonstration](VOTRE_LIEN_VIDEO)
```

---

*Bonne chance pour l'enregistrement ! 🎥*
