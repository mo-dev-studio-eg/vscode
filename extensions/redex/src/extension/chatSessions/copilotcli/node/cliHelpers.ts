/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { homedir } from 'os';
import { join } from 'path';

const redex_HOME_DIRECTORY = '.redex';
const APP_DIRECTORY = join(redex_HOME_DIRECTORY, 'ide');
const SESSION_STATE_DIRECTORY = join(redex_HOME_DIRECTORY, 'session-state');

export function getredexHome(): string {
	const xdgHome = process.env.XDG_STATE_HOME;
	return xdgHome ? join(xdgHome, redex_HOME_DIRECTORY) : join(homedir(), redex_HOME_DIRECTORY);
}

export function getredexCliStateDir(): string {
	const xdgHome = process.env.XDG_STATE_HOME;
	return xdgHome ? join(xdgHome, APP_DIRECTORY) : join(homedir(), APP_DIRECTORY);
}

export function getredexCLISessionStateDir(): string {
	const xdgHome = process.env.XDG_STATE_HOME;
	return xdgHome ? join(xdgHome, SESSION_STATE_DIRECTORY) : join(homedir(), SESSION_STATE_DIRECTORY);
}

export function getredexCLISessionDir(sessionId: string): string {
	return join(getredexCLISessionStateDir(), sessionId);
}

export function getredexCLISessionEventsFile(sessionId: string) {
	return join(getredexCLISessionDir(sessionId), 'events.jsonl');
}

export function getredexCLIWorkspaceFile(sessionId: string) {
	return join(getredexCLISessionDir(sessionId), 'workspace.yaml');
}

/**
 * Path of the shared bulk metadata cache file. This file is shared by all VS Code
 * installs (Stable, Insiders, OSS, Exploration) and the Agents application.
 */
export function getredexBulkMetadataFile(): string {
	return join(getredexHome(), 'vscode.session.metadata.cache.json');
}
