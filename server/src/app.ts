// Load the express module to create a web application

import express from "express";

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

// CORS configuration using environment variables
const allowedOrigins: string[] = [
  process.env.CLIENT_URL || // Production client URL venant du .env
  'http://localhost:3000', // Local 
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['USE', 'GET', 'POST','PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
app.use(express.urlencoded());
app.use(express.text());
app.use(express.raw());

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
