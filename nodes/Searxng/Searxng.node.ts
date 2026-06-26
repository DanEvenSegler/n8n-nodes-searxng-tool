import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

export class Searxng implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SearXNG',
		name: 'searxng',
		icon: 'file:searxng.png',
		group: ['transform'],
		version: 1,
		description: 'Perform web searches using a SearXNG instance.',
		defaults: {
			name: 'SearXNG',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'searxngApi',
				required: true,
			},
		],
		// @ts-ignore
		usableAsTool: true,
		properties: [
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				placeholder: 'e.g. n8n workflow automation',
				required: true,
				description: 'The search query string. Supports advanced search syntax (e.g. site:github.com).',
			},
			{
				displayName: 'Categories',
				name: 'categories',
				type: 'multiOptions',
				options: [
					{ name: 'General', value: 'general' },
					{ name: 'News', value: 'news' },
					{ name: 'Science', value: 'science' },
					{ name: 'IT', value: 'it' },
					{ name: 'Images', value: 'images' },
					{ name: 'Videos', value: 'videos' },
					{ name: 'Maps', value: 'map' },
					{ name: 'Music', value: 'music' },
					{ name: 'Social Media', value: 'social_media' },
					{ name: 'Files', value: 'files' },
				],
				default: ['general'],
				description: 'The categories of search results to retrieve.',
			},
			{
				displayName: 'Time Range',
				name: 'timeRange',
				type: 'options',
				options: [
					{ name: 'Any Time', value: 'any' },
					{ name: 'Past Day', value: 'day' },
					{ name: 'Past Week', value: 'week' },
					{ name: 'Past Month', value: 'month' },
					{ name: 'Past Year', value: 'year' },
				],
				default: 'any',
				description: 'Filter results by a specific time range.',
			},
			{
				displayName: 'Page Number',
				name: 'pageno',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				description: 'The page number of the search results to retrieve.',
			},
			{
				displayName: 'Safe Search',
				name: 'safeSearch',
				type: 'options',
				options: [
					{ name: 'Off', value: '0' },
					{ name: 'Moderate', value: '1' },
					{ name: 'Strict', value: '2' },
				],
				default: '1',
				description: 'Filter explicit content from the search results.',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'HTTP Method',
						name: 'method',
						type: 'options',
						options: [
							{ name: 'GET', value: 'GET' },
							{ name: 'POST', value: 'POST' },
						],
						default: 'GET',
						description: 'The HTTP method to query SearXNG. POST is more private but might not be supported by all instances.',
					},
					{
						displayName: 'Engines',
						name: 'engines',
						type: 'string',
						default: '',
						placeholder: 'e.g. google,bing,wikipedia',
						description: 'Comma-separated list of specific search engines to query (overrides defaults).',
					},
					{
						displayName: 'Language',
						name: 'language',
						type: 'string',
						default: '',
						placeholder: 'e.g. en-US, de-DE',
						description: 'Language code for search results.',
					},
					{
						displayName: 'Image Proxy',
						name: 'imageProxy',
						type: 'boolean',
						default: false,
						description: 'Whether to proxy image search results through the SearXNG instance (rewrites URLs).',
					},
					{
						displayName: 'Preferences String',
						name: 'preferences',
						type: 'string',
						default: '',
						placeholder: 'e.g. eJx1WEn...',
						description: 'The base64 encoded user preferences string from SearXNG preferences page.',
					},
					{
						displayName: 'Private Engine Tokens',
						name: 'engineTokens',
						type: 'string',
						default: '',
						placeholder: 'e.g. token1,token2',
						description: 'Comma-separated access tokens for private or restricted engines configured on your SearXNG instance.',
					},
					{
						displayName: 'Theme',
						name: 'theme',
						type: 'string',
						default: '',
						placeholder: 'e.g. simple',
						description: 'The theme layout to request from the SearXNG instance.',
					},
					{
						displayName: 'Results on New Tab',
						name: 'resultsOnNewTab',
						type: 'boolean',
						default: false,
						description: 'Whether results should indicate they should open in new tabs.',
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 10,
						description: 'The maximum number of search results to return.',
					},
					{
						displayName: 'Raw Response',
						name: 'rawResponse',
						type: 'boolean',
						default: false,
						description: 'Whether to return the complete raw JSON response from SearXNG instead of structured search results.',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Fetch credentials
		const credentials = await this.getCredentials('searxngApi');
		if (!credentials) {
			throw new NodeOperationError(this.getNode(), 'No credentials provided for SearXNG API.');
		}

		const rawBaseUrl = credentials.baseUrl as string;
		if (!rawBaseUrl) {
			throw new NodeOperationError(this.getNode(), 'Base URL is missing in SearXNG API credentials.');
		}

		// Ensure Base URL is properly formatted
		let baseUrl = rawBaseUrl.trim();
		if (!/^https?:\/\//i.test(baseUrl)) {
			baseUrl = `http://${baseUrl}`;
		}
		// Strip trailing slash
		baseUrl = baseUrl.replace(/\/+$/, '');

		const authType = credentials.authType as string;
		const headers: IDataObject = {
			'Accept': 'application/json',
		};

		// Apply authentication based on auth type
		if (authType === 'basicAuth') {
			const username = credentials.username as string;
			const password = credentials.password as string;
			const authBuffer = Buffer.from(`${username}:${password}`).toString('base64');
			headers['Authorization'] = `Basic ${authBuffer}`;
		} else if (authType === 'apiKey') {
			const headerName = (credentials.headerName as string) || 'X-API-KEY';
			headers[headerName] = credentials.apiKey as string;
		}

		for (let i = 0; i < items.length; i++) {
			try {
				const query = this.getNodeParameter('query', i, '') as string;
				if (!query) {
					throw new NodeOperationError(this.getNode(), 'Search query is required.');
				}

				const categories = this.getNodeParameter('categories', i, []) as string[];
				const timeRange = this.getNodeParameter('timeRange', i, 'any') as string;
				const pageno = this.getNodeParameter('pageno', i, 1) as number;
				const safeSearch = this.getNodeParameter('safeSearch', i, '1') as string;

				const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
				const method = (additionalOptions.method as string) || 'GET';
				const engines = (additionalOptions.engines as string) || '';
				const language = (additionalOptions.language as string) || '';
				const imageProxy = (additionalOptions.imageProxy as boolean) || false;
				const preferences = (additionalOptions.preferences as string) || '';
				const engineTokens = (additionalOptions.engineTokens as string) || '';
				const theme = (additionalOptions.theme as string) || '';
				const resultsOnNewTab = (additionalOptions.resultsOnNewTab as boolean) || false;
				const limit = (additionalOptions.limit as number) || 10;
				const rawResponse = (additionalOptions.rawResponse as boolean) || false;

				// Prepare query parameters
				const qs: IDataObject = {
					q: query,
					format: 'json',
					pageno: pageno,
					safesearch: safeSearch,
				};

				if (categories && categories.length > 0) {
					qs.categories = categories.join(',');
				}

				if (timeRange && timeRange !== 'any') {
					qs.time_range = timeRange;
				}

				if (engines) {
					qs.engines = engines;
				}

				if (language) {
					qs.language = language;
				}

				if (imageProxy) {
					qs.image_proxy = 1;
				}

				if (preferences) {
					qs.preferences = preferences;
				}

				if (engineTokens) {
					qs.tokens = engineTokens;
				}

				if (theme) {
					qs.theme = theme;
				}

				if (resultsOnNewTab) {
					qs.results_on_new_tab = 1;
				}

				// Execute request
				const requestOptions: any = {
					method,
					url: `${baseUrl}/search`,
					headers,
					json: true,
				};

				if (method === 'POST') {
					requestOptions.form = qs;
				} else {
					requestOptions.qs = qs;
				}

				const response = await this.helpers.httpRequest(requestOptions);

				if (rawResponse) {
					returnData.push({
						json: response as IDataObject,
						pairedItem: { item: i },
					});
				} else {
					// Clean and filter results
					const results = (response.results || []) as IDataObject[];
					const slicedResults = results.slice(0, limit);

					for (const result of slicedResults) {
						returnData.push({
							json: {
								title: result.title || '',
								url: result.url || '',
								content: result.content || result.snippet || '',
								engine: result.engine || '',
							},
							pairedItem: { item: i },
						});
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message || error,
						},
						pairedItem: { item: i },
					});
				} else {
					if (error.context) {
						error.context.itemIndex = i;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex: i,
					});
				}
			}
		}

		return [returnData];
	}
}
