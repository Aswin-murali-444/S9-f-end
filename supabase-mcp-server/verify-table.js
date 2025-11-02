const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zbscbvrklkntlbtefkgw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpic2NidnJrbGtudGxidGVma2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4ODM5MiwiZXhwIjoyMDY4NjY0MzkyfQ.0n2Us3XrsXZO2wAhAvUncuZL-bOt-1vELeiUMNQP1uk'
);

async function verifyTable() {
  console.log('Verifying if test_cursor_table was created...\n');
  
  const { data, error } = await supabase.rpc('mcp_execute_sql', {
    p_sql: "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name = 'test_cursor_table';"
  });
  
  if (error) {
    console.log('✗ Error:', error.message);
    return;
  }
  
  console.log('Response:', JSON.stringify(data, null, 2));
  
  if (data && data.success && data.rows && data.rows.length > 0) {
    console.log('\n✓ Table test_cursor_table EXISTS in Supabase!');
  } else {
    console.log('\n✗ Table test_cursor_table NOT FOUND');
    console.log('The CREATE TABLE command may not have executed properly.');
  }
}

verifyTable();



