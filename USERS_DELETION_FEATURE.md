# تحسينات قائمة المواطنين وإضافة ميزة الحذف

## التاريخ: 21 أكتوبر 2025
## Commit: `8f386c4`

---

## 1️⃣ تحسين تناسق أزرار الـ Dialogs

### المشكلة
الأزرار في dialogs "Send Login Link" و "Get Login Link" لم تكن متناسقة في الحجم والمسافات.

### الحل
```typescript
<DialogFooter className="mt-4 gap-3">
  <Button className="flex-1 min-w-[120px]" variant="outline">
    Cancel
  </Button>
  <Button className="flex-1 min-w-[120px]" variant="default">
    Send Login Link
  </Button>
</DialogFooter>
```

### النتيجة
- ✅ مسافة ثابتة بين الأزرار (`gap-3`)
- ✅ أزرار متساوية في العرض (`flex-1`)
- ✅ حد أدنى للعرض (`min-w-[120px]`)
- ✅ تناسق في جميع الـ dialogs

---

## 2️⃣ إضافة ميزة حذف المواطنين

### الميزات المضافة

#### أ) حذف فردي
- زر حذف لكل مواطن في الجدول
- أيقونة سلة المهملات بلون أحمر
- dialog تأكيد قبل الحذف
- عرض اسم/بريد المستخدم في التأكيد

#### ب) حذف جماعي
- checkbox لكل صف في الجدول
- checkbox "Select All" في رأس الجدول
- عداد للعناصر المحددة
- زر "Delete Selected" يظهر عند التحديد
- dialog تأكيد يعرض عدد المستخدمين المحددين

---

## 3️⃣ الملفات المضافة

### Backend (`src/data/admin/user.tsx`)

#### `deleteUserAction`
```typescript
export const deleteUserAction = adminActionClient
  .schema(deleteUserSchema)
  .action(async ({ parsedInput: { userId } }) => {
    const { error } = await supabaseAdminClient.auth.admin.deleteUser(userId);
    // ...
  });
```

#### `deleteMultipleUsersAction`
```typescript
export const deleteMultipleUsersAction = adminActionClient
  .schema(deleteMultipleUsersSchema)
  .action(async ({ parsedInput: { userIds } }) => {
    // حذف المستخدمين واحد تلو الآخر
    // إرجاع تقرير بالنجاح والفشل
  });
```

### Frontend

#### `DeleteUserDialog.tsx`
- مكون dialog لحذف مستخدم واحد
- تصميم destructive (أحمر)
- loading states
- toast notifications

#### `UsersListWithBulkDelete.tsx`
- مكون client-side للجدول
- إدارة state للعناصر المحددة
- checkboxes للتحديد
- زر حذف جماعي
- dialog تأكيد للحذف الجماعي

---

## 4️⃣ التغييرات في الجدول

### قبل
```
| Full Name | Email | Created At | ... | Promote to Manager |
```

### بعد
```
| ☑ | Full Name | Email | Created At | ... | Promote to Manager | Delete |
```

### الأعمدة الجديدة
1. **Checkbox Column**: للتحديد الفردي والجماعي
2. **Delete Column**: زر حذف لكل مستخدم

---

## 5️⃣ تجربة المستخدم (UX)

### الحذف الفردي
1. المستخدم يضغط على أيقونة سلة المهملات
2. يظهر dialog تأكيد مع اسم المستخدم
3. المستخدم يؤكد الحذف
4. يظهر loading state "Deleting..."
5. toast notification بالنجاح أو الفشل
6. الصفحة تُحدث تلقائياً

### الحذف الجماعي
1. المستخدم يحدد عدة مواطنين بالـ checkboxes
2. يظهر شريط علوي يعرض عدد المحددين
3. المستخدم يضغط "Delete Selected"
4. يظهر dialog تأكيد مع العدد
5. المستخدم يؤكد الحذف
6. يظهر loading state "Deleting X users..."
7. toast notification بالنتيجة
8. الصفحة تُحدث تلقائياً

---

## 6️⃣ الأمان

### الحماية
- ✅ استخدام `adminActionClient` (يتطلب صلاحيات admin)
- ✅ التحقق من صحة البيانات بـ Zod schemas
- ✅ استخدام `supabaseAdminClient` للحذف الآمن
- ✅ Cascade delete (حذف البيانات المرتبطة تلقائياً)

### التحقق
```typescript
const deleteUserSchema = z.object({
  userId: z.string().uuid(),
});

const deleteMultipleUsersSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1),
});
```

---

## 7️⃣ معالجة الأخطاء

### الحذف الفردي
- إذا فشل: toast error مع رسالة الخطأ
- لا يُغلق الـ dialog
- يمكن إعادة المحاولة

### الحذف الجماعي
- يحذف المستخدمين واحد تلو الآخر
- يجمع الأخطاء في array
- يعرض تقرير نهائي:
  - `status: "success"` - كل المستخدمين تم حذفهم
  - `status: "partial"` - بعض المستخدمين فشل حذفهم
  - يعرض عدد النجاح والفشل

---

## 8️⃣ الاختبار الموصى به

### اختبار الحذف الفردي
1. افتح `/app_admin/users`
2. اضغط على أيقونة سلة المهملات لمستخدم
3. تأكد من ظهور dialog التأكيد
4. اضغط "Delete"
5. تأكد من حذف المستخدم

### اختبار الحذف الجماعي
1. حدد عدة مستخدمين بالـ checkboxes
2. تأكد من ظهور الشريط العلوي
3. تأكد من صحة العدد المعروض
4. اضغط "Delete Selected"
5. تأكد من ظهور dialog التأكيد
6. اضغط "Delete"
7. تأكد من حذف جميع المستخدمين المحددين

### اختبار Select All
1. اضغط على checkbox "Select All"
2. تأكد من تحديد جميع المستخدمين في الصفحة الحالية
3. اضغط مرة أخرى لإلغاء التحديد
4. تأكد من إلغاء تحديد الجميع

---

## 9️⃣ الملفات المعدلة

| الملف | التعديل |
|------|---------|
| `ConfirmSendLoginLinkDialog.tsx` | تحسين تناسق الأزرار |
| `GetLoginLinkDialog.tsx` | تحسين تناسق الأزرار |
| `user.tsx` | إضافة دوال الحذف |
| `UsersList.tsx` | تبسيط لاستخدام المكون الجديد |
| `DeleteUserDialog.tsx` | **جديد** - مكون حذف فردي |
| `UsersListWithBulkDelete.tsx` | **جديد** - مكون الجدول مع الحذف الجماعي |

---

## 🎉 الخلاصة

تم بنجاح:
- ✅ تحسين تناسق أزرار الـ dialogs
- ✅ إضافة حذف فردي للمواطنين
- ✅ إضافة حذف جماعي مع checkboxes
- ✅ إضافة Select All functionality
- ✅ معالجة أخطاء شاملة
- ✅ تجربة مستخدم احترافية
- ✅ أمان وحماية كاملة

الآن يمكن للأدمن إدارة المواطنين بسهولة وحذف المستخدمين غير المرغوب فيهم بشكل فردي أو جماعي! 🚀

