'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CandidateRankingProps {
  jobId: string;
  filters?: any;
}

interface Candidate {
  _id: string;
  candidateId: {
    name: string;
    email: string;
  };
  matchAnalysis: {
    score: number;
    matchingSkills: string[];
    missingSkills: string[];
  };
  extractedData: {
    skills: string[];
    experience: any[];
  };
  status: string;
}

export const CandidateRanking: React.FC<CandidateRankingProps> = ({ jobId, filters }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchCandidates();
  }, [jobId, filters, sortBy, order]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      // TODO: Appeler l'API
      // const response = await fetch(
      //   `/api/new-features/dashboard/job/${jobId}/ranking?sortBy=${sortBy}&order=${order}`,
      //   {...}
      // );
      // const data = await response.json();
      // setCandidates(data.data);
    } catch (error) {
      console.error('Erreur récupération candidats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      analyzed: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Classement des candidats</CardTitle>
            <CardDescription>
              Candidats triés par score de correspondance
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'score' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('score')}
            >
              Score
            </Button>
            <Button
              variant={sortBy === 'date' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('date')}
            >
              Date
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            >
              {order === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {candidates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun candidat trouvé
            </p>
          ) : (
            candidates.map((candidate, index) => (
              <div
                key={candidate._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-400">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {candidate.candidateId?.name || 'Candidat anonyme'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {candidate.candidateId?.email || ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(candidate.matchAnalysis.score)}`}>
                      {candidate.matchAnalysis.score}
                    </div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(candidate.status)}`}>
                    {candidate.status}
                  </div>
                  <Button variant="outline" size="sm">
                    Voir détails
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

