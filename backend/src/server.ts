// FIX: Unify express imports and explicitly import Request and Response to resolve type conflicts.
import express from 'express';
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

// FIX: Explicitly type Request and Response to resolve type ambiguity that was causing errors in middleware type checking.
app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Reddit Clone API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
