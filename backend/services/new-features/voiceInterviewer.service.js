const OpenAI = require('openai');

class VoiceInterviewerService {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Génère une question d'entretien basée sur le contexte
   */
  async generateQuestion(context, previousQuestions = []) {
    const prompt = `Tu es un recruteur expert. Génère une question d'entretien pertinente basée sur le contexte suivant.

CONTEXTE DU POSTE:
${context.jobDescription || 'Non spécifié'}

COMPÉTENCES REQUISES:
${context.requiredSkills?.join(', ') || 'Non spécifiées'}

QUESTIONS DÉJÀ POSÉES:
${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n') || 'Aucune'}

NIVEAU DU CANDIDAT:
${context.candidateLevel || 'Non spécifié'}

Génère une question d'entretien professionnelle, pertinente et qui évalue les compétences techniques et comportementales. Réponds au format JSON:
{
  "question": "La question à poser",
  "type": "technical" | "behavioral" | "situational",
  "expectedTopics": ["sujet1", "sujet2"],
  "evaluationCriteria": ["critère1", "critère2"]
}`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "Tu es un expert en recrutement. Génère des questions d'entretien de qualité." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  /**
   * Analyse la réponse du candidat à une question
   */
  async analyzeResponse(question, response, context) {
    const prompt = `Analyse cette réponse à une question d'entretien et évalue sa qualité.

QUESTION:
${question}

RÉPONSE DU CANDIDAT:
${response}

CONTEXTE:
${JSON.stringify(context, null, 2)}

Évalue la réponse selon les critères suivants:
- Pertinence technique
- Clarté de la communication
- Exemples concrets fournis
- Capacité à structurer la pensée
- Connaissance du domaine

Réponds au format JSON:
{
  "score": 75,
  "strengths": ["point fort 1", "point fort 2"],
  "weaknesses": ["point faible 1"],
  "technicalAccuracy": "Évaluation de la précision technique",
  "communicationScore": 80,
  "recommendations": "Recommandations pour améliorer la réponse",
  "nextQuestionHint": "Suggestion pour la prochaine question"
}`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "Tu es un expert en évaluation de candidats. Analyse objectivement les réponses." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  /**
   * Génère un résumé final de l'entretien
   */
  async generateInterviewSummary(exchanges, context) {
    const prompt = `Génère un résumé complet de cet entretien d'embauche.

ÉCHANGES:
${exchanges.map((ex, i) => `
Question ${i + 1}: ${ex.question}
Réponse: ${ex.response}
Analyse: ${JSON.stringify(ex.analysis)}
`).join('\n')}

CONTEXTE:
${JSON.stringify(context, null, 2)}

Génère un résumé professionnel au format JSON:
{
  "overallScore": 82,
  "technicalScore": 85,
  "communicationScore": 80,
  "culturalFit": 75,
  "summary": "Résumé général de la performance",
  "strengths": ["force 1", "force 2"],
  "weaknesses": ["faiblesse 1"],
  "recommendation": "recommended" | "maybe" | "not_recommended",
  "detailedFeedback": "Feedback détaillé pour le recruteur",
  "areasForImprovement": ["zone 1", "zone 2"]
}`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "Tu es un expert RH. Génère des évaluations objectives et constructives." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  /**
   * Transcrit l'audio en texte (utilise l'API Whisper d'OpenAI)
   * @param {Buffer} audioBuffer - Buffer de l'audio
   * @param {string} language - Code langue (fr, en, etc.)
   * @param {string} filename - Nom du fichier (optionnel, pour le type MIME)
   */
  async transcribeAudio(audioBuffer, language = 'fr', filename = 'audio.webm') {
    try {
      // Créer un File-like object pour l'API OpenAI
      // L'API OpenAI SDK pour Node.js accepte un Buffer avec les métadonnées
      const fs = require('fs');
      const path = require('path');
      const os = require('os');

      // Créer un fichier temporaire
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, filename);
      
      // Écrire le buffer dans un fichier temporaire
      fs.writeFileSync(tempFilePath, audioBuffer);

      // Créer un File à partir du fichier temporaire
      const file = fs.createReadStream(tempFilePath);

      // Transcription avec OpenAI
      const transcription = await this.openai.audio.transcriptions.create({
        file: file,
        model: "whisper-1",
        language: language,
        response_format: "text"
      });

      // Nettoyer le fichier temporaire
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.warn('Erreur nettoyage fichier temporaire:', cleanupError);
      }

      return transcription;
    } catch (error) {
      throw new Error(`Erreur de transcription: ${error.message}`);
    }
  }
}

module.exports = new VoiceInterviewerService();

