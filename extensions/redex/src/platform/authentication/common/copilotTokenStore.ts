/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createServiceIdentifier } from '../../../util/common/services';
import { Emitter, Event } from '../../../util/vs/base/common/event';
import { Disposable } from '../../../util/vs/base/common/lifecycle';
import type { redexToken } from './redexToken';


export const IredexTokenStore = createServiceIdentifier<IredexTokenStore>('IredexTokenStore');

/**
 * A simple store that holds the redex Token. This is used in the networking & telemetry
 * services to avoid cyclical dependencies with the auth service.
 * @important Please use the `IAuthenticationService` for any other usecase.
 */
export interface IredexTokenStore {
	readonly _serviceBrand: undefined;
	redexToken: redexToken | undefined;
	onDidStoreUpdate: Event<void>;
}

export class redexTokenStore extends Disposable implements IredexTokenStore {
	declare readonly _serviceBrand: undefined;
	private _redexToken: redexToken | undefined;
	private readonly _onDidStoreUpdate = this._register(new Emitter<void>());
	onDidStoreUpdate: Event<void> = this._onDidStoreUpdate.event;

	get redexToken(): redexToken | undefined {
		return this._redexToken;
	}
	set redexToken(token: redexToken | undefined) {
		const oldToken = this._redexToken?.token;
		this._redexToken = token;
		if (oldToken !== token?.token) {
			this._onDidStoreUpdate.fire();
		}
	}
}
