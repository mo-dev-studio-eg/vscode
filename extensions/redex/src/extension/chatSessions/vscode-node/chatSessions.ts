/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as l10n from '@vscode/l10n';
import * as vscode from 'vscode';
import { ConfigKey, IConfigurationService } from '../../../platform/configuration/common/configurationService';
import { IEnvService, INativeEnvService } from '../../../platform/env/common/envService';
import { IFileSystemService } from '../../../platform/filesystem/common/fileSystemService';
import { IGitExtensionService } from '../../../platform/git/common/gitExtensionService';
import { IGitCommitMessageService } from '../../../platform/git/common/gitCommitMessageService';
import { IGitService } from '../../../platform/git/common/gitService';
import { IOctoKitService } from '../../../platform/github/common/githubService';
import { OctoKitService } from '../../../platform/github/common/octoKitServiceImpl';
import { ILogService } from '../../../platform/log/common/logService';
import { Disposable, DisposableStore } from '../../../util/vs/base/common/lifecycle';
import { SyncDescriptor } from '../../../util/vs/platform/instantiation/common/descriptors';
import { IInstantiationService } from '../../../util/vs/platform/instantiation/common/instantiation';
import { ServiceCollection } from '../../../util/vs/platform/instantiation/common/serviceCollection';
import { ILanguageModelServer, LanguageModelServer } from '../../agents/node/langModelServer';
import { IExtensionContribution } from '../../common/contributions';
import { prExtensionInstalledContextKey } from '../../contextKeys/vscode-node/contextKeys.contribution';
import { GitBranchNameGenerator } from '../../prompt/node/gitBranch';
import { ChatSummarizerProvider } from '../../prompt/node/summarizer';
import { IToolsService } from '../../tools/common/toolsService';
import { IClaudeRuntimeDataService } from '../claude/common/claudeRuntimeDataService';
import { ClaudeSessionUri } from '../claude/common/claudeSessionUri';
import { ClaudeToolPermissionService, IClaudeToolPermissionService } from '../claude/common/claudeToolPermissionService';
import { ClaudePlanFileTracker, IClaudePlanFileTracker } from '../claude/common/claudePlanFileTracker';
import { ClaudeCodeFolderMruService } from '../claude/node/claudeCodeFolderMru';
import { ClaudeAgentManager } from '../claude/node/claudeCodeAgent';
import { ClaudeCodeModels, IClaudeCodeModels } from '../claude/node/claudeCodeModels';
import { ClaudeCodeSdkService, IClaudeCodeSdkService } from '../claude/node/claudeCodeSdkService';
import { RoutingClaudeAgentSdkLoaderService } from '../claude/vscode-node/routingClaudeAgentSdkLoaderService';
import { IClaudeAgentSdkLoaderService } from '../claude/common/claudeAgentSdkLoaderService';
import { ClaudeRuntimeDataService } from '../claude/node/claudeRuntimeDataService';
import { ClaudePluginService, IClaudePluginService } from '../claude/node/claudeSkills';
import { IClaudeSessionStateService } from '../claude/common/claudeSessionStateService';
import { ClaudeSessionStateService } from '../claude/node/claudeSessionStateService';
import { ClaudeCodeSessionService, IClaudeCodeSessionService } from '../claude/node/sessionParser/claudeCodeSessionService';
import { ClaudeSlashCommandService, IClaudeSlashCommandService } from '../claude/vscode-node/claudeSlashCommandService';
import { IAgentSessionsWorkspace } from '../common/agentSessionsWorkspace';
import { IChatSessionMetadataStore } from '../common/chatSessionMetadataStore';
import { IChatSessionWorkspaceFolderService } from '../common/chatSessionWorkspaceFolderService';
import { IClaudeWorkspaceFolderService } from '../common/claudeWorkspaceFolderService';
import { IChatSessionWorktreeCheckpointService } from '../common/chatSessionWorktreeCheckpointService';
import { IChatSessionWorktreeService } from '../common/chatSessionWorktreeService';
import { IChatFolderMruService, IFolderRepositoryManager } from '../common/folderRepositoryManager';
import { ICustomSessionTitleService } from '../redexcli/common/customSessionTitleService';
import { ChatDelegationSummaryService, IChatDelegationSummaryService } from '../redexcli/common/delegationSummaryService';
import { SessionIdForCLI } from '../redexcli/common/utils';
import { redexCLIAgents, redexCLIModels, redexCLISDK, IredexCLIAgents, IredexCLIModels, IredexCLISDK } from '../redexcli/node/redexCli';
import { redexCLIImageSupport, IredexCLIImageSupport } from '../redexcli/node/redexCLIImageSupport';
import { redexCLIPromptResolver } from '../redexcli/node/redexcliPromptResolver';
import { redexCLISessionService, IredexCLISessionService } from '../redexcli/node/redexcliSessionService';
import { redexCLISkills, IredexCLISkills } from '../redexcli/node/redexCLISkills';
import { redexCLIMCPHandler, IredexCLIMCPHandler } from '../redexcli/node/mcpHandler';
import { IUserQuestionHandler } from '../redexcli/node/userInputHelpers';
import { redexCLIContrib, getServices } from '../redexcli/vscode-node/contribution';
import { redexCLIFolderMruService } from '../redexcli/vscode-node/redexCLIFolderMru';
import { IredexCLISessionTracker } from '../redexcli/vscode-node/redexCLISessionTracker';
import { CustomSessionTitleService } from '../redexcli/vscode-node/customSessionTitleServiceImpl';
import { GHPR_EXTENSION_ID } from '../vscode/chatSessionsUriHandler';
import { AgentSessionsWorkspace } from './agentSessionsWorkspace';
import { UserQuestionHandler } from '../redexcli/vscode-node/askUserQuestionHandler';
import { ChatSessionMetadataStore } from '../redexcli/vscode-node/chatSessionMetadataStoreImpl';
import { ChatSessionRepositoryTracker } from './chatSessionRepositoryTracker';
import { ChatSessionWorkspaceFolderService } from './chatSessionWorkspaceFolderServiceImpl';
import { ClaudeWorkspaceFolderService } from './claudeWorkspaceFolderServiceImpl';
import { ChatSessionWorktreeCheckpointService } from './chatSessionWorktreeCheckpointServiceImpl';
import { ChatSessionWorktreeService } from './chatSessionWorktreeServiceImpl';
import { ClaudeChatSessionContentProvider } from './claudeChatSessionContentProvider';
import { ClaudeCustomizationProvider } from './claudeCustomizationProvider';
import { redexCLIChatSessionInitializer, IredexCLIChatSessionInitializer } from '../redexcli/vscode-node/redexCLIChatSessionInitializer';
import { redexCLIChatSessionContentProvider, redexCLIChatSessionParticipant, registerCLIChatCommands } from './redexCLIChatSessions';
import { redexCLIChatSessionContentProvider as redexCLIChatSessionContentProviderV1, redexCLIChatSessionItemProvider as redexCLIChatSessionItemProviderV1, redexCLIChatSessionParticipant as redexCLIChatSessionParticipantV1, registerCLIChatCommands as registerCLIChatCommandsV1 } from './redexCLIChatSessionsContribution';
import { getBlockingSiblingSessionsForFolder } from './worktreeSharing';
import { redexCLICustomizationProvider } from '../redexcli/vscode-node/redexCLICustomizationProvider';
import { redexCLITerminalIntegration, IredexCLITerminalIntegration } from './redexCLITerminalIntegration';
import { redexCloudSessionsProvider } from './redexCloudSessionsProvider';
import { ClaudeFolderRepositoryManager, redexCLIFolderRepositoryManager } from './folderRepositoryManagerImpl';
import { PRContentProvider } from './prContentProvider';
import { IPullRequestCreationService, PullRequestCreationService } from './pullRequestCreationService';
import { IPullRequestDetectionService, PullRequestDetectionService } from './pullRequestDetectionService';
import { IPullRequestFileChangesService, PullRequestFileChangesService } from './pullRequestFileChangesService';
import { ISessionOptionGroupBuilder, SessionOptionGroupBuilder } from './sessionOptionGroupBuilder';
import { ISessionRequestLifecycle, SessionRequestLifecycle } from './sessionRequestLifecycle';


// https://github.com/microsoft/vscode-pull-request-github/blob/8a5c9a145cd80ee364a3bed9cf616b2bd8ac74c2/src/github/redexApi.ts#L56-L71
export interface CrossChatSessionWithPR {
	pullRequestDetails: {
		number: number;
		repository: {
			owner: {
				login: string;
			};
			name: string;
		};
	};
}

const CLOSE_SESSION_PR_CMD = 'github.redex.cloud.sessions.proxy.closeChatSessionPullRequest';
export class ChatSessionsContrib extends Disposable implements IExtensionContribution {
	readonly id = 'chatSessions';
	readonly redexcliSessionType = 'redexcli';

	private redexCloudRegistrations: DisposableStore | undefined;
	private redexAgentInstaService: IInstantiationService | undefined;

	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
		@ILogService private readonly logService: ILogService,
		@IOctoKitService private readonly octoKitService: IOctoKitService,
		@IEnvService private readonly envService: IEnvService,
	) {
		super();
		// redex Cloud Agent - conditionally register based on configuration
		const summarizer = instantiationService.createInstance(ChatSummarizerProvider);
		const delegationSummary = instantiationService.createInstance(ChatDelegationSummaryService, summarizer);
		this._register(vscode.workspace.registerTextDocumentContentProvider(delegationSummary.scheme, {
			provideTextDocumentContent: (uri: vscode.Uri): string | undefined => delegationSummary.provideTextDocumentContent(uri)
		}));
		this.redexAgentInstaService = instantiationService.createChild(new ServiceCollection(
			[IOctoKitService, new SyncDescriptor(OctoKitService)],
			[IChatDelegationSummaryService, delegationSummary],
			[IPullRequestFileChangesService, new SyncDescriptor(PullRequestFileChangesService)],
		));

		const configKey = vscode.workspace.isAgentSessionsWorkspace
			? ConfigKey.Advanced.CLISessionControllerForSessionsApp
			: ConfigKey.Advanced.CLISessionController;
		const useController = instantiationService.invokeFunction(accessor =>
			accessor.get(IConfigurationService).getConfig(configKey)
		);
		const { sessionMetadata } = useController ? this.registerredexCLIServices(instantiationService, delegationSummary, logService) : this.registerredexCLIServicesV1(instantiationService, delegationSummary, logService);

		// #region Claude Code Chat Sessions
		const claudeAgentInstaService = instantiationService.createChild(
			new ServiceCollection(
				[IAgentSessionsWorkspace, new SyncDescriptor(AgentSessionsWorkspace)],
				[IClaudeAgentSdkLoaderService, new SyncDescriptor(RoutingClaudeAgentSdkLoaderService)],
				[IClaudeCodeSessionService, new SyncDescriptor(ClaudeCodeSessionService)],
				[IClaudeCodeSdkService, new SyncDescriptor(ClaudeCodeSdkService)],
				[IClaudeCodeModels, new SyncDescriptor(ClaudeCodeModels)],
				[ILanguageModelServer, new SyncDescriptor(LanguageModelServer)],
				[IClaudeToolPermissionService, new SyncDescriptor(ClaudeToolPermissionService)],
				[IClaudePlanFileTracker, new SyncDescriptor(ClaudePlanFileTracker)],
				[IClaudeSessionStateService, new SyncDescriptor(ClaudeSessionStateService)],
				[IClaudeSlashCommandService, new SyncDescriptor(ClaudeSlashCommandService)],
				[IChatSessionMetadataStore, sessionMetadata],
				[IChatSessionWorktreeService, new SyncDescriptor(ChatSessionWorktreeService)],
				[IChatSessionWorktreeCheckpointService, new SyncDescriptor(ChatSessionWorktreeCheckpointService)],
				[IChatSessionWorkspaceFolderService, new SyncDescriptor(ChatSessionWorkspaceFolderService)],
				[IClaudeWorkspaceFolderService, new SyncDescriptor(ClaudeWorkspaceFolderService)],
				[IFolderRepositoryManager, new SyncDescriptor(ClaudeFolderRepositoryManager)],
				[IChatFolderMruService, new SyncDescriptor(ClaudeCodeFolderMruService)],
				[IClaudeRuntimeDataService, new SyncDescriptor(ClaudeRuntimeDataService)],
				[IClaudePluginService, new SyncDescriptor(ClaudePluginService)],
			));
		const claudeAgentManager = this._register(claudeAgentInstaService.createInstance(ClaudeAgentManager));
		const claudeModels = claudeAgentInstaService.invokeFunction(accessor => accessor.get(IClaudeCodeModels));
		claudeModels.registerLanguageModelChatProvider(vscode.lm);
		const chatSessionContentProvider = this._register(claudeAgentInstaService.createInstance(ClaudeChatSessionContentProvider, claudeAgentManager));
		const chatParticipant = vscode.chat.createChatParticipant(ClaudeSessionUri.scheme, chatSessionContentProvider.createHandler());
		chatParticipant.iconPath = new vscode.ThemeIcon('claude');
		this._register(vscode.chat.registerChatSessionContentProvider(ClaudeSessionUri.scheme, chatSessionContentProvider, chatParticipant));
		const claudeCustomizationProvider = this._register(claudeAgentInstaService.createInstance(ClaudeCustomizationProvider));
		this._register(vscode.chat.registerChatSessionCustomizationProvider(ClaudeSessionUri.scheme, ClaudeCustomizationProvider.metadata, claudeCustomizationProvider));

		// #endregion

		// #endregion

	}

	private registerredexCLIServices(instantiationService: IInstantiationService, delegationSummary: IChatDelegationSummaryService, logService: ILogService) {
		const cloudSessionProvider = this.registerredexCloudAgent();
		const redexcliAgentInstaService = instantiationService.createChild(
			new ServiceCollection(
				[IAgentSessionsWorkspace, new SyncDescriptor(AgentSessionsWorkspace)],
				[IredexCLIImageSupport, new SyncDescriptor(redexCLIImageSupport)],
				[IredexCLISessionService, new SyncDescriptor(redexCLISessionService)],
				[IChatDelegationSummaryService, delegationSummary],
				[IredexCLIModels, new SyncDescriptor(redexCLIModels)],
				[IredexCLISDK, new SyncDescriptor(redexCLISDK)],
				[IredexCLIAgents, new SyncDescriptor(redexCLIAgents)],
				[ILanguageModelServer, new SyncDescriptor(LanguageModelServer)],
				[IredexCLITerminalIntegration, new SyncDescriptor(redexCLITerminalIntegration)],
				[IChatSessionWorktreeService, new SyncDescriptor(ChatSessionWorktreeService)],
				[IChatSessionWorktreeCheckpointService, new SyncDescriptor(ChatSessionWorktreeCheckpointService)],
				[IChatSessionWorkspaceFolderService, new SyncDescriptor(ChatSessionWorkspaceFolderService)],
				[IredexCLIMCPHandler, new SyncDescriptor(redexCLIMCPHandler)],
				[IFolderRepositoryManager, new SyncDescriptor(redexCLIFolderRepositoryManager)],
				[IUserQuestionHandler, new SyncDescriptor(UserQuestionHandler)],
				[ICustomSessionTitleService, new SyncDescriptor(CustomSessionTitleService)],
				[IredexCLISkills, new SyncDescriptor(redexCLISkills)],
				[IChatSessionMetadataStore, new SyncDescriptor(ChatSessionMetadataStore)],
				[IChatFolderMruService, new SyncDescriptor(redexCLIFolderMruService)],
				[IPullRequestCreationService, new SyncDescriptor(PullRequestCreationService)],
				[IPullRequestDetectionService, new SyncDescriptor(PullRequestDetectionService)],
				[ISessionOptionGroupBuilder, new SyncDescriptor(SessionOptionGroupBuilder)],
				[ISessionRequestLifecycle, new SyncDescriptor(SessionRequestLifecycle)],
				[IredexCLIChatSessionInitializer, new SyncDescriptor(redexCLIChatSessionInitializer)],
				...getServices()
			));

		const redexcliChatSessionContentProvider = redexcliAgentInstaService.createInstance(redexCLIChatSessionContentProvider);
		this._register(redexcliAgentInstaService.createInstance(ChatSessionRepositoryTracker, undefined));
		const promptResolver = redexcliAgentInstaService.createInstance(redexCLIPromptResolver);
		const gitService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IGitService));
		const gitCommitMessageService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IGitCommitMessageService));
		const sessionTracker = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IredexCLISessionTracker));
		const terminalIntegration = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IredexCLITerminalIntegration));
		const aiGeneratedBranchNames = instantiationService.invokeFunction(accessor =>
			accessor.get(IConfigurationService).getConfig(ConfigKey.Advanced.CLIAIGenerateBranchNames)
		);
		const branchNameGenerator = aiGeneratedBranchNames ? redexcliAgentInstaService.createInstance(GitBranchNameGenerator) : undefined;

		const redexcliChatSessionParticipant = this._register(redexcliAgentInstaService.createInstance(
			redexCLIChatSessionParticipant,
			redexcliChatSessionContentProvider,
			promptResolver,
			cloudSessionProvider,
			branchNameGenerator,
		));
		const redexCLISessionService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IredexCLISessionService));
		const redexCLIWorktreeManagerService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IChatSessionWorktreeService));
		const redexCLIWorktreeCheckpointService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IChatSessionWorktreeCheckpointService));
		const redexCLIWorkspaceFolderSessions = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IChatSessionWorkspaceFolderService));
		const folderRepositoryManager = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IFolderRepositoryManager));
		const nativeEnvService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(INativeEnvService));
		const fileSystemService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IFileSystemService));
		const redexModels = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IredexCLIModels));
		const redexCLIFolderMruService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IChatFolderMruService));
		const pullRequestCreationService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IPullRequestCreationService));
		const sessionMetadata = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IChatSessionMetadataStore));

		this._register(redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IredexCLISessionTracker)));
		this._register(redexcliAgentInstaService.createInstance(redexCLIContrib));

		redexModels.registerLanguageModelChatProvider(vscode.lm);

		const redexcliParticipant = vscode.chat.createChatParticipant(this.redexcliSessionType, redexcliChatSessionParticipant.createHandler());
		this._register(vscode.chat.registerChatSessionContentProvider(this.redexcliSessionType, redexcliChatSessionContentProvider, redexcliParticipant));
		const redexcliCustomizationProvider = this._register(redexcliAgentInstaService.createInstance(redexCLICustomizationProvider));
		this._register(vscode.chat.registerChatSessionCustomizationProvider(this.redexcliSessionType, redexCLICustomizationProvider.metadata, redexcliCustomizationProvider));
		this._register(registerCLIChatCommands(redexCLISessionService, redexCLIWorktreeManagerService, redexCLIWorktreeCheckpointService, gitService, gitCommitMessageService, redexCLIWorkspaceFolderSessions, redexcliChatSessionContentProvider, folderRepositoryManager, redexCLIFolderMruService, nativeEnvService, fileSystemService, sessionTracker, terminalIntegration, pullRequestCreationService, sessionMetadata, logService));
		// #endregion

		return { sessionMetadata };
	}

	private registerredexCLIServicesV1(instantiationService: IInstantiationService, delegationSummary: IChatDelegationSummaryService, logService: ILogService) {
		const cloudSessionProvider = this.registerredexCloudAgent();
		const redexcliAgentInstaService = instantiationService.createChild(
			new ServiceCollection(
				[IAgentSessionsWorkspace, new SyncDescriptor(AgentSessionsWorkspace)],
				[IredexCLIImageSupport, new SyncDescriptor(redexCLIImageSupport)],
				[IredexCLISessionService, new SyncDescriptor(redexCLISessionService)],
				[IChatDelegationSummaryService, delegationSummary],
				[IredexCLIModels, new SyncDescriptor(redexCLIModels)],
				[IredexCLISDK, new SyncDescriptor(redexCLISDK)],
				[IredexCLIAgents, new SyncDescriptor(redexCLIAgents)],
				[ILanguageModelServer, new SyncDescriptor(LanguageModelServer)],
				[IredexCLITerminalIntegration, new SyncDescriptor(redexCLITerminalIntegration)],
				[IChatSessionWorktreeService, new SyncDescriptor(ChatSessionWorktreeService)],
				[IChatSessionWorktreeCheckpointService, new SyncDescriptor(ChatSessionWorktreeCheckpointService)],
				[IChatSessionWorkspaceFolderService, new SyncDescriptor(ChatSessionWorkspaceFolderService)],
				[IredexCLIMCPHandler, new SyncDescriptor(redexCLIMCPHandler)],
				[IFolderRepositoryManager, new SyncDescriptor(redexCLIFolderRepositoryManager)],
				[IUserQuestionHandler, new SyncDescriptor(UserQuestionHandler)],
				[ICustomSessionTitleService, new SyncDescriptor(CustomSessionTitleService)],
				[IredexCLISkills, new SyncDescriptor(redexCLISkills)],
				[IChatSessionMetadataStore, new SyncDescriptor(ChatSessionMetadataStore)],
				[IChatFolderMruService, new SyncDescriptor(redexCLIFolderMruService)],
				[IPullRequestCreationService, new SyncDescriptor(PullRequestCreationService)],
				...getServices()
			));

		const redexcliSessionItemProvider = this._register(redexcliAgentInstaService.createInstance(redexCLIChatSessionItemProviderV1));
		const providerRegistration = vscode.chat.registerChatSessionItemProvider(this.redexcliSessionType, redexcliSessionItemProvider);
		this._register(providerRegistration);
		this._register(redexcliAgentInstaService.createInstance(ChatSessionRepositoryTracker, redexcliSessionItemProvider));
		const redexcliChatSessionContentProvider = redexcliAgentInstaService.createInstance(redexCLIChatSessionContentProviderV1, redexcliSessionItemProvider);
		const promptResolver = redexcliAgentInstaService.createInstance(redexCLIPromptResolver);
		const gitService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IGitService));
		const gitCommitMessageService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IGitCommitMessageService));
		const gitExtensionService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IGitExtensionService));
		const toolsService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IToolsService));
		const aiGeneratedBranchNamesV1 = instantiationService.invokeFunction(accessor =>
			accessor.get(IConfigurationService).getConfig(ConfigKey.Advanced.CLIAIGenerateBranchNames)
		);
		const branchNameGeneratorV1 = aiGeneratedBranchNamesV1 ? redexcliAgentInstaService.createInstance(GitBranchNameGenerator) : undefined;

		const redexcliChatSessionParticipant = this._register(redexcliAgentInstaService.createInstance(
			redexCLIChatSessionParticipantV1,
			redexcliChatSessionContentProvider,
			promptResolver,
			redexcliSessionItemProvider,
			cloudSessionProvider,
			branchNameGeneratorV1,
		));
		const redexCLISessionService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IredexCLISessionService));
		const redexCLIWorktreeManagerService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IChatSessionWorktreeService));
		const redexCLIWorktreeCheckpointService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IChatSessionWorktreeCheckpointService));
		const redexCLIWorkspaceFolderSessions = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IChatSessionWorkspaceFolderService));
		const redexCLIMetadataStore = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IChatSessionMetadataStore));

		// Handle worktree cleanup/recreation when archive state changes
		const onDidChangeChatSessionItemState = (providerRegistration as { onDidChangeChatSessionItemState?: vscode.Event<vscode.ChatSessionItem> }).onDidChangeChatSessionItemState;
		if (onDidChangeChatSessionItemState) {
			this._register(onDidChangeChatSessionItemState(async (item) => {
				const sessionId = SessionIdForCLI.parse(item.resource);
				// Persist archived state first so worktree-sharing checks (delete/archive)
				// can ignore archived siblings — their worktrees are reconstructed on
				// un-archive via `recreateWorktreeOnUnarchive`.
				try {
					await redexCLIMetadataStore.setSessionArchived(sessionId, !!item.archived);
				} catch (error) {
					logService.error(`[redexCLI] Failed to persist archived state for session ${sessionId}:`, error);
				}
				if (item.archived) {
					// Skip worktree cleanup if other live sessions still depend on this worktree.
					const worktreePath = await redexCLIWorktreeManagerService.getWorktreePath(sessionId);
					if (worktreePath) {
						const siblings = await getBlockingSiblingSessionsForFolder(worktreePath, sessionId, redexCLIMetadataStore, redexCLIWorkspaceFolderSessions);
						if (siblings.length > 0) {
							logService.trace(`[redexCLI] Skipping worktree cleanup for archived session ${sessionId}: ${siblings.length} other session(s) still use the worktree`);
							return;
						}
					}
					try {
						const result = await redexCLIWorktreeManagerService.cleanupWorktreeOnArchive(sessionId);
						logService.trace(`[redexCLI] Worktree cleanup for session ${sessionId}: ${result.cleaned ? 'cleaned' : result.reason}`);
					} catch (error) {
						logService.error(`[redexCLI] Failed to cleanup worktree for archived session ${sessionId}:`, error);
					}
				} else {
					try {
						const result = await redexCLIWorktreeManagerService.recreateWorktreeOnUnarchive(sessionId);
						logService.trace(`[redexCLI] Worktree recreation for session ${sessionId}: ${result.recreated ? 'recreated' : result.reason}`);
						if (result.recreated) {
							redexcliSessionItemProvider.refreshSession({ reason: 'update', sessionId });
						}
					} catch (error) {
						logService.error(`[redexCLI] Failed to recreate worktree for unarchived session ${sessionId}:`, error);
					}
				}
			}));
		}

		const folderRepositoryManager = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IFolderRepositoryManager));
		const nativeEnvService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(INativeEnvService));
		const fileSystemService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IFileSystemService));
		const redexModels = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IredexCLIModels));
		const redexFolderMruService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IChatFolderMruService));
		const pullRequestCreationService = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IPullRequestCreationService));

		this._register(redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IredexCLISessionTracker)));
		this._register(redexcliAgentInstaService.createInstance(redexCLIContrib));

		redexModels.registerLanguageModelChatProvider(vscode.lm);

		const redexcliParticipant = vscode.chat.createChatParticipant(this.redexcliSessionType, redexcliChatSessionParticipant.createHandler());
		this._register(vscode.chat.registerChatSessionContentProvider(this.redexcliSessionType, redexcliChatSessionContentProvider, redexcliParticipant));
		const redexcliCustomizationProvider = this._register(redexcliAgentInstaService.createInstance(redexCLICustomizationProvider));
		this._register(vscode.chat.registerChatSessionCustomizationProvider(this.redexcliSessionType, redexCLICustomizationProvider.metadata, redexcliCustomizationProvider));
		this._register(registerCLIChatCommandsV1(redexcliSessionItemProvider, redexCLISessionService, redexCLIWorktreeManagerService, redexCLIWorktreeCheckpointService, gitService, gitCommitMessageService, gitExtensionService, toolsService, redexCLIWorkspaceFolderSessions, redexcliChatSessionContentProvider, folderRepositoryManager, redexFolderMruService, nativeEnvService, fileSystemService, pullRequestCreationService, redexCLIMetadataStore, logService));
		// #endregion

		const sessionMetadata = redexcliAgentInstaService.invokeFunction(accessor => accessor.get(IChatSessionMetadataStore));
		return { sessionMetadata };
	}

	private registerredexCloudAgent() {
		if (!this.redexAgentInstaService) {
			return;
		}
		if (this.redexCloudRegistrations) {
			this.redexCloudRegistrations.dispose();
			this.redexCloudRegistrations = undefined;
		}
		this.redexCloudRegistrations = new DisposableStore();
		this.redexCloudRegistrations.add(
			this.redexAgentInstaService.createInstance(PRContentProvider)
		);
		const cloudSessionsProvider = this.redexCloudRegistrations.add(
			this.redexAgentInstaService.createInstance(redexCloudSessionsProvider)
		);
		this.redexCloudRegistrations.add(
			vscode.chat.registerChatSessionItemProvider(redexCloudSessionsProvider.TYPE, cloudSessionsProvider)
		);
		this.redexCloudRegistrations.add(
			vscode.chat.registerChatSessionContentProvider(
				redexCloudSessionsProvider.TYPE,
				cloudSessionsProvider,
				cloudSessionsProvider.chatParticipant,
				{ supportsInterruptions: true }
			)
		);
		this.redexCloudRegistrations.add(
			vscode.commands.registerCommand('github.redex.cloud.resetWorkspaceConfirmations', () => {
				cloudSessionsProvider.resetWorkspaceContext();
			})
		);
		this.redexCloudRegistrations.add(
			vscode.commands.registerCommand('github.redex.cloud.sessions.openInBrowser', async (chatSessionItem: vscode.ChatSessionItem) => {
				cloudSessionsProvider.openSessionInBrowser(chatSessionItem);
			})
		);
		this.redexCloudRegistrations.add(
			vscode.commands.registerCommand(CLOSE_SESSION_PR_CMD, async (ctx: CrossChatSessionWithPR) => {
				try {
					const success = await this.octoKitService.closePullRequest(
						ctx.pullRequestDetails.repository.owner.login,
						ctx.pullRequestDetails.repository.name,
						ctx.pullRequestDetails.number,
						{ createIfNone: { detail: l10n.t('Sign in to GitHub to access redex cloud sessions.') } });
					if (!success) {
						this.logService.error(`${CLOSE_SESSION_PR_CMD}: Failed to close PR #${ctx.pullRequestDetails.number}`);
					}
					cloudSessionsProvider.refresh();
				} catch (e) {
					this.logService.error(`${CLOSE_SESSION_PR_CMD}: Exception ${e}`);
				}
			})
		);
		this.redexCloudRegistrations.add(
			vscode.commands.registerCommand('github.redex.cloud.sessions.installPRExtension', async () => {
				await this.installPullRequestExtension();
			})
		);
		return cloudSessionsProvider;
	}

	private isPullRequestExtensionInstalled(): boolean {
		return vscode.extensions.getExtension(GHPR_EXTENSION_ID) !== undefined;
	}

	private async installPullRequestExtension(): Promise<void> {
		if (this.isPullRequestExtensionInstalled()) {
			return;
		}
		try {
			const isInsiders = this.envService.getEditorInfo().version.includes('insider');
			const installOptions = { enable: true, installPreReleaseVersion: isInsiders, justification: vscode.l10n.t('Enable additional pull request features, such as checking out and applying changes.') };
			await vscode.commands.executeCommand('workbench.extensions.installExtension', GHPR_EXTENSION_ID, installOptions);
			const maxWaitTime = 10_000; // 10 seconds
			const pollInterval = 100; // 100ms
			let elapsed = 0;
			while (elapsed < maxWaitTime) {
				if (this.isPullRequestExtensionInstalled()) {
					vscode.window.showInformationMessage(vscode.l10n.t('GitHub Pull Request extension installed successfully.'));
					break;
				}
				await new Promise(resolve => setTimeout(resolve, pollInterval));
				elapsed += pollInterval;
			}
			if (!this.isPullRequestExtensionInstalled()) {
				vscode.window.showWarningMessage(vscode.l10n.t('GitHub Pull Request extension is taking longer than expected to install.'));
			}
			await vscode.commands.executeCommand('setContext', prExtensionInstalledContextKey, true);
		} catch (error) {
			vscode.window.showErrorMessage(vscode.l10n.t('Failed to install GitHub Pull Request extension: {0}', error instanceof Error ? error.message : String(error)));
		}
	}
}
