-- ============================================
-- NOUVELLES TABLES POUR LES FONCTIONNALITÉS IA
-- ============================================

-- Table: cv_analysis
-- Stocke les analyses de CV effectuées par l'IA
CREATE TABLE IF NOT EXISTS cv_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    candidate_id TEXT, -- ID du candidat (peut référencer une table candidate si elle existe)
    job_id TEXT REFERENCES interview(id) ON DELETE CASCADE, -- Référence au poste
    
    -- Données extraites du CV
    extracted_data JSONB NOT NULL DEFAULT '{}',
    
    -- Analyse de correspondance
    match_analysis JSONB NOT NULL DEFAULT '{}',
    
    -- URL du PDF uploadé (stocké dans Supabase Storage)
    pdf_url TEXT,
    
    -- Statut de l'analyse
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzed', 'reviewed', 'rejected')),
    
    -- Métadonnées
    reviewed_by TEXT REFERENCES "user"(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_cv_analysis_candidate_job ON cv_analysis(candidate_id, job_id);
CREATE INDEX IF NOT EXISTS idx_cv_analysis_job_id ON cv_analysis(job_id);
CREATE INDEX IF NOT EXISTS idx_cv_analysis_status ON cv_analysis(status);
CREATE INDEX IF NOT EXISTS idx_cv_analysis_match_score ON cv_analysis((match_analysis->>'score'));

-- Table: interview_session
-- Sessions d'entretien vocal/vidéo avec l'IA
CREATE TABLE IF NOT EXISTS interview_session (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    candidate_id TEXT,
    job_id TEXT REFERENCES interview(id) ON DELETE CASCADE,
    interviewer_id TEXT REFERENCES "user"(id),
    
    -- Type de session
    session_type TEXT NOT NULL DEFAULT 'voice' CHECK (session_type IN ('voice', 'video', 'text')),
    
    -- Statut de la session
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    
    -- Horaires
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- Durée en secondes
    
    -- Données de la session
    audio_url TEXT, -- URL dans Supabase Storage
    transcript TEXT,
    
    -- Résumé généré par l'IA
    summary JSONB DEFAULT '{}',
    
    -- Notes
    notes TEXT,
    created_by TEXT REFERENCES "user"(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_interview_session_candidate_job ON interview_session(candidate_id, job_id);
CREATE INDEX IF NOT EXISTS idx_interview_session_job_id ON interview_session(job_id);
CREATE INDEX IF NOT EXISTS idx_interview_session_status ON interview_session(status);
CREATE INDEX IF NOT EXISTS idx_interview_session_scheduled ON interview_session(scheduled_at);

-- Table: interview_exchange
-- Échanges question/réponse dans une session d'entretien
CREATE TABLE IF NOT EXISTS interview_exchange (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    session_id UUID NOT NULL REFERENCES interview_session(id) ON DELETE CASCADE,
    
    -- Question posée
    question JSONB NOT NULL DEFAULT '{}',
    
    -- Réponse du candidat
    response JSONB NOT NULL DEFAULT '{}',
    
    -- Analyse de la réponse par l'IA
    analysis JSONB DEFAULT '{}',
    
    -- Ordre dans la session
    order_number INTEGER NOT NULL,
    
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index
CREATE INDEX IF NOT EXISTS idx_interview_exchange_session ON interview_exchange(session_id, order_number);

-- Table: training_data
-- Données d'entraînement pour le modèle ML
CREATE TABLE IF NOT EXISTS training_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- Type de données
    type TEXT NOT NULL CHECK (type IN ('cv_analysis', 'interview', 'matching', 'performance')),
    
    -- Données d'entrée et de sortie
    input_data JSONB NOT NULL DEFAULT '{}',
    output_data JSONB NOT NULL DEFAULT '{}',
    
    -- Résultat
    outcome TEXT NOT NULL CHECK (outcome IN ('success', 'failure', 'partial')),
    
    -- Feedback du recruteur
    feedback JSONB DEFAULT '{}',
    
    -- Métadonnées
    metadata JSONB DEFAULT '{}',
    
    -- Statut d'utilisation
    used_for_training BOOLEAN DEFAULT false,
    training_date TIMESTAMP WITH TIME ZONE,
    quality_score NUMERIC(3, 2) DEFAULT 0.5 CHECK (quality_score >= 0 AND quality_score <= 1)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_training_data_type ON training_data(type, used_for_training);
CREATE INDEX IF NOT EXISTS idx_training_data_organization ON training_data((metadata->>'organizationId'));
CREATE INDEX IF NOT EXISTS idx_training_data_outcome ON training_data(outcome);
CREATE INDEX IF NOT EXISTS idx_training_data_quality ON training_data(quality_score DESC);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_cv_analysis_updated_at BEFORE UPDATE ON cv_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_session_updated_at BEFORE UPDATE ON interview_session
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_data_updated_at BEFORE UPDATE ON training_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - À activer selon vos besoins
-- ALTER TABLE cv_analysis ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE interview_session ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE interview_exchange ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE training_data ENABLE ROW LEVEL SECURITY;

