# 🎯 Nouvelles Fonctionnalités - Plateforme de Recrutement IA

Ce document décrit les nouveaux modules ajoutés à la plateforme de recrutement assistée par IA.

## 📁 Structure créée

### Backend
```
backend/
├── services/new-features/
│   ├── cvAnalyzer.service.js      # Analyse automatique des CVs
│   ├── voiceInterviewer.service.js # Entretiens vocaux avec IA
│   ├── learningEngine.service.js   # Moteur d'apprentissage ML
│   └── index.js
├── models/new-features/
│   ├── CVAnalysis.model.js         # Modèle d'analyse de CV
│   ├── InterviewSession.model.js   # Modèle de session d'entretien
│   ├── InterviewExchange.model.js  # Modèle d'échange Q/R
│   └── TrainingData.model.js       # Modèle de données d'entraînement
├── controllers/new-features/
│   ├── cv.controller.js            # Contrôleur CV
│   ├── interview.controller.js     # Contrôleur entretiens
│   ├── dashboard.controller.js     # Contrôleur dashboard
│   └── ml.controller.js            # Contrôleur ML
└── routes/new-features/
    ├── cv.routes.js                # Routes CV
    ├── interview.routes.js         # Routes entretiens
    ├── dashboard.routes.js         # Routes dashboard
    └── ml.routes.js                # Routes ML
```

### Frontend
```
src/
├── components/new-features/
│   ├── CVUploader.tsx              # Composant upload CV
│   ├── VoiceInterview.tsx          # Composant entretien vocal
│   ├── RecruiterDashboard/         # Dashboard recruteur
│   │   ├── index.tsx
│   │   ├── CandidateRanking.tsx
│   │   ├── AdvancedFilters.tsx
│   │   ├── PerformanceCharts.tsx
│   │   └── AIRecommendations.tsx
│   └── MLTraining.tsx              # Composant entraînement ML
├── pages/new-features/
│   ├── CVAnalysisPage.tsx          # Page analyse CV
│   ├── VoiceInterviewPage.tsx      # Page entretien vocal
│   └── RecruiterDashboardPage.tsx  # Page dashboard
├── hooks/new-features/
│   ├── useVoiceRecorder.ts         # Hook enregistrement vocal
│   ├── useCVAnalysis.ts            # Hook analyse CV
│   └── useMLPredictions.ts         # Hook prédictions ML
└── services/new-features/
    └── api.ts                      # Service API frontend
```

## 🚀 Installation

### Backend

1. Installer les dépendances :
```bash
cd backend
npm install
```

2. Configurer les variables d'environnement :
```bash
cp .env.example .env
# Éditer .env avec vos clés API
```

3. Démarrer le serveur :
```bash
npm run dev
```

### Frontend

Les composants sont déjà intégrés dans le projet Next.js existant. Aucune installation supplémentaire n'est nécessaire (les dépendances sont déjà dans `package.json`).

## 🔧 Fonctionnalités

### 1. Analyse Automatique des CVs

- **Upload de CV** : Interface drag-and-drop pour uploader des PDFs
- **Extraction de données** : Extraction automatique des compétences, expériences, formations
- **Scoring de correspondance** : Calcul d'un score de 0 à 100 basé sur la fiche de poste
- **Recommandations IA** : Suggestions basées sur l'analyse GPT

**Utilisation** :
```tsx
import { CVUploader } from '@/components/new-features/CVUploader';

<CVUploader 
  jobId="job-123" 
  jobDescription="Description du poste..."
  onUploadComplete={(analysis) => console.log(analysis)}
/>
```

### 2. Entretiens Vocaux avec IA

- **Enregistrement vocal** : Capture audio du navigateur
- **Transcription** : Transcription automatique avec Whisper
- **Analyse en temps réel** : Analyse des réponses avec GPT
- **Génération de questions** : Questions adaptatives basées sur le contexte
- **Résumé final** : Résumé complet de l'entretien avec recommandations

**Utilisation** :
```tsx
import { VoiceInterview } from '@/components/new-features/VoiceInterview';

<VoiceInterview 
  sessionId="session-123"
  jobDescription="Description du poste..."
  onComplete={(summary) => console.log(summary)}
/>
```

### 3. Dashboard Recruteur

- **Statistiques** : Vue d'ensemble des candidatures et entretiens
- **Classement** : Tri des candidats par score de correspondance
- **Filtres avancés** : Filtrage par compétences, langues, score, etc.
- **Recommandations IA** : Candidats recommandés et à surveiller
- **Graphiques** : Visualisation des performances (à implémenter avec Chart.js/Recharts)

**Utilisation** :
```tsx
import { RecruiterDashboard } from '@/components/new-features/RecruiterDashboard';

<RecruiterDashboard jobId="job-123" />
```

### 4. Moteur d'Apprentissage ML

- **Entraînement** : Entraînement du modèle avec des données de feedback
- **Prédictions** : Prédiction de la performance future des candidats
- **Optimisation** : Optimisation des critères de matching
- **Amélioration continue** : Apprentissage à partir des retours des recruteurs

**Utilisation** :
```tsx
import { useMLPredictions } from '@/hooks/new-features/useMLPredictions';

const { predictCandidatePerformance } = useMLPredictions();
const prediction = await predictCandidatePerformance('candidate-123', 'job-123');
```

## 🔌 API Endpoints

### CV Analysis
- `POST /api/new-features/cv/analyze` - Analyser un CV
- `GET /api/new-features/cv/job/:jobId` - Analyses d'un poste
- `GET /api/new-features/cv/:id` - Récupérer une analyse
- `PUT /api/new-features/cv/:id/status` - Mettre à jour le statut
- `GET /api/new-features/cv/job/:jobId/top` - Top candidats

### Interview
- `POST /api/new-features/interview/session` - Créer une session
- `POST /api/new-features/interview/session/:id/start` - Démarrer
- `POST /api/new-features/interview/session/:id/exchange` - Ajouter échange
- `POST /api/new-features/interview/session/:id/complete` - Terminer
- `GET /api/new-features/interview/session/:id` - Récupérer session
- `POST /api/new-features/interview/transcribe` - Transcrire audio

### Dashboard
- `GET /api/new-features/dashboard/stats` - Statistiques
- `GET /api/new-features/dashboard/job/:jobId/ranking` - Classement
- `GET /api/new-features/dashboard/job/:jobId/filtered` - Filtres
- `GET /api/new-features/dashboard/job/:jobId/recommendations` - Recommandations
- `GET /api/new-features/dashboard/performance` - Performance

### ML
- `POST /api/new-features/ml/train` - Entraîner
- `POST /api/new-features/ml/predict` - Prédire
- `POST /api/new-features/ml/optimize` - Optimiser
- `GET /api/new-features/ml/training-data` - Données
- `POST /api/new-features/ml/feedback` - Feedback

## 🔐 Authentification

Les routes backend nécessitent une authentification. Le middleware actuel est basique et doit être adapté selon votre système d'authentification existant.

## 📝 Notes importantes

1. **Variables d'environnement** : Assurez-vous d'avoir `OPENAI_API_KEY` configuré
2. **MongoDB** : Les modèles utilisent Mongoose, configurez votre connexion MongoDB
3. **Authentification** : Adaptez les middlewares d'authentification selon votre système
4. **Graphiques** : Les composants `PerformanceCharts` nécessitent une librairie de graphiques (Chart.js, Recharts, etc.)
5. **Fichiers** : Les uploads sont limités (10MB pour PDF, 50MB pour audio)

## 🚧 À compléter

- [ ] Intégrer l'authentification réelle (JWT, OAuth, etc.)
- [ ] Implémenter les graphiques dans `PerformanceCharts`
- [ ] Ajouter des tests unitaires
- [ ] Ajouter la gestion d'erreurs complète
- [ ] Ajouter la validation des données (Zod, Joi, etc.)
- [ ] Ajouter la documentation Swagger/OpenAPI
- [ ] Optimiser les performances (cache, pagination, etc.)
- [ ] Ajouter la gestion des fichiers (storage S3, etc.)

## 🤝 Contribution

Ces modules sont créés en tant que nouvelles fonctionnalités et ne modifient pas le code existant. Ils peuvent être intégrés progressivement selon les besoins.

## 📄 License

Même license que le projet principal.

