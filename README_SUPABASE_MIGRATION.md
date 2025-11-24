# Migration vers Supabase

## ✅ Changements effectués

Le projet a été migré de MongoDB/Mongoose vers Supabase (PostgreSQL).

### Fichiers supprimés
- `backend/models/new-features/*.model.js` (modèles Mongoose)
- `backend/config/database.js` (configuration MongoDB)

### Fichiers créés/modifiés
- `supabase_new_features_schema.sql` - Schémas SQL pour les nouvelles tables
- `backend/services/new-features/supabase.service.js` - Service Supabase
- Tous les contrôleurs adaptés pour utiliser Supabase

## 🗄️ Tables créées

1. **cv_analysis** - Analyses de CV
2. **interview_session** - Sessions d'entretien
3. **interview_exchange** - Échanges question/réponse
4. **training_data** - Données d'entraînement ML

## 📝 Installation

1. **Exécuter le schéma SQL dans Supabase** :
   - Ouvrir le SQL Editor dans votre dashboard Supabase
   - Copier le contenu de `supabase_new_features_schema.sql`
   - Exécuter le script

2. **Configurer les variables d'environnement** :
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Installer les dépendances** :
   ```bash
   cd backend
   npm install
   ```

## 🔄 Différences principales

### Avant (MongoDB/Mongoose)
```javascript
const analysis = new CVAnalysis({ ... });
await analysis.save();
```

### Après (Supabase)
```javascript
const analysis = await supabaseService.createCVAnalysis({ ... });
```

### Naming conventions
- `candidateId` → `candidate_id`
- `matchAnalysis` → `match_analysis`
- `extractedData` → `extracted_data`
- `createdAt` → `created_at`

## 📊 Structure des données JSONB

Les données complexes sont stockées en JSONB dans Supabase :
- `extracted_data` - Données extraites du CV
- `match_analysis` - Analyse de correspondance
- `summary` - Résumé de l'entretien
- `question`, `response`, `analysis` - Données d'échange
- `input_data`, `output_data` - Données d'entraînement

## 🔍 Requêtes

Les requêtes Supabase utilisent la syntaxe PostgREST :
```javascript
await supabase
  .from('cv_analysis')
  .select('*')
  .eq('job_id', jobId)
  .order('created_at', { ascending: false });
```

## ⚠️ Notes importantes

1. Les index sont créés automatiquement dans le schéma SQL
2. Les triggers pour `updated_at` sont configurés
3. RLS (Row Level Security) est commenté - à activer selon vos besoins
4. Les relations avec les tables existantes (`interview`, `user`) sont préservées

