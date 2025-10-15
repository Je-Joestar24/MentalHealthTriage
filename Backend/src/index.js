import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import itemsRouter from './routes/items.routes.js';
import { errorHandler } from './middleware/error.handler.js';

const app = express();

// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ✅ default route
app.get('/', (req, res) => {
    res.json({ app: 'Mental Health Triage Backend' });
});

// other routes
app.use('/api/items', itemsRouter);

// health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ MHT_Backend running on port ${PORT}`);
});
