'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cvApi } from '@/services/new-features/api';
import { CVAnalysisResults } from './CVAnalysisResults';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Eye, Download, Search, Filter, X } from 'lucide-react';

interface Candidate {
  id: string;
  candidate_id: string;
  job_id: string | null;
  extracted_data: {
    name?: string;
    email?: string;
    skills?: string[];
    experience?: any[];
    languages?: string[];
    certifications?: string[];
    experienceLevel?: string;
    totalExperienceYears?: number;
  };
  match_analysis: {
    score: number;
    matching_skills?: string[];
    missing_skills?: string[];
    hire_recommendation?: string;
    top3_strengths?: string[];
  };
  status: string;
  pdf_url?: string;
  created_at: string;
  analyzed_at?: string;
}

export const CandidateList: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [jobIdFilter, setJobIdFilter] = useState<string>('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [candidates, searchTerm, statusFilter, scoreFilter, sortBy, sortOrder, jobIdFilter]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const filters: any = {
        sortBy,
        sortOrder
      };
      
      if (jobIdFilter) {
        filters.jobId = jobIdFilter;
      }

      const response = await cvApi.getAllCandidates(filters);
      setCandidates(response.data || []);
    } catch (error) {
      console.error('Erreur récupération candidats:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...candidates];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(candidate => {
        const name = candidate.extracted_data?.name?.toLowerCase() || '';
        const email = candidate.extracted_data?.email?.toLowerCase() || '';
        const skills = candidate.extracted_data?.skills?.join(' ').toLowerCase() || '';
        return name.includes(term) || email.includes(term) || skills.includes(term);
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Score filter
    if (scoreFilter !== 'all') {
      filtered = filtered.filter(c => {
        const score = c.match_analysis?.score || 0;
        switch (scoreFilter) {
          case 'high':
            return score >= 80;
          case 'medium':
            return score >= 60 && score < 80;
          case 'low':
            return score < 60;
          default:
            return true;
        }
      });
    }

    // Job filter
    if (jobIdFilter) {
      filtered = filtered.filter(c => c.job_id === jobIdFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'score') {
        const scoreA = a.match_analysis?.score || 0;
        const scoreB = b.match_analysis?.score || 0;
        return sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      } else {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

    setFilteredCandidates(filtered);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailOpen(true);
  };

  const handleDownloadCV = async (candidate: Candidate) => {
    if (candidate.pdf_url) {
      window.open(candidate.pdf_url, '_blank');
    } else {
      alert('CV non disponible');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setScoreFilter('all');
    setJobIdFilter('');
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
        <h1 className="text-3xl font-bold">Liste des candidats</h1>
        <p className="text-muted-foreground">
          Visualisez tous les candidats avec leurs CVs et scores
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email, compétences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="analyzed">Analysé</SelectItem>
                <SelectItem value="reviewed">Examiné</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>

            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les scores</SelectItem>
                <SelectItem value="high">≥ 80%</SelectItem>
                <SelectItem value="medium">60-79%</SelectItem>
                <SelectItem value="low">&lt; 60%</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(v: 'score' | 'date') => setSortBy(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Trier par score</SelectItem>
                  <SelectItem value="date">Trier par date</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
              {(searchTerm || statusFilter !== 'all' || scoreFilter !== 'all' || jobIdFilter) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <Input
              placeholder="Filtrer par Job ID (optionnel)"
              value={jobIdFilter}
              onChange={(e) => setJobIdFilter(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total candidats</CardDescription>
            <CardTitle className="text-2xl">{candidates.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Résultats filtrés</CardDescription>
            <CardTitle className="text-2xl">{filteredCandidates.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Score moyen</CardDescription>
            <CardTitle className="text-2xl">
              {filteredCandidates.length > 0
                ? Math.round(
                    filteredCandidates.reduce(
                      (sum, c) => sum + (c.match_analysis?.score || 0),
                      0
                    ) / filteredCandidates.length
                  )
                : 0}
              %
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Haut score</CardDescription>
            <CardTitle className="text-2xl">
              {filteredCandidates.length > 0
                ? Math.max(...filteredCandidates.map(c => c.match_analysis?.score || 0))
                : 0}
              %
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Candidate List */}
      <Card>
        <CardHeader>
          <CardTitle>Candidats ({filteredCandidates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun candidat trouvé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg ${getScoreColor(candidate.match_analysis?.score || 0)}`}>
                        {candidate.match_analysis?.score || 0}%
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {candidate.extracted_data?.name || candidate.candidate_id || 'Candidat anonyme'}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {candidate.extracted_data?.email || 'Email non disponible'}
                      </p>
                      {candidate.job_id && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Job ID: {candidate.job_id}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {candidate.extracted_data?.skills?.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.extracted_data?.skills && candidate.extracted_data.skills.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{candidate.extracted_data.skills.length - 5}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(candidate.status)}`}>
                        {candidate.status}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(candidate.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(candidate)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Détails
                      </Button>
                      {candidate.pdf_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadCV(candidate)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          CV
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <AlertDialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Détails du candidat: {selectedCandidate?.extracted_data?.name || selectedCandidate?.candidate_id}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Analyse complète du CV et de la correspondance
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedCandidate && (
            <div className="mt-4">
              <CVAnalysisResults analysis={selectedCandidate} />
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

