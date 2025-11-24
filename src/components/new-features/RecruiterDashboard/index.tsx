'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CandidateRanking } from './CandidateRanking';
import { AdvancedFilters } from './AdvancedFilters';
import { PerformanceCharts } from './PerformanceCharts';
import { AIRecommendations } from './AIRecommendations';

interface RecruiterDashboardProps {
  jobId: string;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ jobId }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    fetchDashboardStats();
  }, [jobId, filters]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // TODO: Appeler l'API pour récupérer les stats
      // const response = await fetch(`/api/new-features/dashboard/stats?jobId=${jobId}`, {...});
      // const data = await response.json();
      // setStats(data.data);
    } catch (error) {
      console.error('Erreur récupération stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord recruteur</h1>
        <p className="text-muted-foreground">
          Gérez et analysez vos candidats avec l'IA
        </p>
      </div>

      {/* Statistiques rapides */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>CVs analysés</CardDescription>
              <CardTitle className="text-2xl">{stats.cvStats?.total || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Score moyen</CardDescription>
              <CardTitle className="text-2xl">
                {stats.cvStats?.avgScore?.toFixed(1) || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Entretiens</CardDescription>
              <CardTitle className="text-2xl">{stats.interviewStats?.total || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Taux de complétion</CardDescription>
              <CardTitle className="text-2xl">
                {stats.interviewStats?.completionRate || 0}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Filtres avancés */}
      <AdvancedFilters onFiltersChange={setFilters} />

      {/* Recommandations IA */}
      <AIRecommendations jobId={jobId} />

      {/* Classement des candidats */}
      <CandidateRanking jobId={jobId} filters={filters} />

      {/* Graphiques de performance */}
      <PerformanceCharts jobId={jobId} />
    </div>
  );
};

