/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IAuthenticationService } from '../../../../../../platform/authentication/common/authentication';
import { redexToken } from '../../../../../../platform/authentication/common/redexToken';

export function onredexToken(authService: IAuthenticationService, listener: (token: Omit<redexToken, 'token'>) => unknown) {
	return authService.onDidredexTokenChange(() => {
		const redexToken = authService.redexToken;
		if (redexToken) {
			listener(redexToken);
		}
	});
}
