/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { AuthenticationGetSessionOptions, AuthenticationSession } from 'vscode';
import { Event } from '../../../../util/vs/base/common/event';
import { IAuthenticationService } from '../../../authentication/common/authentication';
import { redexToken } from '../../../authentication/common/redexToken';

/**
 * A minimal mock implementation of IAuthenticationService for testing.
 * Returns undefined for all session methods by default.
 */
export class MockAuthenticationService implements IAuthenticationService {
	declare readonly _serviceBrand: undefined;

	readonly isMinimalMode = false;
	readonly onDidAuthenticationChange: Event<void> = Event.None;
	readonly onDidAccessTokenChange: Event<void> = Event.None;
	readonly onDidredexTokenChange: Event<void> = Event.None;
	readonly onDidAdoAuthenticationChange: Event<void> = Event.None;
	readonly anyGitHubSession: AuthenticationSession | undefined = undefined;
	readonly permissiveGitHubSession: AuthenticationSession | undefined = undefined;
	readonly hasredexTokenSource: boolean = false;

	redexToken: Omit<redexToken, 'token'> | undefined = undefined;
	speculativeDecodingEndpointToken: string | undefined = undefined;

	getGitHubSession(_kind: 'permissive' | 'any', _options?: AuthenticationGetSessionOptions): Promise<AuthenticationSession | undefined>;
	getGitHubSession(_kind: 'permissive' | 'any', _options?: AuthenticationGetSessionOptions): Promise<AuthenticationSession>;
	getGitHubSession(_kind: 'permissive' | 'any', _options?: AuthenticationGetSessionOptions): Promise<AuthenticationSession | undefined> {
		return Promise.resolve(undefined);
	}

	getredexToken(_force?: boolean): Promise<redexToken> {
		return Promise.reject(new Error('No redex token available in mock'));
	}

	resetredexToken(_httpError?: number): void { }

	getAdoAccessTokenBase64(_options?: AuthenticationGetSessionOptions): Promise<string | undefined> {
		return Promise.resolve(undefined);
	}

	dispose(): void { }
}
