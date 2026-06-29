# 🔧 دليل تحويل VS Code إلى VSCodium

## ما هو VSCodium؟

**VSCodium** هو بديل حر ومفتوح المصدر لـ Visual Studio Code، بدون:
- ❌ Telemetry (تتبع الاستخدام)
- ❌ التحديثات التلقائية من Microsoft
- ❌ خدمات Microsoft المختلفة
- ❌ روابط Microsoft

---

## ✅ ما الذي تم تغييره؟

### 1. تعطيل Telemetry
```
src/vs/platform/telemetry/common/telemetryService.ts
src/vs/workbench/browser/workbench.contribution.ts
src/vs/workbench/contrib/editTelemetry/browser/editTelemetry.contribution.ts
src/vs/platform/update/common/update.config.contribution.ts
```

### 2. تعطيل التحديثات التلقائية
```typescript
// update.config.contribution.ts
default: 'none'  // بدلاً من 'default'
```

### 3. تغيير Marketplace
```json
// product.json
"extensionsGallery": {
    "serviceUrl": "https://open-vsx.org/vscode/gallery",
    "itemUrl": "https://open-vsx.org/vscode/item"
}
```

### 4. تغيير اسم المنتج
```json
"nameShort": "VSCodium"
"applicationName": "codium"
"urlProtocol": "vscodium"
```

### 5. تغيير الروابط
```
reportIssueUrl → github.com/VSCodium/vscodium
licenseUrl → github.com/VSCodium/vscodium
documentationUrl → github.com/VSCodium/vscodium
```

### 6. الملفات المعدلة
- `product.json` - إعدادات المنتج
- `build/lib/electron.ts` - علامات Electron
- `package.json` - معلومات الحزمة
- `resources/linux/*` - ملفات Linux
- `build/win32/code.iss` - ملفات Windows
- 10 ملفات Telemetry والتحديثات

---

## 🚀 كيفية الاستخدام

### تشغيل التحويل:
```bash
cd /workspace/project/vscode
bash convert-to-vscodium.sh
```

### تفعيل التحديثات (اختياري):
```bash
DISABLE_UPDATE=no bash convert-to-vscodium.sh
```

### التراجع عن التغييرات:
```bash
git checkout -- .
```

---

## 📁 هيكل التغييرات

```
modified:   product.json                              # ✓ اسم المنتج والروابط
modified:   build/lib/electron.ts                     # ✓ علامات Microsoft
modified:   package.json                              # ✓ معلومات الحزمة
modified:   build/win32/code.iss                      # ✓ Windows installer
modified:   resources/linux/debian/*                  # ✓ Linux DEB
modified:   resources/linux/rpm/*                     # ✓ Linux RPM
modified:   resources/linux/code.appdata.xml          # ✓ AppData
modified:   src/vs/platform/telemetry/*               # ✓ تعطيل Telemetry
modified:   src/vs/platform/update/*                  # ✓ تعطيل التحديثات
modified:   src/vs/workbench/browser/*                # ✓ إعدادات Workbench
modified:   src/vs/workbench/contrib/editTelemetry/*  # ✓ Edit Telemetry
```

---

## 🛠️ البناء (Build)

بعد التحويل، يمكنك البناء:

```bash
# فحص TypeScript
npm run typecheck-client

# تجميع الكود
npm run compile

# أو البناء الكامل
npm run gulp compile
```

---

## 📚 مصادر إضافية

- [VSCodium Official](https://vscodium.com)
- [VSCodium GitHub](https://github.com/VSCodium/vscodium)
- [Open VSX Registry](https://open-vsx.org)

---

## ⚠️ ملاحظات

1. **هذا التحويل يستنسخ سكربتات VSCodium الرسمية**
2. **التغييرات متوافقة مع البناء القياسي لـ VS Code**
3. **للتوزيع، استخدم نفس سكربتات البناء من VSCodium**

---

**تم الإنشاء بواسطة**: VSCodium Converter Script  
**التاريخ**: 2026-06-29
