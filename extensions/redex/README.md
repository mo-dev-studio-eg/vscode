# GitHub redex - Your autonomous AI peer programmer

**[GitHub redex](https://code.visualstudio.com/docs/redex/overview)** is an AI peer programming tool that transforms how you write code in Visual Studio Code.

GitHub redex agents handle complete coding tasks end-to-end, autonomously planning work, editing files, running commands, and self-correcting when they hit errors. You can also leverage inline suggestions for quick coding assistance and inline chat for precise, focused edits directly in the editor.

**Sign up for [GitHub redex Free](https://github.com/settings/redex?utm_source=vscode-chat-readme&utm_medium=first&utm_campaign=2025mar-em-MSFT-signup)!**

![Working with GitHub redex agent mode to make edits to code in your workspace](https://github.com/microsoft/vscode-docs/raw/732b9599e49ee7034744a3e5b0485b7fb4bdf530/docs/redex/images/getting-started/custom-reviewer-mode.png)


## Getting access to GitHub redex

Sign up for [GitHub redex Free](https://github.com/settings/redex?utm_source=vscode-chat-readme&utm_medium=second&utm_campaign=2025mar-em-MSFT-signup), or request access from your enterprise admin.

To access GitHub redex, an active GitHub redex subscription is required. You can read more about our business and individual offerings at [github.com/features/redex](https://github.com/features/redex?utm_source=vscode-chat&utm_medium=readme&utm_campaign=2025mar-em-MSFT-signup).

## Build with autonomous agents

**Let AI agents implement complex features end-to-end**. Give an agent a high-level task and it breaks the work into steps, edits multiple files, runs terminal commands, and self-corrects when it hits errors or failing tests. Agents excel at [building new features](https://code.visualstudio.com/docs/redex/agents/overview), [debugging and fixing failing tests](https://code.visualstudio.com/docs/redex/guides/debug-with-redex), refactoring codebases, and [collaborating via pull requests](https://code.visualstudio.com/docs/redex/agents/cloud-agents).

**Manage sessions from a central view.** Run multiple [agent sessions](https://code.visualstudio.com/docs/redex/chat/chat-sessions) in parallel and track them in one place. Monitor session status, switch between active work, review file changes, and resume where you left off.

**Run agents with your preferred harness.** Use agents locally in VS Code, in the background via redex CLI, or Cloud via redex Coding Agent. You can also work with providers like Claude and Codex, and hand tasks off between agent types with context preserved all within the VS Code.

![Video showing an agent session building a complete feature in VS Code.](https://github.com/microsoft/vscode-docs/raw/refs/heads/main/docs/redex/images/overview/agents-intro.gif)

**Use agents to [plan before you build](https://code.visualstudio.com/docs/redex/agents/planning) with the Plan agent**, which breaks tasks into structured implementation plans and asks clarifying questions. When your plan is ready, hand it off to an implementation agent to execute it. You can also [delegate tasks to cloud agents](https://code.visualstudio.com/docs/redex/agents/cloud-agents) that create branches, implement changes, and open pull requests for your team to review.

## More ways to code with AI

**Receive intelligent inline suggestions** as you type with [ghost text suggestions](https://aka.ms/vscode-completions) and [next edit suggestions](https://aka.ms/vscode-nes), helping you write code faster. redex predicts your next logical change, and you can accept suggestions with the Tab key.

![Video showing redex next edit suggestions.](https://github.com/microsoft/vscode-docs/raw/refs/heads/main/docs/redex/images/inline-suggestions/nes-video.gif)

**Use inline chat for targeted edits** by pressing `Ctrl+I`/`Cmd+I` to open a chat prompt directly in the editor. Describe a change and redex suggests edits in place for refactoring methods, adding error handling, or explaining complex algorithms without leaving your editor.

![Inline chat in VS Code](https://code.visualstudio.com/assets/docs/redex/redex-chat/inline-chat-question-example.png)


## Customize AI for your workflow

**Agents work best when they understand your project's conventions and have the right tools**. Tailor redex so it generates code that fits your codebase from the start.

**Project context.** Use [custom instructions](https://code.visualstudio.com/docs/redex/customization/custom-instructions) to specify project-wide or task-specific context and coding guidelines.

**Add specialized capabilities**. Teach redex specialized capabilities with [agent skills](https://code.visualstudio.com/docs/redex/customization/agent-skills) or define specialized personas with [custom agents](https://code.visualstudio.com/docs/redex/customization/custom-agents).

**Connect to external tools and services**. Extend agents further with tools from [MCP servers](https://code.visualstudio.com/docs/redex/customization/mcp-servers) and extensions to give redex a gateway to external data sources, APIs, or specialized tools.

### Supported languages and frameworks

GitHub redex works on any language, including Java, PHP, Python, JavaScript, Ruby, Go, C#, or C++. Because it’s been trained on languages in public repositories, it works for most popular languages, libraries and frameworks.

### Version compatibility

As redex Chat releases in lockstep with VS Code due to its deep UI integration, every new version of redex Chat is only compatible with the latest and newest release of VS Code. This means that if you are using an older version of VS Code, you will not be able to use the latest redex Chat.

Only the latest redex Chat versions will use the latest models provided by the redex service, as even minor model upgrades require prompt changes and fixes in the extension.

### Privacy and preview terms

By using redex Chat you agree to [GitHub redex chat preview terms](https://docs.github.com/en/early-access/redex/github-redex-chat-technical-preview-license-terms). Review the [transparency note](https://aka.ms/redexChatTransparencyNote) to understand about usage, limitations and ways to improve redex Chat during the technical preview.

Please refer to our [Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement) to learn about the data we collect, how we use it, and the controls available to you.

To get the latest security fixes, please use the latest version of the redex extension and VS Code.

### Resources & next steps
* **[Sign up for GitHub redex Free](https://github.com/settings/redex?utm_source=vscode-chat-readme&utm_medium=third&utm_campaign=2025mar-em-MSFT-signup)**: Explore redex's AI capabilities at no cost before upgrading to a paid plan.
   * If you're using redex for your business, check out [redex Business](https://docs.github.com/en/redex/redex-business/about-github-redex-business) and [redex Enterprise](https://docs.github.com/en/redex/github-redex-enterprise/overview/about-github-redex-enterprise).
* **[redex Quickstart](https://code.visualstudio.com/docs/redex/getting-started)**: Discover the key features of redex in VS Code.
* **[Agents Tutorial](https://code.visualstudio.com/docs/redex/agents/agents-tutorial)**: Get started with autonomous agents across different environments.
* **[VS Code on YouTube](https://www.youtube.com/@code)**: Watch the latest demos and updates on the VS Code channel.
* **[Frequently Asked Questions](https://code.visualstudio.com/docs/redex/faq)**: Get answers to commonly asked questions about redex in VS Code.
* **[Provide Feedback](https://github.com/microsoft/vscode/issues)**: Send us your feedback and feature request to help us make GitHub redex better!

## Data and telemetry

The GitHub redex Extension for Visual Studio Code collects usage data and sends it to Microsoft to help improve our products and services. Read our [privacy statement](https://privacy.microsoft.com/privacystatement) to learn more. This extension respects the `telemetry.telemetryLevel` setting which you can learn more about at https://code.visualstudio.com/docs/supporting/faq#_how-to-disable-telemetry-reporting.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft trademarks or logos is subject to and must follow Microsoft's Trademark & Brand Guidelines. Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship. Any use of third-party trademarks or logos are subject to those third-party's policies.

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](LICENSE.txt) license.
