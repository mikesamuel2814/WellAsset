// Load dotenv in development (only if not in production)
// In production, environment variables are provided by systemd/system
if (process.env.NODE_ENV !== "production") {
  try {
    // Dynamic import for dotenv - won't be bundled in production build
    const dotenv = await import("dotenv");
    dotenv.config();
  } catch {
    // dotenv not available - use system env vars (production)
  }
}

// Import config AFTER environment variables are loaded
import "./config";

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";

// Simple logger function
const log = (...args: any[]) => {
  console.log(new Date().toLocaleTimeString('en-US', { hour12: false }), ...args);
};

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Health check endpoint for Docker and load balancers
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

(async () => {
  const server = await registerRoutes(app);

  // Serve attached_assets folder as static files
  const attachedAssetsPath = path.resolve(import.meta.dirname, '..', 'attached_assets');
  app.use('/attached_assets', express.static(attachedAssetsPath));

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV !== "production") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    // In production, serve static files from dist/public
    const publicPath = path.resolve(import.meta.dirname, "../dist/public");
    app.use(express.static(publicPath));
    
    // SPA catch-all route: serve index.html for all non-API routes
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  // Note: reusePort is not supported on Windows, so we use the standard listen method
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
