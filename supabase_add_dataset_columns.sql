-- ============================================
-- MIGRATION: Add dataset_comparison and dataset_insights columns to cv_analysis
-- ============================================

-- Add dataset_comparison column (JSONB to store comparison results with the dataset)
ALTER TABLE cv_analysis 
ADD COLUMN IF NOT EXISTS dataset_comparison JSONB DEFAULT '{}';

-- Add dataset_insights column (JSONB to store dataset insights/statistics)
ALTER TABLE cv_analysis 
ADD COLUMN IF NOT EXISTS dataset_insights JSONB DEFAULT '{}';

-- Add index for dataset_comparison queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_cv_analysis_dataset_comparison 
ON cv_analysis USING GIN (dataset_comparison);

-- Add index for dataset_insights queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_cv_analysis_dataset_insights 
ON cv_analysis USING GIN (dataset_insights);

-- Add comment to document the columns
COMMENT ON COLUMN cv_analysis.dataset_comparison IS 'Comparison results of the candidate CV with the resume dataset (market analysis, percentiles, competitiveness, etc.)';
COMMENT ON COLUMN cv_analysis.dataset_insights IS 'Dataset insights and statistics used for the comparison (top skills, market trends, etc.)';

