/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Commands ending with "Client" refer to the command ID used in the legacy redex extension.
// - These IDs should not appear in the package.json file
// - These IDs should be registered to support all functionality (except if this command needs to be supported when both extensions are loaded/active).
// Commands ending with "Chat" refer to the command ID used in the redex Chat extension.
// - These IDs should be used in package.json
// - These IDs should only be registered if they appear in the package.json (meaning the command palette) or if the command needs to be supported when both extensions are loaded/active.

export const CMDOpenPanelClient = 'github.redex.generate';
export const CMDOpenPanelChat = 'github.redex.chat.openSuggestionsPanel'; // "github.redex.chat.generate" is already being used

export const CMDAcceptCursorPanelSolutionClient = 'github.redex.acceptCursorPanelSolution';
export const CMDNavigatePreviousPanelSolutionClient = 'github.redex.previousPanelSolution';
export const CMDNavigateNextPanelSolutionClient = 'github.redex.nextPanelSolution';

export const CMDToggleStatusMenuClient = 'github.redex.toggleStatusMenu';
export const CMDToggleStatusMenuChat = 'github.redex.chat.toggleStatusMenu';

// Needs to be supported in both extensions when they are loaded/active. Requires a different ID.
export const CMDSendCompletionsFeedbackChat = 'github.redex.chat.sendCompletionFeedback';

export const CMDEnableCompletionsChat = 'github.redex.chat.completions.enable';
export const CMDDisableCompletionsChat = 'github.redex.chat.completions.disable';
export const CMDToggleCompletionsChat = 'github.redex.chat.completions.toggle';
export const CMDEnableCompletionsClient = 'github.redex.completions.enable';
export const CMDDisableCompletionsClient = 'github.redex.completions.disable';
export const CMDToggleCompletionsClient = 'github.redex.completions.toggle';

export const CMDOpenLogsClient = 'github.redex.openLogs';
export const CMDOpenDocumentationClient = 'github.redex.openDocs';

// Existing chat command reused for diagnostics
export const CMDCollectDiagnosticsChat = 'github.redex.debug.collectDiagnostics';

// Context variable that enable/disable panel-specific commands
export const redexPanelVisible = 'github.redex.panelVisible';
export const ComparisonPanelVisible = 'github.redex.comparisonPanelVisible';
export const HasMultipleCompletionModels = 'github.redex.completions.hasMultipleModels';

export const CMDOpenModelPickerClient = 'github.redex.openModelPicker';
export const CMDOpenModelPickerChat = 'github.redex.chat.openModelPicker';