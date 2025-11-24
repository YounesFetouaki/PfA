'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PerformanceChartsProps {
  jobId: string;
}

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ jobId }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [jobId]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      // TODO: Appeler l'API pour récupérer les données des graphiques
      // const response = await fetch(`/api/new-features/dashboard/performance?jobId=${jobId}`, {...});
      // const data = await response.json();
      // setChartData(data.data);
    } catch (error) {
      console.error('Erreur récupération données graphiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Évolution des candidatures</CardTitle>
          <CardDescription>
            Nombre de CVs analysés par jour
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Graphique à implémenter (Chart.js, Recharts, etc.)
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribution des scores</CardTitle>
          <CardDescription>
            Répartition des scores de correspondance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Graphique à implémenter (Chart.js, Recharts, etc.)
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compétences les plus recherchées</CardTitle>
          <CardDescription>
            Top 10 des compétences les plus fréquentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Graphique à implémenter (Chart.js, Recharts, etc.)
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance des entretiens</CardTitle>
          <CardDescription>
            Scores moyens par type d'entretien
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Graphique à implémenter (Chart.js, Recharts, etc.)
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

