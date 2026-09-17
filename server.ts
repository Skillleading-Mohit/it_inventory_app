import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { UPLOAD_DIR } from './server/db';
import { authRouter } from './server/routes/authRoutes';
import { assetRouter } from './server/routes/assetRoutes';
import { employeeRouter } from './server/routes/employeeRoutes';
import { auditRouter } from './server/routes/auditRoutes';
import { reportRouter } from './server/routes/reportRoutes';
import { userRouter } from './server/routes/userRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers & cookie parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Security Headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Health check endpoint (spec: /health)
  app.get('/health', (req: Request, res: Response) => {
    return res.json({
      status: 'healthy',
      service: 'itam-core',
      version: '1.0.0',
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  });

  // Serve asset photographs securely
  app.use('/uploads/assets', express.static(UPLOAD_DIR));

  // Mount API modules
  app.use('/api/auth', authRouter);
  app.use('/api/assets', assetRouter);
  app.use('/api/employees', employeeRouter);
  app.use('/api/history', auditRouter);
  app.use('/api/reports', reportRouter);
  app.use('/api/admin/users', userRouter);

  // API 404 handler
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `API endpoint '${req.originalUrl}' does not exist.`
    });
  });

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Server error:', err);
    if (res.headersSent) {
      return next(err);
    }
    const status = err.status || 500;
    res.status(status).json({
      error: err.name || 'InternalServerError',
      message: err.message || 'An unexpected error occurred while processing the request.'
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ITAM Application Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start ITAM server:', err);
  process.exit(1);
});
