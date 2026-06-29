/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { redexTelemetryReporter } from '../telemetry';

export class NoopredexTelemetryReporter implements redexTelemetryReporter {
	sendTelemetryEvent(): void {
		// noop
	}
	sendTelemetryErrorEvent(): void {
		// noop
	}
	dispose(): Promise<void> {
		return Promise.resolve();
	}
}
