# ميزات البحث والفلترة في قائمة النواب

## 📅 التاريخ
19 أكتوبر 2025

---

## 🎯 الميزات الجديدة المضافة

### 1. دالة البحث المتقدمة `searchDeputiesAction`

دالة جديدة للبحث والفلترة في قائمة النواب مع دعم كامل للـ pagination والفلاتر المتعددة.

#### المعاملات المدعومة:

```typescript
{
  query?: string;              // البحث النصي
  governorateId?: string;      // فلتر المحافظة
  partyId?: string;            // فلتر الحزب
  councilId?: string;          // فلتر المجلس
  deputyStatus?: "active" | "inactive";  // فلتر الحالة
  page?: number;               // رقم الصفحة (default: 1)
  limit?: number;              // عدد النتائج (default: 20)
}
```

#### البحث النصي يشمل:
- ✅ الاسم الكامل (user_profiles.full_name)
- ✅ البريد الإلكتروني (user_profiles.email)
- ✅ رقم الهاتف (user_profiles.phone)
- ✅ الرمز الانتخابي (electoral_symbol)
- ✅ الرقم الانتخابي (electoral_number)

#### الفلاتر المتاحة:
- ✅ **المحافظة** - عبر user_profiles.governorate_id
- ✅ **الحزب** - عبر user_profiles.party_id
- ✅ **المجلس** - عبر council_id
- ✅ **الحالة** - active أو inactive

#### البيانات المرجعة:

```typescript
{
  deputies: Deputy[];      // قائمة النواب
  total: number;          // إجمالي عدد النتائج
  totalPages: number;     // إجمالي عدد الصفحات
  currentPage: number;    // الصفحة الحالية
}
```

---

### 2. مكون DeputiesList - واجهة البحث والفلترة

مكون React جديد يوفر واجهة مستخدم كاملة للبحث والفلترة.

#### الميزات الرئيسية:

##### أ. شريط البحث
- بحث فوري عند الضغط على Enter
- placeholder واضح يشرح ما يمكن البحث عنه
- زر بحث منفصل
- زر مسح الفلاتر (يظهر عند وجود فلاتر نشطة)

##### ب. لوحة الفلاتر
- قابلة للإظهار/الإخفاء عبر زر "إظهار الفلاتر"
- تصميم responsive (4 أعمدة على الشاشات الكبيرة، عمود واحد على الموبايل)
- 4 فلاتر منفصلة:
  1. **المحافظة** - قائمة منسدلة بجميع المحافظات
  2. **الحزب** - قائمة منسدلة بجميع الأحزاب النشطة
  3. **المجلس** - قائمة منسدلة بجميع المجالس النشطة
  4. **الحالة** - اختيار بين نشط/غير نشط

##### ج. جدول النتائج
- عرض جميع بيانات النائب:
  - الاسم
  - البريد الإلكتروني
  - الهاتف
  - المحافظة
  - الحزب
  - المجلس
  - الرقم الانتخابي
  - الحالة (مع badge ملون)
  - زر تعديل
- رسائل واضحة عند عدم وجود نتائج
- تمييز بين "لا توجد نتائج" و "لا توجد نتائج تطابق البحث"

##### د. Pagination
- أزرار السابق/التالي
- عرض رقم الصفحة الحالية وإجمالي الصفحات
- تعطيل الأزرار عند الحاجة
- يظهر فقط عند وجود أكثر من صفحة

##### هـ. حالات التحميل
- رسالة "جاري التحميل..." أثناء البحث
- تعطيل الأزرار أثناء التحميل
- منع الضغط المتكرر

---

## 🔧 التفاصيل التقنية

### استخدام Inner Join

```typescript
user_profiles!inner (...)
```

استخدام `!inner` يضمن أن:
- كل نائب له user profile صحيح
- لا توجد نتائج null أو undefined
- البيانات متسقة ومترابطة

### الفلترة عبر الجداول المرتبطة

```typescript
// Filter by governorate (through user_profiles)
if (governorateId) {
  supabaseQuery = supabaseQuery.eq(
    "user_profiles.governorate_id",
    governorateId
  );
}
```

الفلترة تتم عبر العلاقات بشكل صحيح باستخدام dot notation.

### البحث النصي المتقدم

```typescript
supabaseQuery = supabaseQuery.or(
  `user_profiles.full_name.ilike.%${query}%,user_profiles.email.ilike.%${query}%,user_profiles.phone.ilike.%${query}%,electoral_symbol.ilike.%${query}%,electoral_number.ilike.%${query}%`
);
```

البحث يستخدم `OR` للبحث في 5 حقول مختلفة في نفس الوقت.

---

## 📱 تجربة المستخدم

### سيناريو 1: البحث البسيط
1. المستخدم يكتب "أحمد" في شريط البحث
2. يضغط Enter أو زر "بحث"
3. النظام يبحث في جميع الحقول ويعرض النتائج
4. يظهر عدد النتائج: "إجمالي 15 نائب مسجل (مفلتر)"

### سيناريو 2: الفلترة المتقدمة
1. المستخدم يضغط "إظهار الفلاتر"
2. يختار محافظة "القاهرة"
3. يختار حزب "الوفد"
4. يختار حالة "نشط"
5. يضغط "بحث"
6. النظام يعرض فقط النواب النشطين من حزب الوفد في القاهرة

### سيناريو 3: مسح الفلاتر
1. المستخدم لديه فلاتر نشطة
2. يضغط زر "مسح الفلاتر"
3. جميع الفلاتر تُمسح
4. النظام يعرض جميع النواب

### سيناريو 4: التنقل بين الصفحات
1. المستخدم يرى 20 نائب في الصفحة الأولى
2. يضغط "التالي"
3. النظام يعرض النواب من 21-40
4. الفلاتر والبحث يبقون نشطين

---

## 🎨 التصميم والواجهة

### الألوان والأيقونات
- 🔍 **Search** - أيقونة البحث
- 🔽 **Filter** - أيقونة الفلاتر
- ❌ **X** - أيقونة مسح الفلاتر
- ✏️ **Edit** - أيقونة التعديل
- ➕ **UserPlus** - أيقونة إضافة نائب

### Badges للحالة
- **نشط** - Badge أزرق (default variant)
- **غير نشط** - Badge رمادي (secondary variant)

### Layout
- **Desktop**: 4 أعمدة للفلاتر
- **Tablet**: عمودين للفلاتر
- **Mobile**: عمود واحد للفلاتر

---

## 🚀 كيفية الاستخدام

### للمطورين:

```typescript
import { searchDeputiesAction } from "@/data/admin/deputies";
import { useAction } from "next-safe-action/hooks";

const { execute, isExecuting } = useAction(searchDeputiesAction);

// بحث بسيط
const result = await execute({ 
  query: "ahmed" 
});

// بحث مع فلاتر
const result = await execute({
  query: "ahmed",
  governorateId: "gov-uuid",
  partyId: "party-uuid",
  deputyStatus: "active",
  page: 1,
  limit: 20
});

// الوصول للنتائج
const { deputies, total, totalPages, currentPage } = result.data;
```

### للمستخدمين:

1. **افتح صفحة النواب** في لوحة الأدمن
2. **اكتب في شريط البحث** أو **اضغط "إظهار الفلاتر"**
3. **اختر الفلاتر** المطلوبة
4. **اضغط "بحث"** لتطبيق الفلاتر
5. **استخدم "السابق/التالي"** للتنقل بين الصفحات
6. **اضغط "مسح الفلاتر"** للعودة لجميع النواب

---

## 📊 الأداء والتحسينات

### 1. Lazy Loading للفلاتر
القوائم المنسدلة (المحافظات، الأحزاب، المجالس) تُحمّل مرة واحدة فقط عند فتح الصفحة.

### 2. Debouncing (مستقبلي)
يمكن إضافة debouncing للبحث الفوري أثناء الكتابة:

```typescript
const debouncedSearch = useDebouncedCallback(
  (value: string) => {
    executeSearch({ query: value });
  },
  500
);
```

### 3. Caching (مستقبلي)
يمكن إضافة cache للنتائج المكررة باستخدام React Query أو SWR.

### 4. Infinite Scroll (مستقبلي)
بدلاً من pagination، يمكن استخدام infinite scroll:

```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(...);
```

---

## ⚠️ ملاحظات مهمة

### 1. إعادة تشغيل التطبيق مطلوبة
بعد رفع الكود، يجب إعادة تشغيل التطبيق:

```bash
npm run dev
# أو
npm run build && npm start
```

### 2. الفلاتر تعمل مع البحث
يمكن استخدام البحث النصي + الفلاتر معاً. مثال:
- البحث: "أحمد"
- المحافظة: "القاهرة"
- النتيجة: جميع النواب المسمين "أحمد" في القاهرة

### 3. القيمة "all" في الفلاتر
عند اختيار "جميع المحافظات" أو "جميع الأحزاب"، يتم إرسال `undefined` للسيرفر (لا يتم تطبيق الفلتر).

### 4. الـ Pagination يحافظ على الفلاتر
عند التنقل بين الصفحات، جميع الفلاتر والبحث يبقون نشطين.

---

## 🔄 الفرق بين الدالتين

### `searchUsersAction` (للبحث في المستخدمين)
- **الهدف**: البحث في المستخدمين لتحويلهم إلى نواب
- **الجدول**: `user_profiles`
- **الاستخدام**: صفحة "إضافة نائب جديد"
- **الميزة الخاصة**: يضيف flag `isDeputy` لكل مستخدم

### `searchDeputiesAction` (للبحث في النواب)
- **الهدف**: البحث والفلترة في قائمة النواب الموجودين
- **الجدول**: `deputy_profiles` مع join لـ `user_profiles`
- **الاستخدام**: صفحة "قائمة النواب"
- **الميزة الخاصة**: فلاتر متقدمة + pagination

---

## ✅ الخلاصة

تم إضافة نظام بحث وفلترة متقدم لقائمة النواب يشمل:

1. ✅ **دالة بحث منفصلة** (`searchDeputiesAction`)
2. ✅ **مكون واجهة كامل** (`DeputiesList`)
3. ✅ **بحث نصي** في 5 حقول مختلفة
4. ✅ **4 فلاتر منفصلة** (محافظة، حزب، مجلس، حالة)
5. ✅ **Pagination** مع الحفاظ على الفلاتر
6. ✅ **تصميم responsive** يعمل على جميع الأجهزة
7. ✅ **حالات تحميل** وإدارة أخطاء
8. ✅ **تجربة مستخدم ممتازة** مع رسائل واضحة

**النظام جاهز للاستخدام بعد إعادة تشغيل التطبيق!** 🎉

---

## 📝 Commits

### Commit 1: النظام الكامل
**Hash**: `dbd2af0`
**Message**: `feat: complete search and filter system overhaul based on database structure`

### Commit 2: التوثيق
**Hash**: `e1960ac`
**Message**: `docs: add complete search system documentation`

### Commit 3: بحث النواب
**Hash**: `97ea4ae`
**Message**: `feat: add advanced search and filtering for deputies list`

**الملفات المضافة/المعدلة:**
- ✅ `src/data/admin/deputies.ts` - إضافة `searchDeputiesAction`
- ✅ `src/app/.../deputies/DeputiesList.tsx` - مكون جديد
- ✅ `src/app/.../deputies/page.tsx` - تحديث لاستخدام المكون الجديد
- ✅ `DEPUTIES_SEARCH_FEATURES.md` - هذا الملف

**الإحصائيات:**
- 3 ملفات معدلة
- 612 سطر مضاف
- 161 سطر محذوف

