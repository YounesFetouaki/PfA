import { useState, useCallback } from 'react';
import { mlApi } from '@/services/new-features/api';

export const useMLPredictions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trainModel = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mlApi.trainModel(data);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de l\'entraînement';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const predictCandidatePerformance = useCallback(async (candidateId: string, jobId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mlApi.predictCandidatePerformance(candidateId, jobId);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la prédiction';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const optimizeMatchingCriteria = useCallback(async (organizationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mlApi.optimizeMatchingCriteria(organizationId);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de l\'optimisation';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    trainModel,
    predictCandidatePerformance,
    optimizeMatchingCriteria,
    loading,
    error
  };
};

