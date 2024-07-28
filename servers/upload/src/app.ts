import express, { Application } from 'express';
import errorMiddleware from './shared/global/helpers/error-middleware';
import uploadRouter from './routes/upload-routes';

const app: Application = express();

app.use(uploadRouter);

app.use(errorMiddleware);

export default app;
