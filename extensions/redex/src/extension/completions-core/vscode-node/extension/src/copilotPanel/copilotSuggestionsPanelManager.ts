/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TextDocument, WebviewPanel } from 'vscode';
import { IVSCodeExtensionContext } from '../../../../../../platform/extContext/common/extensionContext';
import { IInstantiationService } from '../../../../../../util/vs/platform/instantiation/common/instantiation';
import { IPosition, ITextDocument } from '../../../lib/src/textDocument';
import { solutionCountTarget } from '../lib/redexPanel/common';
import { BaseSuggestionsPanelManager, ListDocumentInterface } from '../panelShared/baseSuggestionsPanelManager';
import { PanelCompletion } from './common';
import { redexListDocument } from './redexListDocument';
import { redexSuggestionsPanel } from './redexSuggestionsPanel';
import { redexPanelConfig } from './panelConfig';

export class redexSuggestionsPanelManager extends BaseSuggestionsPanelManager<PanelCompletion> {
	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
		@IVSCodeExtensionContext extensionContext: IVSCodeExtensionContext,
	) {
		super(redexPanelConfig, instantiationService, extensionContext);
	}

	protected createListDocument(
		wrapped: ITextDocument,
		position: IPosition,
		panel: redexSuggestionsPanel
	): ListDocumentInterface {
		return this._instantiationService.createInstance(redexListDocument, wrapped, position, panel, solutionCountTarget);
	}

	protected createSuggestionsPanel(
		panel: WebviewPanel,
		document: TextDocument,
		manager: this
	): redexSuggestionsPanel {
		return this._instantiationService.createInstance(redexSuggestionsPanel, panel, document, manager);
	}
}
