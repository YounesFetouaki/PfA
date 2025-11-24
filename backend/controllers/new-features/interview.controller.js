const voiceInterviewerService = require('../../services/new-features/voiceInterviewer.service');
const supabaseService = require('../../services/new-features/supabase.service');

/**
 * Crée une nouvelle session d'entretien
 */
const createInterviewSession = async (req, res) => {
  try {
    const { candidateId, jobId, scheduledAt, sessionType } = req.body;

    const session = await supabaseService.createInterviewSession({
      candidate_id: candidateId,
      job_id: jobId,
      interviewer_id: req.user?.id,
      session_type: sessionType || 'voice',
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString(),
      status: 'scheduled',
      created_by: req.user?.id
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Erreur création session:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Démarre une session d'entretien
 */
const startInterviewSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await supabaseService.updateInterviewSession(id, {
      status: 'in_progress',
      started_at: new Date().toISOString()
    });

    if (!session) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    // Générer la première question
    const context = {
      jobDescription: req.body.jobDescription,
      requiredSkills: req.body.requiredSkills,
      candidateLevel: req.body.candidateLevel
    };

    const firstQuestion = await voiceInterviewerService.generateQuestion(context);

    res.status(200).json({
      success: true,
      data: session,
      question: firstQuestion
    });
  } catch (error) {
    console.error('Erreur démarrage session:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Ajoute un échange (question/réponse) à une session
 */
const addInterviewExchange = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, response, context } = req.body;

    const session = await InterviewSession.findById(id);

    if (!session) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    // Analyser la réponse
    const analysis = await voiceInterviewerService.analyzeResponse(
      question,
      response,
      context
    );

    // Récupérer les échanges existants pour déterminer l'ordre
    const existingExchanges = await supabaseService.getInterviewExchangesBySession(id);
    const orderNumber = existingExchanges.length + 1;

    // Créer l'échange
    const exchange = await supabaseService.createInterviewExchange({
      session_id: id,
      question: question,
      response: {
        text: response,
        duration: req.body.duration
      },
      analysis: analysis,
      order_number: orderNumber
    });

    // Générer la prochaine question si nécessaire
    let nextQuestion = null;
    if (req.body.continueInterview) {
      const previousQuestions = existingExchanges.map(e => e.question?.text || '');
      nextQuestion = await voiceInterviewerService.generateQuestion(
        context,
        previousQuestions
      );
    }

    res.status(201).json({
      success: true,
      data: exchange,
      analysis: analysis,
      nextQuestion: nextQuestion
    });
  } catch (error) {
    console.error('Erreur ajout échange:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Termine une session d'entretien et génère le résumé
 */
const completeInterviewSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await supabaseService.getInterviewSession(id);

    if (!session) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    // Récupérer tous les échanges avec leurs analyses
    const exchanges = await supabaseService.getInterviewExchangesBySession(id);

    const exchangesData = exchanges.map(ex => ({
      question: ex.question,
      response: ex.response,
      analysis: ex.analysis
    }));

    // Générer le résumé
    const context = {
      jobDescription: req.body.jobDescription,
      candidateId: session.candidateId
    };

    const summary = await voiceInterviewerService.generateInterviewSummary(
      exchangesData,
      context
    );

    // Calculer la durée
    const startedAt = new Date(session.started_at);
    const completedAt = new Date();
    const duration = Math.floor((completedAt - startedAt) / 1000);

    // Mettre à jour la session
    const updatedSession = await supabaseService.updateInterviewSession(id, {
      status: 'completed',
      completed_at: completedAt.toISOString(),
      duration: duration,
      summary: summary,
      transcript: req.body.transcript || ''
    });

    res.status(200).json({
      success: true,
      data: updatedSession,
      summary: summary
    });
  } catch (error) {
    console.error('Erreur complétion session:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupère une session d'entretien
 */
const getInterviewSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await supabaseService.getInterviewSession(id);

    if (!session) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Erreur récupération session:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupère toutes les sessions d'entretien pour un job
 */
const getInterviewSessionsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const sessions = await supabaseService.getInterviewSessionsByJob(jobId);

    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Erreur récupération sessions:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Transcrit l'audio d'un échange
 */
const transcribeAudio = async (req, res) => {
  try {
    const audioBuffer = req.file?.buffer;

    if (!audioBuffer) {
      return res.status(400).json({ error: 'Fichier audio requis' });
    }

    const transcription = await voiceInterviewerService.transcribeAudio(
      audioBuffer,
      req.body.language || 'fr'
    );

    res.status(200).json({
      success: true,
      transcription: transcription
    });
  } catch (error) {
    console.error('Erreur transcription:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createInterviewSession,
  startInterviewSession,
  addInterviewExchange,
  completeInterviewSession,
  getInterviewSession,
  getInterviewSessionsByJob,
  transcribeAudio
};

