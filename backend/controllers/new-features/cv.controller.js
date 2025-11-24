const cvAnalyzerService = require('../../services/new-features/cvAnalyzer.service');
const supabaseService = require('../../services/new-features/supabase.service');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

/**
 * Analyse un CV uploadé
 */
const analyzeCV = async (req, res) => {
  console.log('[STEP 1] analyzeCV called');
  try {
    console.log('[STEP 2] Checking authentication');
    // Validate authentication
    if (!req.user?.id) {
      console.log('[ERROR] No user ID');
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('[STEP 3] Extracting request body');
    // With multer, text fields from FormData are in req.body
    const jobId = req.body.jobId;
    let jobDescription = req.body.jobDescription;
    const pdfBuffer = req.file?.buffer;

    console.log('=== CV Upload Request ===');
    console.log('User ID:', req.user.id);
    console.log('File received:', !!pdfBuffer);
    console.log('File size:', req.file?.size, 'bytes');
    console.log('File type:', req.file?.mimetype);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('jobId from body:', jobId);
    console.log('jobDescription from body:', jobDescription);
    console.log('jobDescription type:', typeof jobDescription);
    console.log('jobDescription length:', jobDescription?.length);

    console.log('[STEP 4] Validating file');
    // Validate file
    if (!pdfBuffer) {
      console.log('[ERROR] No PDF buffer');
      return res.status(400).json({ error: 'Fichier PDF requis' });
    }

    console.log('[STEP 5] Validating file type');
    // Validate file type
    if (req.file?.mimetype !== 'application/pdf') {
      console.log('[ERROR] Wrong file type:', req.file?.mimetype);
      return res.status(400).json({ error: 'Only PDF files are supported' });
    }

    console.log('[STEP 6] Validating file size');
    // Validate file size (10MB limit to match multer config)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (req.file.size > MAX_FILE_SIZE) {
      console.log('[ERROR] File too large');
      return res.status(413).json({ error: 'File size exceeds 10MB limit' });
    }

    console.log('[STEP 7] Validating job description');
    // Validate job description - make it optional but provide default
    if (!jobDescription || (typeof jobDescription === 'string' && jobDescription.trim().length === 0)) {
      console.log('[WARNING] No job description provided, using default');
      jobDescription = 'Analyse générale du CV sans fiche de poste spécifique. Extrayez les compétences, expériences, formations et langues du candidat.';
    }
    
    // Ensure it's a string
    if (typeof jobDescription !== 'string') {
      jobDescription = String(jobDescription);
    }

    if (jobDescription.length > 5000) {
      console.log('[ERROR] Job description too long');
      return res.status(400).json({ error: 'Job description exceeds 5000 characters' });
    }

    console.log('[STEP 8] Starting CV analysis service');
    console.log('Calling cvAnalyzerService.processCV...');
    console.log('Using job description (first 100 chars):', jobDescription.substring(0, 100) + '...');

    // Analyze the CV
    const analysisResult = await cvAnalyzerService.processCV(pdfBuffer, jobDescription);

    console.log('[STEP 9] CV analysis completed, saving to database...');

    // Save to Supabase
    const cvAnalysis = await supabaseService.createCVAnalysis({
      candidate_id: req.user.id,
      job_id: jobId || null,
      extracted_data: analysisResult.extractedData,
      match_analysis: analysisResult.matchAnalysis,
      analyzed_at: analysisResult.analyzedAt,
      status: 'analyzed'
    });

    console.log('Analysis saved successfully');

    res.status(200).json({
      success: true,
      data: cvAnalysis,
      analysis: analysisResult
    });
  } catch (error) {
    console.error('=== Erreur analyse CV ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      error: error.message || 'Failed to analyze CV. Please try again.'
    });
  }
};

/**
 * Récupère toutes les analyses de CV pour un poste
 */
const getCVAnalysesByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: 'jobId is required' });
    }

    const analyses = await supabaseService.getCVAnalysesByJob(jobId);

    res.status(200).json({
      success: true,
      data: analyses
    });
  } catch (error) {
    console.error('Erreur récupération analyses:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve analyses. Please try again.'
    });
  }
};

/**
 * Récupère une analyse spécifique
 */
const getCVAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Analysis ID is required' });
    }

    const analysis = await supabaseService.getCVAnalysis(id);

    if (!analysis) {
      return res.status(404).json({ error: 'Analyse non trouvée' });
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Erreur récupération analyse:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve analysis. Please try again.'
    });
  }
};

/**
 * Met à jour le statut d'une analyse
 */
const updateCVAnalysisStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Analysis ID is required' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updates = { status };

    if (status === 'reviewed') {
      updates.reviewed_by = req.user?.id;
      updates.reviewed_at = new Date().toISOString();
    }

    const analysis = await supabaseService.updateCVAnalysis(id, updates);

    if (!analysis) {
      return res.status(404).json({ error: 'Analyse non trouvée' });
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Erreur mise à jour analyse:', error);
    res.status(500).json({
      error: error.message || 'Failed to update analysis. Please try again.'
    });
  }
};

/**
 * Récupère les candidats les mieux notés pour un poste
 */
const getTopCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100

    if (!jobId) {
      return res.status(400).json({ error: 'jobId is required' });
    }

    const topCandidates = await supabaseService.getTopCandidates(jobId, limit);

    res.status(200).json({
      success: true,
      data: topCandidates
    });
  } catch (error) {
    console.error('Erreur récupération top candidats:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve top candidates. Please try again.'
    });
  }
};

module.exports = {
  analyzeCV,
  getCVAnalysesByJob,
  getCVAnalysis,
  updateCVAnalysisStatus,
  getTopCandidates,
  upload
};
