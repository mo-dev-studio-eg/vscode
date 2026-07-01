/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Redex Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Abstract base class for creating custom providers in Redex.
 * Extend this class to easily create your own provider with custom API endpoints.
 *
 * @example
 * ```typescript
 * class MyCustomProvider extends AbstractCustomProvider {
 *   readonly providerId = 'my-custom';
 *   readonly providerName = 'My Custom Provider';
 *   readonly baseUrl = 'https://api.my-provider.com/v1';
 *
 *   async getModels(): Promise<CustomModel[]> {
 *     return [
 *       { id: 'my-model-1', name: 'My Model 1' },
 *       { id: 'my-model-2', name: 'My Model 2' }
 *     ];
 *   }
 * }
 * ```
 */

import { BYOKAuthType } from '../common/byokProvider';

export interface CustomModel {
	id: string;
	name: string;
	/** Optional: API key for this specific model (for per-model auth) */
	apiKey?: string;
	/** Optional: Custom endpoint for this model */
	baseUrl?: string;
	/** Optional: Supported features */
	capabilities?: {
		toolCalling?: boolean;
		vision?: boolean;
		thinking?: boolean;
		streaming?: boolean;
	};
}

export abstract class AbstractCustomProvider {
	/** Unique identifier for this provider */
	abstract readonly providerId: string;

	/** Display name for this provider */
	abstract readonly providerName: string;

	/** Base URL for the API endpoint */
	abstract readonly baseUrl: string;

	/** Authentication type - defaults to GlobalApiKey */
	authType: BYOKAuthType = BYOKAuthType.GlobalApiKey;

	/**
	 * Get the list of available models.
	 * Override this method to provide your own models list.
	 * If not overridden, the provider will use the /models endpoint from the base URL.
	 */
	async getModels(): Promise<CustomModel[]> {
		return [];
	}

	/**
	 * Test the connection to the provider.
	 * Override this to implement custom connection testing.
	 */
	async testConnection(): Promise<boolean> {
		return true;
	}

	/**
	 * Get custom headers to include in API requests.
	 * Override this to add provider-specific headers.
	 */
	getHeaders?(): Record<string, string>;

	/**
	 * Transform the request body for provider-specific formats.
	 * Override this if your provider requires a different format.
	 */
	transformRequest?(body: unknown): unknown {
		return body;
	}

	/**
	 * Transform the response for provider-specific formats.
	 * Override this if your provider returns a non-standard response format.
	 */
	transformResponse?(response: unknown): unknown {
		return response;
	}
}