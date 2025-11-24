'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: any) => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState({
    minScore: '',
    maxScore: '',
    skills: [] as string[],
    languages: [] as string[],
    status: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const addSkill = () => {
    if (newSkill && !filters.skills.includes(newSkill)) {
      const newSkills = [...filters.skills, newSkill];
      handleFilterChange('skills', newSkills);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    const newSkills = filters.skills.filter(s => s !== skill);
    handleFilterChange('skills', newSkills);
  };

  const addLanguage = () => {
    if (newLanguage && !filters.languages.includes(newLanguage)) {
      const newLanguages = [...filters.languages, newLanguage];
      handleFilterChange('languages', newLanguages);
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    const newLanguages = filters.languages.filter(l => l !== language);
    handleFilterChange('languages', newLanguages);
  };

  const clearFilters = () => {
    const emptyFilters = {
      minScore: '',
      maxScore: '',
      skills: [],
      languages: [],
      status: ''
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Filtres avancés</CardTitle>
            <CardDescription>
              Filtrez les candidats selon vos critères
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Réinitialiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Score */}
          <div className="space-y-2">
            <Label>Score minimum</Label>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.minScore}
              onChange={(e) => handleFilterChange('minScore', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label>Score maximum</Label>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.maxScore}
              onChange={(e) => handleFilterChange('maxScore', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="100"
            />
          </div>

          {/* Compétences */}
          <div className="space-y-2">
            <Label>Compétences</Label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="Ajouter une compétence"
              />
              <Button onClick={addSkill} size="sm">Ajouter</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Langues */}
          <div className="space-y-2">
            <Label>Langues</Label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="Ajouter une langue"
              />
              <Button onClick={addLanguage} size="sm">Ajouter</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.languages.map((language) => (
                <span
                  key={language}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1"
                >
                  {language}
                  <button
                    onClick={() => removeLanguage(language)}
                    className="hover:text-green-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label>Statut</Label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Tous</option>
              <option value="pending">En attente</option>
              <option value="analyzed">Analysé</option>
              <option value="reviewed">Examiné</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

