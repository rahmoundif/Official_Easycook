// Get variables from .env file for database connection
import { Pool } from "pg";

// Use DATABASE_URL for Supabase Pooler connection (Vercel optimized)
const client = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL configuration for Supabase (always required)
  ssl: { rejectUnauthorized: false },
});

// Prevent process crash on transient connection errors
client.on("error", (err) => {
  // Common transient error: {:shutdown, :client_termination}
  console.error("Postgres pool error:", err?.message || err);
});

// Ready to export
export default client;

// Types export
import type { PoolClient, QueryResult } from "pg";

type DatabaseClient = Pool;
type Result = QueryResult;
type Rows = QueryResult["rows"];

export type { DatabaseClient, Result, Rows };
