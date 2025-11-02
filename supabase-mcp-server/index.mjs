import { createClient } from '@supabase/supabase-js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import pg from 'pg';
const { Pool } = pg;

// Load .env located alongside this file (works when launched from Cursor)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Get environment variables (from .env file OR from Cursor's mcp.json)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || (!SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_ANON_KEY)) {
  console.error('[MCP] ERROR: Missing required environment variables');
  console.error('[MCP] SUPABASE_URL:', SUPABASE_URL ? '✓ Set' : '✗ Missing');
  console.error('[MCP] SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing');
  console.error('[MCP] SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
  console.error('[MCP] Check .cursor/mcp.json env configuration');
  process.exit(1);
}

console.error('[MCP] Successfully loaded Supabase configuration');

const supabaseKey = SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const server = new McpServer({ 
  name: 'supabase-mcp', 
  version: '0.1.0',
  capabilities: {
    tools: {}
  }
});

// Create Postgres connection pool if DATABASE_URL is available
let pgPool = null;
if (process.env.DATABASE_URL) {
  try {
    // Decode URL-encoded password in connection string
    const dbUrl = process.env.DATABASE_URL.replace(/%40/g, '@');
    console.error('[MCP] Initializing Postgres pool with DATABASE_URL');
    pgPool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });
    // Test connection
    pgPool.query('SELECT 1').then(() => {
      console.error('[MCP] Postgres connection pool initialized successfully');
    }).catch(err => {
      console.error('[MCP] Postgres connection failed:', err.message);
    });
  } catch (error) {
    console.error('[MCP] Failed to create Postgres pool:', error.message);
  }
} else {
  console.error('[MCP] DATABASE_URL not found in environment variables');
}

// Schemas
const selectSchema = z.object({
  table: z.string(),
  columns: z.array(z.string()).optional(),
  match: z.any().optional(),
  limit: z.number().int().positive().max(1000).optional(),
  orderBy: z
    .object({ column: z.string(), ascending: z.boolean().default(true) })
    .optional(),
});

const mutateSchema = z.object({
  table: z.string(),
  values: z.any(),
  match: z.any().optional(),
});

const rpcSchema = z.object({ 
  fn: z.string(), 
  args: z.any().optional().default({})
});

const storageListSchema = z.object({
  bucket: z.string(),
  path: z.string().default(''),
  limit: z.number().int().positive().max(1000).default(100),
});

// Tools
server.tool(
  'supabase.select',
  { description: 'Select rows from a table with optional match and ordering', inputSchema: selectSchema },
  async (input) => {
    const { table, columns = ['*'], match, limit = 100, orderBy } = input;
    const cols = Array.isArray(columns) ? columns.join(',') : '*';
    let q = supabase.from(table).select(cols).limit(limit);
    if (match && typeof match === 'object') q = q.match(match);
    if (orderBy) q = q.order(orderBy.column, { ascending: orderBy.ascending !== false });
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return { data };
  }
);

server.tool(
  'supabase.insert',
  { description: 'Insert one or more rows into a table', inputSchema: mutateSchema },
  async (input) => {
    const { table, values } = input;
    const payload = Array.isArray(values) ? values : [values];
    const { data, error } = await supabase.from(table).insert(payload).select('*');
    if (error) throw new Error(error.message);
    return { data };
  }
);

server.tool(
  'supabase.update',
  { description: 'Update rows in a table using match criteria', inputSchema: mutateSchema },
  async (input) => {
    const { table, values, match } = input;
    if (!match) throw new Error('match is required for update');
    const { data, error } = await supabase.from(table).update(values).match(match).select('*');
    if (error) throw new Error(error.message);
    return { data };
  }
);

server.tool(
  'supabase.delete',
  { description: 'Delete rows from a table using match criteria', inputSchema: mutateSchema.pick({ table: true, match: true }) },
  async (input) => {
    const { table, match } = input;
    if (!match) throw new Error('match is required for delete');
    const { data, error } = await supabase.from(table).delete().match(match).select('*');
    if (error) throw new Error(error.message);
    return { data };
  }
);

server.tool(
  'supabase.rpc',
  { description: 'Invoke a Postgres function (RPC)', inputSchema: rpcSchema },
  async (input) => {
    const { fn, args } = input;
    const rpcArgs = args || {};
    try {
      const { data, error } = await supabase.rpc(fn, rpcArgs);
      if (error) throw new Error(error.message);
      return { data };
    } catch (error) {
      throw new Error(`RPC error: ${error.message}`);
    }
  }
);

// SQL execution via RPC function (works without direct DB connection)
server.tool(
  'supabase.executeSQL',
  { 
    description: 'Execute SQL queries via RPC function (works through REST API - no direct DB connection needed)', 
    inputSchema: z.object({ 
      sql: z.string().describe('SQL query to execute'),
    }) 
  },
  async (input) => {
    const { sql } = input;
    
    if (!sql || !sql.trim()) {
      return {
        success: false,
        error: 'SQL query cannot be empty'
      };
    }
    
    try {
      console.error(`[MCP] Executing SQL via RPC: ${sql.substring(0, 100)}...`);
      
      // Call the mcp_execute_sql RPC function
      const { data, error } = await supabase.rpc('mcp_execute_sql', { p_sql: sql });
      
      if (error) {
        console.error(`[MCP] RPC error: ${error.message}`);
        return {
          success: false,
          error: error.message,
          hint: error.message.includes('function') || error.message.includes('does not exist') 
            ? 'Make sure you ran mcp-execute-any-sql.sql in Supabase SQL Editor to create the function' 
            : undefined
        };
      }
      
      // If the function returns an error in the JSON response
      if (data && typeof data === 'object' && !data.success) {
        console.error(`[MCP] SQL execution failed: ${data.error}`);
        return {
          success: false,
          error: data.error || 'SQL execution failed',
          sqlstate: data.sqlstate,
          rowCount: data.rowCount || 0
        };
      }
      
      console.error(`[MCP] SQL executed successfully`);
      // Return the data from the RPC function
      return data || { 
        success: true, 
        message: 'SQL executed successfully',
        rowCount: 0
      };
    } catch (error) {
      console.error(`[MCP] Exception in executeSQL: ${error.message}`);
      console.error(`[MCP] Stack:`, error.stack);
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        rowCount: 0
      };
    }
  }
);

server.tool(
  'supabase.auth.getUserByEmail',
  { description: 'Admin: get user by email', inputSchema: z.object({ email: z.string().email() }) },
  async (input) => {
    try {
      const { data, error } = await supabase.auth.admin.getUserByEmail(input.email);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
);

server.tool(
  'supabase.storage.listBuckets',
  { description: 'List storage buckets', inputSchema: z.object({}) },
  async () => {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw new Error(error.message);
    return { buckets: data };
  }
);

server.tool(
  'supabase.storage.listObjects',
  { description: 'List objects in a bucket and path', inputSchema: storageListSchema },
  async (input) => {
    const { bucket, path: p, limit } = input;
    const { data, error } = await supabase.storage.from(bucket).list(p, { limit });
    if (error) throw new Error(error.message);
    return { objects: data };
  }
);

// Note: Direct SQL execution via DATABASE_URL is disabled due to connection issues
// Using RPC-based SQL execution (above) which works through REST API
if (pgPool) {
  console.error('[MCP] DATABASE_URL available but direct SQL tool disabled - using RPC method instead');
}

// Handle uncaught errors to prevent server crash
process.on('uncaughtException', (error) => {
  console.error('[MCP] Uncaught exception:', error.message);
  console.error('[MCP] Stack:', error.stack);
  // Don't exit - let the server continue running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[MCP] Unhandled rejection:', reason);
  // Don't exit - let the server continue running
});

// Start stdio transport for MCP
try {
  console.error('[MCP] Starting MCP server...');
  const transport = new StdioServerTransport();
  server.connect(transport);
  console.error('[MCP] MCP server connected successfully');
} catch (error) {
  console.error('[MCP] Failed to start server:', error.message);
  console.error('[MCP] Error stack:', error.stack);
  process.exit(1);
}


