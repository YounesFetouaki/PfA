'use client';

import React, { Suspense } from 'react';
import { VoiceInterview } from '@/components/new-features/VoiceInterview';
import { useSearchParams } from 'next/navigation';

function VoiceInterviewContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId') || 'default-session-id';
  const jobDescription = searchParams.get('jobDescription') || undefined;

  const handleComplete = (summary: any) => {
    console.log('Résumé de l\'entretien:', summary);
    // TODO: Rediriger ou afficher les résultats
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Entretien Vocal</h1>
        <p className="text-muted-foreground mb-8">
          Répondez aux questions posées par l'IA recruteuse
        </p>
        <VoiceInterview
          sessionId={sessionId}
          jobDescription={jobDescription}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}

export default function VoiceInterviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VoiceInterviewContent />
    </Suspense>
  );
}

