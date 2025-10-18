# صفحة التشخيص - System Diagnostics

**المسار:** `/en/app_admin/diagnostics`  
**الصلاحيات:** Admin فقط

---

## 🎯 الغرض

صفحة شاملة لاكتشاف جميع الأخطاء والمشاكل في النظام بشكل تلقائي.

---

## ✅ الفحوصات التي تقوم بها

### 1. Users (المستخدمين)

#### ✓ Users Without Workspace
- **الوصف:** البحث عن مستخدمين ليس لديهم workspace
- **الحالة المثالية:** 0 مستخدمين
- **إذا وجدت مشكلة:** يجب تشغيل SQL لإنشاء workspace لهم

#### ⚠️ Users Without Avatar
- **الوصف:** البحث عن مستخدمين بدون صورة شخصية
- **الحالة:** تحذير (ليس خطأ حرج)
- **التأثير:** تجربة مستخدم أقل

#### ℹ️ Admin Users
- **الوصف:** عرض قائمة المستخدمين الذين لديهم صلاحيات Admin
- **الحالة:** معلومات فقط

---

### 2. Workspaces

#### ✓ Workspaces Without Settings
- **الوصف:** البحث عن workspaces بدون `workspace_application_settings`
- **الحالة المثالية:** 0 workspaces
- **إذا وجدت مشكلة:** يجب إضافة settings لهم

#### ✓ Workspaces Without Owner
- **الوصف:** البحث عن workspaces ليس لها owner
- **الحالة المثالية:** 0 workspaces
- **إذا وجدت مشكلة:** خطأ حرج - يجب إصلاحه فوراً

#### ⚠️ Members Without Permissions
- **الوصف:** البحث عن أعضاء workspace بدون permissions
- **الحالة:** تحذير
- **التأثير:** قد لا يتمكنون من القيام بأي عمليات

---

### 3. Statistics (الإحصائيات)

#### ℹ️ Database Statistics
- **الوصف:** عرض إحصائيات عامة عن قاعدة البيانات
- **البيانات:**
  - عدد المستخدمين
  - عدد Workspaces
  - عدد الأعضاء
  - عدد Settings

---

## 🎨 واجهة الصفحة

### العناصر الرئيسية:

1. **Header:**
   - عنوان الصفحة
   - عدد الأخطاء والتحذيرات

2. **Summary Cards:**
   - Total Checks (إجمالي الفحوصات)
   - Passed (الناجحة)
   - Issues Found (المشاكل المكتشفة)

3. **Results by Category:**
   - كل فئة في Card منفصلة
   - كل فحص في Alert مع:
     - أيقونة الحالة (✓ ✗ ⚠ ℹ)
     - Badge للحالة
     - رسالة توضيحية
     - تفاصيل إضافية (إذا وجدت)
     - البيانات الكاملة (قابلة للتوسيع)

4. **Footer:**
   - معلومات عن آخر تشغيل
   - ملخص الحالة

---

## 🎨 الألوان والحالات

| الحالة | اللون | الأيقونة | المعنى |
|--------|-------|---------|---------|
| Success | أخضر | ✓ | كل شيء على ما يرام |
| Error | أحمر | ✗ | خطأ حرج يجب إصلاحه |
| Warning | أصفر | ⚠ | تحذير - ليس حرج لكن يفضل الإصلاح |
| Info | أزرق | ℹ | معلومات فقط |

---

## 📊 مثال على النتائج

### حالة صحية (All Clear):
```
✅ All Clear
Total Checks: 7
Passed: 7
Issues Found: 0
```

### حالة بها مشاكل:
```
❌ 2 Errors  ⚠️ 1 Warning
Total Checks: 7
Passed: 4
Issues Found: 3

Errors:
- Users Without Workspace: Found 2 users
- Workspaces Without Settings: Found 1 workspace

Warnings:
- Users Without Avatar: Found 5 users
```

---

## 🔧 كيفية الاستخدام

### 1. الوصول للصفحة:
```
https://naebak.com/en/app_admin/diagnostics
```

### 2. قراءة النتائج:
- انظر إلى الـ Summary في الأعلى
- إذا كان "All Clear" → كل شيء تمام ✅
- إذا كان هناك Errors → اقرأ التفاصيل

### 3. عرض البيانات:
- اضغط على "View Data" لرؤية البيانات الكاملة
- يمكنك نسخ الـ JSON للتحليل

### 4. الإصلاح:
- كل خطأ يحتوي على رسالة توضيحية
- استخدم الـ SQL المناسب للإصلاح

---

## 🛠️ إضافة فحوصات جديدة

لإضافة فحص جديد، أضف الكود في دالة `runDiagnostics()`:

```typescript
// مثال: التحقق من Projects بدون Team Members
try {
  const { data: projectsWithoutMembers, error } = await supabase
    .from("projects")
    .select("id, name")
    .not("id", "in", supabase.from("project_team_members").select("project_id"));

  if (error) throw error;

  results.push({
    category: "Projects",
    name: "Projects Without Members",
    status: projectsWithoutMembers && projectsWithoutMembers.length > 0 ? "warning" : "success",
    message: projectsWithoutMembers && projectsWithoutMembers.length > 0
      ? `Found ${projectsWithoutMembers.length} projects without members`
      : "All projects have members",
    data: projectsWithoutMembers,
  });
} catch (e: any) {
  results.push({
    category: "Projects",
    name: "Projects Without Members",
    status: "error",
    message: "Failed to check projects",
    details: e.message,
  });
}
```

---

## 🔐 الأمان

- ✅ الصفحة في مجلد `(admin-pages)` → Admin فقط
- ✅ تستخدم `createSupabaseUserServerComponentClient` → Row Level Security مفعل
- ✅ لا تعرض معلومات حساسة (passwords, tokens, etc.)
- ✅ البيانات الحساسة مخفية بشكل افتراضي (داخل `<details>`)

---

## 📝 ملاحظات مهمة

### 1. Performance:
- الصفحة تقوم بعدة queries في نفس الوقت
- قد تأخذ 2-3 ثواني للتحميل
- يمكن تحسينها بإضافة caching لاحقاً

### 2. Real-time:
- النتائج تُحدّث عند كل refresh
- ليست real-time (لا تستخدم subscriptions)
- يمكن إضافة زر "Refresh" لاحقاً

### 3. Permissions:
- تتطلب صلاحيات Admin
- إذا حاول مستخدم عادي الوصول، سيحصل على 403

---

## 🚀 التحسينات المستقبلية

### قصيرة المدى:
- [ ] إضافة زر "Auto-fix" لإصلاح المشاكل تلقائياً
- [ ] إضافة زر "Refresh" بدون reload الصفحة
- [ ] إضافة export للنتائج (JSON, CSV)

### متوسطة المدى:
- [ ] إضافة Scheduled Diagnostics (تشغيل تلقائي كل ساعة)
- [ ] إرسال Email عند اكتشاف أخطاء حرجة
- [ ] Dashboard للـ diagnostics history

### طويلة المدى:
- [ ] AI-powered suggestions للإصلاح
- [ ] Integration مع monitoring tools (Sentry, etc.)
- [ ] Performance metrics

---

## 🎯 الخلاصة

صفحة التشخيص هي أداة قوية لـ:
- ✅ اكتشاف المشاكل مبكراً
- ✅ مراقبة صحة النظام
- ✅ تسهيل الصيانة
- ✅ توفير الوقت في debugging

**استخدمها بانتظام للحفاظ على صحة النظام!** 🚀

