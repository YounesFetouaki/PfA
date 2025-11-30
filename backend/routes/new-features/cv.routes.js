const express = require('express');
const router = express.Router();
const cvController = require('../../controllers/new-features/cv.controller');
const supabaseService = require('../../services/new-features/supabase.service');
const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
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
 * @route GET /api/new-features/cv/all
 * @desc Récupère toutes les analyses de CV (tous les candidats)
 */
router.get('/all', authenticate, cvController.getAllCandidates);

/**
 * @route GET /api/new-features/cv/job/:jobId
 * @desc Récupère toutes les analyses de CV pour un poste
 */
router.get('/job/:jobId', authenticate, async (req, res) => {
  try {
    const { jobId } = req.params;
    const candidates = await supabaseService.getCVAnalysesByJob(jobId);
    res.json({ success: true, data: candidates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/new-features/cv/:id
 * @desc Récupère une analyse spécifique
 */
router.get('/:id', authenticate, cvController.getCVAnalysisById);

module.exports = router;
