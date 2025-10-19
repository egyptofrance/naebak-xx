# نظام البحث والفلترة الكامل - تحديث شامل

## 📅 التاريخ
19 أكتوبر 2025

---

## 🎯 الهدف من التحديث

تطوير نظام بحث وفلترة متقدم في لوحة الأدمن بناءً على **بنية قاعدة البيانات الفعلية** من Supabase، مع دعم كامل للعلاقات (relationships) والجداول المرتبطة.

---

## 📊 تحليل قاعدة البيانات

### الجداول الرئيسية المستخدمة:

#### 1. `user_profiles` - جدول المستخدمين
**الحقول المتاحة:**
- `id`, `full_name`, `email`, `phone`
- `governorate_id` (FK → governorates)
- `party_id` (FK → parties)
- `city`, `district`, `village`, `electoral_district`
- `job_title`, `address`, `gender`, `role`

**العلاقات:**
- ← `governorates.id` (SET NULL on delete)
- ← `parties.id` (SET NULL on delete)
- → `deputy_profiles.user_id`

---

#### 2. `deputy_profiles` - جدول النواب
**الحقول المتاحة:**
- `id`, `user_id` (FK → user_profiles)
- `deputy_status`, `council_id` (FK → councils)
- `electoral_symbol`, `electoral_number`
- `bio`, `office_address`, `office_phone`, `office_hours`
- `social_media_*`, `website_url`

**العلاقات:**
- ← `user_profiles.id` (FK)
- ← `councils.id` (FK)

---

#### 3. `governorates` - جدول المحافظات
- `id`, `name_ar`, `name_en`, `code`

#### 4. `parties` - جدول الأحزاب
- `id`, `name_ar`, `name_en`, `abbreviation`

#### 5. `councils` - جدول المجالس
- `id`, `name_ar`, `name_en`, `code`

---

## ✨ الميزات الجديدة

### 1. البحث في صفحة إضافة نائب (`searchUsersAction`)

**الوظيفة:** البحث في المستخدمين لتحويلهم إلى نواب

**البحث يشمل:**
- ✅ الاسم الكامل (full_name)
- ✅ البريد الإلكتروني (email)
- ✅ رقم الهاتف (phone)

**البيانات المرجعة:**
```typescript
{
  id: string;
  full_name: string;
  email: string;
  phone: string;
  governorate_id: string;
  party_id: string;
  city: string;
  district: string;
  electoral_district: string;
  governorates: {
    id: string;
    name_ar: string;
    name_en: string;
    code: string;
  };
  parties: {
    id: string;
    name_ar: string;
    name_en: string;
    abbreviation: string;
  };
  isDeputy: boolean; // تم إضافته تلقائياً
}
```

**الاستخدام:**
```typescript
const { execute } = useAction(searchUsersAction);
execute({ query: "ahmed" });
```

---

### 2. البحث في قائمة المستخدمين (`getPaginatedUserListAction`)

**الوظيفة:** البحث والفلترة المتقدمة في قائمة جميع المستخدمين

**البحث النصي يشمل:**
- ✅ الاسم الكامل (full_name)
- ✅ البريد الإلكتروني (email)
- ✅ رقم الهاتف (phone)
- ✅ المدينة (city)
- ✅ المنطقة (district)
- ✅ الدائرة الانتخابية (electoral_district)

**الفلاتر المتاحة:**
- ✅ المحافظة (governorateId)
- ✅ الحزب (partyId)
- ✅ الدور (role)
- ✅ الجنس (gender)

**الاستخدام:**
```typescript
const { execute } = useAction(getPaginatedUserListAction);
execute({
  query: "ahmed",
  page: 1,
  limit: 10,
  governorateId: "uuid-here",
  partyId: "uuid-here",
  role: "citizen",
  gender: "male"
});
```

---

### 3. دوال مساعدة جديدة

#### `getGovernoratesAction`
جلب قائمة المحافظات للاستخدام في القوائم المنسدلة (dropdowns)

```typescript
const { execute } = useAction(getGovernoratesAction);
const { governorates } = await execute();
```

#### `getPartiesAction`
جلب قائمة الأحزاب النشطة

```typescript
const { execute } = useAction(getPartiesAction);
const { parties } = await execute();
```

#### `getCouncilsAction`
جلب قائمة المجالس النشطة

```typescript
const { execute } = useAction(getCouncilsAction);
const { councils } = await execute();
```

---

### 4. عمليات CRUD للنواب

#### `createDeputyAction`
تحويل مستخدم عادي إلى نائب

```typescript
const { execute } = useAction(createDeputyAction);
execute({ 
  userId: "user-uuid", 
  deputyStatus: "active" 
});
```

#### `getDeputiesAction`
جلب قائمة جميع النواب مع معلوماتهم الكاملة

```typescript
const { execute } = useAction(getDeputiesAction);
const { deputies } = await execute();
```

#### `getDeputyByIdAction`
جلب معلومات نائب واحد بالتفصيل

```typescript
const { execute } = useAction(getDeputyByIdAction);
const { deputy } = await execute({ deputyId: "deputy-uuid" });
```

#### `updateDeputyAction`
تحديث معلومات النائب

```typescript
const { execute } = useAction(updateDeputyAction);
execute({
  deputyId: "deputy-uuid",
  bio: "السيرة الذاتية",
  officeAddress: "عنوان المكتب",
  // ... باقي الحقول
});
```

#### `deleteDeputyAction`
حذف ملف نائب (تحويله مرة أخرى إلى مستخدم عادي)

```typescript
const { execute } = useAction(deleteDeputyAction);
execute({ deputyId: "deputy-uuid" });
```

---

## 🔧 الملفات المعدلة

### 1. `src/data/admin/deputies.ts`
**التغييرات:**
- ✅ إعادة كتابة كاملة للملف
- ✅ إضافة Supabase joins الصحيحة
- ✅ إزالة الإشارات إلى جداول غير موجودة (app_admins)
- ✅ إضافة جميع عمليات CRUD للنواب
- ✅ إضافة دوال مساعدة (getCouncilsAction)

**قبل:**
```typescript
const { data: users, error } = await supabase
  .from("user_profiles")
  .select(`
    id, full_name, email, phone,
    governorates (...), // ❌ خطأ
    parties (...)        // ❌ خطأ
  `)
```

**بعد:**
```typescript
const { data: users, error } = await supabase
  .from("user_profiles")
  .select(`
    id, full_name, email, phone,
    governorate_id, party_id,
    governorates (id, name_ar, name_en, code), // ✅ صحيح
    parties (id, name_ar, name_en, abbreviation) // ✅ صحيح
  `)
```

---

### 2. `src/data/admin/user.tsx`
**التغييرات:**
- ✅ تحسين البحث ليشمل 6 حقول بدلاً من 1
- ✅ إضافة 4 فلاتر جديدة (governorate, party, role, gender)
- ✅ إضافة Supabase joins للمحافظات والأحزاب
- ✅ إضافة دوال مساعدة (getGovernoratesAction, getPartiesAction)

**قبل:**
```typescript
if (query) {
  supabaseQuery = supabaseQuery.ilike("full_name", `%${query}%`);
}
```

**بعد:**
```typescript
if (query) {
  supabaseQuery = supabaseQuery.or(
    `full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,city.ilike.%${query}%,district.ilike.%${query}%,electoral_district.ilike.%${query}%`
  );
}

// Filters
if (governorateId) {
  supabaseQuery = supabaseQuery.eq("governorate_id", governorateId);
}
if (partyId) {
  supabaseQuery = supabaseQuery.eq("party_id", partyId);
}
// ... etc
```

---

### 3. ملفات التوثيق الجديدة

- ✅ `DATABASE_STRUCTURE.md` - توثيق كامل لبنية قاعدة البيانات
- ✅ `SEARCH_FIXES_SUMMARY.md` - ملخص الإصلاحات السابقة
- ✅ `ADMIN_FIXES_SUMMARY.md` - ملخص إصلاحات الأدمن
- ✅ `COMPLETE_SEARCH_SYSTEM.md` - هذا الملف

---

## 🚀 كيفية الاستخدام

### في صفحة إضافة نائب:

```typescript
import { searchUsersAction, createDeputyAction } from "@/data/admin/deputies";

// البحث عن مستخدمين
const { execute: search } = useAction(searchUsersAction);
const results = await search({ query: "ahmed" });

// تحويل مستخدم إلى نائب
const { execute: create } = useAction(createDeputyAction);
await create({ userId: "user-id", deputyStatus: "active" });
```

---

### في صفحة المستخدمين:

```typescript
import { 
  getPaginatedUserListAction, 
  getGovernoratesAction,
  getPartiesAction 
} from "@/data/admin/user";

// جلب المحافظات للفلتر
const { governorates } = await getGovernoratesAction();

// جلب الأحزاب للفلتر
const { parties } = await getPartiesAction();

// البحث مع الفلاتر
const { execute } = useAction(getPaginatedUserListAction);
const users = await execute({
  query: "ahmed",
  governorateId: selectedGovernorate,
  partyId: selectedParty,
  page: 1,
  limit: 10
});
```

---

## ⚠️ ملاحظات مهمة

### 1. إعادة تشغيل التطبيق مطلوبة
بعد رفع التغييرات إلى GitHub، يجب **إعادة تشغيل** (restart) التطبيق لتحميل الكود الجديد:

```bash
# في بيئة التطوير
npm run dev

# أو في الإنتاج
npm run build
npm start
```

---

### 2. العلاقات موجودة في قاعدة البيانات
جميع العلاقات (Foreign Keys) موجودة وصحيحة:
- ✅ `user_profiles.governorate_id` → `governorates.id`
- ✅ `user_profiles.party_id` → `parties.id`
- ✅ `deputy_profiles.user_id` → `user_profiles.id`
- ✅ `deputy_profiles.council_id` → `councils.id`

---

### 3. Supabase Joins تعمل بشكل صحيح
الكود الجديد يستخدم Supabase joins بالطريقة الصحيحة:

```typescript
.select(`
  *,
  governorates (
    id,
    name_ar,
    name_en
  ),
  parties (
    id,
    name_ar,
    name_en
  )
`)
```

---

## 📈 التحسينات المستقبلية المقترحة

### 1. إضافة بحث في قائمة النواب
حالياً قائمة النواب تعرض جميع النواب بدون بحث. يمكن إضافة:
- بحث بالاسم، البريد، الهاتف
- فلترة حسب المحافظة، الحزب، المجلس، الحالة

### 2. إضافة ترتيب (Sorting)
- ترتيب حسب الاسم (أ-ي)
- ترتيب حسب تاريخ الإنشاء (الأحدث أولاً)
- ترتيب حسب التقييم

### 3. إضافة تصدير (Export)
- تصدير قائمة المستخدمين إلى Excel
- تصدير قائمة النواب إلى PDF

### 4. إضافة إحصائيات
- عدد المستخدمين حسب المحافظة
- عدد النواب حسب الحزب
- توزيع النواب حسب المجالس

---

## 🔄 معلومات Git

### Commit 1: إصلاح البحث الأساسي
**Hash:** `3c42c3e`
**Message:** `fix: improve search functionality in deputies and users admin pages`

### Commit 2: النظام الكامل
**Hash:** `dbd2af0`
**Message:** `feat: complete search and filter system overhaul based on database structure`

**الملفات المعدلة:**
- `src/data/admin/deputies.ts` (إعادة كتابة كاملة)
- `src/data/admin/user.tsx` (تحسينات كبيرة)
- `DATABASE_STRUCTURE.md` (جديد)
- `SEARCH_FIXES_SUMMARY.md` (جديد)
- `ADMIN_FIXES_SUMMARY.md` (موجود سابقاً)

**الإحصائيات:**
- 4 ملفات معدلة
- 587 سطر مضاف
- 15 سطر محذوف

---

## ✅ الخلاصة

تم تطوير نظام بحث وفلترة متقدم وشامل يعتمد على:

1. ✅ **بنية قاعدة البيانات الفعلية** من Supabase
2. ✅ **العلاقات الصحيحة** بين الجداول
3. ✅ **Supabase joins** بالطريقة الصحيحة
4. ✅ **بحث متقدم** في 6 حقول مختلفة
5. ✅ **فلاتر متعددة** (محافظة، حزب، دور، جنس)
6. ✅ **عمليات CRUD كاملة** للنواب
7. ✅ **دوال مساعدة** لجلب البيانات المرجعية
8. ✅ **توثيق شامل** لجميع التغييرات

**النظام الآن جاهز للاستخدام بعد إعادة تشغيل التطبيق!** 🎉

