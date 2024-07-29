import express, { Application } from 'express';
import errorMiddleware from './shared/global/helpers/error-middleware';
import uploadRouter from './routes/upload-routes';
import cors from 'cors';
const app: Application = express();

app.use(cors({ origin: '*' }));
app.use(express.json())

app.use(uploadRouter);

app.use(errorMiddleware);

export default app;
