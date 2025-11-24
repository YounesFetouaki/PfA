const OpenAI = require('openai');

class LearningEngineService {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Entraîne le modèle avec de nouvelles données
   */
  async trainModel(trainingData) {
    try {
      // Analyse des patterns dans les données d'entraînement
      const patterns = await this.analyzeTrainingPatterns(trainingData);
      
      // Génération de règles d'apprentissage
      const learningRules = await this.generateLearningRules(patterns);
      
      return {
        patterns,
        learningRules,
        trainedAt: new Date(),
        dataPoints: trainingData.length
      };
    } catch (error) {
      throw new Error(`Erreur d'entraînement: ${error.message}`);
    }
  }

  /**
   * Analyse les patterns dans les données d'entraînement
   */
  async analyzeTrainingPatterns(trainingData) {
    const prompt = `Analyse ces données d'entraînement pour un système de recrutement IA et identifie les patterns.

DONNÉES D'ENTRAÎNEMENT:
${JSON.stringify(trainingData, null, 2)}

Identifie:
- Patterns de succès dans les recrutements
- Caractéristiques des candidats performants
- Corrélations entre compétences et performance
- Patterns de correspondance CV/poste
- Signaux d'alerte à détecter

Réponds au format JSON:
{
  "successPatterns": ["pattern1", "pattern2"],
  "keyIndicators": ["indicateur1", "indicateur2"],
  "correlations": {
    "skill1": "correlation avec performance"
  },
  "warningSignals": ["signal1", "signal2"],
  "recommendations": "Recommandations pour améliorer le modèle"
}`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "Tu es un expert en machine learning pour le recrutement." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  /**
   * Génère des règles d'apprentissage basées sur les patterns
   */
  async generateLearningRules(patterns) {
    const prompt = `Génère des règles d'apprentissage pour un système de recrutement IA basées sur ces patterns.

PATTERNS IDENTIFIÉS:
${JSON.stringify(patterns, null, 2)}

Génère des règles concrètes et actionnables au format JSON:
{
  "rules": [
    {
      "name": "Nom de la règle",
      "condition": "Condition à vérifier",
      "action": "Action à prendre",
      "weight": 0.8,
      "description": "Description de la règle"
    }
  ],
  "scoringWeights": {
    "technicalSkills": 0.4,
    "experience": 0.3,
    "communication": 0.2,
    "culturalFit": 0.1
  },
  "thresholds": {
    "minimumScore": 70,
    "recommendedScore": 85
  }
}`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "Tu es un expert en systèmes d'apprentissage automatique." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  /**
   * Prédit la performance future d'un candidat
   */
  async predictCandidatePerformance(candidateData, jobRequirements) {
    const prompt = `Prédit la performance future d'un candidat basée sur son profil et les exigences du poste.

PROFIL CANDIDAT:
${JSON.stringify(candidateData, null, 2)}

EXIGENCES DU POSTE:
${JSON.stringify(jobRequirements, null, 2)}

Prédits:
- Probabilité de succès dans le rôle
- Temps d'adaptation estimé
- Zones de développement nécessaires
- Risques potentiels

Réponds au format JSON:
{
  "successProbability": 0.85,
  "adaptationTime": "2-3 mois",
  "predictedPerformance": "excellent" | "good" | "average" | "below_average",
  "developmentAreas": ["zone1", "zone2"],
  "potentialRisks": ["risque1"],
  "confidence": 0.8,
  "reasoning": "Explication de la prédiction"
}`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "Tu es un expert en prédiction de performance." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  /**
   * Optimise les critères de matching
   */
  async optimizeMatchingCriteria(feedbackData) {
    const prompt = `Optimise les critères de matching basés sur les retours des recruteurs.

RETOURS:
${JSON.stringify(feedbackData, null, 2)}

Analyse quels critères sont les plus prédictifs du succès et optimise les poids.

Réponds au format JSON:
{
  "optimizedWeights": {
    "technicalSkills": 0.45,
    "experience": 0.25,
    "education": 0.15,
    "softSkills": 0.15
  },
  "newCriteria": ["critère1"],
  "removedCriteria": ["critère2"],
  "improvement": "Amélioration attendue",
  "confidence": 0.9
}`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "Tu es un expert en optimisation de systèmes de matching." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  }
}

module.exports = new LearningEngineService();

