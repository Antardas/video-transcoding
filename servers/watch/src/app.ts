import express, { Application } from 'express';
import cors from 'cors';
import errorMiddleware from './shared/global/helpers/error-middleware';
import videosRoutes from './routes/get-videos-routes';
import { setupConsumer } from './shared/services/kafka/setupConsumer';
import { elasticSearch } from './shared/services/elasticsearch';
import { ELASTIC_SEARCH_INDEX_NAME } from './shared/global/helpers/CONSTANT';

const app: Application = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

(async () => {
	await setupConsumer();
	await elasticSearch.createIndex(ELASTIC_SEARCH_INDEX_NAME);
	app.use(videosRoutes);
	app.use(errorMiddleware);
})();

export default app;
