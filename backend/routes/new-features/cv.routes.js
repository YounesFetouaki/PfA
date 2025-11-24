const express = require('express');
const router = express.Router();
const cvController = require('../../controllers/new-features/cv.controller');
const multer = require('multer');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
    }
  }
});

// Middleware d'authentification
const { authenticate } = require('../../middleware/auth');

/**
 * @route POST /api/new-features/cv/analyze
 * @desc Analyse un CV uploadé
 */
router.post('/analyze', authenticate, upload.single('cv'), cvController.analyzeCV);

/**
 * @route GET /api/new-features/cv/job/:jobId
 * @desc Récupère toutes les analyses de CV pour un poste
 */
router.get('/job/:jobId', authenticate, cvController.getCVAnalysesByJob);

/**
 * @route GET /api/new-features/cv/:id
 * @desc Récupère une analyse spécifique
 */
router.get('/:id', authenticate, cvController.getCVAnalysis);

/**
 * @route PUT /api/new-features/cv/:id/status
 * @desc Met à jour le statut d'une analyse
 */
router.put('/:id/status', authenticate, cvController.updateCVAnalysisStatus);

/**
 * @route GET /api/new-features/cv/job/:jobId/top
 * @desc Récupère les candidats les mieux notés pour un poste
 */
router.get('/job/:jobId/top', authenticate, cvController.getTopCandidates);

module.exports = router;

