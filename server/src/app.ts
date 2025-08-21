// Load the express module to create a web application

import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.get("/", (req, res) => res.send("I guess it's working right ?"));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Headers:`, req.headers);
  next();
});
// Configure it

/* ************************************************************************* */

// CORS Handling: Why is the current code present and do I need to define specific allowed origins for my project?

// CORS (Cross-Origin Resource Sharing) is a security mechanism in web browsers that blocks requests from a different domain than the server.
// You may find the following magic line in forums:

// app.use(cors());

// You should NOT do that: such code uses the `cors` module to allow all origins, which can pose security issues.
// For this pedagogical template, the CORS code allows CLIENT_URL in development mode (when process.env.CLIENT_URL is defined).

import cors from "cors";
import { csrfProtection } from "./modules/middleware/csrf";

// CORS configuration (supports multiple origins via CLIENT_URLS comma list)
const baseOrigins = [
  process.env.CLIENT_URLS, // comma separated list optional
  process.env.CLIENT_URL,
  "http://localhost:3000",
].filter(Boolean) as string[];

const allowedOrigins = baseOrigins
  .flatMap((o) => o.split(","))
  .map((o) => o.trim())
  .filter(Boolean);

// Helper to log once for diagnostics (especially for iOS issues)
console.log("CORS allowed origins:", allowedOrigins);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // same-origin or mobile webview
    if (
      allowedOrigins.includes(origin) ||
      /https?:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
    ) {
      return callback(null, true);
    }
    console.warn("CORS blocked origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  exposedHeaders: ["X-CSRF-Token"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Lightweight debug endpoint to inspect headers & cookie presence (remove in production if not needed)
app.get("/debug/origin", (req, res) => {
  res.json({
    origin: req.headers.origin,
    referer: req.headers.referer,
    cookiePresent: Boolean(req.headers.cookie),
    allowedOrigins,
  });
});

// Parse cookies for auth (HTTP-only JWT)
app.use(cookieParser());

// CSRF protection (double-submit cookie)
app.use(csrfProtection);

/* ************************************************************************* */

// Request Parsing: Understanding the purpose of this part

// Request parsing is necessary to extract data sent by the client in an HTTP request.
// For example to access the body of a POST request.
// The current code contains different parsing options as comments to demonstrate different ways of extracting data.

// 1. `express.json()`: Parses requests with JSON data.
// 2. `express.urlencoded()`: Parses requests with URL-encoded data.
// 3. `express.text()`: Parses requests with raw text data.
// 4. `express.raw()`: Parses requests with raw binary data.

// Uncomment one or more of these options depending on the format of the data sent by your client:
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ************************************************************************* */

// Import the API router
import router from "./router";

// Mount the API router under the "/api" endpoint
app.use(router);

/* ************************************************************************* */

// Middleware for Error Logging
// Important: Error-handling middleware should be defined last, after other app.use() and routes calls.

import type { ErrorRequestHandler } from "express";
import { env } from "node:process";

// Define a middleware function to log errors
const logErrors: ErrorRequestHandler = (err, req, res, next) => {
  // Log the error to the console for debugging purposes
  console.error('Error occurred:', err);
  console.error("on req:", req.method, req.path);
  console.error("Error stack:", err.stack);

  // Send error response
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message,
    path: req.path 
  });
};

// Mount the logErrors middleware globally
app.use(logErrors);

/* ************************************************************************* */

export default app;
