const pdf = require('pdf-parse');
const Groq = require('groq-sdk');

class CVAnalyzerService {
  constructor() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not defined in environment variables');
    }
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  /**
   * Extrait le contenu textuel d'un PDF
   */
  async extractTextFromPDF(pdfBuffer) {
    try {
      console.log('Extracting text from PDF buffer...');
      const data = await pdf(pdfBuffer);
      console.log(`Successfully extracted ${data.text.length} characters from PDF`);
      return data.text;
    } catch (error) {
      console.error('PDF extraction error:', error.message);
      throw new Error(`Erreur extraction PDF: ${error.message}`);
    }
  }

  /**
   * Analyse le CV avec Groq pour extraire les informations structurées
   */
  async analyzeCV(cvText) {
    try {
      console.log('Starting CV analysis with Groq...');
      
      const prompt = `Tu es un expert HR qui analyse des CVs TRÈS ATTENTIVEMENT. Extrais TOUTES les informations suivantes:

CV:
${cvText}

Réponds UNIQUEMENT avec du JSON valide (pas de markdown):
{
  "skills": ["liste complète de compétences techniques"],
  "experience": [
    {
      "title": "titre exact",
      "company": "nom exact",
      "duration": "ex: 2020-2023 (3 ans)",
      "years": nombre,
      "description": "description des responsabilités"
    }
  ],
  "education": [
    {
      "degree": "diplôme exact",
      "institution": "école/université",
      "year": "année"
    }
  ],
  "languages": ["liste de langues avec niveaux"],
  "softSkills": ["communication", "leadership", "etc"],
  "certifications": ["certification 1", "certification 2"],
  "keywords": ["mots-clés importants"],
  "totalExperienceYears": nombre exact,
  "experienceLevel": "Junior (0-2 ans)|Mid (2-5 ans)|Senior (5+ ans)"
}`;

      console.log('Calling Groq API...');
      let message;
      try {
        message = await this.groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert RH qui analyses des CVs. Réponds UNIQUEMENT avec du JSON valide, sans texte supplémentaire, sans markdown.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 2000
        });
        console.log('Groq API call successful');
      } catch (groqError) {
        console.error('Groq API Error Details:', {
          message: groqError.message,
          code: groqError.code,
          status: groqError.status
        });
        throw groqError;
      }

      let content = message.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from Groq');
      }

      console.log('Successfully parsed CV data from Groq');
      return JSON.parse(content);
    } catch (error) {
      console.error('Groq CV Analysis Error:', {
        message: error.message
      });
      throw new Error(`Erreur analyse CV avec Groq: ${error.message}`);
    }
  }

  /**
   * Calcule le score de correspondance avec analyse détaillée
   */
  async calculateMatchScore(cvData, jobDescription) {
    try {
      console.log('Calculating match score with Groq...');
      
      const prompt = `Tu es un expert en recrutement senior. Analyse EN DÉTAIL la correspondance entre ce profil candidat et la fiche de poste.

PROFIL CANDIDAT:
${JSON.stringify(cvData, null, 2)}

FICHE DE POSTE:
${jobDescription}

ANALYSE REQUISE - Sois très spécifique et détaillé:

1. TOP 3 FORCES: Identifie les 3 plus grands atouts du candidat par rapport au poste
2. EXPERIENCE: Analyse complète de l'expérience (pertinence, années, croissance)
3. CERTIFICATIONS: Évalue la pertinence des certifications pour le poste
4. LANGUES: Vérifie la correspondance avec les langues requises du poste
5. SALAIRE: Suggère une fourchette basée sur l'expérience totale et le niveau

Réponds UNIQUEMENT avec du JSON valide (pas de texte supplémentaire, pas de markdown):
{
  "score": 85,
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": ["skill3", "skill4"],
  "top3_strengths": ["force spécifique 1", "force spécifique 2", "force spécifique 3"],
  "experience_match": "Analyse détaillée: années d'expérience, progression, pertinence...",
  "experience_level_match": "Analyse: le candidat est-il Junior/Mid/Senior pour ce poste?",
  "certification_relevance": "Analyse des certifications: lesquelles sont pertinentes et pourquoi",
  "language_requirements": "Analyse: langues demandées vs langues du candidat",
  "recommendations": "Résumé: forces, faiblesses, potentiel, conseils pour améliorer",
  "hire_recommendation": "Highly Recommended|Recommended|Consider|Not Recommended",
  "salary_range_suggestion": "Fourchette salariale estimée: ex. 45k-55k EUR basé sur X années d'expérience"
}`;

      console.log('Calling Groq API for match score...');
      let message;
      try {
        message = await this.groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en recrutement. Réponds UNIQUEMENT avec du JSON valide, sans texte supplémentaire, sans markdown.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 2000
        });
        console.log('Groq API call for match score successful');
      } catch (groqError) {
        console.error('Groq Match Score API Error Details:', {
          message: groqError.message,
          code: groqError.code,
          status: groqError.status
        });
        throw groqError;
      }

      let content = message.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from Groq');
      }

      console.log('Successfully calculated match score');
      return JSON.parse(content);
    } catch (error) {
      console.error('Groq Match Score Error:', {
        message: error.message
      });
      throw new Error(`Erreur calcul score de correspondance: ${error.message}`);
    }
  }

  /**
   * Processus complet d'analyse
   */
  async processCV(pdfBuffer, jobDescription) {
    try {
      console.log('=== Starting CV Processing ===');
      console.log('Buffer size:', pdfBuffer.length, 'bytes');
      console.log('Job description length:', jobDescription.length, 'characters');

      // 1. Extraire le texte
      const cvText = await this.extractTextFromPDF(pdfBuffer);

      if (!cvText || cvText.trim().length === 0) {
        throw new Error('PDF is empty or unreadable');
      }

      // 2. Analyser avec Groq
      const cvData = await this.analyzeCV(cvText);

      // 3. Calculer le score de correspondance
      const matchScore = await this.calculateMatchScore(cvData, jobDescription);

      console.log('=== CV Processing Completed Successfully ===');

      return {
        extractedData: cvData,
        matchAnalysis: matchScore,
        analyzedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('=== CV Processing Failed ===');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }
}

module.exports = new CVAnalyzerService();
