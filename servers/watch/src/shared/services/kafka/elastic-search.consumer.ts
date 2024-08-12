import { Video } from './../db/schema';
import { MessageBroker } from '.';
import { MessageType, SearchIndexEvents } from '../../../types';
import createLogger from '../../global/helpers/logger';
import { elasticSearch } from '../elasticsearch';
import { ELASTIC_SEARCH_INDEX_NAME } from '../../global/helpers/CONSTANT';

const logger = createLogger('elastic-search');
export function saveVideoToElasticSearch() {
	MessageBroker.subscribe('SearchIndexEvents', async (data: MessageType) => {
		if (data.event === SearchIndexEvents.ADD_TO_SEARCH_ENGINE) {
			try {
				logger.info('SearchIndexEvents');
				console.info(data);
				await elasticSearch.indexVideoDocument(
					ELASTIC_SEARCH_INDEX_NAME,
					data.data as Video
				);
			} catch (error) {
				logger.error(error);
			}
		}
	});
}
