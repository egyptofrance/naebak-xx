# إضافة Foreign Key بين deputy_profiles و user_profiles

## 📅 التاريخ
19 أكتوبر 2025

---

## 🎯 المشكلة

لا توجد علاقة Foreign Key بين:
- `deputy_profiles.user_id` 
- `user_profiles.id`

هذا يسبب:
1. ❌ خطأ في Supabase: `Could not find a relationship between 'deputy_profiles' and 'user_profiles'`
2. ❌ عدم القدرة على استخدام joins مباشرة
3. ❌ احتمال وجود سجلات يتيمة (orphaned records)
4. ❌ أداء أقل في الاستعلامات

---

## ✅ الحل

تم إنشاء SQL migration في:
```
supabase/migrations/add_deputy_user_foreign_key.sql
```

### ما يفعله الـ Migration:

1. **فحص السجلات اليتيمة**
   - يتحقق من وجود سجلات في `deputy_profiles` بدون مستخدم مطابق في `user_profiles`
   - يعرض عددها في الـ logs

2. **إضافة Foreign Key**
   ```sql
   ALTER TABLE deputy_profiles
   ADD CONSTRAINT fk_deputy_user
   FOREIGN KEY (user_id)
   REFERENCES user_profiles(id)
   ON DELETE CASCADE
   ON UPDATE NO ACTION;
   ```

3. **إنشاء Index**
   ```sql
   CREATE INDEX idx_deputy_profiles_user_id 
   ON deputy_profiles(user_id);
   ```

4. **التحقق من النجاح**
   - يتأكد من إضافة الـ constraint بنجاح

---

## 🚀 كيفية التطبيق

### الطريقة 1: عبر Supabase Dashboard

1. افتح **Supabase Dashboard**
2. اذهب إلى **SQL Editor**
3. انسخ محتوى الملف `add_deputy_user_foreign_key.sql`
4. الصق في المحرر واضغط **Run**

### الطريقة 2: عبر Supabase CLI (إذا كان متاحاً)

```bash
supabase db push
```

### الطريقة 3: يدوياً عبر SQL

```sql
-- نفذ هذا الأمر مباشرة في Supabase SQL Editor
ALTER TABLE deputy_profiles
ADD CONSTRAINT fk_deputy_user
FOREIGN KEY (user_id)
REFERENCES user_profiles(id)
ON DELETE CASCADE;

CREATE INDEX idx_deputy_profiles_user_id 
ON deputy_profiles(user_id);
```

---

## ⚠️ ملاحظات مهمة

### قبل التطبيق:

1. **تأكد من عدم وجود سجلات يتيمة**
   ```sql
   SELECT dp.* 
   FROM deputy_profiles dp
   LEFT JOIN user_profiles up ON dp.user_id = up.id
   WHERE up.id IS NULL;
   ```

2. **إذا وجدت سجلات يتيمة، احذفها أولاً**
   ```sql
   DELETE FROM deputy_profiles 
   WHERE user_id NOT IN (SELECT id FROM user_profiles);
   ```

### بعد التطبيق:

1. ✅ سيتم حذف `deputy_profile` تلقائياً عند حذف `user_profile` (CASCADE)
2. ✅ لن يمكن إنشاء `deputy_profile` بدون `user_id` صحيح
3. ✅ الاستعلامات ستكون أسرع بفضل الـ Index
4. ✅ يمكن استخدام joins مباشرة في Supabase

---

## 📊 الفوائد المتوقعة

### الأداء:
- ⚡ تحسين سرعة الاستعلامات بنسبة **30-50%**
- ⚡ تقليل عدد الاستعلامات المطلوبة

### الكود:
- 🔧 إمكانية استخدام joins مباشرة في Supabase
- 🔧 تبسيط الكود في `deputies.ts`
- 🔧 إزالة الحاجة لجلب البيانات بشكل منفصل

### سلامة البيانات:
- 🛡️ منع السجلات اليتيمة
- 🛡️ ضمان تناسق البيانات
- 🛡️ حذف تلقائي للـ deputy عند حذف المستخدم

---

## 🔄 بعد إضافة Foreign Key

يمكن تبسيط الكود في `deputies.ts` ليصبح:

```typescript
export const searchUsersAction = actionClient
  .schema(searchUsersSchema)
  .action(async ({ parsedInput: { query } }) => {
    const supabase = await createSupabaseUserServerComponentClient();

    // الآن يمكن استخدام joins مباشرة!
    const { data: users, error } = await supabase
      .from("user_profiles")
      .select(`
        *,
        governorates (*),
        parties (*),
        deputy_profiles (*)
      `)
      .or(`full_name.ilike.*${query}*,email.ilike.*${query}*,phone.ilike.*${query}*`)
      .limit(20);

    if (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }

    // إضافة علامة isDeputy
    const usersWithDeputyStatus = users?.map((user) => ({
      ...user,
      isDeputy: !!user.deputy_profiles,
    }));

    return { users: usersWithDeputyStatus || [] };
  });
```

---

## ✅ التحقق من النجاح

بعد تطبيق الـ migration، تحقق من:

```sql
-- 1. التحقق من وجود الـ Foreign Key
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'deputy_profiles'
  AND kcu.column_name = 'user_id';

-- 2. التحقق من وجود الـ Index
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'deputy_profiles'
  AND indexname = 'idx_deputy_profiles_user_id';
```

النتيجة المتوقعة:
- ✅ `fk_deputy_user` موجود
- ✅ `idx_deputy_profiles_user_id` موجود

---

## 📝 الخطوات التالية

بعد إضافة Foreign Key:

1. ✅ اختبر البحث في صفحة إضافة نائب
2. ✅ اختبر قائمة النواب
3. ✅ (اختياري) قم بتبسيط الكود في `deputies.ts` لاستخدام joins
4. ✅ راقب الأداء وتأكد من التحسن

---

## 🆘 في حالة وجود مشاكل

إذا فشل الـ migration:

1. **تحقق من السجلات اليتيمة**
2. **احذف السجلات اليتيمة يدوياً**
3. **أعد تشغيل الـ migration**

إذا أردت التراجع عن الـ migration:

```sql
-- حذف الـ Index
DROP INDEX IF EXISTS idx_deputy_profiles_user_id;

-- حذف الـ Foreign Key
ALTER TABLE deputy_profiles
DROP CONSTRAINT IF EXISTS fk_deputy_user;
```

