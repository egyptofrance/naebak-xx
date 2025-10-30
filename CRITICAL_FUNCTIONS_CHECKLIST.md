# قائمة الوظائف الحرجة - يجب اختبارها بعد كل مرحلة

## 🔴 الوظائف الأكثر حساسية (CRITICAL)

### 1. تسجيل مستخدم جديد والـ Onboarding
**الملفات الرئيسية:**
- `src/data/auth/auth.ts` - دوال التسجيل والمصادقة
- `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/onboarding/` - مسار الـ onboarding
- `src/middlewares/onboarding-middleware.ts` - middleware الـ onboarding

**المراحل المطلوب اختبارها:**
1. ✅ تسجيل حساب جديد (Sign Up)
2. ✅ تأكيد البريد الإلكتروني
3. ✅ صفحة الـ Onboarding الأولى
4. ✅ تحديث البروفايل (ProfileUpdate.tsx)
5. ✅ قبول الشروط (TermsAcceptance.tsx)
6. ✅ إعداد Workspace (SetupWorkspaces.tsx)
7. ✅ صفحة الإنهاء (FinishingUp.tsx)
8. ✅ الانتقال لصفحة Home بعد إتمام الـ Onboarding

**التبعيات المستخدمة:**
- `@supabase/supabase-js` ✅ (موجودة ولن تُحذف)
- `@supabase/ssr` ✅ (موجودة ولن تُحذف)
- `react-hook-form` ✅ (موجودة ولن تُحذف)
- `zod` ✅ (موجودة ولن تُحذف)
- `next-safe-action` ✅ (موجودة ولن تُحذف)

**✅ آمنة:** لا توجد تبعيات مستخدمة في هذه الوظيفة ضمن قائمة الحذف

---

### 2. الترقية إلى نائب (Deputy)
**الملف الرئيسي:**
- `src/data/admin/deputies.ts` - دالة `createDeputyAction`

**الخطوات المطلوب اختبارها:**
1. ✅ اختيار مستخدم citizen
2. ✅ الضغط على "ترقية إلى نائب"
3. ✅ التحقق من إضافة role "deputy" في user_roles
4. ✅ التحقق من إنشاء deputy_profile
5. ✅ التحقق من نسخ البيانات (gender, governorate)
6. ✅ التحقق من ظهور النائب في قائمة النواب
7. ✅ التحقق من صلاحيات النائب الجديد

**التبعيات المستخدمة:**
- `@supabase/supabase-js` ✅ (موجودة ولن تُحذف)
- `zod` ✅ (موجودة ولن تُحذف)
- `next-safe-action` ✅ (موجودة ولن تُحذف)

**✅ آمنة:** لا توجد تبعيات مستخدمة في هذه الوظيفة ضمن قائمة الحذف

---

### 3. الترقية إلى مدير (Manager)
**الملف الرئيسي:**
- `src/data/admin/managers.ts` - دالة `promoteToManagerAction`

**الخطوات المطلوب اختبارها:**
1. ✅ اختيار مستخدم citizen
2. ✅ الضغط على "ترقية إلى مدير"
3. ✅ التحقق من حذف role "citizen" (إن وُجد)
4. ✅ التحقق من إضافة role "manager" في user_roles
5. ✅ التحقق من إنشاء manager_permissions
6. ✅ التحقق من الصلاحيات الافتراضية للمدير
7. ✅ التحقق من ظهور المدير في قائمة المديرين
8. ✅ التحقق من صلاحيات المدير الجديد

**التبعيات المستخدمة:**
- `@supabase/supabase-js` ✅ (موجودة ولن تُحذف)
- `zod` ✅ (موجودة ولن تُحذف)
- `next-safe-action` ✅ (موجودة ولن تُحذف)

**✅ آمنة:** لا توجد تبعيات مستخدمة في هذه الوظيفة ضمن قائمة الحذف

---

## 🟡 وظائف مهمة أخرى (HIGH PRIORITY)

### 4. تسجيل الدخول (Login)
**الملفات:**
- `src/data/auth/auth.ts`
- `src/app/[locale]/(dynamic-pages)/(misc-login-pages)/auth/`

**الاختبارات:**
1. ✅ تسجيل دخول بـ email/password
2. ✅ تسجيل دخول بـ magic link
3. ✅ تسجيل دخول بـ OAuth (إن وُجد)

### 5. إدارة الشكاوى (Complaints)
**الملفات:**
- `src/data/complaints/complaints.ts`

**الاختبارات:**
1. ✅ إنشاء شكوى جديدة
2. ✅ عرض الشكاوى
3. ✅ تحديث حالة الشكوى
4. ✅ حذف شكوى

### 6. إدارة المحتوى للنائب
**الملفات:**
- `src/data/admin/deputy-content.tsx`

**الاختبارات:**
1. ✅ إضافة برنامج انتخابي
2. ✅ إضافة إنجاز
3. ✅ إضافة مشروع
4. ✅ إضافة حدث

---

## 📋 سكريبت الاختبار السريع

بعد كل مرحلة، نفذ هذا السكريبت للتحقق من الوظائف الحرجة:

```bash
#!/bin/bash
# test-critical-functions.sh

echo "🧪 Testing Critical Functions"
echo "=============================="
echo ""

# Start the dev server in background
echo "🚀 Starting dev server..."
pnpm dev > /dev/null 2>&1 &
DEV_PID=$!
sleep 10  # Wait for server to start

echo "✅ Dev server started (PID: $DEV_PID)"
echo ""

echo "📝 Manual Testing Checklist:"
echo ""
echo "1. 🔴 CRITICAL: Sign Up & Onboarding"
echo "   [ ] Go to /signup"
echo "   [ ] Register new user"
echo "   [ ] Complete onboarding flow"
echo "   [ ] Verify home page loads"
echo ""
echo "2. 🔴 CRITICAL: Promote to Deputy"
echo "   [ ] Login as admin"
echo "   [ ] Go to /app_admin/users"
echo "   [ ] Select a citizen user"
echo "   [ ] Click 'Promote to Deputy'"
echo "   [ ] Verify deputy appears in /app_admin/deputies"
echo ""
echo "3. 🔴 CRITICAL: Promote to Manager"
echo "   [ ] Login as admin"
echo "   [ ] Go to /app_admin/users"
echo "   [ ] Select a citizen user"
echo "   [ ] Click 'Promote to Manager'"
echo "   [ ] Verify manager appears in /app_admin/managers"
echo ""
echo "4. 🟡 Login"
echo "   [ ] Test login with email/password"
echo "   [ ] Test magic link login"
echo ""
echo "5. 🟡 Complaints"
echo "   [ ] Create new complaint"
echo "   [ ] View complaints list"
echo "   [ ] Update complaint status"
echo ""

read -p "Press Enter when testing is complete..."

# Kill dev server
kill $DEV_PID
echo ""
echo "✅ Testing complete!"
```

---

## 🛡️ ضمانات الأمان

### ما تم التحقق منه:

✅ **جميع التبعيات المستخدمة في الوظائف الحرجة محمية:**
- `@supabase/supabase-js` - ✅ لن تُحذف
- `@supabase/ssr` - ✅ لن تُحذف
- `react-hook-form` - ✅ لن تُحذف
- `zod` - ✅ لن تُحذف
- `next-safe-action` - ✅ لن تُحذف
- `next` - ✅ لن تُحذف
- `react` - ✅ لن تُحذف

✅ **الحزم المطلوب حذفها لا تؤثر على الوظائف الحرجة:**
- كل الحزم في قائمة الحذف غير مستخدمة في:
  - Auth/Signup/Onboarding
  - Deputy promotion
  - Manager promotion

✅ **المرحلة الأولى آمنة 100% للوظائف الحرجة**

---

## 📊 جدول التأثير المحتمل

| الوظيفة | التبعيات المستخدمة | في قائمة الحذف؟ | مستوى الخطر |
|:---|:---|:---:|:---:|
| Sign Up & Onboarding | Supabase, React Hook Form, Zod | ❌ لا | 🟢 آمن |
| Promote to Deputy | Supabase, Zod, Next Safe Action | ❌ لا | 🟢 آمن |
| Promote to Manager | Supabase, Zod, Next Safe Action | ❌ لا | 🟢 آمن |
| Login | Supabase, Next | ❌ لا | 🟢 آمن |
| Complaints | Supabase, Zod | ❌ لا | 🟢 آمن |

---

## ✅ الخلاصة

**المرحلة الأولى (حذف التبعيات) آمنة تماماً للوظائف الحرجة:**
- لا توجد أي تبعية مستخدمة في الوظائف الحرجة ضمن قائمة الحذف
- جميع الحزم المطلوب حذفها غير مستخدمة في الكود الفعلي
- تم التحقق من ذلك باستخدام `depcheck`

**مع ذلك، سنختبر كل شيء بعد التنفيذ للتأكد 100%**
