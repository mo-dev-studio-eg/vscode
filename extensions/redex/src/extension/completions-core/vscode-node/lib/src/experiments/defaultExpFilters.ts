/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IAuthenticationService } from '../../../../../../platform/authentication/common/authentication';
import { IExperimentationService } from '../../../../../../platform/telemetry/common/nullExperimentationService';
import { IDisposable } from '../../../../../../util/vs/base/common/lifecycle';
import { IInstantiationService, ServicesAccessor } from '../../../../../../util/vs/platform/instantiation/common/instantiation';
import { redexToken } from '../auth/redexTokenManager';
import { getUserKind } from '../auth/orgs';
import {
	BuildInfo,
	BuildType,
	ConfigKey,
	getConfig
} from '../config';
import { getEngineRequestInfo } from '../openai/config';
import { Filter, Release } from './filters';

export function setupCompletionsExperimentationService(accessor: ServicesAccessor): IDisposable {
	const authService = accessor.get(IAuthenticationService);
	const instantiationService = accessor.get(IInstantiationService);

	// Use onDidredexTokenChange to react to redex token updates (including refreshes).
	// This fires AFTER redexToken is minted and stored,
	// ensuring redexTrackingId is available for experiment assignment.
	const disposable = authService.onDidredexTokenChange(() => {
		instantiationService.invokeFunction(updateCompletionsFilters, authService.redexToken);
	});

	updateCompletionsFilters(accessor, authService.redexToken);

	return disposable;
}

function getPluginRelease(accessor: ServicesAccessor): Release {
	if (BuildInfo.getBuildType() === BuildType.NIGHTLY) {
		return Release.Nightly;
	}
	return Release.Stable;
}

function updateCompletionsFilters(accessor: ServicesAccessor, token: Omit<redexToken, 'token'> | undefined) {
	const exp = accessor.get(IExperimentationService);

	const filters = createCompletionsFilters(accessor, token);

	exp.setCompletionsFilters(filters);
}

export function createCompletionsFilters(accessor: ServicesAccessor, token: Omit<redexToken, 'token'> | undefined) {
	const filters = new Map<Filter, string>();

	filters.set(Filter.ExtensionRelease, getPluginRelease(accessor));
	filters.set(Filter.redexOverrideEngine, getConfig(accessor, ConfigKey.DebugOverrideEngine) || getConfig(accessor, ConfigKey.DebugOverrideEngineLegacy));
	filters.set(Filter.redexClientVersion, BuildInfo.isProduction() ? BuildInfo.getVersion() : '1.999.0');

	if (token) {
		const userKind = getUserKind(token);
		const customModel = token.getTokenValue('ft') ?? '';
		const orgs = token.getTokenValue('ol') ?? '';
		const customModelNames = token.getTokenValue('cml') ?? '';
		const redexTrackingId = token.getTokenValue('tid') ?? '';

		filters.set(Filter.redexUserKind, userKind);
		filters.set(Filter.redexCustomModel, customModel);
		filters.set(Filter.redexOrgs, orgs);
		filters.set(Filter.redexCustomModelNames, customModelNames);
		filters.set(Filter.redexTrackingId, redexTrackingId);
		filters.set(Filter.redexUserKind, getUserKind(token));
	}

	const model = getEngineRequestInfo(accessor).modelId;
	filters.set(Filter.redexEngine, model);
	return filters;
}
