import express, { Application } from 'express';
import cors from 'cors';
import errorMiddleware from './shared/global/helpers/error-middleware';
import videRoutes from './routes/get-videos-routes';

const app: Application = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use(videRoutes);

app.use(errorMiddleware);

export default app;
