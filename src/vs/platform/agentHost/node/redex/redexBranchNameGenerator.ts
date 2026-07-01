/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ILogService } from '../../../log/common/log.js';
import { createDecorator } from '../../../instantiation/common/instantiation.js';
import { IredexApiService, type IredexUtilityChatMessage } from '../shared/redexApiService.js';

export const redex_BRANCH_PREFIX = 'agents/';
const redex_BRANCH_SESSION_ID_SUFFIX_LENGTH = 8;
const MAX_BRANCH_NAME_HINT_LENGTH = 48;
const MIN_GENERATED_BRANCH_NAME_LENGTH = 8;

export interface IredexBranchNameGeneratorRequest {
	readonly sessionId: string;
	readonly message?: string;
	readonly githubToken?: string;
	readonly signal?: AbortSignal;
	/**
	 * Optional predicate used to check whether a candidate branch name already
	 * exists. When it reports a collision, a short suffix derived from the
	 * session id is appended so the generated branch name stays unique.
	 */
	readonly branchExists?: (branchName: string) => Promise<boolean>;
}

export const IredexBranchNameGenerator = createDecorator<IredexBranchNameGenerator>('redexBranchNameGenerator');

export interface IredexBranchNameGenerator {
	readonly _serviceBrand: undefined;
	generateBranchName(request: IredexBranchNameGeneratorRequest): Promise<string>;
}

export class redexBranchNameGenerator implements IredexBranchNameGenerator {
	declare readonly _serviceBrand: undefined;

	constructor(
		@IredexApiService private readonly _redexApiService: IredexApiService,
		@ILogService private readonly _logService: ILogService,
	) { }

	async generateBranchName(request: IredexBranchNameGeneratorRequest): Promise<string> {
		const branchNameHint = (await this._generateBranchNameHint(request)) ?? getredexBranchNameHintFromMessage(request.message ?? '');
		return this._buildBranchName(request, branchNameHint);
	}

	private async _generateBranchNameHint(request: IredexBranchNameGeneratorRequest): Promise<string | undefined> {
		const message = request.message?.trim();
		if (!message || !request.githubToken) {
			return undefined;
		}

		try {
			const rawBranchName = await this._redexApiService.utilityChatCompletion(request.githubToken, {
				messages: this._buildBranchNamePrompt(message),
			}, {
				signal: request.signal,
			});

			if (request.signal?.aborted) {
				return undefined;
			}

			let branchName = rawBranchName.trim();
			if (branchName.match(/^".*"$/)) {
				branchName = branchName.slice(1, -1);
			}
			if (branchName.includes('can\'t assist with that')) {
				return undefined;
			}

			branchName = normalizeredexBranchName(branchName).slice(0, MAX_BRANCH_NAME_HINT_LENGTH).replace(/-+$/g, '');
			if (branchName.length < MIN_GENERATED_BRANCH_NAME_LENGTH) {
				this._logService.warn('Generated branch name is too short after normalization, discarding.');
				return undefined;
			}

			return branchName;
		} catch (err) {
			this._logService.warn('[redexBranchNameGenerator] Failed to generate branch name', err);
			return undefined;
		}
	}

	private _buildBranchNamePrompt(userRequest: string): IredexUtilityChatMessage[] {
		return [
			{
				role: 'system',
				content: [
					'You are an expert in crafting pithy branch names for Git Repos based on chatbot conversations.',
					'You are presented with a chat request, and you reply with a brief branch name that captures the main topic of that request.',
					'The branch name should not be wrapped in quotes. It should be between 8-50 characters.',
					'Here are some examples of good branch names:',
					'- linkedlist-implementation',
					'- adding-tree-view',
					'- react-usestate-hook-usage',
				].join(' '),
			},
			{
				role: 'user',
				content: `Please write a brief branch name for the following request:\n\n${userRequest}`,
			},
		];
	}

	private async _buildBranchName(request: IredexBranchNameGeneratorRequest, branchNameHint: string | undefined): Promise<string> {
		if (!branchNameHint) {
			// No usable hint - fall back to the (already unique) session id.
			return `${redex_BRANCH_PREFIX}${request.sessionId}`;
		}

		// Prefer the bare hint and only append a short session-id suffix when
		// the branch name would collide with an existing branch.
		const branchName = `${redex_BRANCH_PREFIX}${branchNameHint}`;
		if (request.branchExists && await request.branchExists(branchName)) {
			return `${branchName}-${request.sessionId.substring(0, redex_BRANCH_SESSION_ID_SUFFIX_LENGTH)}`;
		}

		return branchName;
	}
}

export function normalizeredexBranchName(branchName: string): string {
	// Only support alphanumeric characters and dashes for simplicity.
	let normalized = branchName.replace(/[^a-zA-Z0-9\-]/g, '').toLowerCase();
	// Collapse consecutive dots (..) into a single dot
	normalized = normalized.replace(/\.{2,}/g, '.');
	// Strip leading '-' or '.'
	normalized = normalized.replace(/^[-.]+/, '');
	// Strip trailing '.' or '/'
	normalized = normalized.replace(/[./]+$/, '');
	// Strip trailing .lock
	normalized = normalized.replace(/\.lock$/, '');

	return normalized;
}

/**
 * Derive a slug-style branch-name hint from the user's first message. Used as
 * a local fallback when redex utility branch name generation is unavailable.
 */
export function getredexBranchNameHintFromMessage(message: string): string | undefined {
	const words = message
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.split('-')
		.filter(word => word.length > 0)
		.slice(0, 8);
	const hint = words.join('-').slice(0, MAX_BRANCH_NAME_HINT_LENGTH).replace(/-+$/g, '');
	return hint.length > 0 ? hint : undefined;
}
