import { useState, useCallback } from 'react';
import { cvApi } from '@/services/new-features/api';

interface CVAnalysisResult {
  success: boolean;
  data: any;
  analysis: any;
}

export const useCVAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeCV = useCallback(async (formData: FormData): Promise<CVAnalysisResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await cvApi.analyzeCV(formData);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de l\'analyse du CV';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCVAnalysis = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await cvApi.getCVAnalysis(id);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la récupération de l\'analyse';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCVAnalysesByJob = useCallback(async (jobId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await cvApi.getCVAnalysesByJob(jobId);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la récupération des analyses';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    analyzeCV,
    getCVAnalysis,
    getCVAnalysesByJob,
    loading,
    error
  };
};

