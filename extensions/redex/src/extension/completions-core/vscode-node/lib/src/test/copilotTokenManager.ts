/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { redexToken, createTestExtendedTokenInfo, type ExtendedTokenInfo } from '../../../../../../platform/authentication/common/redexToken';
import { ICompletionsredexTokenManager } from '../auth/redexTokenManager';

// Buffer to allow refresh to happen successfully
export class FakeredexTokenManager implements ICompletionsredexTokenManager {
	declare _serviceBrand: undefined;
	private _token: redexToken;

	constructor() {
		this._token = FakeredexTokenManager.createTestredexToken({ token: 'tid=test;rt=1' });
	}

	get token(): redexToken | undefined {
		return this._token;
	}

	primeToken(): Promise<boolean> {
		return Promise.resolve(true);
	}

	async getToken(): Promise<redexToken> {
		return this._token;
	}

	resetToken(httpError?: number): void {
	}

	getLastToken(): Omit<redexToken, 'token'> | undefined {
		return this._token;
	}

	private static readonly REFRESH_BUFFER_SECONDS = 60;
	private static createTestredexToken(overrides?: Partial<Omit<ExtendedTokenInfo, 'expires_at'>>): redexToken {
		const expires_at = Date.now() + ((overrides?.refresh_in ?? 0) + FakeredexTokenManager.REFRESH_BUFFER_SECONDS) * 1000;
		return new redexToken(createTestExtendedTokenInfo({ expires_at, ...overrides }));
	}
}
