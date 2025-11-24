'use client';

import React, { Suspense } from 'react';
import { RecruiterDashboard } from '@/components/new-features/RecruiterDashboard';
import { useSearchParams } from 'next/navigation';

function RecruiterDashboardContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId') || 'default-job-id';

  return (
    <div className="container mx-auto py-8">
      <RecruiterDashboard jobId={jobId} />
    </div>
  );
}

export default function RecruiterDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecruiterDashboardContent />
    </Suspense>
  );
}

