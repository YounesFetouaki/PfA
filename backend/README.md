# Backend - Plateforme de Recrutement IA

## 📋 Prérequis

- Node.js (v18 ou supérieur)
- Supabase (PostgreSQL)
- OpenAI API Key

## 🚀 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
Créer un fichier `.env` à la racine du dossier `backend/` :

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server
PORT=3001

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
```

3. Démarrer le serveur :
```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:3001`

## 📁 Structure

```
backend/
├── services/new-features/     # Services métier (CV, Interview, ML, Supabase)
├── controllers/new-features/  # Contrôleurs
├── routes/new-features/       # Routes API
└── server.js                  # Point d'entrée
```

## 🔌 Endpoints API

### CV Analysis
- `POST /api/new-features/cv/analyze` - Analyser un CV
- `GET /api/new-features/cv/job/:jobId` - Récupérer les analyses d'un poste
- `GET /api/new-features/cv/:id` - Récupérer une analyse
- `PUT /api/new-features/cv/:id/status` - Mettre à jour le statut
- `GET /api/new-features/cv/job/:jobId/top` - Top candidats

### Interview
- `POST /api/new-features/interview/session` - Créer une session
- `POST /api/new-features/interview/session/:id/start` - Démarrer une session
- `POST /api/new-features/interview/session/:id/exchange` - Ajouter un échange
- `POST /api/new-features/interview/session/:id/complete` - Terminer une session
- `GET /api/new-features/interview/session/:id` - Récupérer une session
- `GET /api/new-features/interview/job/:jobId` - Sessions d'un poste
- `POST /api/new-features/interview/transcribe` - Transcrire l'audio

### Dashboard
- `GET /api/new-features/dashboard/stats` - Statistiques
- `GET /api/new-features/dashboard/job/:jobId/ranking` - Classement
- `GET /api/new-features/dashboard/job/:jobId/filtered` - Filtres avancés
- `GET /api/new-features/dashboard/job/:jobId/recommendations` - Recommandations IA
- `GET /api/new-features/dashboard/performance` - Métriques de performance

### ML
- `POST /api/new-features/ml/train` - Entraîner le modèle
- `POST /api/new-features/ml/predict` - Prédire la performance
- `POST /api/new-features/ml/optimize` - Optimiser les critères
- `GET /api/new-features/ml/training-data` - Données d'entraînement
- `POST /api/new-features/ml/feedback` - Ajouter du feedback

## 🔐 Authentification

Les routes nécessitent une authentification. Actuellement, un middleware simple est utilisé.
À adapter selon votre système d'authentification (JWT, OAuth, etc.).

## 📝 Notes

- Les fichiers PDF sont limités à 10MB
- Les fichiers audio sont limités à 50MB
- L'API OpenAI est utilisée pour l'analyse des CVs et des entretiens
- Whisper est utilisé pour la transcription audio

