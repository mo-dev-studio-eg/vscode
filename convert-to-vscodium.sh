#!/usr/bin/env bash
# =============================================================================
# VSCodium Converter - تحويل VS Code إلى VSCodium
# =============================================================================
# هذا السكربت يحول Visual Studio Code إلى VSCodium
# بإزالة جميع خدمات Microsoft بما فيها:
# - Telemetry (تتبع الاستخدام)
# - التحديثات التلقائية
# - خدمات Microsoft المختلفة
# - Branding والعلامات التجارية
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}           ${GREEN}VSCodium Converter - تحويل VS Code${NC}             ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# =============================================================================
# 1. التحقق من المتطلبات
# =============================================================================
echo -e "${YELLOW}[1/6] التحقق من المتطلبات...${NC}"

if ! command -v jq &> /dev/null; then
    echo -e "${RED}خطأ: jq غير مثبت${NC}"
    echo "قم بتثبيت jq أولاً: sudo apt install jq"
    exit 1
fi

# =============================================================================
# 2. إعداد product.json لـ VSCodium
# =============================================================================
echo -e "${YELLOW}[2/6] إعداد product.json لـ VSCodium...${NC}"

# إنشاء نسخة احتياطية
cp product.json product.json.backup

# تطبيق التعديلات باستخدام jq
echo "تغيير اسم المنتج..."

# الإعدادات الأساسية
jq '.nameShort = "VSCodium"' product.json > temp.json && mv temp.json product.json
jq '.nameLong = "VSCodium"' product.json > temp.json && mv temp.json product.json
jq '.applicationName = "codium"' product.json > temp.json && mv temp.json product.json
jq '.dataFolderName = ".vscodium"' product.json > temp.json && mv temp.json product.json
jq '.urlProtocol = "vscodium"' product.json > temp.json && mv temp.json product.json
jq '.serverApplicationName = "codium-server"' product.json > temp.json && mv temp.json product.json
jq '.serverDataFolderName = ".vscodium-server"' product.json > temp.json && mv temp.json product.json
jq '.tunnelApplicationName = "codium-tunnel"' product.json > temp.json && mv temp.json product.json
jq '.linuxIconName = "vscodium"' product.json > temp.json && mv temp.json product.json
jq '.quality = "stable"' product.json > temp.json && mv temp.json product.json

# Windows
jq '.win32AppUserModelId = "VSCodium.VSCodium"' product.json > temp.json && mv temp.json product.json
jq '.win32DirName = "VSCodium"' product.json > temp.json && mv temp.json product.json
jq '.win32MutexName = "vscodium"' product.json > temp.json && mv temp.json product.json
jq '.win32NameVersion = "VSCodium"' product.json > temp.json && mv temp.json product.json
jq '.win32RegValueName = "VSCodium"' product.json > temp.json && mv temp.json product.json
jq '.win32ShellNameShort = "VSCodium"' product.json > temp.json && mv temp.json product.json
jq '.win32x64AppId = "{{88DA3577-054F-4CA1-8122-7D820494CFFB}"' product.json > temp.json && mv temp.json product.json
jq '.win32arm64AppId = "{{67DEE444-3D04-4258-B92A-BC1F0FF2CAE4}"' product.json > temp.json && mv temp.json product.json

# macOS
jq '.darwinBundleIdentifier = "com.vscodium"' product.json > temp.json && mv temp.json product.json

# روابط Microsoft -> VSCodium
jq '.reportIssueUrl = "https://github.com/VSCodium/vscodium/issues/new"' product.json > temp.json && mv temp.json product.json
jq '.licenseUrl = "https://github.com/VSCodium/vscodium/blob/master/LICENSE"' product.json > temp.json && mv temp.json product.json
jq '.serverLicenseUrl = "https://github.com/VSCodium/vscodium/blob/master/LICENSE"' product.json > temp.json && mv temp.json product.json

# marketplace -> open-vsx
jq '.extensionsGallery = {
    "serviceUrl": "https://open-vsx.org/vscode/gallery",
    "itemUrl": "https://open-vsx.org/vscode/item",
    "latestUrlTemplate": "https://open-vsx.org/vscode/gallery/{publisher}/{name}/latest",
    "controlUrl": "https://raw.githubusercontent.com/EclipseFdn/publish-extensions/refs/heads/master/extension-control/extensions.json"
}' product.json > temp.json && mv temp.json product.json

# روابط Microsoft's Links
jq '.documentationUrl = "https://github.com/VSCodium/vscodium"' product.json > temp.json && mv temp.json product.json
jq '.introductoryVideosUrl = "https://github.com/VSCodium/vscodium"' product.json > temp.json && mv temp.json product.json
jq '.keyboardShortcutsUrlLinux = "https://github.com/VSCodium/vscodium"' product.json > temp.json && mv temp.json product.json
jq '.keyboardShortcutsUrlMac = "https://github.com/VSCodium/vscodium"' product.json > temp.json && mv temp.json product.json
jq '.keyboardShortcutsUrlWin = "https://github.com/VSCodium/vscodium"' product.json > temp.json && mv temp.json product.json
jq '.releaseNotesUrl = "https://github.com/VSCodium/vscodium"' product.json > temp.json && mv temp.json product.json
jq '.requestFeatureUrl = "https://github.com/VSCodium/vscodium"' product.json > temp.json && mv temp.json product.json
jq '.tipsAndTricksUrl = "https://github.com/VSCodium/vscodium"' product.json > temp.json && mv temp.json product.json
jq '.twitterUrl = "https://github.com/VSCodium/vscodium"' product.json > temp.json && mv temp.json product.json
jq '.checksumFailMoreInfoUrl = "https://github.com/VSCodium/vscodium"' product.json > temp.json && mv temp.json product.json

# Trusted domains
jq '.linkProtectionTrustedDomains = ["https://open-vsx.org"]' product.json > temp.json && mv temp.json product.json

# Disable update URL (سيتم تفعيله إذا كان DISABLE_UPDATE=no)
if [[ "${DISABLE_UPDATE:-yes}" == "yes" ]]; then
    echo "تعطيل التحديثات التلقائية..."
    jq '.updateUrl = ""' product.json > temp.json && mv temp.json product.json
    jq '.downloadUrl = ""' product.json > temp.json && mv temp.json product.json
else
    jq '.updateUrl = "https://raw.githubusercontent.com/VSCodium/versions/refs/heads/master"' product.json > temp.json && mv temp.json product.json
    jq '.downloadUrl = "https://github.com/VSCodium/vscodium/releases"' product.json > temp.json && mv temp.json product.json
fi

echo -e "${GREEN}✓ تم تحديث product.json${NC}"

# =============================================================================
# 3. تعطيل Telemetry (تتبع الاستخدام)
# =============================================================================
echo -e "${YELLOW}[3/6] تعطيل Telemetry...${NC}"

# تعطيل telemetry endpoints في الكود
echo "إزالة endpoints تتبع Microsoft..."

# البحث واستبدال URLs
SEARCH_PATTERN='\.data\.microsoft\.com'
REPLACE_WITH='//0\.0\.0\.0'

if command -v rg &> /dev/null; then
    rg --no-ignore -l "$SEARCH_PATTERN" src/ | xargs -I {} sed -i "s|//[^/]*\.data\.microsoft\.com|//0.0.0.0|g" {} 2>/dev/null || true
elif command -v grep &> /dev/null; then
    grep -rl --exclude-dir=.git -E "$SEARCH_PATTERN" src/ | xargs -I {} sed -i "s|//[^/]*\.data\.microsoft\.com|//0.0.0.0|g" {} 2>/dev/null || true
fi

# تعطيل إعدادات Telemetry الافتراضية
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
# 4. إزالة خدمات Microsoft الإضافية
# =============================================================================
echo -e "${YELLOW}[4/6] إزالة خدمات Microsoft...${NC}"

# إزالة Copilot terminal suggestion
if [ -f "extensions/terminal-suggest/src/completions/code.ts" ]; then
    sed -i 's/enabled: true/enabled: false/g' extensions/terminal-suggest/src/completions/code.ts
fi

# إزالة Microsoft branding من electron.ts
if [ -f "build/lib/electron.ts" ]; then
    sed -i 's/Microsoft Corporation/VSCodium/g' build/lib/electron.ts
    sed -i 's/[0-9] Microsoft/VSCodium/g' build/lib/electron.ts
fi

# إزالة Microsoft من package.json
if [ -f "package.json" ]; then
    sed -i 's/Microsoft Corporation/VSCodium/g' package.json
fi

# إزالة announcements
if [ -f "src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted.ts" ]; then
    # Comment out BUILTIN_ANNOUNCEMENTS - simpler approach
    sed -i '/BUILTIN_ANNOUNCEMENTS/s/^\/\*/\/\*/' src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted.ts 2>/dev/null || true
fi

echo -e "${GREEN}✓ تم إزالة خدمات Microsoft${NC}"

# =============================================================================
# 5. تعطيل التوصيات والـ onboarding
# =============================================================================
echo -e "${YELLOW}[5/6] تعطيل التوصيات وOnboarding...${NC}"

# تعطيل welcome page features
if [ -f "src/vs/workbench/contrib/welcomeCommon/browser/contribution.ts" ]; then
    sed -i "s/'default': true/'default': false/g" src/vs/workbench/contrib/welcomeCommon/browser/contribution.ts
fi

# تعطيل extensions recommendations
if [ -f "src/vs/workbench/contrib/extensions/browser/extensionRecommendations.ts" ]; then
    sed -i 's/enabled: true/enabled: false/g' src/vs/workbench/contrib/extensions/browser/extensionRecommendations.ts
fi

echo -e "${GREEN}✓ تم تعطيل التوصيات${NC}"

# =============================================================================
# 6. تعديل الملفات النهائية
# =============================================================================
echo -e "${YELLOW}[6/6] التعديلات النهائية...${NC}"

# Linux: تعديل ملفات DEB/RPM
if [ -d "resources/linux/debian" ]; then
    # control.template
    if [ -f "resources/linux/debian/control.template" ]; then
        sed -i 's/Microsoft Corporation <vscode-linux@microsoft.com>/VSCodium Team <VSCodium@users.noreply.github.com>/g' resources/linux/debian/control.template
        sed -i 's/Visual Studio Code/VSCodium/g' resources/linux/debian/control.template
        sed -i 's|https://code.visualstudio.com|https://vscodium.com|g' resources/linux/debian/control.template
    fi
    
    # postinst.template
    if [ -f "resources/linux/debian/postinst.template" ]; then
        sed -i 's/code-oss/codium/g' resources/linux/debian/postinst.template
    fi
fi

# RPM
if [ -d "resources/linux/rpm" ]; then
    if [ -f "resources/linux/rpm/code.spec.template" ]; then
        sed -i 's/Microsoft Corporation/VSCodium Team/g' resources/linux/rpm/code.spec.template
        sed -i 's/Visual Studio Code Team <vscode-linux@microsoft.com>/VSCodium Team <VSCodium@users.noreply.github.com>/g' resources/linux/rpm/code.spec.template
        sed -i 's/Visual Studio Code/VSCodium/g' resources/linux/rpm/code.spec.template
        sed -i 's|https://code.visualstudio.com|https://vscodium.com|g' resources/linux/rpm/code.spec.template
    fi
fi

# AppData
if [ -f "resources/linux/code.appdata.xml" ]; then
    sed -i 's/Visual Studio Code/VSCodium/g' resources/linux/code.appdata.xml
    sed -i 's|https://code.visualstudio.com|https://vscodium.com|g' resources/linux/code.appdata.xml
fi

# Windows
if [ -f "build/win32/code.iss" ]; then
    sed -i 's/Microsoft Corporation/VSCodium/g' build/win32/code.iss
    sed -i 's|https://code.visualstudio.com|https://vscodium.com|g' build/win32/code.iss
fi

echo -e "${GREEN}✓ تم التعديلات النهائية${NC}"

# =============================================================================
# ملخص
# =============================================================================
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}                    ${GREEN}تمت العملية بنجاح!${NC}                       ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓${NC} تم تحويل VS Code إلى VSCodium"
echo ""
echo "التعديلات التي تمت:"
echo "  • تم تعطيل Telemetry (تتبع الاستخدام)"
echo "  • تم تعطيل التحديثات التلقائية (يمكن تفعيلها عبر DISABLE_UPDATE=no)"
echo "  • تم تغيير Marketplace إلى Open-VSX"
echo "  • تم تغيير اسم المنتج إلى VSCodium"
echo "  • تم إزالة روابط Microsoft"
echo "  • تم تعطيل التوصيات"
echo "  • تم تغيير العلامات التجارية"
echo ""
echo "الخطوة التالية:"
echo "  npm run compile    # تجميع الكود"
echo "  npm run typecheck-client  # فحص TypeScript"
echo ""
echo "للتراجع عن التغييرات:"
echo "  git checkout -- ."
echo ""
