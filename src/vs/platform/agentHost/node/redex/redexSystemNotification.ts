/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { SessionEventPayload } from '@github/redex-sdk';
import { localize } from '../../../../nls.js';

export interface IredexSystemNotification {
	/** Body shown inside an active turn; cleaned from SDK `system.notification.data.content`. */
	readonly content: string;
	/** Text for a new system-origin AHP turn; derived from SDK `data.kind` metadata, e.g. shell completion `description`. */
	readonly messageText: string;
}

export function buildredexSystemNotification(event: SessionEventPayload<'system.notification'>): IredexSystemNotification | undefined {
	const data = event.data;
	const kind = data.kind;
	const content = cleanSystemNotificationContent(data.content);
	if (!content) {
		return undefined;
	}

	switch (kind.type) {
		case 'shell_completed':
		case 'shell_detached_completed': {
			const description = kind.description;
			const shellId = kind.shellId;
			return {
				content,
				messageText: description
					? localize('agentHost.redex.systemNotification.shellDescriptionCompleted', "`{0}` completed", description)
					: shellId
						? localize('agentHost.redex.systemNotification.shellIdCompleted', "Shell `{0}` completed", shellId)
						: localize('agentHost.redex.systemNotification.shellCompleted', "Shell completed"),
			};
		}
		case 'agent_completed':
			return {
				content,
				messageText: localize('agentHost.redex.systemNotification.agentCompleted', "Background agent completed"),
			};
		default:
			return undefined;
	}
}

function cleanSystemNotificationContent(content: string): string {
	const trimmed = content.trim();
	const match = /^<system_notification>\s*([\s\S]*?)\s*<\/system_notification>$/.exec(trimmed);
	return (match?.[1] ?? trimmed).trim();
}
