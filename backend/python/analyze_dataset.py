import pandas as pd
import os
import json
from collections import Counter

# Find CSV file
csv_file = None
for file in os.listdir('data/'):
    if file.endswith('.csv'):
        csv_file = f'data/{file}'
        break

if not csv_file:
    print(json.dumps({'error': 'No CSV found'}))
    exit()

# Load data
df = pd.read_csv(csv_file)

# Analysis
analysis = {
    'total_resumes': len(df),
    'columns': df.columns.tolist(),
    'missing_values': df.isnull().sum().to_dict(),
    'data_shape': [len(df), len(df.columns)],
}

# If there's a Category column
if 'Category' in df.columns:
    analysis['categories'] = df['Category'].value_counts().to_dict()

# If there's Resume text
if 'Resume' in df.columns or 'resume' in df.columns:
    col_name = 'Resume' if 'Resume' in df.columns else 'resume'
    analysis['avg_resume_length'] = df[col_name].str.len().mean()
    analysis['max_resume_length'] = df[col_name].str.len().max()

print(json.dumps(analysis, indent=2))
