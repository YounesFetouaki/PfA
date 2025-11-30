const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Middleware CORS - Configuration plus permissive pour le développement
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id', 'organization-id']
}));

// Middleware pour parser JSON et URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Vérifier la configuration Supabase
const supabaseService = require('./services/new-features/supabase.service');
if (!supabaseService.isConfigured()) {
  console.warn('⚠️  Supabase non configuré. Assurez-vous d\'avoir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans votre .env');
}

// Routes
const cvRoutes = require('./routes/new-features/cv.routes');
const interviewRoutes = require('./routes/new-features/interview.routes');
const dashboardRoutes = require('./routes/new-features/dashboard.routes');
const mlRoutes = require('./routes/new-features/ml.routes');
const datasetRoutes = require('./routes/new-features/dataset.routes');

app.use('/api/new-features/cv', cvRoutes);
app.use('/api/new-features/interview', interviewRoutes);
app.use('/api/new-features/dashboard', dashboardRoutes);
app.use('/api/new-features/ml', mlRoutes);
app.use('/api/new-features/dataset', datasetRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend API is running' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur interne',
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}/api/new-features`);
});

module.exports = app;

