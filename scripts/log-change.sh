#!/bin/bash

# سكريبت لتسجيل التغييرات بسهولة
# الاستخدام: ./scripts/log-change.sh

echo "==================================="
echo "📝 تسجيل تغيير جديد"
echo "==================================="
echo ""

# الحصول على معلومات Git
CURRENT_BRANCH=$(git branch --show-current)
LAST_COMMIT=$(git log --oneline -1 | awk '{print $1}')
LAST_COMMIT_MSG=$(git log --oneline -1 | cut -d' ' -f2-)

echo "📍 Branch الحالي: $CURRENT_BRANCH"
echo "📍 آخر Commit: $LAST_COMMIT"
echo "📍 رسالة Commit: $LAST_COMMIT_MSG"
echo ""

# الحصول على التاريخ والوقت
CURRENT_DATE=$(date '+%d/%m/%Y')
CURRENT_TIME=$(date '+%H:%M')

echo "==================================="
echo "ℹ️  معلومات التغيير"
echo "==================================="
echo ""

# طلب معلومات التغيير
read -p "📝 عنوان التغيير: " CHANGE_TITLE
read -p "📄 وصف التغيير: " CHANGE_DESC
read -p "📂 الملفات المتأثرة (مفصولة بفواصل): " CHANGED_FILES
read -p "✅ هل التغيير نجح؟ (y/n): " SUCCESS

if [ "$SUCCESS" = "y" ]; then
    STATUS="✅ نجح"
else
    STATUS="❌ فشل"
fi

read -p "📝 ملاحظات إضافية (اختياري): " NOTES

echo ""
echo "==================================="
echo "💾 حفظ التغيير..."
echo "==================================="

# إضافة التغيير إلى CHANGELOG.md
cat >> CHANGELOG.md << EOF

---

### 📅 $CURRENT_DATE - $CURRENT_TIME

#### $STATUS التعديل: $CHANGE_TITLE

**الوصف:**
$CHANGE_DESC

**الملفات المتأثرة:**
$CHANGED_FILES

**النتيجة:** $STATUS

**Commit Hash:** \`$LAST_COMMIT\`

**ملاحظات:**
$NOTES

**للرجوع لهذا التعديل:**
\`\`\`bash
git cherry-pick $LAST_COMMIT
\`\`\`

EOF

echo ""
echo "✅ تم حفظ التغيير في CHANGELOG.md"
echo ""
echo "==================================="
echo "📊 ملخص التغيير"
echo "==================================="
echo "📅 التاريخ: $CURRENT_DATE $CURRENT_TIME"
echo "📝 العنوان: $CHANGE_TITLE"
echo "📄 الوصف: $CHANGE_DESC"
echo "📂 الملفات: $CHANGED_FILES"
echo "✅ الحالة: $STATUS"
echo "🔖 Commit: $LAST_COMMIT"
echo ""
echo "==================================="
echo "🎯 الخطوة التالية"
echo "==================================="
echo "1. راجع CHANGELOG.md للتأكد من التسجيل"
echo "2. عمل commit للتغييرات:"
echo "   git add CHANGELOG.md"
echo "   git commit -m \"docs: log change - $CHANGE_TITLE\""
echo "   git push origin $CURRENT_BRANCH"
echo ""
