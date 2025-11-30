import pandas as pd
import json
import sys
from collections import Counter

# Common technical skills
TECHNICAL_SKILLS = [
    'python', 'javascript', 'java', 'c++', 'c#', 'typescript', 'rust', 'go',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
    'sql', 'mongodb', 'postgresql', 'mysql', 'redis',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp',
    'git', 'jenkins', 'gitlab', 'github',
    'machine learning', 'tensorflow', 'pytorch', 'scikit-learn',
    'html', 'css', 'rest', 'graphql', 'api'
]

def analyze_skills(resume_text):
    """Extract technical skills from resume"""
    text = str(resume_text).lower()
    
    found_skills = []
    for skill in TECHNICAL_SKILLS:
        if skill in text:
            found_skills.append(skill)
    
    return {
        'found_skills': found_skills,
        'skills_count': len(found_skills),
        'skill_diversity': len(set(found_skills))
    }


if __name__ == '__main__':
    if len(sys.argv) > 1:
        resume_text = sys.argv[1]
        analysis = analyze_skills(resume_text)
        print(json.dumps(analysis))
