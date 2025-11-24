'use client';

import React from 'react';
import { CVUploader } from '@/components/new-features/CVUploader';

export default function CVAnalysisPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Analyse de CV</h1>
        <p className="text-muted-foreground mb-8">
          Uploader un CV pour une analyse automatique avec l'IA
        </p>
        <CVUploader
          jobId="default-job-id"
          jobDescription="Senior Software Engineer - Looking for experienced developer with strong problem-solving skills"
          onUploadComplete={(analysis) => console.log('Analysis:', analysis)}
        />
      </div>
    </div>
  );
}
