'use client';

import React from 'react';
import { RecruiterDashboard } from '@/components/new-features/RecruiterDashboard';

interface RecruiterDashboardPageProps {
  jobId?: string;
}

export default function RecruiterDashboardPage({ jobId }: RecruiterDashboardPageProps) {
  return (
    <div className="container mx-auto py-8">
      <RecruiterDashboard jobId={jobId || 'default-job-id'} />
    </div>
  );
}

