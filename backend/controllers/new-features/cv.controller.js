const cvAnalyzerService = require('../../services/new-features/cvAnalyzer.service');
const datasetAnalyzerService = require('../../services/new-features/datasetAnalyzer.service');
const supabaseService = require('../../services/new-features/supabase.service');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

/**
 * Analyse un CV uploadé et le compare avec le dataset
 */
const analyzeCV = async (req, res) => {
  try {
    console.log('[STEP 1] analyzeCV called');
    
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { jobId, jobDescription } = req.body;
    const pdfBuffer = req.file?.buffer;

    console.log('[STEP 2] Validating file');
    if (!pdfBuffer) {
      return res.status(400).json({ error: 'PDF file required' });
    }

    if (req.file?.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are supported' });
    }

    if (!jobDescription || jobDescription.trim().length === 0) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    console.log('[STEP 3] Analyzing CV with dataset-based extraction');
    
    // Step 1: Analyze CV using dataset-based extraction
    const analysisResult = await cvAnalyzerService.processCV(pdfBuffer, jobDescription);

    console.log('[STEP 4] Comparing with dataset');
    
    // Step 2: Compare with dataset (with error handling)
    let datasetComparison = null;
    let datasetInsights = null;
    
    try {
      datasetComparison = datasetAnalyzerService.compareWithDataset({
        ...analysisResult.extractedData,
        matchScore: analysisResult.matchAnalysis.score / 100
      });
      console.log('[STEP 5] Getting dataset insights');
      datasetInsights = datasetAnalyzerService.getDatasetInsights();
    } catch (datasetError) {
      console.warn('[WARNING] Dataset comparison failed:', datasetError.message);
      // Continue without dataset comparison - CV analysis is still valid
    }

    console.log('[STEP 6] Saving to database');
    
    // Step 4: Save to Supabase
    const cvAnalysisData = {
      candidate_id: req.user.id,
      job_id: jobId || null,
      extracted_data: analysisResult.extractedData,
      match_analysis: analysisResult.matchAnalysis,
      analyzed_at: analysisResult.analyzedAt,
      status: 'analyzed'
    };
    
    // Add dataset fields only if they exist (to handle cases where columns might not be added yet)
    if (datasetComparison !== null) {
      cvAnalysisData.dataset_comparison = datasetComparison;
    }
    if (datasetInsights !== null) {
      cvAnalysisData.dataset_insights = datasetInsights;
    }
    
    const cvAnalysis = await supabaseService.createCVAnalysis(cvAnalysisData);

    console.log('[STEP 7] Success - returning results');

    res.status(200).json({
      success: true,
      data: cvAnalysis,
      analysis: {
        extractedData: analysisResult.extractedData,
        matchAnalysis: analysisResult.matchAnalysis,
        datasetComparison: datasetComparison,
        datasetInsights: datasetInsights
      }
    });
  } catch (error) {
    console.error('CV Analysis Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze CV'
    });
  }
};

/**
 * Récupère toutes les analyses de CV (tous les candidats)
 */
const getAllCandidates = async (req, res) => {
  try {
    const { jobId, status, minScore, maxScore, limit, sortBy, sortOrder } = req.query;

    const filters = {};
    if (jobId) filters.jobId = jobId;
    if (status) filters.status = status;
    if (minScore) filters.minScore = minScore;
    if (maxScore) filters.maxScore = maxScore;
    if (limit) filters.limit = limit;
    if (sortBy) filters.sortBy = sortBy;
    if (sortOrder) filters.sortOrder = sortOrder;

    const candidates = await supabaseService.getAllCandidates(filters);

    res.status(200).json({
      success: true,
      data: candidates,
      count: candidates.length
    });
  } catch (error) {
    console.error('Erreur récupération candidats:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupère une analyse de CV spécifique avec tous les détails
 */
const getCVAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;

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
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  analyzeCV,
  getAllCandidates,
  getCVAnalysisById,
  upload
};
