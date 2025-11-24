// Use Next.js API routes as proxy to backend
const API_BASE_URL = '/api/new-features';

// Helper pour les requêtes
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token'); // À adapter selon votre système d'auth

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur serveur' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// API pour les CVs
export const cvApi = {
  analyzeCV: async (formData: FormData) => {
    const token = localStorage.getItem('auth_token');
    
    const fullUrl = `${API_BASE_URL}/cv/analyze`;
    console.log('[analyzeCV] Full URL:', fullUrl);
    console.log('[analyzeCV] Starting upload...');
    console.log('[analyzeCV] FormData entries:', {
      cv: formData.get('cv')?.constructor.name,
      jobId: formData.get('jobId'),
      jobDescription: formData.get('jobDescription')?.substring(0, 50) + '...'
    });
    
    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        // IMPORTANT: Do NOT set Content-Type header for FormData
        // The browser will set it automatically with the correct boundary
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Remove 'Content-Type': 'application/json' for FormData uploads
        },
        body: formData,
      });

      console.log('[analyzeCV] Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
          console.error('[analyzeCV] Error response:', error);
        } catch (parseError) {
          console.error('[analyzeCV] Could not parse error response');
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('[analyzeCV] Success:', result);
      return result;
    } catch (error) {
      console.error('[analyzeCV] Fetch error:', error);
      throw error;
    }
  },

  getCVAnalysis: async (id: string) => {
    return fetchAPI(`/cv/${id}`);
  },

  getCVAnalysesByJob: async (jobId: string) => {
    return fetchAPI(`/cv/job/${jobId}`);
  },

  getTopCandidates: async (jobId: string, limit: number = 10) => {
    return fetchAPI(`/cv/job/${jobId}/top?limit=${limit}`);
  },

  updateCVAnalysisStatus: async (id: string, status: string) => {
    return fetchAPI(`/cv/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// API pour les entretiens
export const interviewApi = {
  createInterviewSession: async (data: any) => {
    return fetchAPI('/interview/session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  startInterviewSession: async (sessionId: string, data: any) => {
    return fetchAPI(`/interview/session/${sessionId}/start`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  addInterviewExchange: async (sessionId: string, data: any) => {
    return fetchAPI(`/interview/session/${sessionId}/exchange`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  completeInterviewSession: async (sessionId: string, data: any) => {
    return fetchAPI(`/interview/session/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getInterviewSession: async (sessionId: string) => {
    return fetchAPI(`/interview/session/${sessionId}`);
  },

  getInterviewSessionsByJob: async (jobId: string) => {
    return fetchAPI(`/interview/job/${jobId}`);
  },

  transcribeAudio: async (audioBlob: Blob, language: string = 'fr') => {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('language', language);

    const response = await fetch(`${API_BASE_URL}/interview/transcribe`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur serveur' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// API pour le dashboard
export const dashboardApi = {
  getDashboardStats: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/dashboard/stats?${queryString}`);
  },

  getCandidateRanking: async (jobId: string, params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/dashboard/job/${jobId}/ranking?${queryString}`);
  },

  getFilteredCandidates: async (jobId: string, filters: any = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return fetchAPI(`/dashboard/job/${jobId}/filtered?${queryString}`);
  },

  getAIRecommendations: async (jobId: string) => {
    return fetchAPI(`/dashboard/job/${jobId}/recommendations`);
  },

  getPerformanceMetrics: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/dashboard/performance?${queryString}`);
  },
};

// API pour le ML
export const mlApi = {
  trainModel: async (data: any) => {
    return fetchAPI('/ml/train', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  predictCandidatePerformance: async (candidateId: string, jobId: string) => {
    return fetchAPI('/ml/predict', {
      method: 'POST',
      body: JSON.stringify({ candidateId, jobId }),
    });
  },

  optimizeMatchingCriteria: async (organizationId: string) => {
    return fetchAPI('/ml/optimize', {
      method: 'POST',
      body: JSON.stringify({ organizationId }),
    });
  },

  getTrainingData: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/ml/training-data?${queryString}`);
  },

  addFeedbackData: async (trainingDataId: string, feedback: any) => {
    return fetchAPI('/ml/feedback', {
      method: 'POST',
      body: JSON.stringify({ trainingDataId, feedback }),
    });
  },
};

// Export par défaut
export default {
  cvApi,
  interviewApi,
  dashboardApi,
  mlApi,
};
