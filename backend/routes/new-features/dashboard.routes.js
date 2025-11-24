const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/new-features/dashboard.controller');

// Middleware d'authentification
const { authenticate } = require('../../middleware/auth');

/**
 * @route GET /api/new-features/dashboard/stats
 * @desc Récupère les statistiques du dashboard
 */
router.get('/stats', authenticate, dashboardController.getDashboardStats);

/**
 * @route GET /api/new-features/dashboard/job/:jobId/ranking
 * @desc Récupère le classement des candidats
 */
router.get('/job/:jobId/ranking', authenticate, dashboardController.getCandidateRanking);

/**
 * @route GET /api/new-features/dashboard/job/:jobId/filtered
 * @desc Applique des filtres avancés
 */
router.get('/job/:jobId/filtered', authenticate, dashboardController.getFilteredCandidates);

/**
 * @route GET /api/new-features/dashboard/job/:jobId/recommendations
 * @desc Récupère les recommandations IA
 */
router.get('/job/:jobId/recommendations', authenticate, dashboardController.getAIRecommendations);

/**
 * @route GET /api/new-features/dashboard/performance
 * @desc Récupère les performances du recrutement
 */
router.get('/performance', authenticate, dashboardController.getPerformanceMetrics);

module.exports = router;

