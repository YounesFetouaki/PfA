const learningEngineService = require('../../services/new-features/learningEngine.service');
const supabaseService = require('../../services/new-features/supabase.service');

/**
 * Entraîne le modèle avec de nouvelles données
 */
const trainModel = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (!type || !data) {
      return res.status(400).json({ error: 'Type et données requis' });
    }

    // Sauvegarder les données d'entraînement
    const trainingData = await supabaseService.createTrainingData({
      type,
      input_data: data.input,
      output_data: data.output,
      outcome: data.outcome || 'partial',
      feedback: data.feedback || {},
      metadata: {
        organizationId: req.user?.organizationId,
        tags: data.tags || [],
        version: data.version || '1.0'
      },
      quality_score: data.qualityScore || 0.5
    });

    // Récupérer les données d'entraînement récentes
    const recentTrainingData = await supabaseService.getTrainingData({
      type,
      usedForTraining: false,
      limit: 100
    });

    // Entraîner le modèle
    const trainingResult = await learningEngineService.trainModel(
      recentTrainingData.map(td => ({
        input: td.input_data,
        output: td.output_data,
        outcome: td.outcome
      }))
    );

    // Marquer les données comme utilisées
    for (const td of recentTrainingData) {
      await supabaseService.updateTrainingData(td.id, {
        used_for_training: true,
        training_date: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      data: trainingResult,
      trainingDataId: trainingData.id
    });
  } catch (error) {
    console.error('Erreur entraînement:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Prédit la performance d'un candidat
 */
const predictCandidatePerformance = async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;

    // Récupérer les données du candidat
    const cvAnalyses = await supabaseService.getCVAnalysesByJob(jobId);
    const cvAnalysis = cvAnalyses.find(c => c.candidate_id === candidateId);

    if (!cvAnalysis) {
      return res.status(404).json({ error: 'Analyse CV non trouvée' });
    }

    // Récupérer les entretiens passés si disponibles
    const allSessions = await supabaseService.getInterviewSessionsByJob(jobId);
    const interviews = allSessions.filter(s => s.candidate_id === candidateId);

    const candidateData = {
      cv: cvAnalysis.extracted_data,
      matchScore: cvAnalysis.match_analysis?.score,
      interviews: await Promise.all(interviews.map(async i => {
        const exchanges = await supabaseService.getInterviewExchangesBySession(i.id);
        return {
          score: i.summary?.overallScore,
          exchanges: exchanges
        };
      }))
    };

    const jobRequirements = {
      description: cvAnalysis.job_id?.description,
      requiredSkills: cvAnalysis.job_id?.requiredSkills,
      level: cvAnalysis.job_id?.level
    };

    // Prédire la performance
    const prediction = await learningEngineService.predictCandidatePerformance(
      candidateData,
      jobRequirements
    );

    res.status(200).json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error('Erreur prédiction:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Optimise les critères de matching
 */
const optimizeMatchingCriteria = async (req, res) => {
  try {
    const { organizationId } = req.body;

    // Récupérer les données de feedback
    const allTrainingData = await supabaseService.getTrainingData({
      organizationId,
      limit: 1000
    });
    
    const feedbackData = allTrainingData.filter(td => 
      td.metadata?.organizationId === organizationId && 
      td.feedback?.recruiterRating
    );

    // Optimiser les critères
    const optimization = await learningEngineService.optimizeMatchingCriteria(
      feedbackData.map(fd => ({
        input: fd.input_data,
        output: fd.output_data,
        feedback: fd.feedback,
        outcome: fd.outcome
      }))
    );

    res.status(200).json({
      success: true,
      data: optimization
    });
  } catch (error) {
    console.error('Erreur optimisation:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupère les données d'entraînement
 */
const getTrainingData = async (req, res) => {
  try {
    const { type, organizationId, usedForTraining } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (organizationId) filters.organizationId = organizationId;
    if (usedForTraining !== undefined) filters.usedForTraining = usedForTraining === 'true';

    const trainingData = await supabaseService.getTrainingData({
      ...filters,
      limit: 100
    });

    res.status(200).json({
      success: true,
      data: trainingData,
      count: trainingData.length
    });
  } catch (error) {
    console.error('Erreur récupération données:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Ajoute des données de feedback pour l'entraînement
 */
const addFeedbackData = async (req, res) => {
  try {
    const { trainingDataId, feedback } = req.body;

    const existingData = await supabaseService.getTrainingData({});
    const trainingData = existingData.find(td => td.id === trainingDataId);

    if (!trainingData) {
      return res.status(404).json({ error: 'Données d\'entraînement non trouvées' });
    }

    const updatedFeedback = {
      ...(trainingData.feedback || {}),
      ...feedback
    };

    const updates = { feedback: updatedFeedback };

    // Mettre à jour le score de qualité
    if (feedback.recruiterRating) {
      updates.quality_score = feedback.recruiterRating / 100;
    }

    const updated = await supabaseService.updateTrainingData(trainingDataId, updates);

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Erreur ajout feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  trainModel,
  predictCandidatePerformance,
  optimizeMatchingCriteria,
  getTrainingData,
  addFeedbackData
};

