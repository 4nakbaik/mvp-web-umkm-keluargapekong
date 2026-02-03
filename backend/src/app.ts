import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import productRoutes from './routes/product.routes';

const app: Application = express();

// Middleware
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logger

// Config CORS(penting ni ye buat communicate be-fe)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Routes
app.use('/api/v1/products', productRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

export default app;
