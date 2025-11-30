'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CVAnalysisResults } from '@/components/new-features/CVAnalysisResults';

interface __AIRecommendationsProps__ {
  jobId: string;
}

export const AIRecommendations: __React__.__FC__<__AIRecommendationsProps__> = ({ jobId }) => {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [cvAnalyses, setCVAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
    fetchCVAnalyses();
  }, [jobId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      // TODO: Appeler l'API
      // const response = await fetch`/api/new-features/dashboard/job/${jobId}/recommendations`, {...});
      // const data = await response.json();
      // setRecommendations(data.data);
    } catch (error) {
      console.error('Erreur récupération recommandations:', error);
    } finally {
      setLoading(false);
    }
  };

 const fetchCVAnalyses = async () => {
  try {
    const response = await fetch(`/api/new-features/cv/job/${jobId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch CV analyses');
    }
    
    const data = await response.json();
    console.log('Raw API response:', data);
    
    // Handle different response structures
    let analyses = [];
    
    if (data.data && Array.isArray(data.data)) {
      analyses = data.data;
    } else if (Array.isArray(data)) {
      analyses = data;
    }
    
    // Log each analysis structure
    console.log('Analyses to display:', analyses);
    if (analyses.length > 0) {
      console.log('First analysis structure:', analyses[0]);
      console.log('Keys:', Object.keys(analyses[0]));
    }
    
    setCVAnalyses(analyses);
  } catch (error) {
    console.error('Erreur récupération analyses CV:', error);
  }
};


  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Existing Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>🌟 Candidats hautement recommandés</CardTitle>
            <CardDescription>
              Candidats avec un score de 85% ou plus
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendations?.highlyRecommended?.length > 0 ? (
              <div className="space-y-2">
                {recommendations.highlyRecommended.slice(0, 5).map((candidate: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{candidate.candidateId?.name || 'Candidat'}</p>
                        <p className="text-sm text-muted-foreground">
                          Score: {candidate.matchAnalysis?.score}%
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Voir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Aucun candidat hautement recommandé pour le moment
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>👀 Candidats à surveiller</CardTitle>
            <CardDescription>
              Candidats avec un score entre 70% et 85%
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendations?.toWatch?.length > 0 ? (
              <div className="space-y-2">
                {recommendations.toWatch.slice(0, 5).map((candidate: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{candidate.candidateId?.name || 'Candidat'}</p>
                        <p className="text-sm text-muted-foreground">
                          Score: {candidate.matchAnalysis?.score}%
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Voir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Aucun candidat à surveiller pour le moment
              </p>
            )}
          </CardContent>
        </Card>

        {recommendations?.skillAnalysis && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>📊 Analyse des compétences</CardTitle>
              <CardDescription>
                Compétences les plus présentes chez les candidats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recommendations.skillAnalysis.slice(0, 10).map((skill: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium">{skill._id}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {skill.count} candidats
                      </span>
                      <span className="text-sm font-medium">
                        Score moyen: {skill.avgScore?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    
    </div>
  );
};
