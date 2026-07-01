#!/usr/bin/env bash
# =============================================================================
# Redex Converter - تحويل VS Code / VSCodium إلى Redex
# =============================================================================
# هذا السكربت يحول VS Code إلى Redex
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}         ${GREEN}Redex Converter - تحويل المشروع إلى Redex${NC}          ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# =============================================================================
# 1. التحقق من المتطلبات
# =============================================================================
echo -e "${YELLOW}[1/7] التحقق من المتطلبات...${NC}"

if ! command -v jq &> /dev/null; then
    echo -e "${RED}خطأ: jq غير مثبت${NC}"
    echo "قم بتثبيت jq أولاً: sudo apt install jq"
    exit 1
fi

# =============================================================================
# 2. إعداد product.json لـ Redex
# =============================================================================
echo -e "${YELLOW}[2/7] إعداد product.json لـ Redex...${NC}"

# إنشاء نسخة احتياطية
cp product.json product.json.backup

# الإعدادات الأساسية
echo "تغيير اسم المنتج..."

jq '.nameShort = "Redex"' product.json > temp.json && mv temp.json product.json
jq '.nameLong = "Redex Editor"' product.json > temp.json && mv temp.json product.json
jq '.applicationName = "redex"' product.json > temp.json && mv temp.json product.json
jq '.dataFolderName = ".redex"' product.json > temp.json && mv temp.json product.json
jq '.sharedDataFolderName = ".redex-shared"' product.json > temp.json && mv temp.json product.json
jq '.urlProtocol = "redex"' product.json > temp.json && mv temp.json product.json
jq '.serverApplicationName = "redex-server"' product.json > temp.json && mv temp.json product.json
jq '.serverDataFolderName = ".redex-server"' product.json > temp.json && mv temp.json product.json
jq '.tunnelApplicationName = "redex-tunnel"' product.json > temp.json && mv temp.json product.json
jq '.linuxIconName = "redex"' product.json > temp.json && mv temp.json product.json
jq '.quality = "stable"' product.json > temp.json && mv temp.json product.json
jq '.codeOssVersion = "1.0.0"' product.json > temp.json && mv temp.json product.json

# Windows
jq '.win32AppUserModelId = "Redex.Rebox"' product.json > temp.json && mv temp.json product.json
jq '.win32DirName = "Redex"' product.json > temp.json && mv temp.json product.json
jq '.win32MutexName = "redex"' product.json > temp.json && mv temp.json product.json
jq '.win32NameVersion = "Redex Editor"' product.json > temp.json && mv temp.json product.json
jq '.win32RegValueName = "Redex"' product.json > temp.json && mv temp.json product.json
jq '.win32ShellNameShort = "Redex"' product.json > temp.json && mv temp.json product.json
jq '.win32x64AppId = "{{88DA3577-054F-4CA1-8122-7D820494CFFB}"' product.json > temp.json && mv temp.json product.json
jq '.win32arm64AppId = "{{67DEE444-3D04-4258-B92A-BC1F0FF2CAE4}"' product.json > temp.json && mv temp.json product.json
jq '.win32x64UserAppId = "{{0FD05EB4-651E-4E78-A062-515204B47A3A}"' product.json > temp.json && mv temp.json product.json
jq '.win32arm64UserAppId = "{{57FD70A5-1B8D-4875-9F40-C5553F094828}"' product.json > temp.json && mv temp.json product.json
jq '.win32TunnelServiceMutex = "redex-tunnelservice"' product.json > temp.json && mv temp.json product.json
jq '.win32TunnelMutex = "redex-tunnel"' product.json > temp.json && mv temp.json product.json

# macOS
jq '.darwinBundleIdentifier = "com.redex.editor"' product.json > temp.json && mv temp.json product.json

# روابط Redex
jq '.reportIssueUrl = "https://github.com/redex-project/redex/issues/new"' product.json > temp.json && mv temp.json product.json
jq '.licenseUrl = "https://github.com/redex-project/redex/blob/main/LICENSE"' product.json > temp.json && mv temp.json product.json
jq '.serverLicenseUrl = "https://github.com/redex-project/redex/blob/main/LICENSE"' product.json > temp.json && mv temp.json product.json
jq '.documentationUrl = "https://github.com/redex-project/redex"' product.json > temp.json && mv temp.json product.json
jq '.introductoryVideosUrl = "https://github.com/redex-project/redex"' product.json > temp.json && mv temp.json product.json
jq '.keyboardShortcutsUrlLinux = "https://github.com/redex-project/redex"' product.json > temp.json && mv temp.json product.json
jq '.keyboardShortcutsUrlMac = "https://github.com/redex-project/redex"' product.json > temp.json && mv temp.json product.json
jq '.keyboardShortcutsUrlWin = "https://github.com/redex-project/redex"' product.json > temp.json && mv temp.json product.json
jq '.releaseNotesUrl = "https://github.com/redex-project/redex"' product.json > temp.json && mv temp.json product.json
jq '.requestFeatureUrl = "https://github.com/redex-project/redex"' product.json > temp.json && mv temp.json product.json
jq '.tipsAndTricksUrl = "https://github.com/redex-project/redex"' product.json > temp.json && mv temp.json product.json
jq '.twitterUrl = "https://github.com/redex-project/redex"' product.json > temp.json && mv temp.json product.json
jq '.checksumFailMoreInfoUrl = "https://github.com/redex-project/redex"' product.json > temp.json && mv temp.json product.json

# marketplace -> open-vsx
jq '.extensionsGallery = {
    "serviceUrl": "https://open-vsx.org/vscode/gallery",
    "itemUrl": "https://open-vsx.org/vscode/item",
    "latestUrlTemplate": "https://open-vsx.org/vscode/gallery/{publisher}/{name}/latest",
    "controlUrl": "https://raw.githubusercontent.com/EclipseFdn/publish-extensions/refs/heads/master/extension-control/extensions.json"
}' product.json > temp.json && mv temp.json product.json

# Trusted domains
jq '.linkProtectionTrustedDomains = ["https://open-vsx.org"]' product.json > temp.json && mv temp.json product.json

# Disable update URL
if [[ "${DISABLE_UPDATE:-yes}" == "yes" ]]; then
    echo "تعطيل التحديثات التلقائية..."
    jq '.updateUrl = ""' product.json > temp.json && mv temp.json product.json
    jq '.downloadUrl = ""' product.json > temp.json && mv temp.json product.json
else
    jq '.updateUrl = "https://raw.githubusercontent.com/redex-project/versions/refs/heads/master"' product.json > temp.json && mv temp.json product.json
    jq '.downloadUrl = "https://github.com/redex-project/redex/releases"' product.json > temp.json && mv temp.json product.json
fi

echo -e "${GREEN}✓ تم تحديث product.json${NC}"

# =============================================================================
# 3. تعطيل Telemetry
# =============================================================================
echo -e "${YELLOW}[3/7] تعطيل Telemetry...${NC}"

echo "إزالة endpoints تتبع Microsoft..."

SEARCH_PATTERN='\.data\.microsoft\.com'
if command -v rg &> /dev/null; then
    rg --no-ignore -l "$SEARCH_PATTERN" src/ 2>/dev/null | xargs -I {} sed -i "s|//[^/]*\.data\.microsoft\.com|//0.0.0.0|g" {} 2>/dev/null || true
elif command -v grep &> /dev/null; then
    grep -rl --exclude-dir=.git -E "$SEARCH_PATTERN" src/ 2>/dev/null | xargs -I {} sed -i "s|//[^/]*\.data\.microsoft\.com|//0.0.0.0|g" {} 2>/dev/null || true
fi

echo "تعطيل إعدادات Telemetry الافتراضية..."

# telemetryService.ts
if [ -f "src/vs/platform/telemetry/common/telemetryService.ts" ]; then
    sed -i "s/'default': TelemetryConfiguration.ON/'default': TelemetryConfiguration.OFF/g" src/vs/platform/telemetry/common/telemetryService.ts
    sed -i "s/\"default\": TelemetryConfiguration.ON/\"default\": TelemetryConfiguration.OFF/g" src/vs/platform/telemetry/common/telemetryService.ts
    sed -i "s/'default': true,/'default': false,/g" src/vs/platform/telemetry/common/telemetryService.ts
fi

# workbench.contribution.ts
if [ -f "src/vs/workbench/browser/workbench.contribution.ts" ]; then
    sed -i "s/'default': true/'default': false/g" src/vs/workbench/browser/workbench.contribution.ts
fi

# editTelemetry.contribution.ts
if [ -f "src/vs/workbench/contrib/editTelemetry/browser/editTelemetry.contribution.ts" ]; then
    sed -i "s/default: true/default: false/g" src/vs/workbench/contrib/editTelemetry/browser/editTelemetry.contribution.ts
fi

# preferencesContribution.ts
if [ -f "src/vs/workbench/contrib/preferences/common/preferencesContribution.ts" ]; then
    sed -i "s/'default': true/'default': false/g" src/vs/workbench/contrib/preferences/common/preferencesContribution.ts
fi

# desktop.contribution.ts
if [ -f "src/vs/workbench/electron-browser/desktop.contribution.ts" ]; then
    sed -i "s/'default': true,/'default': false,/g" src/vs/workbench/electron-browser/desktop.contribution.ts
fi

# assignmentService.ts
if [ -f "src/vs/workbench/services/assignment/common/assignmentService.ts" ]; then
    sed -i "s/'default': true,/'default': false,/g" src/vs/workbench/services/assignment/common/assignmentService.ts
fi

# update.config.contribution.ts
if [ -f "src/vs/platform/update/common/update.config.contribution.ts" ]; then
    sed -i "s/default: 'default'/default: 'none'/g" src/vs/platform/update/common/update.config.contribution.ts
    sed -i "s/'default': 'default'/'default': 'none'/g" src/vs/platform/update/common/update.config.contribution.ts
fi

echo -e "${GREEN}✓ تم تعطيل Telemetry${NC}"

# =============================================================================
# 4. إزالة خدمات Microsoft
# =============================================================================
echo -e "${YELLOW}[4/7] إزالة خدمات Microsoft...${NC}"

# Copilot terminal suggestion
if [ -f "extensions/terminal-suggest/src/completions/code.ts" ]; then
    sed -i 's/enabled: true/enabled: false/g' extensions/terminal-suggest/src/completions/code.ts
fi

# Branding
if [ -f "build/lib/electron.ts" ]; then
    sed -i 's/Microsoft Corporation/Redex Team/g' build/lib/electron.ts
fi

if [ -f "package.json" ]; then
    sed -i 's/Microsoft Corporation/Redex Team/g' package.json
fi

echo -e "${GREEN}✓ تم إزالة خدمات Microsoft${NC}"

# =============================================================================
# 5. تعطيل التوصيات
# =============================================================================
echo -e "${YELLOW}[5/7] تعطيل التوصيات...${NC}"

if [ -f "src/vs/workbench/contrib/welcomeCommon/browser/contribution.ts" ]; then
    sed -i "s/'default': true/'default': false/g" src/vs/workbench/contrib/welcomeCommon/browser/contribution.ts
fi

echo -e "${GREEN}✓ تم تعطيل التوصيات${NC}"

# =============================================================================
# 6. تعديل ملفات المنصات
# =============================================================================
echo -e "${YELLOW}[6/7] تعديل ملفات المنصات...${NC}"

# Linux DEB
if [ -d "resources/linux/debian" ]; then
    if [ -f "resources/linux/debian/control.template" ]; then
        sed -i 's/Microsoft Corporation <vscode-linux@microsoft.com>/Redex Team <redex@redex-project.org>/g' resources/linux/debian/control.template
        sed -i 's/Visual Studio Code/Redex/g' resources/linux/debian/control.template
        sed -i 's|https://code.visualstudio.com|https://redex-project.org|g' resources/linux/debian/control.template
    fi
    
    if [ -f "resources/linux/debian/postinst.template" ]; then
        sed -i 's/code-oss/redex/g' resources/linux/debian/postinst.template
        sed -i 's/vscodium/redex/g' resources/linux/debian/postinst.template 2>/dev/null || true
    fi
fi

# RPM
if [ -d "resources/linux/rpm" ]; then
    if [ -f "resources/linux/rpm/code.spec.template" ]; then
        sed -i 's/Microsoft Corporation/Redex Team/g' resources/linux/rpm/code.spec.template
        sed -i 's/Visual Studio Code Team <vscode-linux@microsoft.com>/Redex Team <redex@redex-project.org>/g' resources/linux/rpm/code.spec.template
        sed -i 's/Visual Studio Code/Redex/g' resources/linux/rpm/code.spec.template
        sed -i 's|https://code.visualstudio.com|https://redex-project.org|g' resources/linux/rpm/code.spec.template
    fi
fi

# AppData
if [ -f "resources/linux/code.appdata.xml" ]; then
    sed -i 's/Visual Studio Code/Redex/g' resources/linux/code.appdata.xml
    sed -i 's|https://code.visualstudio.com|https://redex-project.org|g' resources/linux/code.appdata.xml
fi

# Windows
if [ -f "build/win32/code.iss" ]; then
    sed -i 's/Microsoft Corporation/Redex Team/g' build/win32/code.iss
    sed -i 's|https://code.visualstudio.com|https://redex-project.org|g' build/win32/code.iss
fi

# server manifest
if [ -f "resources/server/manifest.json" ]; then
    sed -i 's/Visual Studio Code/Redex/g' resources/server/manifest.json
    sed -i 's/code-oss/redex/g' resources/server/manifest.json
fi

# VisualElementsManifest.xml
if [ -f "resources/win32/VisualElementsManifest.xml" ]; then
    sed -i 's/Visual Studio Code/Redex/g' resources/win32/VisualElementsManifest.xml
fi

echo -e "${GREEN}✓ تم تعديل ملفات المنصات${NC}"

# =============================================================================
# 7. تحديث TypeScript source files
# =============================================================================
echo -e "${YELLOW}[7/7] تحديث ملفات المصدر...${NC}"

# تحديث الملفات التي تحتوي على Code-OSS
find_files_with_code_oss() {
    grep -rl "Code - OSS\|code-oss\|Code OSS\|Code - OSS" --include="*.ts" --include="*.json" . 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v "convert-" | grep -v "VSCODIUM"
}

# تحديث product.ts
if [ -f "src/vs/platform/product/common/product.ts" ]; then
    sed -i 's/Code - OSS/Redex/g' src/vs/platform/product/common/product.ts
    sed -i 's/code-oss/redex/g' src/vs/platform/product/common/product.ts
fi

# تحديث main.ts
if [ -f "src/main.ts" ]; then
    sed -i 's/Code - OSS/Redex/g' src/main.ts
    sed -i 's/code-oss/redex/g' src/main.ts
fi

# تحديث licenseAgreement.ts
if [ -f "src/vs/platform/endpoint/common/licenseAgreement.ts" ]; then
    sed -i 's/Visual Studio Code/Redex/g' src/vs/platform/endpoint/common/licenseAgreement.ts
fi

if [ -f "extensions/copilot/src/platform/endpoint/common/licenseAgreement.ts" ]; then
    sed -i 's/Visual Studio Code/Redex/g' extensions/copilot/src/platform/endpoint/common/licenseAgreement.ts
fi

# تحديث env.ts
if [ -f "extensions/microsoft-authentication/src/common/env.ts" ]; then
    sed -i 's/code.visualstudio.com/redex-project.org/g' extensions/microsoft-authentication/src/common/env.ts
fi

if [ -f "extensions/github-authentication/src/common/env.ts" ]; then
    sed -i 's/code.visualstudio.com/redex-project.org/g' extensions/github-authentication/src/common/env.ts
fi

# تحديث experimental services
if [ -f "extensions/typescript-language-features/src/experimentationService.ts" ]; then
    sed -i 's/code.visualstudio.com/redex-project.org/g' extensions/typescript-language-features/src/experimentationService.ts
fi

if [ -f "extensions/github-authentication/src/common/experimentationService.ts" ]; then
    sed -i 's/code.visualstudio.com/redex-project.org/g' extensions/github-authentication/src/common/experimentationService.ts
fi

# تحديث protocol handler
if [ -f "extensions/git/src/protocolHandler.ts" ]; then
    sed -i 's/code-oss/redex/g' extensions/git/src/protocolHandler.ts
fi

# تحديث extension scanning service
if [ -f "src/vs/platform/extensionManagement/common/extensionsScannerService.ts" ]; then
    sed -i 's/code-oss/redex/g' src/vs/platform/extensionManagement/common/extensionsScannerService.ts
fi

# تحديث userDataPath
if [ -f "src/vs/platform/environment/node/userDataPath.ts" ]; then
    sed -i 's/code-oss/redex/g' src/vs/platform/environment/node/userDataPath.ts
fi

echo -e "${GREEN}✓ تم تحديث ملفات المصدر${NC}"

# =============================================================================
# ملخص
# =============================================================================
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}                    ${GREEN}تمت العملية بنجاح!${NC}                        ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓${NC} تم تحويل المشروع إلى Redex"
echo ""
echo "التعديلات التي تمت:"
echo "  • تم تغيير اسم المنتج إلى Redex"
echo "  • تم تعطيل Telemetry (تتبع الاستخدام)"
echo "  • تم تعطيل التحديثات التلقائية"
echo "  • تم تغيير Marketplace إلى Open-VSX"
echo "  • تم تغيير جميع روابط Microsoft"
echo "  • تم تعطيل التوصيات"
echo "  • تم تعديل ملفات جميع المنصات"
echo ""
echo "الخطوة التالية:"
echo "  npm run compile    # تجميع الكود"
echo "  npm run typecheck-client  # فحص TypeScript"
echo ""
echo "للتراجع عن التغييرات:"
echo "  git checkout -- ."
echo ""
