# دليل حل المشاكل - منصة نائبك

**آخر تحديث:** 27 أكتوبر 2025  
**الإصدار:** 1.0

هذا الدليل يحتوي على جميع المشاكل التي واجهناها في تطوير منصة نائبك والحلول الناجحة لها.

---

## 📑 فهرس المحتويات

1. [مشاكل رفع الصور](#1-مشاكل-رفع-الصور)
2. [مشاكل البحث والفلترة](#2-مشاكل-البحث-والفلترة)
3. [مشاكل التصميم والواجهة](#3-مشاكل-التصميم-والواجهة)
4. [مشاكل الأذونات والقوائم](#4-مشاكل-الأذونات-والقوائم)
5. [مشاكل TypeScript](#5-مشاكل-typescript)
6. [أفضل الممارسات](#6-أفضل-الممارسات)

---

## 1. مشاكل رفع الصور

### 1.1 فشل رفع الصور للنائب

#### المشكلة
```
❌ النائب لا يستطيع رفع صور للبرنامج الانتخابي/الإنجازات/المناسبات
❌ رسالة خطأ: "فشل رفع الصورة"
```

#### السبب
```typescript
// ❌ كان يستخدم uploadImageAction المخصص للـ Admin فقط
import { uploadImageAction } from "@/data/admin/user";

const { execute } = useAction(uploadImageAction);
```

**المشكلة:** `uploadImageAction` يحتاج `userId` كمعامل، لكن النائب لا يمرره!

#### الحل ✅

**1. إنشاء Action جديد للنائب:**

```typescript
// src/data/deputy/content-upload.ts
"use server";

import { authActionClient } from "@/lib/safe-action";
import { createSupabaseUserServerActionClient } from "@/supabase-clients/user/createSupabaseUserServerActionClient";
import { z } from "zod";

const uploadSchema = z.object({
  fileData: z.string(), // base64
  fileName: z.string(),
  fileType: z.string(),
});

export const uploadDeputyContentImageAction = authActionClient
  .schema(uploadSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    const supabase = await createSupabaseUserServerActionClient();
    
    // ✅ يحصل على userId من ctx تلقائياً
    const userId = ctx.userId;
    
    // Convert base64 to Buffer
    const base64Data = input.fileData.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    
    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${input.fileName}`;
    const filePath = `deputy-content/${userId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from("deputy-images")
      .upload(filePath, buffer, {
        contentType: input.fileType,
        upsert: false,
      });
    
    if (error) {
      throw new Error(`Failed to upload: ${error.message}`);
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("deputy-images")
      .getPublicUrl(filePath);
    
    return { url: publicUrl };
  });
```

**2. استخدام Action الجديد:**

```typescript
// في DeputyContentItemManager.tsx
import { uploadDeputyContentImageAction } from "@/data/deputy/content-upload";

const { execute: uploadImage, status: uploadStatus } = useAction(
  uploadDeputyContentImageAction,
  {
    onSuccess: ({ data }) => {
      if (data?.url) {
        // تحديث URL الصورة
        handleFieldChange(index, "image_url", data.url);
        toast.success("تم رفع الصورة بنجاح!");
      }
    },
    onError: ({ error }) => {
      toast.error("فشل رفع الصورة");
    },
  }
);
```

#### الدروس المستفادة
- ✅ استخدم `authActionClient` للحصول على `userId` تلقائياً
- ✅ لا تستخدم Admin actions في صفحات النائب
- ✅ استخدم base64 encoding لرفع الصور (مثل نظام البانر)

---

### 1.2 مشكلة TypeScript في ref

#### المشكلة
```
❌ Type 'HTMLInputElement | null' is not assignable to 'void'
❌ السطر 258: ref={(el) => (fileInputRefs.current[index] = el)}
```

#### السبب
```typescript
// ❌ خطأ - ref callback يُرجع قيمة
ref={(el) => (fileInputRefs.current[index] = el)}
```

في React، `ref` callback يجب أن يُرجع `void` وليس قيمة.

#### الحل ✅
```typescript
// ✅ صحيح - ref callback يُرجع void
ref={(el) => {
  fileInputRefs.current[index] = el;
}}
```

**الفرق:**
- `(el) => (expression)` - يُرجع قيمة
- `(el) => { statement; }` - يُرجع void

---

## 2. مشاكل البحث والفلترة

### 2.1 البحث محدود بـ 1000 نائب فقط

#### المشكلة
```
❌ رسالة: "عرض 1 - 20 من 1000 نتيجة"
❌ رغم أن قاعدة البيانات تحتوي على 3,700 نائب!
❌ البحث لا يعمل على جميع النواب
```

#### السبب الحقيقي
**ليست المشكلة في الكود!**

```typescript
// ❌ حاولنا تغيير limit لكن لم ينجح
.limit(10000)   // لا يعمل!
.limit(100000)  // لا يعمل أيضاً!
```

**السبب:** Supabase PostgREST له حد افتراضي **1000 صف** لكل طلب!

من [وثائق Supabase](https://supabase.com/docs/guides/api):
> PostgREST has a default maximum of 1000 rows per request.

#### الحل ✅

**استخدام Pagination مع `.range()`:**

```typescript
// src/app/actions/deputy/getAllDeputies.ts
export async function getAllDeputies() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ✅ جلب جميع النواب باستخدام pagination
  let allDeputies: any[] = [];
  let page = 0;
  const pageSize = 1000; // Supabase's default max
  let hasMore = true;

  while (hasMore) {
    const start = page * pageSize;
    const end = start + pageSize - 1;

    const { data: deputiesPage, error } = await supabase
      .from("deputy_profiles")
      .select(`
        id,
        user_id,
        slug,
        // ... all fields
      `)
      .range(start, end);  // ✅ المفتاح هنا!

    if (error) {
      console.error(`Error on page ${page}:`, error);
      break;
    }

    if (!deputiesPage || deputiesPage.length === 0) {
      hasMore = false;
      break;
    }

    allDeputies = [...allDeputies, ...deputiesPage];

    // إذا حصلنا على أقل من pageSize، وصلنا للنهاية
    if (deputiesPage.length < pageSize) {
      hasMore = false;
    } else {
      page++;
    }
  }

  console.log(`✅ Fetched ${allDeputies.length} deputies in ${page + 1} page(s)`);
  
  return allDeputies;
}
```

#### كيف يعمل؟

**مع 3,700 نائب:**

| الدورة | Range | النتيجة |
|--------|-------|---------|
| 1 | `.range(0, 999)` | 1,000 نائب |
| 2 | `.range(1000, 1999)` | 1,000 نائب |
| 3 | `.range(2000, 2999)` | 1,000 نائب |
| 4 | `.range(3000, 3999)` | 700 نائب (آخر دفعة) |

**المجموع:** 3,700 نائب ✅

#### الدروس المستفادة
- ✅ `.limit()` لا يتجاوز حد Supabase الافتراضي (1000)
- ✅ استخدم `.range()` مع pagination لجلب أكثر من 1000 صف
- ✅ استخدم `while` loop للجلب التلقائي حتى النهاية
- ✅ تحقق من `deputiesPage.length < pageSize` لمعرفة النهاية

---

## 3. مشاكل التصميم والواجهة

### 3.1 صفحة النائب العامة - مشاكل متعددة

#### المشكلة 1: المحاذاة لليسار رغم اللغة العربية
```
❌ النص العربي محاذى لليسار (LTR)
❌ يجب أن يكون محاذى لليمين (RTL)
```

#### الحل ✅
```typescript
// في page.tsx
const isRTL = locale === "ar";

<div dir={isRTL ? "rtl" : "ltr"}>
  {/* المحتوى */}
</div>
```

---

#### المشكلة 2: الصور لا تظهر في البرنامج الانتخابي/الإنجازات/المناسبات

#### السبب
```typescript
// ❌ الكود كان موجود لكن لم يتم عرضه
{item.image_url && (
  <img src={item.image_url} alt={item.title} />
)}
```

#### الحل ✅
```typescript
// ✅ إضافة الصورة مع تنسيق احترافي
{item.image_url && (
  <div className="mt-4">
    <img
      src={item.image_url}
      alt={item.title}
      className="w-full rounded-lg object-cover shadow-md"
      style={{ maxHeight: '500px' }}
    />
  </div>
)}
```

---

#### المشكلة 3: لا توجد صور افتراضية

#### المطلوب
```
✅ صورة افتراضية إذا لم يرفع النائب صورة
✅ صورة جانبية (مثل الأفاتار)
✅ تأثير hover جميل
```

#### الحل ✅

**1. تعريف الصور الافتراضية:**
```typescript
const DEFAULT_IMAGES = {
  electoral_program: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400",
  achievement: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
  event: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
};
```

**2. استخدام الصورة الافتراضية:**
```typescript
<img
  src={item.image_url || DEFAULT_IMAGES.electoral_program}
  alt={item.title}
  className="w-48 h-48 rounded-lg object-cover border-4 border-primary/20 
             transition-all duration-500 hover:border-primary/60 
             hover:shadow-[0_0_30px_rgba(248,123,27,0.4)] 
             hover:scale-105"
/>
```

**3. التأثيرات:**
- ✅ Border ملون
- ✅ Shadow يتوهج عند hover
- ✅ Scale يكبر قليلاً
- ✅ Transition سلس (500ms)

---

### 3.2 صفحة البيانات الإضافية - تصميم سيء

#### المشكلة
```
❌ عمود واحد طويل
❌ ألوان عشوائية على Labels
❌ لا توجد تقسيمات
❌ زر الحفظ لا يعمل
```

#### الحل ✅

**1. تقسيم إلى Cards:**
```typescript
<div className="space-y-6">
  {/* Card 1: المعلومات الأساسية */}
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <User className="h-5 w-5" />
        المعلومات الأساسية
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* الحقول */}
      </div>
    </CardContent>
  </Card>

  {/* Card 2: السيرة الذاتية */}
  <Card>
    {/* ... */}
  </Card>

  {/* Card 3: معلومات المكتب */}
  <Card>
    {/* ... */}
  </Card>

  {/* Card 4: وسائل التواصل */}
  <Card>
    {/* ... */}
  </Card>
</div>
```

**2. Grid Layout:**
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* عمود واحد على الموبايل، عمودين على الديسكتوب */}
</div>
```

**3. تفعيل الحفظ:**
```typescript
// src/data/deputy/update-data.ts
export const updateDeputyDataAction = authActionClient
  .schema(updateDeputyDataSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    const supabase = await createSupabaseUserServerActionClient();
    const userId = ctx.userId;

    const { error } = await supabase
      .from("deputy_profiles")
      .update({
        bio: input.bio,
        office_address: input.office_address,
        office_phone: input.office_phone,
        // ... باقي الحقول
      })
      .eq("user_id", userId);

    if (error) {
      throw new Error("Failed to update deputy data");
    }

    return { success: true };
  });
```

---

### 3.3 صفحة رفع المحتوى - مشاكل UI

#### المشكلة
```
❌ لا يوجد preview للصورة قبل الرفع
❌ زرار الحذف متداخل مع النص
❌ الأزرار كبيرة جداً
❌ التنسيق غير منظم
```

#### الحل ✅

**1. Preview قبل الرفع:**
```typescript
const [previewUrl, setPreviewUrl] = useState<string | null>(null);

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // ✅ إنشاء preview فوراً
  const reader = new FileReader();
  reader.onloadend = () => {
    setPreviewUrl(reader.result as string);
  };
  reader.readAsDataURL(file);
};

// ✅ عرض Preview
{previewUrl && (
  <div className="relative">
    <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />
    <Button onClick={() => setPreviewUrl(null)}>
      إلغاء
    </Button>
    <Button onClick={handleUpload}>
      رفع الصورة
    </Button>
  </div>
)}
```

**2. Header منفصل للعنصر:**
```typescript
<div className="border rounded-lg p-4">
  {/* Header */}
  <div className="flex items-center justify-between mb-4 pb-4 border-b">
    <h3 className="font-semibold">العنصر {index + 1}</h3>
    <Button
      variant="destructive"
      size="sm"
      onClick={() => handleRemove(index)}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      حذف
    </Button>
  </div>

  {/* المحتوى */}
  <div className="space-y-4">
    {/* الحقول */}
  </div>
</div>
```

**3. Drag & Drop Area:**
```typescript
<div
  className="border-2 border-dashed border-primary/20 rounded-lg p-8 
             text-center cursor-pointer hover:border-primary/40 
             transition-colors"
  onClick={() => fileInputRef.current?.click()}
>
  <Upload className="h-12 w-12 mx-auto mb-4 text-primary/40" />
  <p className="text-sm text-muted-foreground">
    اسحب وأفلت الصورة هنا، أو انقر للاختيار
  </p>
</div>
```

---

## 4. مشاكل الأذونات والقوائم

### 4.1 "شكاويي" تظهر للنائب

#### المشكلة
```
❌ النائب يرى "شكاويي" في القائمة
❌ لكن النائب لا يقدم شكاوى، بل يستقبلها!
```

#### الحل ✅
```typescript
// src/components/sidebar-user-nav.tsx
const deputyProfile = await getCachedDeputyProfile();
const isDeputy = !!deputyProfile;

<SidebarMenu>
  <SidebarMenuItem>
    <Link href="/dashboard">الرئيسية</Link>
  </SidebarMenuItem>
  
  <SidebarMenuItem>
    <Link href="/deputies">النواب</Link>
  </SidebarMenuItem>
  
  {/* ✅ إخفاء "شكاويي" عن النواب */}
  {!isDeputy && (
    <SidebarMenuItem>
      <Link href="/complaints">شكاويي</Link>
    </SidebarMenuItem>
  )}
  
  <SidebarMenuItem>
    <Link href="/user/settings">الإعدادات</Link>
  </SidebarMenuItem>
</SidebarMenu>
```

---

### 4.2 "إدارة النائب" تختفي في صفحة الإعدادات

#### المشكلة
```
❌ في صفحة الإعدادات، القائمة اليسرى لا تعرض "إدارة النائب"
❌ فقط "القائمة الرئيسية" و"الإعدادات" ظاهرين
```

#### السبب
```typescript
// ❌ user-sidebar.tsx لا يستورد SidebarDeputyNav
<SidebarContent>
  <SidebarUserNav />
  {/* ❌ مفقود! */}
  <SidebarAdminPanelNav />
</SidebarContent>
```

#### الحل ✅
```typescript
// src/app/[locale]/(dynamic-pages)/(authenticated-pages)/user/@sidebar/user-sidebar.tsx
import { SidebarDeputyNav } from "@/components/sidebar-deputy-nav";
import { getCachedSoloWorkspace } from "@/lib/workspace";

export default async function UserSidebar() {
  const workspace = await getCachedSoloWorkspace();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarUserNav />
        
        {/* ✅ إضافة SidebarDeputyNav */}
        {workspace && <SidebarDeputyNav workspace={workspace} />}
        
        <SidebarAdminPanelNav />
      </SidebarContent>
    </Sidebar>
  );
}
```

---

## 5. مشاكل TypeScript

### 5.1 خطأ ref callback

#### المشكلة
```typescript
// ❌ خطأ
ref={(el) => (fileInputRefs.current[index] = el)}

// Error: Type 'HTMLInputElement | null' is not assignable to 'void'
```

#### الحل ✅
```typescript
// ✅ صحيح
ref={(el) => {
  fileInputRefs.current[index] = el;
}}
```

**القاعدة:**
- Arrow function مع `()` يُرجع قيمة
- Arrow function مع `{}` يُرجع void

---

## 6. أفضل الممارسات

### 6.1 رفع الصور

#### ✅ افعل
```typescript
// استخدم base64 encoding
const reader = new FileReader();
reader.onloadend = () => {
  const base64 = reader.result as string;
  uploadImage({ fileData: base64, fileName, fileType });
};
reader.readAsDataURL(file);
```

#### ❌ لا تفعل
```typescript
// لا ترسل File object مباشرة
uploadImage({ file }); // ❌ لن يعمل
```

---

### 6.2 Supabase Queries

#### ✅ افعل
```typescript
// للحصول على أكثر من 1000 صف، استخدم pagination
let allData = [];
let page = 0;
const pageSize = 1000;

while (true) {
  const { data } = await supabase
    .from("table")
    .select("*")
    .range(page * pageSize, (page + 1) * pageSize - 1);
  
  if (!data || data.length === 0) break;
  
  allData = [...allData, ...data];
  
  if (data.length < pageSize) break;
  page++;
}
```

#### ❌ لا تفعل
```typescript
// لا تعتمد على .limit() فقط
const { data } = await supabase
  .from("table")
  .select("*")
  .limit(100000); // ❌ سيُرجع 1000 فقط!
```

---

### 6.3 التصميم

#### ✅ افعل
```typescript
// استخدم Cards لتنظيم المحتوى
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Icon className="h-5 w-5" />
      العنوان
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* المحتوى */}
    </div>
  </CardContent>
</Card>
```

```typescript
// استخدم Grid للتنسيق
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* responsive: عمود واحد على الموبايل، عمودين على الديسكتوب */}
</div>
```

```typescript
// استخدم RTL/LTR حسب اللغة
const isRTL = locale === "ar";
<div dir={isRTL ? "rtl" : "ltr"}>
  {/* المحتوى */}
</div>
```

#### ❌ لا تفعل
```typescript
// لا تستخدم عمود واحد طويل
<div>
  <input />
  <input />
  <input />
  {/* ... 20 input */}
</div>
```

---

### 6.4 Debug Code

#### ✅ افعل
```typescript
// استخدم console.log فقط أثناء التطوير
if (process.env.NODE_ENV === "development") {
  console.log("[DEBUG] Data:", data);
}
```

#### ❌ لا تفعل
```typescript
// لا تترك debug code في production
console.log("🔍 [DEBUG] Total deputies:", deputies.length);
alert("ERROR: deputyId is undefined!"); // ❌ أبداً!
```

**قبل الـ deployment:**
- ✅ احذف جميع `console.log`
- ✅ احذف جميع `alert()`
- ✅ احذف جميع debug comments

---

### 6.5 Error Handling

#### ✅ افعل
```typescript
// استخدم toast للأخطاء
import { toast } from "sonner";

try {
  await uploadImage(data);
  toast.success("تم رفع الصورة بنجاح!");
} catch (error) {
  toast.error("فشل رفع الصورة");
  // لا ترسل error.message للمستخدم مباشرة
}
```

#### ❌ لا تفعل
```typescript
// لا تستخدم alert
try {
  await uploadImage(data);
  alert("Success!"); // ❌ غير احترافي
} catch (error) {
  alert(error.message); // ❌ قد يكشف معلومات حساسة
}
```

---

## 📝 ملخص الدروس المستفادة

### 1. رفع الصور
- ✅ استخدم `authActionClient` للحصول على `userId` تلقائياً
- ✅ استخدم base64 encoding
- ✅ لا تستخدم Admin actions في صفحات النائب

### 2. البحث والفلترة
- ✅ Supabase له حد افتراضي 1000 صف
- ✅ استخدم `.range()` مع pagination لتجاوز الحد
- ✅ `.limit()` لا يتجاوز حد PostgREST

### 3. التصميم
- ✅ استخدم Cards لتنظيم المحتوى
- ✅ استخدم Grid layout (responsive)
- ✅ استخدم RTL/LTR حسب اللغة
- ✅ أضف صور افتراضية
- ✅ أضف تأثيرات hover

### 4. الأذونات
- ✅ تحقق من نوع المستخدم قبل عرض القوائم
- ✅ استخدم `getCachedDeputyProfile()` للتحقق

### 5. TypeScript
- ✅ ref callback يجب أن يُرجع void
- ✅ استخدم `{}` بدلاً من `()` في arrow functions

### 6. أفضل الممارسات
- ✅ احذف debug code قبل deployment
- ✅ استخدم toast بدلاً من alert
- ✅ لا تكشف error messages للمستخدم

---

## 🔗 روابط مفيدة

- [Supabase Pagination](https://supabase.com/docs/guides/api#pagination)
- [PostgREST Limits](https://postgrest.org/en/stable/api.html#limits-and-pagination)
- [React ref Callback](https://react.dev/reference/react-dom/components/common#ref-callback)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

**آخر تحديث:** 27 أكتوبر 2025  
**المساهمون:** فريق تطوير منصة نائبك

