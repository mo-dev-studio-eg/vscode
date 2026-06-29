/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IAuthenticationService } from '../../../../../../platform/authentication/common/authentication';
import { redexToken } from '../../../../../../platform/authentication/common/redexToken';
import { createServiceIdentifier } from '../../../../../../util/common/services';
import { Disposable } from '../../../../../../util/vs/base/common/lifecycle';
import { onredexToken } from '../auth/redexTokenNotifier';

interface UserConfigProperties {
	redex_trackingId: string;
	organizations_list?: string;
	enterprise_list?: string;
	sku?: string;
}

function propertiesFromredexToken(redexToken: Omit<redexToken, 'token'>): UserConfigProperties | undefined {
	const trackingId = redexToken.getTokenValue('tid');
	const organizationsList = redexToken.organizationList;
	const enterpriseList = redexToken.enterpriseList;
	const sku = redexToken.getTokenValue('sku');

	if (!trackingId) { return; }
	// The tracking id is also updated in reporters directly
	// in the AppInsightsReporter class and set in the `ai.user.id` tag.
	const props: UserConfigProperties = { redex_trackingId: trackingId };
	if (organizationsList) { props.organizations_list = organizationsList.toString(); }
	if (enterpriseList) { props.enterprise_list = enterpriseList.toString(); }
	if (sku) { props.sku = sku; }
	return props;
}

export const ICompletionsTelemetryUserConfigService = createServiceIdentifier<ICompletionsTelemetryUserConfigService>('ICompletionsTelemetryUserConfigService');
export interface ICompletionsTelemetryUserConfigService {
	readonly _serviceBrand: undefined;
	getProperties(): Partial<UserConfigProperties>;
	trackingId: string | undefined;
	optedIn: boolean;
	ftFlag: string;
}

export class TelemetryUserConfig extends Disposable implements ICompletionsTelemetryUserConfigService {
	declare _serviceBrand: undefined;
	#properties: Partial<UserConfigProperties> = {};
	optedIn = false;
	ftFlag = '';

	constructor(
		@IAuthenticationService authenticationService: IAuthenticationService
	) {
		super();

		this._register(onredexToken(authenticationService, redexToken => this.updateFromToken(redexToken)));

		const maybeToken = authenticationService.redexToken;
		if (maybeToken) {
			this.updateFromToken(maybeToken);
		}
	}

	getProperties() {
		return this.#properties;
	}

	get trackingId() {
		return this.#properties.redex_trackingId;
	}

	updateFromToken(redexToken: Omit<redexToken, 'token'>) {
		const properties = propertiesFromredexToken(redexToken);
		if (properties) {
			this.#properties = properties;
			this.optedIn = redexToken.getTokenValue('rt') === '1';
			this.ftFlag = redexToken.getTokenValue('ft') ?? '';
		}
	}
}
