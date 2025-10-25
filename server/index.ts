import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth';
import { experimentsRouter } from './routes/experiments';
import { userRouter } from './routes/users';
import { coursesRouter } from './routes/courses';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Supabase client initialization
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

app.use(cors());
app.use(express.json());

// Auth middleware
app.use(authMiddleware);

// Routes
app.use('/api/experiments', experimentsRouter);
app.use('/api/users', userRouter);
app.use('/api/courses', coursesRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
