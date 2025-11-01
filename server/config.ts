// This file must be imported FIRST before any other imports that depend on environment variables
// NOTE: dotenv is loaded in server/index.ts before this file is imported
// In production, environment variables are provided by systemd/system environment
// This file just re-exports the environment variables that are already set

// Re-export commonly used env vars for convenience
export const DATABASE_URL = process.env.DATABASE_URL;
export const SESSION_SECRET = process.env.SESSION_SECRET || "your-secret-key-change-in-production";
export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = parseInt(process.env.PORT || "5000", 10);

