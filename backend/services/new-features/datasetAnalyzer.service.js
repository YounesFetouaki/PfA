const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

class DatasetAnalyzerService {
  constructor() {
    this.dataCache = null;
  }

  /**
   * Load Resume Dataset
   */
  loadDataset() {
    try {
      console.log('Loading Resume Dataset...');
      
      if (this.dataCache) {
        console.log('Using cached dataset');
        return this.dataCache;
      }

      const csvPath = path.join(__dirname, '../../data/resume_data.csv');
      const fileContent = fs.readFileSync(csvPath, 'utf8');
      
      const records = csv.parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true
      });

      console.log(`Loaded ${records.length} resumes from dataset`);
      this.dataCache = records;
      return records;
    } catch (error) {
      console.error('Dataset loading error:', error.message);
      throw new Error(`Erreur chargement dataset: ${error.message}`);
    }
  }

  /**
   * Get dataset insights and statistics
   */
  getDatasetInsights() {
    try {
      console.log('Getting dataset insights...');
      
      const records = this.loadDataset();

      if (!records || records.length === 0) {
        throw new Error('Dataset is empty');
      }

      // Calculate statistics
      const totalResumes = records.length;
      
      // Extract all skills
      const allSkills = [];
      records.forEach(record => {
        if (record.skills) {
          const skills = String(record.skills)
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);
          allSkills.push(...skills);
        }
      });

      // Extract all positions
      const allPositions = [];
      records.forEach(record => {
        if (record.positions) {
          const positions = String(record.positions)
            .split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0);
          allPositions.push(...positions);
        }
      });

      // Extract all degrees
      const allDegrees = [];
      records.forEach(record => {
        if (record.degree_names) {
          const degrees = String(record.degree_names)
            .split(',')
            .map(d => d.trim())
            .filter(d => d.length > 0);
          allDegrees.push(...degrees);
        }
      });

      // Extract all languages
      const allLanguages = [];
      records.forEach(record => {
        if (record.languages) {
          const languages = String(record.languages)
            .split(',')
            .map(l => l.trim())
            .filter(l => l.length > 0);
          allLanguages.push(...languages);
        }
      });

      // Count occurrences
      const countOccurrences = (arr) => {
        const counts = {};
        arr.forEach(item => {
          counts[item] = (counts[item] || 0) + 1;
        });
        return Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .reduce((obj, [key, val]) => {
            obj[key] = val;
            return obj;
          }, {});
      };

      // Match score statistics
      const matchScores = records
        .map(r => parseFloat(r.matched_score) || 0)
        .filter(s => s > 0);

      const insights = {
        total_resumes: totalResumes,
        data_quality: {
          complete_resumes: records.filter(r => 
            r.skills && r.positions && r.educational_institution_name
          ).length,
          with_skills: records.filter(r => r.skills).length,
          with_experience: records.filter(r => r.professional_company_names).length,
          with_education: records.filter(r => r.educational_institution_name).length,
          with_certifications: records.filter(r => r.certification_providers).length,
          with_languages: records.filter(r => r.languages).length
        },
        match_score_stats: {
          average: (matchScores.reduce((a, b) => a + b, 0) / matchScores.length).toFixed(2),
          min: Math.min(...matchScores).toFixed(2),
          max: Math.max(...matchScores).toFixed(2),
          median: this.calculateMedian(matchScores).toFixed(2)
        },
        top_10_skills: countOccurrences(allSkills),
        top_10_positions: countOccurrences(allPositions),
        top_degrees: countOccurrences(allDegrees),
        top_languages: countOccurrences(allLanguages),
        unique_skills_count: new Set(allSkills).size,
        unique_positions_count: new Set(allPositions).size,
        unique_degrees_count: new Set(allDegrees).size,
        unique_languages_count: new Set(allLanguages).size
      };

      console.log('Dataset insights calculated successfully');
      return insights;
    } catch (error) {
      console.error('Dataset insights error:', error.message);
      throw new Error(`Erreur analyse dataset: ${error.message}`);
    }
  }

  /**
   * Compare candidate with dataset
   */
  compareWithDataset(candidateData) {
    try {
      console.log('Comparing candidate with dataset...');
      
      const records = this.loadDataset();
      const insights = this.getDatasetInsights();

      // Extract candidate info
      const candidateSkills = candidateData.skills || [];
      const candidateExperience = candidateData.totalExperienceYears || 0;
      const candidateLevel = candidateData.experienceLevel || 'Mid';

      // Find similar candidates
      let similarCandidates = records.filter(record => {
        const recordSkills = record.skills ? String(record.skills).split(',') : [];
        return recordSkills.some(skill =>
          candidateSkills.some(cSkill =>
            String(cSkill).toLowerCase().includes(String(skill).toLowerCase())
          )
        );
      });

      // Calculate percentiles
      const datasetMatchScores = records
        .map(r => parseFloat(r.matched_score) || 0)
        .filter(s => s > 0)
        .sort((a, b) => a - b);

      const candidateMatchPercentile = this.calculatePercentile(
        candidateData.matchScore || 0.7,
        datasetMatchScores
      );

      // Get salary insights from similar candidates
      const similarSkillCount = Object.values(insights.top_10_skills)
        .reduce((sum, val) => sum + val, 0) / Object.keys(insights.top_10_skills).length;

      const comparison = {
        market_size: {
          similar_candidates: similarCandidates.length,
          percentage_of_market: ((similarCandidates.length / records.length) * 100).toFixed(1)
        },
        skill_analysis: {
          candidate_skills_count: candidateSkills.length,
          avg_skills_in_market: (similarSkillCount).toFixed(1),
          skill_competitiveness: candidateSkills.length >= similarSkillCount ? 'Above Average' : 'Average',
          trending_skills: Object.keys(insights.top_10_skills).slice(0, 5)
        },
        experience_analysis: {
          candidate_years: candidateExperience,
          avg_years_in_market: this.calculateAverageExperience(similarCandidates).toFixed(1),
          experience_rating: this.rateExperience(candidateExperience),
          market_percentile: `${candidateMatchPercentile}th percentile`
        },
        market_position: {
          competitiveness: this.rateCompetitiveness(
            candidateSkills.length,
            candidateExperience,
            similarSkillCount
          ),
          market_demand: this.calculateMarketDemand(candidateSkills, insights),
          salary_benchmark: this.calculateSalaryBenchmark(
            candidateExperience,
            candidateLevel,
            insights
          )
        },
        dataset_comparison: {
          vs_average_match_score: ((0.7 - parseFloat(insights.match_score_stats.average)) * 100).toFixed(1),
          skill_match_quality: 'High',
          experience_fit: this.rateExperienceFit(candidateExperience),
          overall_market_rating: this.calculateOverallRating(candidateData, insights)
        }
      };

      console.log('Comparison completed successfully');
      return comparison;
    } catch (error) {
      console.error('Comparison error:', error.message);
      throw new Error(`Erreur comparaison dataset: ${error.message}`);
    }
  }

  calculatePercentile(value, sortedArray) {
    const index = sortedArray.findIndex(v => v >= value);
    if (index === -1) return 100;
    return Math.round((index / sortedArray.length) * 100);
  }

  calculateMedian(arr) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  calculateAverageExperience(records) {
    const experiences = records
      .map(r => parseFloat(r.start_dates) || 0)
      .filter(e => e > 0);
    return experiences.length > 0 
      ? experiences.reduce((a, b) => a + b) / experiences.length 
      : 0;
  }

  rateExperience(years) {
    if (years >= 10) return 'Very Senior';
    if (years >= 5) return 'Senior';
    if (years >= 2) return 'Mid Level';
    return 'Junior';
  }

  rateExperienceFit(years) {
    if (years >= 5) return 'Excellent';
    if (years >= 2) return 'Good';
    if (years >= 1) return 'Fair';
    return 'Entry Level';
  }

  rateCompetitiveness(skillCount, experience, avgSkills) {
    const skillScore = skillCount >= avgSkills ? 1 : 0.5;
    const expScore = experience >= 3 ? 1 : 0.5;
    const totalScore = (skillScore + expScore) / 2;

    if (totalScore >= 0.9) return 'Highly Competitive';
    if (totalScore >= 0.7) return 'Very Competitive';
    if (totalScore >= 0.5) return 'Competitive';
    return 'Developing';
  }

  calculateMarketDemand(candidateSkills, insights) {
    const topSkills = Object.keys(insights.top_10_skills);
    const matchedSkills = candidateSkills.filter(skill =>
      topSkills.some(topSkill =>
        String(topSkill).toLowerCase().includes(String(skill).toLowerCase())
      )
    );

    const demandScore = (matchedSkills.length / topSkills.length) * 100;

    if (demandScore >= 80) return 'Very High Demand';
    if (demandScore >= 60) return 'High Demand';
    if (demandScore >= 40) return 'Moderate Demand';
    return 'Niche Skills';
  }

  calculateSalaryBenchmark(experience, level, insights) {
    // Base salaries in Moroccan Dirham (MAD)
    // Realistic salary ranges for Morocco IT market
    const baseSalaries = {
      'Junior': 8000,      // ~8,000-12,000 MAD/month for junior
      'Mid': 15000,        // ~15,000-25,000 MAD/month for mid-level
      'Senior': 30000      // ~30,000-50,000 MAD/month for senior
    };

    const base = baseSalaries[level] || 15000;
    // Experience bonus: ~500-1000 MAD per year of experience
    const experienceBonus = experience * 800;
    // Match score bonus: higher match = higher salary potential
    const avgMatchBonus = parseFloat(insights?.match_score_stats?.average || 0.7) * 5000;

    const estimated = base + experienceBonus + avgMatchBonus;

    return {
      estimated: Math.round(estimated),
      min: Math.round(estimated * 0.85),
      max: Math.round(estimated * 1.15),
      currency: 'MAD'
    };
  }

  calculateOverallRating(candidateData, insights) {
    const skillsScore = candidateData.skills?.length >= 5 ? 0.3 : 0.2;
    const experienceScore = candidateData.totalExperienceYears >= 3 ? 0.3 : 0.2;
    const matchScore = (candidateData.matchScore || 0.7) * 0.4;

    const totalScore = (skillsScore + experienceScore + matchScore) / 10;

    if (totalScore >= 0.8) return '⭐⭐⭐⭐⭐ Excellent';
    if (totalScore >= 0.6) return '⭐⭐⭐⭐ Very Good';
    if (totalScore >= 0.4) return '⭐⭐⭐ Good';
    return '⭐⭐ Average';
  }
}

module.exports = new DatasetAnalyzerService();
