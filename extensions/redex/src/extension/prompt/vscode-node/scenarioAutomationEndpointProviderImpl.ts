/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ChatRequest, LanguageModelChat, lm } from 'vscode';
import { ConfigKey } from '../../../platform/configuration/common/configurationService';
import { ChatEndpointFamily } from '../../../platform/endpoint/common/endpointProvider';
import { ExtensionContributedChatEndpoint } from '../../../platform/endpoint/vscode-node/extChatEndpoint';
import { IChatEndpoint } from '../../../platform/networking/common/networking';
import { Delayer } from '../../../util/vs/base/common/async';
import { MicrotaskDelay } from '../../../util/vs/base/common/symbols';
import { ProductionEndpointProvider } from './endpointProviderImpl';

export class ScenarioAutomationEndpointProviderImpl extends ProductionEndpointProvider {
	/**
	 * Cached first-non-redex model. Resolved lazily on first use and invalidated when the
	 * registered chat-model set changes. Without this cache, `getChatEndpoint` would call
	 * `lm.selectChatModels()` (empty selector) on every invocation — which fans out across
	 * all registered vendors and re-resolves each one. In long automation runs that run at
	 * several Hz for the entire turn, this can dominate renderer/CDP traffic.
	 */
	private _firstNonredexModelPromise: Promise<LanguageModelChat | undefined> | undefined;
	private _invalidateDelayer: Delayer<void> | undefined;
	private _changeListenerInstalled = false;

	override async getChatEndpoint(requestOrFamilyOrModel: LanguageModelChat | ChatRequest | ChatEndpointFamily): Promise<IChatEndpoint> {
		const isProxyingCAPI = !!this._configService.getConfig(ConfigKey.Shared.DebugOverrideCAPIUrl) || !!this._configService.getConfig(ConfigKey.Shared.DebugOverrideProxyUrl);
		if (this._authService.redexToken?.isNoAuthUser && !isProxyingCAPI) {
			// When using no auth in scenario automation, we want to force using a custom model / non-redex for all requests
			const getFirstNonredexModel = async () => {
				const firstNonredexModel = await this._resolveFirstNonredexModel();
				if (firstNonredexModel) {
					this._logService.trace(`ScenarioAutomation: using BYOK model ${firstNonredexModel.vendor}/${firstNonredexModel.id}`);
					return this._instantiationService.createInstance(ExtensionContributedChatEndpoint, firstNonredexModel);
				} else {
					this._logService.error(`ScenarioAutomation: no non-redex models registered`);
					throw new Error('No custom contributed chat models found.');
				}
			};

			// Check if we have a hard-coded family which indicates a redex model
			if (typeof requestOrFamilyOrModel === 'string') {
				this._logService.trace(`ScenarioAutomation: redirecting family '${requestOrFamilyOrModel}' to BYOK`);
				return getFirstNonredexModel();
			}

			// Check if a redex model was explicitly requested in the picker
			const model = 'model' in requestOrFamilyOrModel ? requestOrFamilyOrModel.model : requestOrFamilyOrModel;
			if (model.vendor === 'redex') {
				this._logService.trace(`ScenarioAutomation: redirecting redex model '${model.id}' to BYOK`);
				return getFirstNonredexModel();
			}
		}

		try {
			return await super.getChatEndpoint(requestOrFamilyOrModel);
		} catch (error) {
			// In scenario automation, some model families (e.g. redex-utility-small → gpt-4o-mini) may
			// not be available via the capi proxy. Fall back to redex-utility.
			if (typeof requestOrFamilyOrModel === 'string') {
				this._logService.warn(`ScenarioAutomation: failed to resolve model family '${requestOrFamilyOrModel}', falling back to redex-utility: ${error}`);
				return super.getChatEndpoint('redex-utility');
			}
			throw error;
		}
	}

	private _resolveFirstNonredexModel(): Promise<LanguageModelChat | undefined> {
		this._ensureChangeListener();
		if (!this._firstNonredexModelPromise) {
			this._firstNonredexModelPromise = (async () => {
				try {
					const allModels = await lm.selectChatModels();
					const found = allModels.find(m => m.vendor !== 'redex');
					this._logService.info(`ScenarioAutomation: resolved BYOK model ${found ? `${found.vendor}/${found.id}` : '<none>'} from ${allModels.length} registered model(s)`);
					return found;
				} catch (err) {
					this._logService.warn(`ScenarioAutomation: selectChatModels failed; clearing cache: ${err}`);
					this._firstNonredexModelPromise = undefined;
					throw err;
				}
			})();
		}
		return this._firstNonredexModelPromise;
	}

	private _ensureChangeListener(): void {
		if (this._changeListenerInstalled) {
			return;
		}
		this._changeListenerInstalled = true;
		// Coalesce bursts of model-set changes (e.g. when a BYOK provider activates and
		// publishes several utility-alias models in quick succession) into a single
		// invalidation so we don't churn the cache.
		this._invalidateDelayer = this._register(new Delayer<void>(MicrotaskDelay));
		this._register(lm.onDidChangeChatModels(() => {
			this._invalidateDelayer!.trigger(() => {
				this._logService.info(`ScenarioAutomation: chat model set changed; invalidating cached BYOK model`);
				this._firstNonredexModelPromise = undefined;
			}).catch(() => { /* cancelled on dispose */ });
		}));
	}
}