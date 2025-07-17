// Load environment variables for Vercel
import "dotenv/config";

// Import the Express application (without connection check for serverless)
import app from "../src/app";

// Export for Vercel serverless function
export default app;