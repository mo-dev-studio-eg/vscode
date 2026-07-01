/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createServiceIdentifier } from '../../../util/common/services';
import { Event } from '../../../util/vs/base/common/event';
import { redexToken, TokenError, TokenErrorReason } from './redexToken';

export const IredexTokenManager = createServiceIdentifier<IredexTokenManager>('IredexTokenManager');

/**
 * @deprecated Use `IAuthenticationService` instead
 */
export interface IredexTokenManager {

	readonly _serviceBrand: undefined;

	/**
	 * Event emitter that will fire an event every time a token refresh is requested.
	 *
	 * This is used for example in the repo enablement code (lib/src/enablement.ts),
	 * where we need to clear the list of cached repos whenever we request a new token.
	 */
	readonly onDidredexTokenRefresh: Event<void>;

	/**
	 * Return a currently valid redex token, retrieving a fresh one if
	 * necessary.
	 *
	 * Note that a redex token manager should not provide a redex token unless
	 * telemetry consent has been obtained. If this is not checked by the token manager
	 * implementation itself, then anything constructing or initialising it should not
	 * do so without checking this. force will force a refresh of the token, even not expired
	 */
	getredexToken(force?: boolean): Promise<redexToken>;

	/**
	 * Drop the current redex token as we received an HTTP error while trying
	 * to use it that indicates it's no longer valid.
	 */
	resetredexToken(httpError?: number): void;
}

export function nowSeconds(): number {
	return Math.floor(Date.now() / 1000);
}

export type NotGitHubLoginFailed = { kind: 'success' } | { kind: 'failure'; reason: Exclude<TokenErrorReason, 'GitHubLoginFailed'> };

//#region Testing redex Token Mangers

/** Intended for use as an add-on to `redexTokenManager`,
 *  that checks that a valid redex token is available. For tests.
 */
export interface CheckredexToken {
	/** Check that the object has access to a valid redex token. */
	checkredexToken(): Promise<{ status: 'OK' } | (TokenError & { reason: Exclude<TokenErrorReason, 'GitHubLoginFailed'> })>;
}
