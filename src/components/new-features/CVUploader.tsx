'use client';

import React, { useState, useCallback,useEffect  } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCVAnalysis } from '@/hooks/new-features/useCVAnalysis';

interface CVUploaderProps {
  jobId: string;
  jobDescription?: string;
  onUploadComplete?: (analysis: any) => void;
}

export const CVUploader: React.FC<CVUploaderProps> = ({ 
  jobId, 
  jobDescription: initialJobDescription,
  onUploadComplete 
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState(initialJobDescription || '');
  const { analyzeCV } = useCVAnalysis();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Seuls les fichiers PDF sont acceptés');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('cv', file);
      formData.append('jobId', jobId);
      // Always append jobDescription, even if empty (backend will use default)
      formData.append('jobDescription', jobDescription || '');

      const analysis = await analyzeCV(formData);
      
      if (onUploadComplete) {
        onUploadComplete(analysis);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'analyse du CV');
    } finally {
      setUploading(false);
    }
  }, [jobId, jobDescription, analyzeCV, onUploadComplete]);
  
  // Update local state when prop changes
  useEffect(() => {
    if (initialJobDescription) {
      setJobDescription(initialJobDescription);
    }
  }, [initialJobDescription]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: uploading
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploader un CV</CardTitle>
        <CardDescription>
          Glissez-déposez un fichier PDF ou cliquez pour sélectionner
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Job Description Input */}
        <div className="space-y-2">
          <label htmlFor="jobDescription" className="text-sm font-medium">
            Description du poste (optionnel)
          </label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Entrez la description du poste pour une analyse plus précise..."
            className="w-full px-3 py-2 border rounded-md min-h-[100px] text-sm"
            disabled={uploading}
          />
          <p className="text-xs text-muted-foreground">
            Si vide, une analyse générale sera effectuée
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}
          `}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p>Analyse en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-gray-600">
                {isDragActive
                  ? 'Déposez le fichier ici'
                  : 'Glissez-déposez un PDF ou cliquez pour sélectionner'}
              </p>
              <p className="text-xs text-gray-400">PDF uniquement, max 10MB</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

