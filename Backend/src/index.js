import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';

import itemsRouter from './routes/items.routes.js';
import authRouter from './routes/auth.js';
import organizationsRouter from './routes/organizations.routes.js';
import diagnosesRouter from './routes/diagnosis.routes.js';
import individualRouter from './routes/individual.routes.js';
import dashboardRouter, { psychologistDashboardRouter } from './routes/dashboard.routes.js';
import patientsRouter from './routes/patients.routes.js';
import triageRouter from './routes/triage.routes.js';
import { errorHandler } from './middleware/error.handler.js';

const app = express();

// Guard against unsupported Node versions (MongoDB driver/Mongoose)
const nodeMajor = Number(process.versions.node.split('.')[0]);
if (Number.isFinite(nodeMajor) && nodeMajor >= 22) {
    console.error('❌ Unsupported Node.js version detected:', process.versions.node, '\nPlease use Node 18.x or 20.x LTS.');
    process.exit(1);
}

// middleware
app.use(helmet());
// Permissive CORS: allow all origins, methods, and headers
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        optionsSuccessStatus: 204,
    })
);
app.use(express.json());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ✅ default route
app.get('/', (req, res) => {
    res.json({ app: 'Mental Health Triage Backend' });
});

// other routes
app.use('/api/items', itemsRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin/organizations', organizationsRouter);
app.use('/api/diagnoses', diagnosesRouter);
app.use('/api/admin/individuals', individualRouter);
app.use('/api/admin/dashboard', dashboardRouter);
app.use('/api/psychologist/dashboard', psychologistDashboardRouter);
app.use('/api/psychologist/patients', patientsRouter);
app.use('/api/psychologist/triage', triageRouter);

// health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// error handler
app.use(errorHandler);

// Connect to MongoDB then start server
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mental_health_triage';

mongoose
    .connect(MONGO_URI, { autoIndex: true })
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`✅ MHT_Backend running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });
