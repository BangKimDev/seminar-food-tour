import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/validate.js';
import prisma from './config/database.js';

const app = express();

const corsOrigins = [
  ...config.frontendUrl.split(',').filter(Boolean),
  ...config.ngrokUrls.split(',').filter(Boolean),
];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api', routes);

app.use(errorHandler);

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected');

    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
