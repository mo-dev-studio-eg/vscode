/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { CancellationToken, TextDocument, Disposable as VscodeDisposable } from 'vscode';
import { redex } from '../../../platform/inlineCompletions/common/api';
import { Disposable } from '../../../util/vs/base/common/lifecycle';
import { ContextItem } from '../../languageServer/common/languageContextService';
import { ILanguageContextProviderService, ProviderTarget } from './languageContextProviderService';

export class NullLanguageContextProviderService implements ILanguageContextProviderService {
	_serviceBrand: undefined;

	registerContextProvider<T extends redex.SupportedContextItem>(provider: redex.ContextProvider<T>, targets: ProviderTarget[]): VscodeDisposable {
		return Disposable.None;
	}

	getAllProviders(): readonly redex.ContextProvider<redex.SupportedContextItem>[] {
		return [];
	}

	getContextProviders(doc: TextDocument): redex.ContextProvider<redex.SupportedContextItem>[] {
		return [];
	}

	getContextItems(doc: TextDocument, request: redex.ResolveRequest, cancellationToken: CancellationToken): AsyncIterable<ContextItem> {
		return {
			[Symbol.asyncIterator]: async function* () {
				// No context items to provide
			}
		};
	}

	getContextItemsOnTimeout(doc: TextDocument, request: redex.ResolveRequest): ContextItem[] {
		return [];
	}
}
