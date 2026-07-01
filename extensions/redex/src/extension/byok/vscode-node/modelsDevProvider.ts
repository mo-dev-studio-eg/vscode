/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Redex Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { IConfigurationService } from '../../../platform/configuration/common/configurationService';
import { ILogService } from '../../../platform/log/common/logService';
import { IFetcherService } from '../../../platform/networking/common/fetcherService';
import { IExperimentationService } from '../../../platform/telemetry/common/nullExperimentationService';
import { IInstantiationService } from '../../../util/vs/platform/instantiation/common/instantiation';
import { AbstractOpenAICompatibleLMProvider } from './abstractLanguageModelChatProvider';
import { IBYOKStorageService } from './byokStorageService';

/**
 * ModelsDev Provider for Redex
 * Automatically discovers and loads OpenAI-compatible models from models.dev
 * API: https://models.dev
 */
export class ModelsDevLMProvider extends AbstractOpenAICompatibleLMProvider {

	public static readonly providerName = 'Models.dev';
	public static readonly providerId = 'modelsdev';

	constructor(
		byokStorageService: IBYOKStorageService,
		@IFetcherService fetcherService: IFetcherService,
		@ILogService logService: ILogService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IConfigurationService configurationService: IConfigurationService,
		@IExperimentationService expService: IExperimentationService
	) {
		super(
			ModelsDevLMProvider.providerId,
			ModelsDevLMProvider.providerName,
			{}, // knownModels
			byokStorageService,
			fetcherService,
			logService,
			instantiationService,
			configurationService,
			expService
		);
	}

	protected override getModelsBaseUrl(): string {
		return 'https://models.dev/api/v1';
	}

	/**
	 * Override to fetch models from models.dev
	 */
	async getAvailableModels(): Promise<{ id: string; name: string }[]> {
		try {
			// Fetch models list from models.dev
			const response = await this._fetcherService.fetch('https://models.dev/models.json', {
				method: 'GET',
				callSite: 'modelsdev-available-models'
			});

			if (!response.ok) {
				this._logService.warn(`ModelsDev: failed to fetch models, status: ${response.status}`);
				return [];
			}

			const data = await response.json();
			const models: { id: string; name: string }[] = [];

			if (Array.isArray(data)) {
				for (const model of data) {
					if (model.id && model.display_name) {
						models.push({
							id: model.id,
							name: model.display_name
						});
					}
				}
			}

			this._logService.info(`ModelsDev: discovered ${models.length} models`);
			return models;
		} catch (error) {
			this._logService.warn(`ModelsDev: failed to discover models: ${error}`);
			return [];
		}
	}
}