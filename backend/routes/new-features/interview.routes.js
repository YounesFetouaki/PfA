const express = require('express');
const router = express.Router();
const interviewController = require('../../controllers/new-features/interview.controller');
const multer = require('multer');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB pour l'audio
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers audio sont autorisés'), false);
    }
  }
});

// Middleware d'authentification
const { authenticate } = require('../../middleware/auth');

/**
 * @route POST /api/new-features/interview/session
 * @desc Crée une nouvelle session d'entretien
 */
router.post('/session', authenticate, interviewController.createInterviewSession);

/**
 * @route POST /api/new-features/interview/session/:id/start
 * @desc Démarre une session d'entretien
 */
router.post('/session/:id/start', authenticate, interviewController.startInterviewSession);

/**
 * @route POST /api/new-features/interview/session/:id/exchange
 * @desc Ajoute un échange (question/réponse) à une session
 */
router.post('/session/:id/exchange', authenticate, interviewController.addInterviewExchange);

/**
 * @route POST /api/new-features/interview/session/:id/complete
 * @desc Termine une session d'entretien et génère le résumé
 */
router.post('/session/:id/complete', authenticate, interviewController.completeInterviewSession);

/**
 * @route GET /api/new-features/interview/session/:id
 * @desc Récupère une session d'entretien
 */
router.get('/session/:id', authenticate, interviewController.getInterviewSession);

/**
 * @route GET /api/new-features/interview/job/:jobId
 * @desc Récupère toutes les sessions d'entretien pour un job
 */
router.get('/job/:jobId', authenticate, interviewController.getInterviewSessionsByJob);

/**
 * @route POST /api/new-features/interview/transcribe
 * @desc Transcrit l'audio d'un échange
 */
router.post('/transcribe', authenticate, upload.single('audio'), interviewController.transcribeAudio);

module.exports = router;

