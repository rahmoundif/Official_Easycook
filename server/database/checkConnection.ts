import client from "./client";

// Try to get a connection to the database
client
  .connect()
  .then((connection) => {
    console.info(`Database connected successfully via Supabase Pooler`);
    console.info(`Connection string: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'Supabase'}`);

    connection.release();
  })
  .catch((error: Error) => {
    console.warn(
      "Warning:",
      "Failed to establish a database connection.",
      "Please check your DATABASE_URL in the .env file for Supabase connection.",
    );
    console.warn(error.message);
  });
