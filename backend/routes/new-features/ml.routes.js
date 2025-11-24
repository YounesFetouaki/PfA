const express = require('express');
const router = express.Router();
const mlController = require('../../controllers/new-features/ml.controller');

// Middleware d'authentification
const { authenticate } = require('../../middleware/auth');

/**
 * @route POST /api/new-features/ml/train
 * @desc Entraîne le modèle avec de nouvelles données
 */
router.post('/train', authenticate, mlController.trainModel);

/**
 * @route POST /api/new-features/ml/predict
 * @desc Prédit la performance d'un candidat
 */
router.post('/predict', authenticate, mlController.predictCandidatePerformance);

/**
 * @route POST /api/new-features/ml/optimize
 * @desc Optimise les critères de matching
 */
router.post('/optimize', authenticate, mlController.optimizeMatchingCriteria);

/**
 * @route GET /api/new-features/ml/training-data
 * @desc Récupère les données d'entraînement
 */
router.get('/training-data', authenticate, mlController.getTrainingData);

/**
 * @route POST /api/new-features/ml/feedback
 * @desc Ajoute des données de feedback pour l'entraînement
 */
router.post('/feedback', authenticate, mlController.addFeedbackData);

module.exports = router;

