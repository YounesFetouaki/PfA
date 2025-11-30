'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const MLAnalysisPanel = () => {
  const [datasetAnalysis, setDatasetAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatasetAnalysis();
  }, []);

  const fetchDatasetAnalysis = async () => {
    try {
      const response = await fetch('/api/new-features/ml/dataset-analysis');
      const data = await response.json();
      setDatasetAnalysis(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📊 Resume Dataset Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-gray-600">Total Resumes</p>
            <p className="text-3xl font-bold">{datasetAnalysis?.total_resumes}</p>
          </div>

          {datasetAnalysis?.categories && (
            <div>
              <p className="text-gray-600 mb-2">Categories Distribution</p>
              <div className="space-y-1">
                {Object.entries(datasetAnalysis.categories).map(
                  ([category, count]: [string, any]) => (
                    <div key={category} className="flex justify-between">
                      <span>{category}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          <div>
            <p className="text-gray-600">Avg Resume Length</p>
            <p className="font-semibold">
              {Math.round(datasetAnalysis?.avg_resume_length || 0)} characters
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
