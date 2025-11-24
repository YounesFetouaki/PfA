'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMLPredictions } from '@/hooks/new-features/useMLPredictions';

export const MLTraining: React.FC = () => {
  const [training, setTraining] = useState(false);
  const [trainingResult, setTrainingResult] = useState<any>(null);
  const { trainModel } = useMLPredictions();

  const handleTrain = async () => {
    try {
      setTraining(true);
      // TODO: Appeler l'API d'entraînement
      // const result = await trainModel({ type: 'cv_analysis', data: {...} });
      // setTrainingResult(result);
    } catch (error) {
      console.error('Erreur entraînement:', error);
    } finally {
      setTraining(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entraînement du modèle ML</CardTitle>
        <CardDescription>
          Entraînez le modèle d'IA avec de nouvelles données
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleTrain} 
          disabled={training}
          className="w-full"
        >
          {training ? 'Entraînement en cours...' : 'Démarrer l\'entraînement'}
        </Button>

        {trainingResult && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">
              Entraînement terminé avec succès
            </h3>
            <div className="space-y-1 text-sm text-green-700">
              <p>Points de données: {trainingResult.dataPoints}</p>
              <p>Patterns identifiés: {trainingResult.patterns?.successPatterns?.length || 0}</p>
              <p>Règles générées: {trainingResult.learningRules?.rules?.length || 0}</p>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>
            L'entraînement utilise les données de feedback des recruteurs pour améliorer 
            les prédictions et les recommandations du modèle.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

