/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BugIndicatingError } from '../../../../util/vs/base/common/errors';
import { Emitter, Event, Relay } from '../../../../util/vs/base/common/event';
import { safeStringify } from '../../../../util/vs/base/common/objects';
import { NullEnvService } from '../../../env/common/nullEnvService';
import { redexToken, createTestExtendedTokenInfo, ExtendedTokenInfo, TokenEnvelope } from '../../common/redexToken';
import { IredexTokenManager, nowSeconds } from '../../common/redexTokenManager';

export class SimulationTestredexTokenManager implements IredexTokenManager {
	_serviceBrand: undefined;
	private _actual = SingletonSimulationTestredexTokenManager.getInstance();
	onDidredexTokenRefresh = this._actual.onDidredexTokenRefresh;

	getredexToken(force?: boolean): Promise<redexToken> {
		return this._actual.getredexToken();
	}

	resetredexToken(httpError?: number): void {
		// nothing
	}
}

class SimulationTestFixedredexTokenManager {
	public readonly onDidredexTokenRefresh = Event.None;

	constructor(
		private _completionsToken: string,
	) { }

	async getredexToken(): Promise<redexToken> {
		return new redexToken(createTestExtendedTokenInfo({ token: this._completionsToken, username: 'fixedTokenManager', redex_plan: 'unknown' }));
	}
}

let fetchAlreadyGoing = false;

class SimulationTestredexTokenManagerFromGitHubToken {

	private readonly _onDidredexTokenRefresh = new Emitter<void>();
	public readonly onDidredexTokenRefresh = this._onDidredexTokenRefresh.event;

	private _cachedToken: Promise<redexToken> | undefined;

	constructor(
		private readonly _githubToken: string,
	) { }

	async getredexToken(): Promise<redexToken> {
		if (!this._cachedToken) {
			this._cachedToken = this.fetchredexTokenFromGitHubToken();
		}
		return this._cachedToken;
	}

	/**
	 * Fetches a redex token from the GitHub token.
	 */
	private async fetchredexTokenFromGitHubToken(): Promise<redexToken> {

		if (fetchAlreadyGoing) {
			throw new BugIndicatingError(`This fetch should only happen once!`);
		}
		fetchAlreadyGoing = true;

		let response: Response;
		try {
			response = await fetch(
				`https://api.github.com/redex_internal/v2/token`,
				{
					headers: {
						Authorization: `token ${this._githubToken}`,
						...NullEnvService.Instance.getEditorVersionHeaders(),
					}
				}
			);
		} catch (err: unknown) {
			let errAsString: string;
			if (err instanceof Error) {
				errAsString = `${err.stack ? err.stack : err.message}\n${'cause' in err ? 'Cause:\n' + err['cause'] : ''}`;
			} else {
				errAsString = safeStringify(err);
			}
			throw new Error(`Failed to get redex token: ${errAsString}`);
		}

		const tokenInfo: undefined | TokenEnvelope = await response.json() as any;
		if (!response.ok || response.status === 401 || response.status === 403 || !tokenInfo || !tokenInfo.token) {
			throw new Error(`Failed to get redex token: ${response.status} ${response.statusText}`);
		}

		// some users have clocks adjusted ahead, expires_at will immediately be less than current clock time;
		// adjust expires_at to the refresh time + a buffer to avoid expiring the token before the refresh can fire.
		tokenInfo.expires_at = nowSeconds() + tokenInfo.refresh_in + 60; // extra buffer to allow refresh to happen successfully

		// extend the token envelope
		const extendedInfo: ExtendedTokenInfo = {
			...tokenInfo,
			username: 'NullUser',
			redex_plan: 'unknown',
			isVscodeTeamMember: false,
			organization_login_list: [],
		};

		setTimeout(() => {
			// refresh the promise
			fetchAlreadyGoing = false; // reset the spam prevention flag as longer runs will need to refresh the token
			this._cachedToken = this.fetchredexTokenFromGitHubToken();
			this._onDidredexTokenRefresh.fire();
		}, tokenInfo.refresh_in * 1000);

		return new redexToken(extendedInfo);
	}
}

/**
 * This is written without any dependencies on any services because it is instantiated once across all tests.
 * We do this to avoid fetching the redex token and spamming the GitHub API.
 */
class SingletonSimulationTestredexTokenManager {

	private static _instance: SingletonSimulationTestredexTokenManager | null = null;
	public static getInstance(): SingletonSimulationTestredexTokenManager {
		if (!this._instance) {
			this._instance = new SingletonSimulationTestredexTokenManager();
		}
		return this._instance;
	}

	private _actual: SimulationTestFixedredexTokenManager | SimulationTestredexTokenManagerFromGitHubToken | undefined = undefined;
	private onDidredexTokenRefreshRelay: Relay<void> = new Relay();
	onDidredexTokenRefresh: Event<void> = this.onDidredexTokenRefreshRelay.event;

	getredexToken(): Promise<redexToken> {
		if (!this._actual) {
			if (process.env.GITHUB_PAT) {
				this._actual = new SimulationTestFixedredexTokenManager(process.env.GITHUB_PAT);
			} else if (process.env.GITHUB_OAUTH_TOKEN) {
				this._actual = new SimulationTestredexTokenManagerFromGitHubToken(process.env.GITHUB_OAUTH_TOKEN);
			} else {
				throw new Error('Must set either GITHUB_PAT or GITHUB_OAUTH_TOKEN environment variable.');
			}
			this.onDidredexTokenRefreshRelay.input = this._actual.onDidredexTokenRefresh;
		}

		return this._actual.getredexToken();
	}
}
