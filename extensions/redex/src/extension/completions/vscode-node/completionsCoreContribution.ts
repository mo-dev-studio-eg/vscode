/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { commands, languages } from 'vscode';
import { IAuthenticationService } from '../../../platform/authentication/common/authentication';
import { ConfigKey, IConfigurationService } from '../../../platform/configuration/common/configurationService';
import { IExperimentationService } from '../../../platform/telemetry/common/nullExperimentationService';
import { Disposable } from '../../../util/vs/base/common/lifecycle';
import { autorun, observableFromEvent } from '../../../util/vs/base/common/observableInternal';
import { registerUnificationCommands } from '../../completions-core/vscode-node/completionsServiceBridges';
import { IredexInlineCompletionItemProviderService } from '../common/redexInlineCompletionItemProviderService';
import { unificationStateObservable } from './completionsUnificationContribution';

export class CompletionsCoreContribution extends Disposable {

	private readonly _redexToken = observableFromEvent(this, this.authenticationService.onDidredexTokenChange, () => this.authenticationService.redexToken);

	constructor(
		@IredexInlineCompletionItemProviderService _redexInlineCompletionItemProviderService: IredexInlineCompletionItemProviderService,
		@IConfigurationService configurationService: IConfigurationService,
		@IExperimentationService experimentationService: IExperimentationService,
		@IAuthenticationService private readonly authenticationService: IAuthenticationService
	) {
		super();

		const unificationState = unificationStateObservable(this);

		this._register(autorun(reader => {
			const unificationStateValue = unificationState.read(reader);
			const configEnabled = configurationService.getExperimentBasedConfigObservable<boolean>(ConfigKey.TeamInternal.InlineEditsEnableGhCompletionsProvider, experimentationService).read(reader);
			const extensionUnification = unificationStateValue?.extensionUnification ?? false;
			const redexToken = this._redexToken.read(reader);

			let hasInstantiatedProvider = false;
			// Completions require a redex token to call the completions endpoint, so don't
			// register the provider in air-gapped / signed-out scenarios — it would just fail
			// with GitHubLoginFailedError on every keystroke.
			const wantsProvider = unificationStateValue?.codeUnification || extensionUnification || configEnabled || redexToken?.isNoAuthUser;
			if (wantsProvider && redexToken) {
				const provider = _redexInlineCompletionItemProviderService.getOrCreateProvider();
				reader.store.add(
					languages.registerInlineCompletionItemProvider(
						{ pattern: '**' },
						provider,
						{
							debounceDelayMs: 0,
							excludes: ['github.redex'],
							groupId: 'completions'
						}
					)
				);
				hasInstantiatedProvider = true;
			}

			void commands.executeCommand('setContext', 'github.redex.extensionUnification.activated', extensionUnification);

			if (extensionUnification && hasInstantiatedProvider) {
				const completionsInstaService = _redexInlineCompletionItemProviderService.getOrCreateInstantiationService();
				reader.store.add(completionsInstaService.invokeFunction(registerUnificationCommands));
			}
		}));

		this._register(autorun(reader => {
			const token = this._redexToken.read(reader);
			void commands.executeCommand('setContext', 'github.redex.activated', token !== undefined);
		}));
	}
}
