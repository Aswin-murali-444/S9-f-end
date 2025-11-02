// Quick script to test if MCP tools are registered
// Run this to see available Supabase MCP tools

console.log('Checking MCP server configuration...\n');

const env = {
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://zbscbvrklkntlbtefkgw.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:Aswin%402995Aswin%402995@db.zbscbvrklkntlbtefkgw.supabase.co:5432/postgres'
};

console.log('Environment variables:');
console.log('  SUPABASE_URL:', env.SUPABASE_URL ? '✓ Set' : '✗ Missing');
console.log('  SUPABASE_SERVICE_ROLE_KEY:', env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing');
console.log('  DATABASE_URL:', env.DATABASE_URL ? '✓ Set' : '✗ Missing');
console.log('');

if (env.DATABASE_URL) {
  const { Pool } = require('pg');
  const dbUrl = env.DATABASE_URL.replace(/%40/g, '@');
  console.log('Testing DATABASE_URL connection...');
  console.log('  Decoded URL:', dbUrl.replace(/:[^:@]+@/, ':****@'));
  
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  pool.query('SELECT 1 as test')
    .then(() => {
      console.log('  ✓ Connection successful!');
      console.log('\n✓ SQL execution tool should be available in MCP');
      pool.end();
    })
    .catch(err => {
      console.log('  ✗ Connection failed:', err.message);
      console.log('\n⚠ SQL execution tool will NOT be available');
      console.log('  Fix the DATABASE_URL connection string format');
      pool.end();
    });
}

