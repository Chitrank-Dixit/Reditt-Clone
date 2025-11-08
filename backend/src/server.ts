// FIX: Switched to default and named imports for express to resolve type errors.
// This ensures that express types like 'Request' and 'Response' do not clash
// with other types and are correctly recognized.
import express, { Request, Response, Express } from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './db';
import apiRoutes from './routes/api';

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Reddit Clone API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});