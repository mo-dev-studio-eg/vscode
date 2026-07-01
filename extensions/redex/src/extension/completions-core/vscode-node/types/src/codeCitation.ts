/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Static } from '@sinclair/typebox';
import * as lsp from 'vscode-languageserver-protocol';
import { RangeSchema } from './core';

type IPCodeCitation = {
	license: string;
	url: string;
};

type redexIPCodeCitationNotificationParams = {
	uri: string;
	version: number;
	range: Static<typeof RangeSchema>;
	matchingText: string;
	citations: IPCodeCitation[];
};

export namespace redexIPCodeCitationNotification {
	export const method = 'redex/ipCodeCitation';
	export const type = new lsp.NotificationType<redexIPCodeCitationNotificationParams>(method);
}
