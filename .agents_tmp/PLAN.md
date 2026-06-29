# Plan: تحويل Copilot إلى Redex مع دعم شامل للمزودين

## 1. OBJECTIVE

تحويل نظام Copilot في VS Code إلى نظام Redex مع:
- تغيير اسم "copilot" إلى "redex" في جميع الملفات والمجلدات
- **دعم جميع المزودين**: المزودون الحاليون + 10+ مزودين جدد
- دعم جميع أنواع التفكير (thinking, adaptive_thinking, reasoning_effort)
- تحميل النماذج من models.dev
- تسهيل إضافة مزودين مخصصين

## 2. CONTEXT SUMMARY

### المزودون الحاليون (9):
| المزود | الحالة | API |
|--------|--------|-----|
| openai | ✅ موجود | https://api.openai.com/v1 |
| anthropic | ✅ موجود | https://api.anthropic.com |
| gemini | ✅ موجود | Google GenAI SDK |
| ollama | ✅ موجود | http://localhost:11434 |
| openrouter | ✅ موجود | https://openrouter.ai/api/v1 |
| azure | ✅ موجود | Azure OpenAI |
| xai | ✅ موجود | https://api.x.ai/v1 |
| customoai | ✅ موجود | Custom OpenAI-compatible |
| customendpoint | ✅ موجود | Custom endpoints |

### المزودون المراد إضافتهم (12+):
| المزود | API | النماذج |
|--------|-----|---------|
| groq | https://api.groq.com/openai/v1 | Llama, Mixtral |
| perplexity | https://api.perplexity.ai | Sonar |
| mistral | https://api.mistral.ai/v1 | Mistral, Codestral |
| deepseek | https://api.deepseek.com | Deepseek Coder, V3 |
| cerebras | https://api.cerebras.ai/v1 | Llama |
| fireworks | https://api.fireworks.ai/inference/v1 | Mixtral, Llama |
| cohere | https://api.cohere.ai/v1 | Command R |
| ai21 | https://api.ai21.com/v1 | Jurassic |
| togetherai | https://api.together.xyz/v1 | Llama, Mistral |
| lepton | https://llama3.lepton.ai/api/v1 | Llama |
| cloudflare | Workers AI | Llama, Mistral |
| huggingface | https://api-inference.huggingface.co/v1 | BERT, Llama |
| replicate | https://api.replicate.com/v1 | Stable Diffusion |
| fireworksai | https://api.fireworks.ai/inference/v1 | Mixtral |

## 3. APPROACH OVERVIEW

1. **إعادة تسمية Copilot إلى Redex**: إعادة تسمية شاملة
2. **إضافة مزودين جدد**: إنشاء 12+ مزود جديد
3. **دعم التفكير المتقدم**: تحديث BYOKModelCapabilities
4. **تكامل models.dev**: إضافة مزود يحمل النماذج تلقائياً
5. **تسهيل المزودين المخصصين**: إنشاء قالب مبسط

## 4. IMPLEMENTATION STEPS

### المرحلة 1: إعادة تسمية Copilot إلى Redex

**الملفات المتأثرة:**
- `extensions/copilot/` → `extensions/redex/`
- `src/vs/sessions/contrib/providers/copilotChatSessions/` → `redexChatSessions/`
- `src/vs/platform/agentHost/node/copilot/` → `redex/`

**الطريقة:**
```bash
# إعادة تسمية المجلدات
mv extensions/copilot extensions/redex
mv src/vs/sessions/contrib/providers/copilotChatSessions src/vs/sessions/contrib/providers/redexChatSessions
mv src/vs/platform/agentHost/node/copilot src/vs/platform/agentHost/node/redex

# إعادة تسمية المحتوى
find . -type f \( -name "*.ts" -o -name "*.json" -o -name "*.md" \) | \
  xargs sed -i 's/copilot/redex/gI'
```

### المرحلة 2: إضافة المزودين الجدد (12+ مزود)

**المزودين المراد إضافتهم:**

#### 2.1 GroqProvider (groqProvider.ts)
```typescript
// API: https://api.groq.com/openai/v1
// النماذج: llama-3.3-70b-versatile, mixtral-8x7b-32768
// الميزات: reasoning_effort, fast inference
```

#### 2.2 PerplexityProvider (perplexityProvider.ts)
```typescript
// API: https://api.perplexity.ai
// النماذج: sonar, sonar-pro, sonar-reasoning
// الميزات: online search, reasoning
```

#### 2.3 MistralProvider (mistralProvider.ts)
```typescript
// API: https://api.mistral.ai/v1
// النماذج: mistral-large, codestral
// الميزات: tool calling, vision
```

#### 2.4 DeepseekProvider (deepseekProvider.ts)
```typescript
// API: https://api.deepseek.com
// النماذج: deepseek-chat, deepseek-coder
// الميزات: advanced reasoning, coding
```

#### 2.5 CerebrasProvider (cerebrasProvider.ts)
```typescript
// API: https://api.cerebras.ai/v1
// النماذج: llama-3.3-70b
// الميزات: fastest GPU inference
```

#### 2.6 FireworksProvider (fireworksProvider.ts)
```typescript
// API: https://api.fireworks.ai/inference/v1
// النماذج: mixtral-8x7b, llama
// الميزات: function calling, structured output
```

#### 2.7 CohereProvider (cohereProvider.ts)
```typescript
// API: https://api.cohere.ai/v1
// النماذج: command-r-plus, command-r
// الميزات: RAG, tool use
```

#### 2.8 AI21Provider (ai21Provider.ts)
```typescript
// API: https://api.ai21.com/v1
// النماذج: jamba-large, jamba-instruct
// الميزات: long context
```

#### 2.9 TogetherAIProvider (togetherAIProvider.ts)
```typescript
// API: https://api.together.xyz/v1
// النماذج: mixtral-8x7b, llama
// الميزات: fine-tuned models
```

#### 2.10 LeptonProvider (leptonProvider.ts)
```typescript
// API: https://llama3.lepton.ai/api/v1
// النماذج: llama-3
// الميزات: free tier
```

#### 2.11 CloudflareProvider (cloudflareProvider.ts)
```typescript
// API: Workers AI (OpenAI-compatible via @ai-sdk/openai-compatible)
// النماذج: @cf/meta/llama-3-8b-instruct
// الميزات: edge inference
```

#### 2.12 HuggingFaceProvider (huggingfaceProvider.ts)
```typescript
// API: https://api-inference.huggingface.co/v1
// النماذج: meta-llama, mistralai
// الميزات: inference endpoints
```

#### 2.13 ReplicateProvider (replicateProvider.ts)
```typescript
// API: https://api.replicate.com/v1
// النماذج: llama, stable-diffusion
// الميزات: image generation
```

#### 2.14 ModelsDevProvider (modelsDevProvider.ts)
```typescript
// API: https://models.dev API
// الميزات: discovers and loads all OpenAI-compatible models
// تصنيف تلقائي حسب المزود
```

**ملفات التعديل:**
- `extensions/redex/src/extension/byok/vscode-node/byokContribution.ts`
- `extensions/redex/src/extension/byok/common/byokProvider.ts`
- `src/vs/workbench/contrib/chat/common/languageModels.ts`

### المرحلة 3: دعم جميع أنواع التفكير

**الهدف:** تمكين دعم thinking, adaptive_thinking, reasoning_effort

**الطريقة:** تحديث BYOKModelCapabilities وإضافة خيارات UI

**التعديلات:**

#### 3.1 تحديث byokProvider.ts
```typescript
// extensions/redex/src/extension/byok/common/byokProvider.ts

// إضافة أنواع التفكير الجديدة
export interface BYOKModelCapabilities {
  // ... existing fields ...
  
  // أنواع التفكير المدعومة
  thinking?: boolean;                    // Extended thinking
  adaptiveThinking?: boolean;            // Adaptive thinking  
  reasoningEffort?: string[];            // ['low', 'medium', 'high']
  reasoningEffortFormat?: 'chat-completions' | 'responses';
  
  // إعدادات التفكير
  maxThinkingTokens?: number;            // الحد الأقصى لتokens التفكير
  thinkingBudgetHint?: number;            // Budget hint للـ adaptive thinking
}
```

#### 3.2 إنشاء ModelsDevProvider
```typescript
// extensions/redex/src/extension/byok/vscode-node/modelsDevProvider.ts

// مزود جديد يحمل النماذج من models.dev
export class ModelsDevProvider extends AbstractOpenAICompatibleLMProvider {
  // - يقرأ قائمة النماذج من https://models.dev
  // - يصنف النماذج حسب المزود
  // - يضيف تلقائياً المزودين غير المعروفين
  // - يدعم جميع إعدادات التفكير
}
```

#### 3.3 تحديث byokContribution.ts
```typescript
// تسجيل ModelsDevProvider
this._providers.set(ModelsDevProvider.providerId, 
  instantiationService.createInstance(ModelsDevProvider, this._byokStorageService));
```

### المرحلة 4: تسهيل إضافة مزود مخصص

**الهدف:** إنشاء إطار عمل بسيط لإضافة مزودين مخصصين

**الطريقة:** إنشاء قالب واجهة مزود

#### 4.1 إنشاء AbstractCustomProvider
```typescript
// extensions/redex/src/extension/byok/vscode-node/abstractCustomProvider.ts

/**
 * فئة أساسية مبسطة لإنشاء مزودين مخصصين
 * يمكن للمستخدمين توسيع هذه الفئة بسهولة
 */
export abstract class AbstractCustomProvider<T = void> {
  abstract readonly providerId: string;
  abstract readonly providerName: string;
  abstract readonly baseUrl: string;
  
  // إعدادات المصادقة
  authType: BYOKAuthType = BYOKAuthType.GlobalApiKey;
  
  // اكتشاف النماذج
  async getModels(): Promise<CustomModel[]> {
    // يمكن تجاوزها
    return [];
  }
  
  // التحقق من الاتصال
  async testConnection(): Promise<boolean> {
    return true;
  }
}
```

#### 4.2 إضافة Settings UI
```typescript
// إعدادات JSON في package.json
"redex.customProviders": {
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": { "type": "string" },
      "name": { "type": "string" },
      "baseUrl": { "type": "string" },
      "apiKey": { "type": "string" },
      "models": { "type": "array" }
    }
  }
}
```

### المرحلة 5: تحديث الوثائق والتسمية

**الهدف:** تحديث جميع الوثائق والمراجع

**الملفات:**
- `REDEX_GUIDE.md` - تحديث الدليل
- `.github/copilot-instructions.md` → `.github/redex-instructions.md`
- `README.md` - تحديث الوصف
- `AGENTS.md` - تحديث تعليمات الوكلاء

### ملخص المزودين النهائيين (23+ مزود)

#### المزودون الحاليون (9):
| # | المزود | ملف المزود | API |
|---|--------|------------|-----|
| 1 | OpenAI | `openAIProvider.ts` | api.openai.com |
| 2 | Anthropic | `anthropicProvider.ts` | api.anthropic.com |
| 3 | Gemini | `geminiNativeProvider.ts` | Google GenAI SDK |
| 4 | Ollama | `ollamaProvider.ts` | localhost:11434 |
| 5 | OpenRouter | `openRouterProvider.ts` | openrouter.ai |
| 6 | Azure | `azureProvider.ts` | Azure OpenAI |
| 7 | xAI | `xAIProvider.ts` | api.x.ai |
| 8 | CustomOAI | `customOAIProvider.ts` | Custom |
| 9 | CustomEndpoint | `customEndpointProvider.ts` | Custom |

#### المزودون الجدد (14+):
| # | المزود | ملف المزود | API |
|---|--------|------------|-----|
| 10 | Groq | `groqProvider.ts` | api.groq.com |
| 11 | Perplexity | `perplexityProvider.ts` | api.perplexity.ai |
| 12 | Mistral | `mistralProvider.ts` | api.mistral.ai |
| 13 | Deepseek | `deepseekProvider.ts` | api.deepseek.com |
| 14 | Cerebras | `cerebrasProvider.ts` | api.cerebras.ai |
| 15 | Fireworks | `fireworksProvider.ts` | api.fireworks.ai |
| 16 | Cohere | `cohereProvider.ts` | api.cohere.ai |
| 17 | AI21 | `ai21Provider.ts` | api.ai21.com |
| 18 | TogetherAI | `togetherAIProvider.ts` | api.together.xyz |
| 19 | Lepton | `leptonProvider.ts` | llama3.lepton.ai |
| 20 | Cloudflare | `cloudflareProvider.ts` | Cloudflare Workers AI |
| 21 | HuggingFace | `huggingfaceProvider.ts` | api-inference.huggingface.co |
| 22 | Replicate | `replicateProvider.ts` | api.replicate.com |
| 23 | **ModelsDev** | `modelsDevProvider.ts` | models.dev API |

**المجموع: 23+ مزود**

## 5. TESTING AND VALIDATION

### التحقق من التسمية
```bash
# التحقق من عدم وجود مراجع لـ "copilot"
grep -r "copilot" extensions/redex/ --include="*.ts" | wc -l
# يجب أن يكون 0

# التحقق من وجود "redex"
grep -r "redex" extensions/redex/ --include="*.ts" | wc -l
# يجب أن يكون > 0
```

### اختبار المزودين الجدد
```typescript
// اختبار تسجيل المزودين
const providers = [
  'openai', 'anthropic', 'gemini', 'ollama', 'openrouter',
  'azure', 'xai', 'customoai', 'customendpoint',
  // المزودين الجدد
  'groq', 'perplexity', 'mistral', 'deepseek', 'cerebras',
  'modelsdev'  // مزود models.dev
];

// التحقق من تسجيل الكل
providers.forEach(p => {
  const registered = lm.getLanguageModelChatProvider(p);
  assert(registered !== undefined, `Provider ${p} not registered`);
});
```

### اختبار أنواع التفكير
```typescript
// اختبار دعم التفكير
const testModel = {
  id: 'deepseek-chat',
  thinking: true,
  reasoningEffort: ['low', 'medium', 'high'],
  maxThinkingTokens: 16000
};

// التحقق من تطبيق الإعدادات
const endpoint = createEndpoint(testModel);
assert(endpoint.supportsThinking === true);
assert(endpoint.reasoningEffortFormats.length === 3);
```

### التحقق من models.dev
```typescript
// اختبار تحميل النماذج من models.dev
const modelsDevProvider = new ModelsDevProvider(storage);
const models = await modelsDevProvider.discoverModels();

// التحقق من وجود نماذج
assert(models.length > 0, 'No models discovered from models.dev');

// التحقق من تصنيف المزودين
const providers = new Set(models.map(m => m.vendor));
assert(providers.size > 10, 'Expected multiple vendors');
```

### فحص TypeScript
```bash
cd extensions/redex
npm run typecheck
# يجب أن لا يكون هناك أخطاء
```
