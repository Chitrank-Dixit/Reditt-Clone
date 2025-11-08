
// FIX: The import assignment `import express = require('express')` is not compatible with
// the project's ECMAScript module target. Changed to a default import.
// This single change resolves the type errors on lines 5, 19, and 25.
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './db';
import apiRoutes from './routes/api';

const app: express.Express = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Reddit Clone API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
