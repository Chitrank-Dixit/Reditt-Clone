import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './db';
import apiRoutes from './routes/api';
import './types'; // For Express Request type augmentation

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
// FIX: Correctly use express.json() middleware. The previous error was due to type resolution issues.
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// FIX: Remove explicit Request and Response types to allow for correct type inference from Express.
app.get('/', (req, res) => {
  res.send('Reddit Clone API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
