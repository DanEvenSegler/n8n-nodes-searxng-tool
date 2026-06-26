import type {
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class SearxngApi implements ICredentialType {
	name = 'searxngApi';

	displayName = 'SearXNG API';

	icon: Icon = { light: 'file:../icons/searxng.png', dark: 'file:../icons/searxng.png' };

	documentationUrl = 'https://docs.searxng.org/dev/search_api.html';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://localhost:8080',
			placeholder: 'e.g. http://localhost:8080',
			description: 'The URL of your SearXNG instance.',
			required: true,
		},
		{
			displayName: 'Authentication Type',
			name: 'authType',
			type: 'options',
			options: [
				{
					name: 'None',
					value: 'none',
				},
				{
					name: 'Basic Auth',
					value: 'basicAuth',
				},
				{
					name: 'API Key',
					value: 'apiKey',
				},
			],
			default: 'none',
			description: 'The authentication method required by your SearXNG instance proxy.',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					authType: ['basicAuth'],
				},
			},
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			displayOptions: {
				show: {
					authType: ['basicAuth'],
				},
			},
			required: true,
		},
		{
			displayName: 'Header Name',
			name: 'headerName',
			type: 'string',
			default: 'X-API-KEY',
			placeholder: 'e.g. X-API-KEY',
			description: 'HTTP header name to send the API key in.',
			displayOptions: {
				show: {
					authType: ['apiKey'],
				},
			},
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			displayOptions: {
				show: {
					authType: ['apiKey'],
				},
			},
			required: true,
		},
	];
}
