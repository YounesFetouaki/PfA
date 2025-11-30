const express = require('express');
const router = express.Router();
const datasetAnalyzerService = require('../../services/new-features/datasetAnalyzer.service');

// Get dataset insights
router.get('/insights', async (req, res) => {
  try {
    console.log('[STEP 1] Getting dataset insights');
    const insights = datasetAnalyzerService.getDatasetInsights();
    
    res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Dataset insights error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Compare candidate with dataset
router.post('/compare', async (req, res) => {
  try {
    console.log('[STEP 1] Comparing candidate with dataset');
    const { candidateData } = req.body;

    if (!candidateData) {
      return res.status(400).json({ error: 'Candidate data required' });
    }

    const comparison = datasetAnalyzerService.compareWithDataset(candidateData);
    
    res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Dataset comparison error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
