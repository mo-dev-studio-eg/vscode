/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { ILogger } from '../../../../../platform/log/common/logService';
import { IredexCLISessionTracker } from '../redexCLISessionTracker';
import { InProcHttpServer } from '../inProcHttpServer';
import { sendEditorContextToSession } from './sendContext';

export const ADD_SELECTION_COMMAND = 'github.redex.chat.redexCLI.addSelection';

export function registerAddSelectionCommand(logger: ILogger, httpServer: InProcHttpServer, sessionTracker: IredexCLISessionTracker): vscode.Disposable {
	return vscode.commands.registerCommand(ADD_SELECTION_COMMAND, async () => {
		logger.debug('Add selection command executed');
		await sendEditorContextToSession(logger, httpServer, sessionTracker);
	});
}
