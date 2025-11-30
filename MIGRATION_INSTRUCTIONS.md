# Database Migration Instructions

## Add dataset_comparison and dataset_insights columns

The `cv_analysis` table needs two additional columns for dataset comparison functionality.

### Option 1: Using Supabase Dashboard (Recommended)

1. Open your Supabase Dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the entire contents of `supabase_add_dataset_columns.sql`
5. Click **Run** (or press Ctrl+Enter)
6. Verify the columns were added by checking the table structure

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db execute -f supabase_add_dataset_columns.sql
```

### Option 3: Direct SQL Connection

If you have direct PostgreSQL access:

```bash
psql -h your-db-host -U postgres -d postgres -f supabase_add_dataset_columns.sql
```

### Verification

After running the migration, verify the columns exist:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cv_analysis' 
AND column_name IN ('dataset_comparison', 'dataset_insights');
```

You should see both columns listed with `jsonb` as the data type.

### What the Migration Does

- Adds `dataset_comparison` JSONB column (stores market comparison data)
- Adds `dataset_insights` JSONB column (stores dataset statistics)
- Creates GIN indexes for better query performance
- Adds helpful comments to document the columns

### Note

The application will continue to work without these columns, but dataset comparison features will be disabled until the migration is run.

