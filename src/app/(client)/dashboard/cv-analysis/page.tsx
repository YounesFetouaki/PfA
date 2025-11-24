'use client';
import React, { Suspense, useState } from 'react';
import { CVUploader } from '@/components/new-features/CVUploader';
import { CVAnalysisResults } from '@/components/new-features/CVAnalysisResults';
import { useSearchParams } from 'next/navigation';

function CVAnalysisContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams?.get('jobId') || 'default-job-id';
  const jobDescription = searchParams?.get('jobDescription') || 'Senior Software Engineer';
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  const handleUploadComplete = (analysis: any) => {
    console.log('Full analysis response:', analysis);
    console.log('Analysis structure:', {
      hasAnalysis: !!analysis,
      hasMatchAnalysis: !!analysis.matchAnalysis,
      hasExtractedData: !!analysis.extractedData,
      keys: Object.keys(analysis || {})
    });
    setAnalysisResult(analysis);
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Analyse de CV</h1>
        
        <CVUploader 
          jobId={jobId} 
          jobDescription={jobDescription}
          onUploadComplete={handleUploadComplete}
        />
        
        {analysisResult && <CVAnalysisResults analysis={analysisResult} />}
      </div>
    </div>
  );
}

export default function CVAnalysisPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CVAnalysisContent />
    </Suspense>
  );
}
