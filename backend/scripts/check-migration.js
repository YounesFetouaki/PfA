/**
 * Script to check if dataset_comparison and dataset_insights columns exist
 * Run with: node backend/scripts/check-migration.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found in environment variables');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMigration() {
  console.log('🔍 Checking if migration is needed...\n');

  try {
    // Try to query the columns directly
    const { data, error } = await supabase
      .from('cv_analysis')
      .select('dataset_comparison, dataset_insights')
      .limit(1);

    if (error) {
      if (error.message && error.message.includes('dataset_comparison') || error.message.includes('dataset_insights')) {
        console.log('❌ Migration needed!');
        console.log('The columns dataset_comparison and dataset_insights are missing.\n');
        console.log('📝 To fix this:');
        console.log('1. Open your Supabase Dashboard');
        console.log('2. Go to SQL Editor');
        console.log('3. Run the SQL from: supabase_add_dataset_columns.sql\n');
        return false;
      } else {
        throw error;
      }
    }

    console.log('✅ Migration already applied!');
    console.log('The columns dataset_comparison and dataset_insights exist.\n');
    return true;
  } catch (error) {
    console.error('❌ Error checking migration:', error.message);
    return false;
  }
}

checkMigration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

