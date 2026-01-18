import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import connectDB from './src/config/db.js';       // correct path from root
import sopRoutes from './src/routes/sopRoutes.js'; // correct path from root

process.setMaxListeners(15);

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect DB
await connectDB();

// routes
app.use('/api/sops', sopRoutes);

// health
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// multer error handler
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Max 10MB.' });
    }
  }
  if (error?.message?.includes('Only PDF')) {
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

export default app;
