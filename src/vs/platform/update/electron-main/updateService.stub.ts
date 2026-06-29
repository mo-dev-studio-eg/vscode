/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Redex Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Redex: Auto-update feature has been disabled.
 * 
 * This stub service replaces the update service to ensure the application
 * still functions correctly without update capabilities.
 * 
 * All update-related functionality is disabled in Redex to:
 * - Remove telemetry associated with update checks
 * - Prevent any network requests to Microsoft update servers
 * - Give users full control over their update process
 */

import { Event, Emitter } from '../../../base/common/event.js';
import { State, StateType, UpdateType, IUpdateService } from '../common/update.js';

export class StubUpdateService implements IUpdateService {
	declare readonly _serviceBrand: undefined;

	private readonly _onStateChange = new Emitter<State>();
	readonly onStateChange: Event<State> = this._onStateChange.event;

	constructor() {
		// Initialize to Disabled state with reason ManuallyDisabled
		this._onStateChange.fire({
			type: StateType.Disabled,
			reason: 2 // DisablementReason.ManuallyDisabled
		} as any);
	}

	get state(): State {
		return {
			type: StateType.Disabled,
			reason: 2 // DisablementReason.ManuallyDisabled
		} as any;
	}

	async checkForUpdates(explicit: boolean): Promise<void> {
		// Updates are disabled in Redex
	}

	async downloadUpdate(explicit: boolean): Promise<void> {
		// Updates are disabled in Redex
	}

	async applyUpdate(): Promise<void> {
		// Updates are disabled in Redex
	}

	async quitAndInstall(): Promise<void> {
		// Updates are disabled in Redex
	}

	async isLatestVersion(): Promise<boolean | undefined> {
		// Updates are disabled in Redex
		return true;
	}

	async _applySpecificUpdate(packagePath: string): Promise<void> {
		// Updates are disabled in Redex
	}

	async setInternalOrg(internalOrg: string | undefined): Promise<void> {
		// Updates are disabled in Redex
	}
}
