'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVoiceRecorder } from '@/hooks/new-features/useVoiceRecorder';

interface VoiceInterviewProps {
  sessionId: string;
  jobDescription?: string;
  onComplete?: (summary: any) => void;
}

export const VoiceInterview: React.FC<VoiceInterviewProps> = ({
  sessionId,
  jobDescription,
  onComplete
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'in_progress' | 'completed'>('idle');
  const { startRecording, stopRecording, isRecording: recorderIsRecording } = useVoiceRecorder();

  const handleStartInterview = async () => {
    try {
      // TODO: Appeler l'API pour démarrer la session
      setSessionStatus('in_progress');
      
      // Générer la première question
      // const response = await fetch(`/api/new-features/interview/session/${sessionId}/start`, {...});
      // const data = await response.json();
      // setCurrentQuestion(data.question.text);
    } catch (error) {
      console.error('Erreur démarrage entretien:', error);
    }
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur démarrage enregistrement:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioBlob = await stopRecording();
      setIsRecording(false);

      // TODO: Envoyer l'audio pour transcription et analyse
      // const formData = new FormData();
      // formData.append('audio', audioBlob);
      // const response = await fetch(`/api/new-features/interview/session/${sessionId}/exchange`, {...});
    } catch (error) {
      console.error('Erreur arrêt enregistrement:', error);
    }
  };

  const handleCompleteInterview = async () => {
    try {
      // TODO: Appeler l'API pour compléter l'entretien
      // const response = await fetch(`/api/new-features/interview/session/${sessionId}/complete`, {...});
      // const data = await response.json();
      // setSessionStatus('completed');
      // if (onComplete) {
      //   onComplete(data.summary);
      // }
    } catch (error) {
      console.error('Erreur complétion entretien:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entretien Vocal</CardTitle>
        <CardDescription>
          Répondez aux questions posées par l'IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessionStatus === 'idle' && (
          <Button onClick={handleStartInterview} className="w-full">
            Démarrer l'entretien
          </Button>
        )}

        {sessionStatus === 'in_progress' && (
          <>
            {currentQuestion && (
              <Card>
                <CardHeader>
                  <CardTitle>Question</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">{currentQuestion}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4 justify-center">
              {!isRecording ? (
                <Button onClick={handleStartRecording} variant="default" size="lg">
                  🎤 Démarrer l'enregistrement
                </Button>
              ) : (
                <Button onClick={handleStopRecording} variant="destructive" size="lg">
                  ⏹️ Arrêter l'enregistrement
                </Button>
              )}
            </div>

            {isRecording && (
              <div className="flex items-center justify-center gap-2 text-red-500">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span>Enregistrement en cours...</span>
              </div>
            )}

            <Button onClick={handleCompleteInterview} variant="outline" className="w-full">
              Terminer l'entretien
            </Button>
          </>
        )}

        {sessionStatus === 'completed' && (
          <Card>
            <CardHeader>
              <CardTitle>Entretien terminé</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Merci d'avoir participé à cet entretien.</p>
            </CardContent>
          </Card>
        )}

        {exchanges.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Échanges précédents</h3>
            {exchanges.map((exchange, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <p className="font-medium">Q: {exchange.question}</p>
                  <p className="text-sm text-gray-600 mt-2">R: {exchange.response}</p>
                  {exchange.analysis && (
                    <div className="mt-2 p-2 bg-gray-100 rounded">
                      <p className="text-xs">Score: {exchange.analysis.score}/100</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

