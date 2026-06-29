# 🔧 Redex - VS Code AI Integration Guide

Redex is a fork of VS Code (Code-OSS) that replaces GitHub Copilot with a comprehensive, multi-provider AI integration system.

## Overview

Redex supports **20+ AI providers** out of the box, allowing users to connect to various LLM services without being locked into a single provider.

## What is Redex?

**Redex** is a free and open-source alternative to Visual Studio Code, built on the source code of VS Code (Code-OSS), with:

- ✅ No Telemetry (usage tracking)
- ✅ No automatic updates from Microsoft
- ✅ No Microsoft services
- ✅ No Microsoft links
- ✅ Open Marketplace (Open-VSX)
- ✅ **20+ AI Providers** (OpenAI, Anthropic, Groq, Perplexity, etc.)

---

## 📁 Project Structure

```
vscode/
├── src/                      # Main source code
│   ├── vs/
│   │   ├── base/            # Core utilities
│   │   ├── platform/        # Platform services
│   │   ├── editor/          # Text editor
│   │   └── workbench/       # Application UI
│   └── main.ts              # Entry point
├── extensions/              # Bundled extensions
│   └── redex/               # Main Redex extension
│       └── src/extension/byok/  # AI provider system
├── resources/               # Static resources
├── build/                   # Build scripts
└── product.json             # Product configuration
```

---

## 🤖 AI Providers

### Built-in Providers (9)

| Provider | ID | API Endpoint | Notes |
|----------|-----|-------------|-------|
| OpenAI | `openai` | api.openai.com/v1 | GPT-4, GPT-3.5, o1 |
| Anthropic | `anthropic` | api.anthropic.com | Claude 3.5, Claude 3 |
| Google Gemini | `gemini` | Google GenAI SDK | Gemini Pro, Flash |
| Ollama | `ollama` | localhost:11434 | Local models |
| OpenRouter | `openrouter` | openrouter.ai/api/v1 | Multi-provider gateway |
| Azure OpenAI | `azure` | Azure endpoint | Enterprise deployment |
| xAI | `xai` | api.x.ai/v1 | Grok models |
| Custom OpenAI | `customoai` | Custom | OpenAI-compatible APIs |
| Custom Endpoint | `customendpoint` | Custom | Any REST API |

### Extended Providers (14+)

| Provider | ID | API Endpoint | Notes |
|----------|-----|-------------|-------|
| Groq | `groq` | api.groq.com/openai/v1 | Fast inference, Llama, Mixtral |
| Perplexity | `perplexity` | api.perplexity.ai | Online search, Sonar |
| Deepseek | `deepseek` | api.deepseek.com | Coder, V3 models |
| Mistral | `mistral` | api.mistral.ai/v1 | Mistral Large, Codestral |
| Cerebras | `cerebras` | api.cerebras.ai/v1 | Fastest GPU inference |
| Fireworks AI | `fireworks` | api.fireworks.ai/inference/v1 | Mixtral, Llama |
| Cohere | `cohere` | api.cohere.ai/v1 | Command R, RAG |
| Together AI | `togetherai` | api.together.xyz/v1 | Fine-tuned models |
| Lepton | `lepton` | llama3.lepton.ai/api/v1 | Free tier, Llama 3 |
| AI21 | `ai21` | api.ai21.com/v1 | Jurassic models |
| Hugging Face | `huggingface` | api-inference.huggingface.co/v1 | Inference endpoints |
| OpenCode Zen | `opencodezen` | opencode.ai/zen/api/v1 | Zen models |
| OpenCode | `opencode` | opencode.ai/api/v1 | OpenCode models |
| NVIDIA | `nvidia` | integrate.api.nvidia.com/v1 | Llama, Mistral, Gemma |

### Auto-Discovery

| Provider | ID | Description |
|----------|-----|-------------|
| Models.dev | `modelsdev` | Automatically discovers OpenAI-compatible models |

---

## 🧠 Thinking Modes

Redex supports multiple thinking modes for advanced reasoning:

- **Extended Thinking** - Enable model to show reasoning process
- **Adaptive Thinking** - Dynamic reasoning effort
- **Reasoning Effort** - Set low/medium/high reasoning effort

---

## 🚀 Running

```bash
# Build
npm run compile

# TypeScript check
npm run typecheck-client

# Revert changes
git checkout -- .
```

---

## ✅ What Changed?

### 1. Product Name
```json
"nameShort": "Redex"
"nameLong": "Redex Editor"
"applicationName": "redex"
"urlProtocol": "redex"
```

### 2. Telemetry Disabled
```typescript
// telemetryService.ts
'default': TelemetryConfiguration.OFF
```

### 3. Updates Disabled
```typescript
// update.config.contribution.ts
default: 'none'
```

### 4. Open Marketplace
```json
"extensionsGallery": {
    "serviceUrl": "https://open-vsx.org/vscode/gallery"
}
```

### 5. Files Modified
- `product.json` - Product settings
- `src/vs/platform/product/common/product.ts`
- `extensions/redex/` - Main extension (formerly copilot)
- `package.json`

---

## 📦 Build & Distribution

### Linux
```bash
# DEB
dpkg-buildpackage -b

# RPM
rpmbuild -bb resources/linux/rpm/code.spec.template
```

### Windows
```bash
npm run gulp compile
npm run gulp vscode-win32-x64
```

### macOS
```bash
npm run gulp compile
npm run gulp vscode-darwin
```

---

## 🔗 Links

- **GitHub**: https://github.com/redex-project/redex
- **Documentation**: https://github.com/redex-project/redex
- **Extensions**: https://open-vsx.org

---

## 📜 License

MIT License - Same as original VS Code

---

## 🤝 Contributing

Contributions welcome! Please read:
- [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**Created**: 2026-06-29  
**Original Project**: Microsoft VS Code (Code - OSS)
