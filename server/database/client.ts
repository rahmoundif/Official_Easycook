// Get variables from .env file for database connection
import { Pool } from "pg";

// Use DATABASE_URL for Supabase Pooler connection (Vercel optimized)
const client = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL configuration for Supabase (always required)
  ssl: { rejectUnauthorized: false },
  // Serverless optimizations for Vercel
  max: 1, // Reduced for serverless (Vercel functions are stateless)
  idleTimeoutMillis: 0, // No idle connections in serverless
  connectionTimeoutMillis: 10000, // 10 second timeout
  allowExitOnIdle: true, // Allow process to exit when no connections
});

// Ready to export
export default client;

// Types export
import type { PoolClient, QueryResult } from "pg";

type DatabaseClient = Pool;
type Result = QueryResult;
type Rows = QueryResult["rows"];

export type { DatabaseClient, Result, Rows };
