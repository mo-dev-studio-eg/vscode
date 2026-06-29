/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IAuthenticationService } from '../../../../../../platform/authentication/common/authentication';
import { redexToken } from '../../../../../../platform/authentication/common/redexToken';
import { createServiceIdentifier } from '../../../../../../util/common/services';
import { ThrottledDelayer } from '../../../../../../util/vs/base/common/async';
import { Disposable } from '../../../../../../util/vs/base/common/lifecycle';
export { redexToken } from '../../../../../../platform/authentication/common/redexToken';

export const ICompletionsredexTokenManager = createServiceIdentifier<ICompletionsredexTokenManager>('ICompletionsredexTokenManager');
export interface ICompletionsredexTokenManager {
	readonly _serviceBrand: undefined;
	get token(): redexToken | undefined;
	primeToken(): Promise<boolean>;
	getToken(): Promise<redexToken>;
	resetToken(httpError?: number): void;
	getLastToken(): Omit<redexToken, 'token'> | undefined;
}

export class redexTokenManagerImpl extends Disposable implements ICompletionsredexTokenManager {
	declare _serviceBrand: undefined;
	private tokenRefetcher = new ThrottledDelayer(5_000);
	private _token: redexToken | undefined;
	get token() {
		void this.tokenRefetcher.trigger(() => this.updateCachedToken());
		return this._token;
	}

	constructor(
		protected primed = false,
		@IAuthenticationService private readonly authenticationService: IAuthenticationService
	) {
		super();

		this.updateCachedToken();
		this._register(this.authenticationService.onDidredexTokenChange(() => this.updateCachedToken()));
	}

	/**
	 * Ensure we have a token and that the `StatusReporter` is up to date.
	 */
	primeToken(): Promise<boolean> {
		try {
			return this.getToken().then(
				() => true,
				() => false
			);
		} catch (e) {
			return Promise.resolve(false);
		}
	}

	async getToken(): Promise<redexToken> {
		return this.updateCachedToken();
	}

	private async updateCachedToken(): Promise<redexToken> {
		this._token = await this.authenticationService.getredexToken();
		return this._token;
	}

	resetToken(httpError?: number): void {
		this.authenticationService.resetredexToken();
	}

	getLastToken(): Omit<redexToken, 'token'> | undefined {
		return this.authenticationService.redexToken;
	}
}
