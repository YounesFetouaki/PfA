const supabaseService = require('../../services/new-features/supabase.service');

/**
 * Récupère les statistiques du dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    const { jobId, organizationId } = req.query;

    const filters = {};
    if (jobId) filters.jobId = jobId;
    if (organizationId) filters.organizationId = organizationId;

    // Récupérer les statistiques via Supabase
    const stats = await supabaseService.getDashboardStats(filters);

    // Top candidats
    const topCandidates = jobId 
      ? await supabaseService.getTopCandidates(jobId, 5)
      : [];

    res.status(200).json({
      success: true,
      data: {
        cvStats: stats.cvStats,
        interviewStats: stats.interviewStats,
        topCandidates,
        timeline: [] // À implémenter avec des requêtes Supabase plus complexes
      }
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupère le classement des candidats
 */
const getCandidateRanking = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { limit = 50 } = req.query;

    const candidates = await supabaseService.getCVAnalysesByJob(jobId);
    
    // Trier par score (Supabase ne supporte pas directement le tri JSONB, donc on trie en JS)
    candidates.sort((a, b) => {
      const scoreA = a.match_analysis?.score || 0;
      const scoreB = b.match_analysis?.score || 0;
      return scoreB - scoreA;
    });

    res.status(200).json({
      success: true,
      data: candidates.slice(0, parseInt(limit))
    });
  } catch (error) {
    console.error('Erreur récupération classement:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Applique des filtres avancés
 */
const getFilteredCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { 
      minScore, 
      maxScore, 
      skills, 
      languages,
      status 
    } = req.query;

    // Récupérer tous les candidats pour ce job
    let candidates = await supabaseService.getCVAnalysesByJob(jobId);

    // Appliquer les filtres en JavaScript (Supabase peut aussi filtrer avec des requêtes plus complexes)
    if (status) {
      candidates = candidates.filter(c => c.status === status);
    }

    if (minScore || maxScore) {
      candidates = candidates.filter(c => {
        const score = c.match_analysis?.score || 0;
        if (minScore && score < parseInt(minScore)) return false;
        if (maxScore && score > parseInt(maxScore)) return false;
        return true;
      });
    }

    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      candidates = candidates.filter(c => {
        const candidateSkills = c.extracted_data?.skills || [];
        return skillsArray.some(skill => candidateSkills.includes(skill));
      });
    }

    if (languages) {
      const languagesArray = Array.isArray(languages) ? languages : [languages];
      candidates = candidates.filter(c => {
        const candidateLanguages = c.extracted_data?.languages || [];
        return languagesArray.some(lang => candidateLanguages.includes(lang));
      });
    }

    // Trier par score
    candidates.sort((a, b) => {
      const scoreA = a.match_analysis?.score || 0;
      const scoreB = b.match_analysis?.score || 0;
      return scoreB - scoreA;
    });

    res.status(200).json({
      success: true,
      data: candidates,
      count: candidates.length
    });
  } catch (error) {
    console.error('Erreur filtrage candidats:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupère les recommandations IA
 */
const getAIRecommendations = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Récupérer tous les candidats pour ce job
    const allCandidates = await supabaseService.getCVAnalysesByJob(jobId);

    // Candidats hautement recommandés (score >= 85)
    const highlyRecommended = allCandidates
      .filter(c => (c.match_analysis?.score || 0) >= 85)
      .sort((a, b) => (b.match_analysis?.score || 0) - (a.match_analysis?.score || 0))
      .slice(0, 10);

    // Candidats à surveiller (score entre 70 et 85)
    const toWatch = allCandidates
      .filter(c => {
        const score = c.match_analysis?.score || 0;
        return score >= 70 && score < 85;
      })
      .sort((a, b) => (b.match_analysis?.score || 0) - (a.match_analysis?.score || 0))
      .slice(0, 10);

    // Analyse des compétences (simplifiée)
    const skillMap = new Map();
    allCandidates.forEach(c => {
      const skills = c.extracted_data?.skills || [];
      const score = c.match_analysis?.score || 0;
      skills.forEach(skill => {
        if (!skillMap.has(skill)) {
          skillMap.set(skill, { count: 0, totalScore: 0 });
        }
        const data = skillMap.get(skill);
        data.count++;
        data.totalScore += score;
      });
    });

    const skillAnalysis = Array.from(skillMap.entries())
      .map(([skill, data]) => ({
        _id: skill,
        count: data.count,
        avgScore: data.totalScore / data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        highlyRecommended,
        toWatch,
        skillAnalysis
      }
    });
  } catch (error) {
    console.error('Erreur recommandations IA:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupère les performances du recrutement
 */
const getPerformanceMetrics = async (req, res) => {
  try {
    const { jobId, startDate, endDate } = req.query;

    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    const query = { ...dateQuery };
    if (jobId) query.jobId = jobId;

    // Métriques des CVs
    const cvMetrics = await CVAnalysis.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgScore: { $avg: '$matchAnalysis.score' },
          maxScore: { $max: '$matchAnalysis.score' },
          minScore: { $min: '$matchAnalysis.score' },
          reviewed: {
            $sum: { $cond: [{ $eq: ['$status', 'reviewed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Métriques des entretiens
    const interviewMetrics = await InterviewSession.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          avgDuration: { $avg: '$duration' },
          avgScore: { $avg: '$summary.overallScore' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        cvMetrics: cvMetrics[0] || {},
        interviewMetrics: interviewMetrics[0] || {}
      }
    });
  } catch (error) {
    console.error('Erreur métriques performance:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getCandidateRanking,
  getFilteredCandidates,
  getAIRecommendations,
  getPerformanceMetrics
};

