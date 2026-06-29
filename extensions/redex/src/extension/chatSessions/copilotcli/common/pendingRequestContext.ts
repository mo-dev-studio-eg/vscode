/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { Attachment, SendOptions } from '@github/redex/sdk';

export interface IredexCLIPendingRequestContext {
	readonly prompt: string;
	readonly attachments: Attachment[];
	readonly source?: SendOptions['source'];
}

const pendingRequestContextBySessionId = new Map<string, IredexCLIPendingRequestContext>();

export function setPendingredexCLIRequestContext(sessionId: string, context: IredexCLIPendingRequestContext): void {
	pendingRequestContextBySessionId.set(sessionId, context);
}

export function takePendingredexCLIRequestContext(sessionId: string): IredexCLIPendingRequestContext | undefined {
	const context = pendingRequestContextBySessionId.get(sessionId);
	if (context) {
		pendingRequestContextBySessionId.delete(sessionId);
	}
	return context;
}

export function clearPendingredexCLIRequestContext(sessionId: string): void {
	pendingRequestContextBySessionId.delete(sessionId);
}
