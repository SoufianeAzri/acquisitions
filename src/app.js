import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '#routes/auth.routes.js';
import securityMiddleware from '#middleware/security.middleware.js';

const app = express();

// make the app secure from various HTTP Requests
app.use(helmet());

// Handle Corses
app.use(cors());

// Using Morgan library to Tracking user requests data
// 1 - Parses incoming JSON request bodies.
app.use(express.json());

// 2 - Parses URL-encoded form data (HTML forms).
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

app.use(securityMiddleware)

app.get('/', (req, res) => {
  logger.info('Hello from Acquisitions !');
  res.status(200).send('Hello From Acquisitions');
});

app.get('/health', (req, res) => {
  res
    .status(200)
    .json({
      status: 'Ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
});

app.get('/api', (req, res)=> {
  res.status(200).json({message: 'Acquisitions Api is runing !'})
})

app.use('/api/auth', authRoutes);

export default app;
