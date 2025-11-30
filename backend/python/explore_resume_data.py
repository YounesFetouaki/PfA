import pandas as pd
import os

# Load dataset
data_files = os.listdir('data/')
print("Files in data folder:", data_files)

# Find and load CSV
csv_file = None
for file in data_files:
    if file.endswith('.csv'):
        csv_file = file
        break

if csv_file:
    df = pd.read_csv(f'data/{csv_file}')
    
    print(f"\n✅ Loaded: {csv_file}")
    print(f"Shape: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"\nColumns:\n{df.columns.tolist()}")
    print(f"\nFirst 3 rows:")
    print(df.head(3))
    print(f"\nData types:")
    print(df.dtypes)
    print(f"\nMissing values:")
    print(df.isnull().sum())
else:
    print("No CSV file found in data folder!")
