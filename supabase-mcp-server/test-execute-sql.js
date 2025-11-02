const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zbscbvrklkntlbtefkgw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpic2NidnJrbGtudGxidGVma2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4ODM5MiwiZXhwIjoyMDY4NjY0MzkyfQ.0n2Us3XrsXZO2wAhAvUncuZL-bOt-1vELeiUMNQP1uk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL() {
  const sql = "DROP TABLE IF EXISTS public.test_cursor_table CASCADE;";
  
  console.log('Executing SQL via RPC function...');
  console.log('SQL:', sql);
  console.log('');
  
  try {
    const { data, error } = await supabase.rpc('mcp_execute_sql', { 
      p_sql: sql 
    });
    
    if (error) {
      console.log('✗ ERROR:', error.message);
      if (error.message.includes('function') || error.message.includes('does not exist')) {
        console.log('\n⚠ The function mcp_execute_sql does not exist yet.');
        console.log('Please run the SQL from mcp-execute-any-sql.sql in Supabase SQL Editor first!');
      }
      return;
    }
    
    console.log('✓ SUCCESS!');
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data && data.success) {
      console.log(`\n✓ SQL executed successfully!`);
      console.log(`  Rows affected: ${data.rowCount || 0}`);
      if (data.message) {
        console.log(`  Message: ${data.message}`);
      }
    } else if (data && !data.success) {
      console.log(`\n✗ SQL execution returned error:`);
      console.log(`  ${data.error}`);
    }
    
  } catch (error) {
    console.log('✗ Exception:', error.message);
  }
}

executeSQL();


