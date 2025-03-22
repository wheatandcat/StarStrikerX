import express, { Request, Response, NextFunction } from 'express';
import { Server } from 'http';
import { log, setupVite, serveStatic } from './vite';
import { registerRoutes } from './routes';

async function main() {
  const app = express();
  
  // Create HTTP server
  const server = new Server(app);
  
  // JSON parsing middleware
  app.use(express.json());
  
  // Request logging
  app.use((req: Request, _res: Response, next: NextFunction) => {
    log(`${req.method} ${req.url}`);
    next();
  });
  
  // API Routes
  await registerRoutes(app);
  
  // Setup Vite for development
  await setupVite(app, server);
  
  // Serve static files - 開発モードではviteが処理するので不要
  // serveStatic(app);
  
  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message
    });
  });
  
  // Start server
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    log(`serving on port ${PORT}`);
  });
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});