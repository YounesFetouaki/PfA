'use client';

import React, { Suspense } from 'react';
import { CandidateList } from '@/components/new-features/CandidateList';

function CandidatesContent() {
  return (
    <div className="container mx-auto py-8 px-4">
      <CandidateList />
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Chargement...</div>}>
      <CandidatesContent />
    </Suspense>
  );
}

