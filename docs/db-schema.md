# Schéma de base de données (SQLite)

![Schéma ER](db-schema.svg)

Ce document décrit le modèle de données utilisé par l'API Flask. La base est stockée dans `instance/quiz.db` (chemin géré par Flask via `app.instance_path`).

## Tables et champs

### questions
- `id` INTEGER PRIMARY KEY
- `position` INTEGER UNIQUE NULLABLE — position d'affichage (peut être null, unique si défini)
- `title` VARCHAR(200) NOT NULL — titre
- `text` TEXT NOT NULL — énoncé
- `image` TEXT NULL — image encodée en base64
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
- `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

Relations:
- 1 **question** → N **answers** (cascade `delete-orphan`)

### answers
- `id` INTEGER PRIMARY KEY
- `question_id` INTEGER NOT NULL REFERENCES `questions`(`id`)
- `text` VARCHAR(500) NOT NULL — texte de la réponse
- `is_correct` BOOLEAN NOT NULL DEFAULT 0 — indicateur bonne réponse
- `order` INTEGER NOT NULL DEFAULT 0 — ordre d'affichage

### participations
- `id` INTEGER PRIMARY KEY
- `player_name` VARCHAR(100) NOT NULL
- `score` INTEGER NOT NULL
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

### admin_sessions
- `id` INTEGER PRIMARY KEY
- `token` VARCHAR(200) UNIQUE NOT NULL — jeton admin
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
- `expires_at` DATETIME NOT NULL — expiration du jeton

## Contraintes et règles métier
- `questions.position` est unique quand défini (sert au tri et à l'insertion).
- Une **seule** réponse correcte par question est imposée au niveau **API** (validation applicative), pas par contrainte SQL.
- `answers.order` détermine l'ordre d'affichage des propositions.
- Suppression d'une question entraîne la suppression de ses réponses (cascade `delete-orphan`).

## Diagramme (ER simplifié)
```
Question (1) ───< Answer (N)

Participation (standalone)
AdminSession (standalone)
```

