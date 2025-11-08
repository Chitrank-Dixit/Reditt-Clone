
// FIX: To resolve Express typing issues, use `import = require()` syntax for CommonJS module compatibility.
// This corrects method overload resolution for `app.use` and ensures methods on `Response` (like `send`) are available.
import express = require('express');
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
