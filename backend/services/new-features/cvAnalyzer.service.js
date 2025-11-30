const pdf = require('pdf-parse');
const datasetAnalyzerService = require('./datasetAnalyzer.service');

class CVAnalyzerService {
  constructor() {
    // No longer requires Groq API key - using dataset-based analysis
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
   * Extrait le nom du candidat depuis le texte du CV
   * Le nom est généralement en haut du CV, en grandes lettres
   */
  extractName(cvText) {
    try {
      // Prendre les premières lignes du CV (où se trouve généralement le nom)
      const lines = cvText.split('\n').slice(0, 10);
      
      // Patterns pour trouver le nom
      const namePatterns = [
        // Nom complet (2-4 mots, tous capitalisés)
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/m,
        // Nom avec tiret (ex: Jean-Pierre)
        /^([A-Z][a-z]+(?:-[A-Z][a-z]+)?(?:\s+[A-Z][a-z]+){1,2})$/m,
        // Nom suivi de "CV", "Resume", ou rien
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})(?:\s*(?:CV|Resume|Curriculum|Vitae))?$/im
      ];

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Ignorer les lignes qui contiennent des mots-clés communs (email, téléphone, etc.)
        const skipKeywords = ['email', 'phone', 'téléphone', 'address', 'adresse', 'linkedin', 'github', 'www', 'http', '@', 'tel:', 'mobile'];
        const lowerLine = trimmedLine.toLowerCase();
        if (skipKeywords.some(keyword => lowerLine.includes(keyword))) {
          continue;
        }

        // Ignorer les lignes trop courtes ou trop longues
        if (trimmedLine.length < 3 || trimmedLine.length > 50) {
          continue;
        }

        // Tester les patterns
        for (const pattern of namePatterns) {
          const match = trimmedLine.match(pattern);
          if (match && match[1]) {
            const name = match[1].trim();
            // Vérifier que ce n'est pas un titre de poste ou autre
            const jobTitleKeywords = ['engineer', 'developer', 'manager', 'director', 'analyst', 'designer', 'consultant', 'specialist'];
            const lowerName = name.toLowerCase();
            if (!jobTitleKeywords.some(keyword => lowerName.includes(keyword))) {
              return name;
            }
          }
        }

        // Si la ligne commence par 2-4 mots capitalisés et ne contient pas de caractères spéciaux suspects
        const simpleNamePattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/;
        if (simpleNamePattern.test(trimmedLine)) {
          return trimmedLine;
        }
      }

      // Fallback: chercher dans tout le texte
      const fullTextMatch = cvText.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/m);
      if (fullTextMatch && fullTextMatch[1]) {
        return fullTextMatch[1].trim();
      }

      return null;
    } catch (error) {
      console.error('Error extracting name:', error);
      return null;
    }
  }

  /**
   * Extrait l'email depuis le texte du CV
   */
  extractEmail(cvText) {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const match = cvText.match(emailPattern);
    return match ? match[0] : null;
  }

  /**
   * Extrait les compétences depuis le texte du CV
   */
  extractSkills(cvText) {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'React', 'Node.js', 'Angular', 'Vue.js',
      'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure',
      'Git', 'Linux', 'Agile', 'Scrum', 'Machine Learning', 'Data Science', 'Big Data',
      'Hadoop', 'Spark', 'TensorFlow', 'PyTorch', 'R', 'Excel', 'Power BI', 'Tableau',
      'HTML', 'CSS', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
      'Spring', 'Django', 'Flask', 'Express', 'Laravel', 'Rails', 'GraphQL', 'REST API',
      'Microservices', 'CI/CD', 'Jenkins', 'GitLab', 'GitHub Actions', 'JIRA', 'Confluence'
    ];

    const foundSkills = [];
    const lowerText = cvText.toLowerCase();

    commonSkills.forEach(skill => {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });

    // Also look for skill patterns
    const skillPatterns = [
      /(?:proficient|experienced|skilled|expert|knowledgeable).*?(?:in|with|at)\s+([A-Z][a-zA-Z\s]+)/gi,
      /(?:technologies?|tools?|languages?|frameworks?|platforms?)[:\s]+([A-Za-z0-9\s,]+)/gi
    ];

    skillPatterns.forEach(pattern => {
      const matches = cvText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const extracted = match.replace(/(?:proficient|experienced|skilled|expert|knowledgeable|in|with|at|technologies?|tools?|languages?|frameworks?|platforms?)[:\s]+/gi, '').trim();
          if (extracted && extracted.length > 2 && extracted.length < 50) {
            foundSkills.push(extracted);
          }
        });
      }
    });

    return [...new Set(foundSkills)]; // Remove duplicates
  }

  /**
   * Extrait l'expérience depuis le texte du CV
   */
  extractExperience(cvText) {
    const experience = [];
    const experiencePatterns = [
      /(\d{4})\s*[-–]\s*(\d{4}|present|now|current)/gi,
      /(\w+\s+\d{4})\s*[-–]\s*(\w+\s+\d{4}|present|now|current)/gi
    ];

    let totalYears = 0;
    const lines = cvText.split('\n');

    experiencePatterns.forEach(pattern => {
      const matches = [...cvText.matchAll(pattern)];
      matches.forEach(match => {
        const startDate = match[1];
        const endDate = match[2] || 'present';
        const startYear = parseInt(startDate.match(/\d{4}/)?.[0] || new Date().getFullYear());
        const endYear = endDate.toLowerCase().includes('present') || endDate.toLowerCase().includes('now') || endDate.toLowerCase().includes('current')
          ? new Date().getFullYear()
          : parseInt(endDate.match(/\d{4}/)?.[0] || new Date().getFullYear());
        
        const years = Math.max(0, endYear - startYear);
        totalYears += years;

        // Try to extract job title and company from surrounding text
        const matchIndex = match.index;
        const context = cvText.substring(Math.max(0, matchIndex - 100), Math.min(cvText.length, matchIndex + 100));
        
        experience.push({
          title: this.extractJobTitle(context) || 'Position',
          company: this.extractCompany(context) || 'Company',
          duration: `${startDate} - ${endDate}`,
          years: years,
          description: context.substring(0, 200)
        });
      });
    });

    return {
      experience: experience.slice(0, 10), // Limit to 10 most recent
      totalExperienceYears: totalYears || this.estimateExperienceYears(cvText)
    };
  }

  extractJobTitle(context) {
    const titlePatterns = [
      /(?:position|role|title|job)[:\s]+([A-Z][a-zA-Z\s]+)/i,
      /^([A-Z][a-zA-Z\s&]+)(?:\s+at|\s+@)/m
    ];

    for (const pattern of titlePatterns) {
      const match = context.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  extractCompany(context) {
    const companyPatterns = [
      /(?:at|@|company|employer)[:\s]+([A-Z][a-zA-Z0-9\s&.,-]+)/i,
      /([A-Z][a-zA-Z0-9\s&.,-]+)\s+(?:Inc|LLC|Ltd|Corp|Corporation)/i
    ];

    for (const pattern of companyPatterns) {
      const match = context.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  estimateExperienceYears(cvText) {
    // Look for years mentioned in text
    const yearMentions = cvText.match(/(\d+)\s*(?:years?|ans?|yr|yrs)\s*(?:of|d[''])?\s*(?:experience|expérience|work|professional)/gi);
    if (yearMentions) {
      const years = yearMentions.map(m => parseInt(m.match(/\d+/)?.[0] || 0));
      return Math.max(...years);
    }
    return 0;
  }

  /**
   * Extrait l'éducation depuis le texte du CV
   */
  extractEducation(cvText) {
    const education = [];
    const degreePatterns = [
      /(?:Bachelor|Master|PhD|Doctorate|Diploma|Degree|B\.?Sc|M\.?Sc|B\.?Tech|M\.?Tech)[\s:]+([A-Za-z\s]+)/gi,
      /([A-Z][a-zA-Z\s]+)\s+(?:University|College|Institute|School|École|Université)/gi
    ];

    degreePatterns.forEach(pattern => {
      const matches = [...cvText.matchAll(pattern)];
      matches.forEach(match => {
        education.push({
          degree: match[1]?.trim() || match[0],
          institution: this.extractInstitution(cvText, match.index) || 'Institution',
          year: this.extractYear(cvText, match.index) || 'N/A'
        });
      });
    });

    return education.length > 0 ? education : [{
      degree: 'Not specified',
      institution: 'Not specified',
      year: 'N/A'
    }];
  }

  extractInstitution(text, index) {
    const context = text.substring(Math.max(0, index - 50), Math.min(text.length, index + 100));
    const instMatch = context.match(/([A-Z][a-zA-Z\s&.,-]+)\s+(?:University|College|Institute|School|École|Université)/i);
    return instMatch ? instMatch[1].trim() : null;
  }

  extractYear(text, index) {
    const context = text.substring(Math.max(0, index - 20), Math.min(text.length, index + 20));
    const yearMatch = context.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? yearMatch[0] : null;
  }

  /**
   * Extrait les langues depuis le texte du CV
   */
  extractLanguages(cvText) {
    const languages = [];
    const commonLanguages = ['English', 'French', 'Spanish', 'German', 'Italian', 'Portuguese', 'Arabic', 'Chinese', 'Japanese', 'Russian'];
    const lowerText = cvText.toLowerCase();

    commonLanguages.forEach(lang => {
      if (lowerText.includes(lang.toLowerCase())) {
        languages.push(lang);
      }
    });

    const langPattern = /(?:languages?|langues?)[:\s]+([A-Za-z,\s]+)/gi;
    const match = cvText.match(langPattern);
    if (match) {
      const extracted = match[0].replace(/(?:languages?|langues?)[:\s]+/gi, '').split(',').map(l => l.trim());
      languages.push(...extracted);
    }

    return [...new Set(languages)]; // Remove duplicates
  }

  /**
   * Extrait les certifications depuis le texte du CV
   */
  extractCertifications(cvText) {
    const certifications = [];
    const certPatterns = [
      /(?:certified|certification|certificat)[:\s]+([A-Za-z0-9\s-]+)/gi,
      /([A-Z]{2,}|[A-Z][a-z]+ [A-Z][a-z]+)\s+(?:Certification|Certificate|Certified)/g
    ];

    certPatterns.forEach(pattern => {
      const matches = [...cvText.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1] && match[1].length > 3) {
          certifications.push(match[1].trim());
        }
      });
    });

    return [...new Set(certifications)]; // Remove duplicates
  }

  /**
   * Analyse le CV en utilisant le dataset (sans Groq)
   */
  async analyzeCV(cvText) {
    try {
      console.log('Starting CV analysis with dataset-based extraction...');
      
      // Extract all information using pattern matching
      const name = this.extractName(cvText);
      const email = this.extractEmail(cvText);
      const skills = this.extractSkills(cvText);
      const experienceData = this.extractExperience(cvText);
      const education = this.extractEducation(cvText);
      const languages = this.extractLanguages(cvText);
      const certifications = this.extractCertifications(cvText);
      
      // Determine experience level
      const totalYears = experienceData.totalExperienceYears;
      let experienceLevel = 'Mid';
      if (totalYears < 2) {
        experienceLevel = 'Junior';
      } else if (totalYears >= 5) {
        experienceLevel = 'Senior';
      }

      // Extract soft skills (common keywords)
      const softSkills = [];
      const softSkillKeywords = ['communication', 'leadership', 'teamwork', 'problem solving', 'analytical', 'creative', 'adaptable', 'organized'];
      const lowerText = cvText.toLowerCase();
      softSkillKeywords.forEach(skill => {
        if (lowerText.includes(skill)) {
          softSkills.push(skill);
        }
      });

      // Extract keywords (important terms from the CV)
      const keywords = [];
      const importantTerms = cvText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
      keywords.push(...importantTerms.slice(0, 20)); // Top 20 terms

      console.log('Successfully extracted CV data using dataset-based analysis');
      
      return {
        name: name,
        email: email,
        skills: skills,
        experience: experienceData.experience,
        education: education,
        languages: languages,
        softSkills: softSkills,
        certifications: certifications,
        keywords: keywords,
        totalExperienceYears: totalYears,
        experienceLevel: experienceLevel
      };
    } catch (error) {
      console.error('CV Analysis Error:', {
        message: error.message
      });
      throw new Error(`Erreur analyse CV: ${error.message}`);
    }
  }

  /**
   * Calcule le score de correspondance en utilisant le dataset
   */
  async calculateMatchScore(cvData, jobDescription) {
    try {
      console.log('Calculating match score using dataset-based analysis...');
      
      // Load dataset to find similar profiles
      const records = datasetAnalyzerService.loadDataset();
      const insights = datasetAnalyzerService.getDatasetInsights();
      
      // Extract skills from job description
      const jobSkills = this.extractSkills(jobDescription);
      const candidateSkills = cvData.skills || [];
      
      // Find matching skills
      const matchingSkills = candidateSkills.filter(skill => {
        const skillLower = skill.toLowerCase();
        return jobSkills.some(js => js.toLowerCase().includes(skillLower) || skillLower.includes(js.toLowerCase()));
      });
      
      // Find missing skills
      const missingSkills = jobSkills.filter(js => {
        const jsLower = js.toLowerCase();
        return !candidateSkills.some(cs => cs.toLowerCase().includes(jsLower) || jsLower.includes(cs.toLowerCase()));
      });
      
      // Calculate base score based on skill match
      const skillMatchRatio = jobSkills.length > 0 ? matchingSkills.length / jobSkills.length : 0.5;
      const baseScore = Math.round(skillMatchRatio * 100);
      
      // Adjust score based on experience
      let experienceScore = 0;
      const totalYears = cvData.totalExperienceYears || 0;
      if (totalYears >= 5) experienceScore = 15;
      else if (totalYears >= 2) experienceScore = 10;
      else experienceScore = 5;
      
      // Adjust score based on certifications
      const certScore = (cvData.certifications?.length || 0) * 2;
      
      // Final score (max 100)
      const finalScore = Math.min(100, baseScore + experienceScore + certScore);
      
      // Find similar candidates in dataset
      const similarCandidates = records.filter(record => {
        const recordSkills = record.skills ? String(record.skills).split(',').map(s => s.trim()) : [];
        return recordSkills.some(rs => 
          candidateSkills.some(cs => 
            cs.toLowerCase().includes(rs.toLowerCase()) || rs.toLowerCase().includes(cs.toLowerCase())
          )
        );
      });
      
      // Generate top 3 strengths based on dataset comparison
      const top3Strengths = [];
      if (matchingSkills.length > 0) {
        top3Strengths.push(`Strong match with ${matchingSkills.length} required skills: ${matchingSkills.slice(0, 3).join(', ')}`);
      }
      if (totalYears >= 3) {
        top3Strengths.push(`${totalYears} years of professional experience`);
      }
      if (cvData.certifications && cvData.certifications.length > 0) {
        top3Strengths.push(`${cvData.certifications.length} relevant certification(s)`);
      }
      
      // Determine hire recommendation
      let hireRecommendation = 'Consider';
      if (finalScore >= 80) hireRecommendation = 'Highly Recommended';
      else if (finalScore >= 65) hireRecommendation = 'Recommended';
      else if (finalScore < 40) hireRecommendation = 'Not Recommended';
      
      // Generate experience match analysis
      const experienceMatch = `Candidate has ${totalYears} years of experience (${cvData.experienceLevel} level). `;
      const experienceMatchDetail = cvData.experience && cvData.experience.length > 0
        ? `Most recent position: ${cvData.experience[0].title} at ${cvData.experience[0].company}. `
        : '';
      const experienceLevelMatch = `Experience level (${cvData.experienceLevel}) is ${this.assessExperienceLevel(cvData.experienceLevel, jobDescription)} for this position.`;
      
      // Salary suggestion based on dataset
      const salaryBenchmark = datasetAnalyzerService.calculateSalaryBenchmark(
        totalYears,
        cvData.experienceLevel,
        insights
      );
      const salaryRangeSuggestion = `Fourchette salariale estimée: ${salaryBenchmark.min.toLocaleString('fr-FR')} - ${salaryBenchmark.max.toLocaleString('fr-FR')} ${salaryBenchmark.currency} par mois, basée sur ${totalYears} ans d'expérience et niveau ${cvData.experienceLevel}.`;
      
      // Language requirements
      const languageRequirements = cvData.languages && cvData.languages.length > 0
        ? `Candidate speaks: ${cvData.languages.join(', ')}. `
        : '';
      const jobLanguages = this.extractLanguages(jobDescription);
      const languageMatch = jobLanguages.length > 0
        ? `Job requires: ${jobLanguages.join(', ')}. ${languageRequirements}Match: ${jobLanguages.some(jl => cvData.languages?.some(cl => cl.toLowerCase().includes(jl.toLowerCase())))}`
        : languageRequirements;
      
      // Certification relevance
      const certificationRelevance = cvData.certifications && cvData.certifications.length > 0
        ? `Candidate has ${cvData.certifications.length} certification(s): ${cvData.certifications.join(', ')}. These ${this.assessCertificationRelevance(cvData.certifications, jobDescription)} relevant for the position.`
        : 'No certifications found. Consider adding relevant certifications to strengthen the profile.';
      
      // Recommendations
      const recommendations = this.generateRecommendations(cvData, jobDescription, matchingSkills, missingSkills, finalScore);
      
      console.log('Successfully calculated match score using dataset');
      
      return {
        score: finalScore,
        matching_skills: matchingSkills,
        missing_skills: missingSkills,
        top3_strengths: top3Strengths.length > 0 ? top3Strengths : ['Relevant experience', 'Technical skills match', 'Professional background'],
        experience_match: experienceMatch + experienceMatchDetail + experienceLevelMatch,
        experience_level_match: experienceLevelMatch,
        certification_relevance: certificationRelevance,
        language_requirements: languageMatch || 'No specific language requirements mentioned.',
        recommendations: recommendations,
        hire_recommendation: hireRecommendation,
        salary_range_suggestion: salaryRangeSuggestion
      };
    } catch (error) {
      console.error('Match Score Error:', {
        message: error.message
      });
      throw new Error(`Erreur calcul score de correspondance: ${error.message}`);
    }
  }

  assessExperienceLevel(level, jobDescription) {
    const jobLower = jobDescription.toLowerCase();
    if (jobLower.includes('senior') || jobLower.includes('lead') || jobLower.includes('principal')) {
      return level === 'Senior' ? 'appropriate' : 'may need more experience';
    } else if (jobLower.includes('junior') || jobLower.includes('entry')) {
      return level === 'Junior' ? 'appropriate' : 'overqualified';
    }
    return 'appropriate';
  }

  assessCertificationRelevance(certifications, jobDescription) {
    const jobLower = jobDescription.toLowerCase();
    const relevantCerts = certifications.filter(cert => {
      const certLower = cert.toLowerCase();
      return jobLower.includes(certLower) || certLower.split(' ').some(word => jobLower.includes(word));
    });
    return relevantCerts.length > 0 ? 'are' : 'may not be';
  }

  generateRecommendations(cvData, jobDescription, matchingSkills, missingSkills, score) {
    const recommendations = [];
    
    if (missingSkills.length > 0) {
      recommendations.push(`Consider developing these skills: ${missingSkills.slice(0, 5).join(', ')}`);
    }
    
    if (score < 60) {
      recommendations.push('Profile needs strengthening in key areas. Focus on gaining experience in required technologies.');
    } else if (score >= 80) {
      recommendations.push('Strong candidate profile. Highlight relevant experience and achievements in interviews.');
    }
    
    if (cvData.certifications && cvData.certifications.length === 0) {
      recommendations.push('Consider obtaining relevant certifications to strengthen your profile.');
    }
    
    return recommendations.length > 0 ? recommendations.join(' ') : 'Continue building experience in relevant technologies and domains.';
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

      // 2. Analyser avec extraction basée sur le dataset
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
