import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

const schema = path.join(__dirname, "../database/schema.sql");

const migrate = async () => {
  try {
    const sql = fs.readFileSync(schema, "utf8");
    
    const client = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.query(sql);
    await client.end();

    console.info("Database schema updated successfully 🆙");
  } catch (err) {
    console.error("Error updating the database:", err);
  }
};

migrate();