const { createClient } = require('@supabase/supabase-js');

// Initialiser le client Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Variables Supabase non configurées. Utilisez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Service Supabase pour les nouvelles fonctionnalités
 */
class SupabaseService {
  constructor() {
    this.client = supabase;
  }

  /**
   * Vérifie si Supabase est configuré
   */
  isConfigured() {
    return this.client !== null;
  }

  /**
   * CV Analysis
   */
  async createCVAnalysis(data) {
    if (!this.client) throw new Error('Supabase non configuré');
    
    // Remove dataset_comparison and dataset_insights if columns don't exist
    // This prevents errors if migration hasn't been run yet
    const insertData = { ...data };
    
    // Check if columns exist by trying to insert without them first if error occurs
    const { data: result, error } = await this.client
      .from('cv_analysis')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      // If error is about missing columns, try without them
      if (error.message && error.message.includes('dataset_comparison') || error.message.includes('dataset_insights')) {
        console.warn('⚠️  dataset_comparison or dataset_insights columns not found. Please run the migration SQL.');
        console.warn('⚠️  Run: supabase_add_dataset_columns.sql in your Supabase SQL Editor');
        
        // Remove dataset fields and try again
        delete insertData.dataset_comparison;
        delete insertData.dataset_insights;
        
        const { data: retryResult, error: retryError } = await this.client
          .from('cv_analysis')
          .insert(insertData)
          .select()
          .single();
        
        if (retryError) throw retryError;
        return retryResult;
      }
      throw error;
    }
    
    return result;
  }

  async getCVAnalysis(id) {
    if (!this.client) throw new Error('Supabase non configuré');
    
    const { data, error } = await this.client
      .from('cv_analysis')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getCVAnalysesByJob(jobId) {
    if (!this.client) throw new Error('Supabase non configuré');
    
    const { data, error } = await this.client
      .from('cv_analysis')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateCVAnalysis(id, updates) {
    if (!this.client) throw new Error('Supabase non configuré');
    
    const { data, error } = await this.client
      .from('cv_analysis')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTopCandidates(jobId, limit = 10) {
    if (!this.client) throw new Error('Supabase non configuré');
    
    const { data, error } = await this.client
      .from('cv_analysis')
      .select('*')
      .eq('job_id', jobId)
      .order('match_analysis->score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async getAllCandidates(filters = {}) {
    if (!this.client) throw new Error('Supabase non configuré');
    
    let query = this.client
      .from('cv_analysis')
      .select('*');

    // Apply filters
    if (filters.jobId) {
      query = query.eq('job_id', filters.jobId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.minScore || filters.maxScore) {
      // Note: Supabase JSONB filtering is limited, we'll filter in JS
    }

    // Order by created_at descending by default
    query = query.order('created_at', { ascending: false });

    if (filters.limit) {
      query = query.limit(parseInt(filters.limit));
    }

    const { data, error } = await query;

    if (error) throw error;

    // Apply score filtering in JavaScript if needed
    let filteredData = data;
    if (filters.minScore || filters.maxScore) {
      filteredData = data.filter(candidate => {
        const score = candidate.match_analysis?.score || 0;
        if (filters.minScore && score < parseInt(filters.minScore)) return false;
        if (filters.maxScore && score > parseInt(filters.maxScore)) return false;
        return true;
      });
    }

    // Sort by score if requested
    if (filters.sortBy === 'score') {
      filteredData.sort((a, b) => {
        const scoreA = a.match_analysis?.score || 0;
        const scoreB = b.match_analysis?.score || 0;
        return filters.sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      });
    }

    return filteredData;
  }

  /**
   * Interview Session
   */
  async createInterviewSession(data) {
    if (!this.client) throw new Error('Supabase non configuré');
    
    const { data: result, error } = await this.client
      .from('interview_session')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getInterviewSession(id) {
    if (!this.client) throw new Error('Supabase non configuré');
    
    const { data, error } = await this.client
      .from('interview_session')
      .select(`
        *,
        interview_exchange (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getInterviewSessionsByJob(jobId) {
    if (!this.client) throw new Error('Supabase non configuré');
    
    const { data, error } = await this.client
      .from('interview_session')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateInterviewSession(id, updates) {
    if (!this.client) throw new Error('Supabase non configuré');
    
    const { data, error } = await this.client
      .from('interview_session')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Interview Exchange
   */
  async createInterviewExchange(data) {
    if (!this.client) throw new Error('Supabase non configuré');
    
    const { data: result, error } = await this.client
      .from('interview_exchange')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getInterviewExchangesBySession(sessionId) {
    if (!this.client) throw new Error('Supabase non configuré');
    
    const { data, error } = await this.client
      .from('interview_exchange')
      .select('*')
      .eq('session_id', sessionId)
      .order('order_number', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Training Data
   */
  async createTrainingData(data) {
    if (!this.client) throw new Error('Supabase non configuré');
    
    const { data: result, error } = await this.client
      .from('training_data')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getTrainingData(filters = {}) {
    if (!this.client) throw new Error('Supabase non configuré');
    
    let query = this.client
      .from('training_data')
      .select('*');

    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.organizationId) {
      query = query.eq('metadata->>organizationId', filters.organizationId);
    }
    if (filters.usedForTraining !== undefined) {
      query = query.eq('used_for_training', filters.usedForTraining);
    }

    query = query.order('created_at', { ascending: false });
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async updateTrainingData(id, updates) {
    if (!this.client) throw new Error('Supabase non configuré');
    
    const { data, error } = await this.client
      .from('training_data')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Dashboard Stats
   */
  async getDashboardStats(filters = {}) {
    if (!this.client) throw new Error('Supabase non configuré');
    
    // Statistiques CV
    let cvQuery = this.client
      .from('cv_analysis')
      .select('status, match_analysis');

    if (filters.jobId) {
      cvQuery = cvQuery.eq('job_id', filters.jobId);
    }

    const { data: cvData, error: cvError } = await cvQuery;
    if (cvError) throw cvError;

    // Statistiques entretiens
    let interviewQuery = this.client
      .from('interview_session')
      .select('status, duration, summary');

    if (filters.jobId) {
      interviewQuery = interviewQuery.eq('job_id', filters.jobId);
    }

    const { data: interviewData, error: interviewError } = await interviewQuery;
    if (interviewError) throw interviewError;

    // Calculer les agrégations
    const cvStats = this.aggregateCVStats(cvData);
    const interviewStats = this.aggregateInterviewStats(interviewData);

    return {
      cvStats,
      interviewStats
    };
  }

  aggregateCVStats(data) {
    const stats = {
      total: data.length,
      byStatus: {},
      avgScore: 0,
      scores: []
    };

    data.forEach(item => {
      // Par statut
      stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
      
      // Scores
      if (item.match_analysis && item.match_analysis.score) {
        stats.scores.push(item.match_analysis.score);
      }
    });

    if (stats.scores.length > 0) {
      stats.avgScore = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
    }

    return stats;
  }

  aggregateInterviewStats(data) {
    const stats = {
      total: data.length,
      byStatus: {},
      avgDuration: 0,
      avgScore: 0,
      durations: [],
      scores: []
    };

    data.forEach(item => {
      // Par statut
      stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
      
      // Durées
      if (item.duration) {
        stats.durations.push(item.duration);
      }
      
      // Scores
      if (item.summary && item.summary.overallScore) {
        stats.scores.push(item.summary.overallScore);
      }
    });

    if (stats.durations.length > 0) {
      stats.avgDuration = stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length;
    }

    if (stats.scores.length > 0) {
      stats.avgScore = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
    }

    return stats;
  }
}

module.exports = new SupabaseService();

