import pandas as pd
import numpy as np
from collections import Counter
import json
import sys

def calculate_cv_quality(resume_text):
    """
    Score CV quality (0-100)
    Based on: length, keywords, formatting
    """
    if not resume_text:
        return 0
    
    text = str(resume_text).lower()
    score = 0
    
    # Length check (good CVs are 200-5000 chars)
    if 200 < len(text) < 5000:
        score += 20
    elif len(text) > 5000:
        score += 15
    elif len(text) > 100:
        score += 10
    
    # Keywords check
    important_keywords = [
        'experience', 'skills', 'education', 'projects',
        'achievement', 'responsibility', 'technical', 'certified'
    ]
    
    keyword_count = sum(1 for kw in important_keywords if kw in text)
    score += min(keyword_count * 5, 30)  # Max 30 points
    
    # Contact info check
    if '@' in text or 'phone' in text or 'linkedin' in text:
        score += 20
    
    # Structure check (has numbers, dates)
    has_numbers = any(char.isdigit() for char in text)
    has_dates = any(year in text for year in ['20', '19'])
    
    if has_numbers:
        score += 15
    if has_dates:
        score += 15
    
    return min(score, 100)


def extract_key_info(resume_text):
    """Extract key information from resume"""
    text = str(resume_text).lower()
    
    info = {
        'has_experience': 'experience' in text,
        'has_education': 'education' in text or 'degree' in text or 'bachelor' in text,
        'has_skills': 'skills' in text,
        'has_projects': 'project' in text,
        'has_certifications': 'certified' in text or 'certification' in text,
        'years_mentioned': len([c for c in text if c.isdigit()]) // 2,  # Rough estimate
    }
    
    return info


if __name__ == '__main__':
    if len(sys.argv) > 1:
        resume_text = sys.argv[1]
        quality = calculate_cv_quality(resume_text)
        info = extract_key_info(resume_text)
        
        result = {
            'quality_score': quality,
            'info': info
        }
        print(json.dumps(result))
