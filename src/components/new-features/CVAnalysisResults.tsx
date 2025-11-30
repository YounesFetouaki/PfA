'use client';
import React from 'react';
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from '@/components/ui/card';

interface CVAnalysisResultsProps {
  analysis: any;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

const getRecommendationColor = (recommendation: string) => {
  switch (recommendation) {
    case 'Highly Recommended':
      return 'bg-green-100 text-green-800';
    case 'Recommended':
      return 'bg-blue-100 text-blue-800';
    case 'Consider':
      return 'bg-yellow-100 text-yellow-800';
    case 'Not Recommended':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const CVAnalysisResults: React.FC<CVAnalysisResultsProps> = ({ analysis }) => {
  if (!analysis) return null;
  
  // Handle Supabase snake_case: match_analysis, extracted_data, dataset_comparison
  const matchAnalysis = analysis.match_analysis || analysis.matchAnalysis || analysis.analysis?.matchAnalysis;
  const extractedData = analysis.extracted_data || analysis.extractedData || analysis.analysis?.extractedData;
  const datasetComparison = analysis.dataset_comparison || analysis.datasetComparison || analysis.analysis?.datasetComparison;

  console.log('CVAnalysisResults debug:', {
    hasMatchAnalysis: !!matchAnalysis,
    hasExtractedData: !!extractedData,
    hasDatasetComparison: !!datasetComparison,
    matchAnalysisKeys: matchAnalysis ? Object.keys(matchAnalysis) : [],
    extractedDataKeys: extractedData ? Object.keys(extractedData) : [],
    datasetComparisonKeys: datasetComparison ? Object.keys(datasetComparison) : [],
  });

  if (!matchAnalysis || !extractedData) {
    return (
      <div className="text-red-600 p-4 bg-red-50 border border-red-200 rounded">
        ⚠️ Error: Missing analysis data
        <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(analysis, null, 2).substring(0, 500)}</pre>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      {/* Dataset Comparison Section */}
      {datasetComparison && (
        <Card className="border-2 border-purple-300">
          <CardHeader>
            <CardTitle>📊 Market Comparison (vs Resume Dataset)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {datasetComparison.market_size && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Similar Candidates</p>
                  <p className="text-2xl font-bold">
                    {datasetComparison.market_size.similar_candidates || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {datasetComparison.market_size.percentage_of_market || 0}% of market
                  </p>
                </div>
                {datasetComparison.experience_analysis && (
                  <div>
                    <p className="text-gray-600 text-sm">Market Percentile</p>
                    <p className="text-2xl font-bold">
                      {datasetComparison.experience_analysis.market_percentile || 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {datasetComparison.market_position && (
              <div>
                <p className="text-gray-600 text-sm mb-2">Competitiveness</p>
                <p className="text-lg font-bold text-purple-600">
                  {datasetComparison.market_position.competitiveness || 'N/A'}
                </p>
              </div>
            )}

            {datasetComparison.skill_analysis?.trending_skills && Array.isArray(datasetComparison.skill_analysis.trending_skills) && (
              <div>
                <p className="text-gray-600 text-sm mb-2">Trending Skills</p>
                <div className="flex flex-wrap gap-2">
                  {datasetComparison.skill_analysis.trending_skills.map((skill: string) => (
                    <span key={skill} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {datasetComparison.dataset_comparison?.overall_market_rating && (
              <div>
                <p className="text-gray-600 text-sm mb-2">Overall Rating</p>
                <p className="text-lg font-bold">
                  {datasetComparison.dataset_comparison.overall_market_rating}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* Overall Score & Recommendation */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-600 text-sm mb-2">Score de correspondance</p>
              <div className={`text-5xl font-bold ${getScoreColor(matchAnalysis.score)}`}>
                {matchAnalysis.score || '0'}%
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold ${getRecommendationColor(matchAnalysis.hire_recommendation)}`}>
              {matchAnalysis.hire_recommendation || 'N/A'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Forces */}
      {matchAnalysis.top3_strengths && matchAnalysis.top3_strengths.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">🌟 Top 3 Forces</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {matchAnalysis.top3_strengths.map((strength: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {/* Experience Level */}
      {extractedData.experienceLevel && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">📊 Niveau d'expérience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold">{extractedData.experienceLevel}</p>
              <p className="text-gray-600 text-sm">
                {extractedData.totalExperienceYears || 0} ans d'expérience totale
              </p>
            </div>
            {matchAnalysis.experience_level_match && (
              <p className="text-gray-700">{matchAnalysis.experience_level_match}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Matching Skills */}
      {matchAnalysis.matching_skills && matchAnalysis.matching_skills.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">✅ Compétences correspondantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {matchAnalysis.matching_skills.map((skill: string) => (
                <span
                  key={skill}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missing Skills */}
      {matchAnalysis.missing_skills && matchAnalysis.missing_skills.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">❌ Compétences manquantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {matchAnalysis.missing_skills.map((skill: string) => (
                <span
                  key={skill}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience Analysis */}
      {matchAnalysis.experience_match && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">💼 Analyse de l'expérience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">{matchAnalysis.experience_match}</p>
            {extractedData.experience && extractedData.experience.map((exp: any, i: number) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg border">
                <p className="font-semibold">{exp.title}</p>
                <p className="text-sm text-gray-600">{exp.company} • {exp.duration}</p>
                {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Languages */}
      {extractedData.languages && extractedData.languages.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">🗣️ Langues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {extractedData.languages.map((lang: string) => (
                <span
                  key={lang}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {lang}
                </span>
              ))}
            </div>
            {matchAnalysis.language_requirements && (
              <p className="text-gray-700 text-sm">{matchAnalysis.language_requirements}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {extractedData.certifications && extractedData.certifications.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">🏆 Certifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {extractedData.certifications.map((cert: string) => (
                <span
                  key={cert}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                >
                  {cert}
                </span>
              ))}
            </div>
            {matchAnalysis.certification_relevance && (
              <p className="text-gray-700 text-sm">{matchAnalysis.certification_relevance}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Salary Range Suggestion */}
      {matchAnalysis.salary_range_suggestion && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">💰 Fourchette salariale suggérée</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{matchAnalysis.salary_range_suggestion}</p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {matchAnalysis.recommendations && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">💡 Recommandations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{matchAnalysis.recommendations}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
