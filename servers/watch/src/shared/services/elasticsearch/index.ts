import { Client } from '@elastic/elasticsearch';
import createLogger from '../../global/helpers/logger';
import { Video } from '../db/schema';
class ElasticSearch {
	private client: Client;
	private logger = createLogger('ElasticSearch');
	constructor() {
		const endpoint = process.env.ELASTICSEARCH_ENDPOINT;
		const apiKey = process.env.ELASTICSEARCH_API_KEY;
		this.logger.info(endpoint);
		this.logger.info(apiKey);

		if (!endpoint || !apiKey) {
			this.logger.info('Endpoint or API key is not exist');
			throw new Error('Endpoint or API key is not exist');
		}
		this.client = new Client({
			node: endpoint,
			auth: {
				apiKey: apiKey,
			},
		});
	}

	async createIndex(indexName: string): Promise<void> {
		const exist = await this.client.indices.exists({ index: indexName });
		if (exist) {
			this.logger.info(`Index '${indexName}' already exists.`);
		} else {
			await this.client.indices.create({
				index: indexName,
				mappings: {
					properties: {
						title: {
							type: 'text',
							index: true,
						},
						id: {
							type: 'double',
							index: false,
						},
						description: {
							type: 'text',
							index: true,
						},
						url: {
							type: 'text',
							index: false,
						},
					},
				},
			});
			this.logger.info(`Index '${indexName}' created.`);
		}
	}

	async indexVideoDocument(indexName: string, data: Video): Promise<boolean> {
		try {
			await this.client.index({
				index: indexName,
				id: `${data.id}`,
				body: {
					title: data.title,
					description: data.description,
					url: data.url,
					id: data.id
				},
			});
			return true;
		} catch (error) {
			return false;
		}
	}

	async searchVideos(indexName: string, searchText: string) {
		const result = await this.client.search({
			index: indexName,
			body: {
				query: {
					multi_match: {
						query: searchText,
						fields: ['title', 'description'],
						fuzziness: 'AUTO',
					},
				},
			},
		});
		console.log(JSON.stringify(result));
		
		return result.hits.hits.map((hit) => hit._source);
	}
}

export const elasticSearch = new ElasticSearch();
