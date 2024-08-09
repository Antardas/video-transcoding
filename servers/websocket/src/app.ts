import express, { Application } from 'express';

import cors from 'cors';
import errorMiddleware from './shared/global/helpers/error-middleware';

const app: Application = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use(errorMiddleware);

export default app;
