# تقرير شامل: نظام إدارة النواب في منصة نائبك

## التاريخ
20 أكتوبر 2025

## ملخص تنفيذي

تم اختبار عملية تحويل المواطن إلى نائب من خلال داشبورد الأدمن، وتم اكتشاف مشاكل متعددة تمنع النظام من العمل بشكل صحيح. هذا التقرير يوثق المشاكل المكتشفة ويقدم حلولاً تفصيلية.

---

## المشاكل المكتشفة

### المشكلة 1: زر "ترقية إلى نائب" من صفحة Users لا يعمل

**الموقع:** `/app_admin/users`

**الوصف:**
عند الضغط على زر "ترقية إلى نائب" لأي مستخدم، لا يحدث أي شيء. لا يظهر confirmation dialog ولا توجد أي استجابة من النظام.

**الملفات المتأثرة:**
- `/src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/users/PromoteToDeputyButton.tsx`
- `/src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/users/UsersList.tsx`

**السبب المحتمل:**
1. مشكلة في hydration بين server component و client component
2. الزر قد يكون معطل بسبب خطأ في JavaScript
3. أخطاء 404 في console قد تؤثر على تحميل المكونات

**الكود الحالي:**
```typescript
// PromoteToDeputyButton.tsx
export function PromoteToDeputyButton({ userId, userName }: PromoteToDeputyButtonProps) {
  const router = useRouter();
  
  const { execute, isExecuting } = useAction(createDeputyAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message || `تم ترقية ${userName} إلى نائب بنجاح`);
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "حدث خطأ أثناء الترقية");
    },
  });

  const handlePromote = () => {
    if (confirm(`هل أنت متأكد من ترقية ${userName} إلى نائب؟`)) {
      execute({ userId, deputyStatus: "active" });
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handlePromote}
      disabled={isExecuting}
    >
      <UserPlus className="h-4 w-4 mr-2" />
      {isExecuting ? "جاري الترقية..." : "ترقية إلى نائب"}
    </Button>
  );
}
```

---

### المشكلة 2: صفحة "إضافة نائب جديد" لا تعرض نتائج البحث

**الموقع:** `/app_admin/deputies/add`

**الوصف:**
عند البحث عن مستخدم باستخدام البريد الإلكتروني أو الاسم، لا تظهر أي نتائج بحث. الصفحة تبقى فارغة بدون أي رسائل خطأ أو نتائج.

**الملفات المتأثرة:**
- `/src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/deputies/add/page.tsx`
- `/src/data/admin/deputies.ts`

**السبب المحتمل:**
1. مشكلة في تنفيذ `searchUsersForDeputyAction`
2. عدم عرض النتائج بسبب خطأ في rendering
3. مشكلة في state management

---

### المشكلة 3: أخطاء 404 متكررة في Console

**الوصف:**
هناك أخطاء 404 متكررة في browser console تشير إلى موارد مفقودة. هذه الأخطاء قد تؤثر على أداء التطبيق وتسبب مشاكل في تحميل المكونات.

**التأثير:**
- قد تمنع تحميل بعض المكونات بشكل صحيح
- قد تسبب مشاكل في event handlers
- تؤثر على تجربة المستخدم

---

## بنية قاعدة البيانات

### جدول deputy_profiles

الجدول موجود ويحتوي على جميع الحقول المطلوبة:

**الحقول الأساسية:**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to user_profiles)
- `deputy_status` (enum: active/inactive)

**معلومات المكتب:**
- `office_address` (text)
- `office_phone` (varchar)
- `office_hours` (varchar)

**معلومات انتخابية:**
- `electoral_symbol` (varchar) - الرمز الانتخابي
- `electoral_number` (varchar) - الرقم الانتخابي
- `electoral_program` (text) - البرنامج الانتخابي

**معلومات إضافية:**
- `bio` (text) - السيرة الذاتية
- `achievements` (text) - الإنجازات
- `events` (text) - المناسبات

**روابط اجتماعية:**
- `website_url` (varchar)
- `social_media_facebook` (varchar)
- `social_media_twitter` (varchar)
- `social_media_instagram` (varchar)
- `social_media_youtube` (varchar)

**معلومات التقييم:**
- `initial_rating_count` (integer)
- `initial_rating_average` (numeric)
- `initial_rating_avg` (numeric)

**علاقات:**
- `council_id` (uuid, foreign key to councils)

**التواريخ:**
- `created_at` (timestamp)
- `updated_at` (timestamp)

### جداول مرتبطة

**deputy_achievements** - جدول منفصل للإنجازات
**deputy_events** - جدول منفصل للمناسبات (events table)
**electoral_programs** - جدول منفصل للبرامج الانتخابية

---

## الحلول المقترحة

### الحل 1: إصلاح زر "ترقية إلى نائب"

#### الخطوة 1: التأكد من أن الزر client component بشكل صحيح

تحديث `PromoteToDeputyButton.tsx`:

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { createDeputyAction } from "@/data/admin/deputies";
import { UserPlus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PromoteToDeputyButtonProps {
  userId: string;
  userName: string;
}

export function PromoteToDeputyButton({ userId, userName }: PromoteToDeputyButtonProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  
  const { execute, isExecuting } = useAction(createDeputyAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message || `تم ترقية ${userName} إلى نائب بنجاح`);
      setTimeout(() => {
        router.refresh();
      }, 1000);
    },
    onError: ({ error }) => {
      console.error("Error promoting to deputy:", error);
      toast.error(error.serverError || "حدث خطأ أثناء الترقية");
    },
  });

  const handlePromote = async () => {
    try {
      setIsConfirming(true);
      const confirmed = window.confirm(`هل أنت متأكد من ترقية ${userName} إلى نائب؟`);
      
      if (confirmed) {
        console.log("Promoting user to deputy:", userId);
        await execute({ userId, deputyStatus: "active" });
      }
    } catch (error) {
      console.error("Error in handlePromote:", error);
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handlePromote}
      disabled={isExecuting || isConfirming}
      type="button"
    >
      <UserPlus className="h-4 w-4 mr-2" />
      {isExecuting || isConfirming ? "جاري الترقية..." : "ترقية إلى نائب"}
    </Button>
  );
}
```

#### الخطوة 2: إضافة logging للتشخيص

تحديث `createDeputyAction` في `/src/data/admin/deputies.ts`:

```typescript
export const createDeputyAction = actionClient
  .schema(createDeputySchema)
  .action(async ({ parsedInput: { userId, deputyStatus } }) => {
    console.log("[createDeputyAction] Starting with:", { userId, deputyStatus });
    const supabase = await createSupabaseUserServerComponentClient();

    try {
      // Check if user exists
      console.log("[createDeputyAction] Checking if user exists...");
      const { data: user, error: userError } = await supabase
        .from("user_profiles")
        .select("id, full_name")
        .eq("id", userId)
        .single();

      if (userError || !user) {
        console.error("[createDeputyAction] User not found:", userError);
        throw new Error("User not found");
      }

      console.log("[createDeputyAction] User found:", user);

      // Check if deputy profile already exists
      console.log("[createDeputyAction] Checking if deputy profile exists...");
      const { data: existingDeputy } = await supabase
        .from("deputy_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existingDeputy) {
        console.log("[createDeputyAction] User is already a deputy");
        throw new Error("User is already a deputy");
      }

      // Step 1: Add "deputy" role to user_roles
      console.log("[createDeputyAction] Adding deputy role...");
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: "deputy",
        })
        .select()
        .single();

      if (roleError) {
        console.error("[createDeputyAction] Failed to add role:", roleError);
        throw new Error(`Failed to add deputy role: ${roleError.message}`);
      }

      console.log("[createDeputyAction] Role added successfully:", roleData);

      // Step 2: Create deputy profile
      console.log("[createDeputyAction] Creating deputy profile...");
      const { data: deputy, error: deputyError } = await supabase
        .from("deputy_profiles")
        .insert({
          user_id: userId,
          deputy_status: deputyStatus,
        })
        .select()
        .single();

      if (deputyError) {
        console.error("[createDeputyAction] Failed to create deputy profile:", deputyError);
        // Rollback: remove the role if deputy profile creation fails
        await supabase
          .from("user_roles")
          .delete()
          .eq("id", roleData.id);
        
        throw new Error(`Failed to create deputy profile: ${deputyError.message}`);
      }

      console.log("[createDeputyAction] Deputy profile created successfully:", deputy);

      return { 
        deputy, 
        role: roleData,
        message: `تم ترقية ${user.full_name || 'المستخدم'} إلى نائب بنجاح` 
      };
    } catch (error) {
      console.error("[createDeputyAction] Error:", error);
      throw error;
    }
  });
```

---

### الحل 2: إصلاح صفحة "إضافة نائب جديد"

تحديث `/src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/deputies/add/page.tsx`:

```typescript
"use client";

import { Link } from "@/components/intl-link";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createDeputyAction, searchUsersForDeputyAction } from "@/data/admin/deputies";
import { ArrowLeft, Search, UserPlus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AddDeputyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  const { execute: executeSearch, isExecuting: isSearching } = useAction(
    searchUsersForDeputyAction,
    {
      onSuccess: ({ data }) => {
        console.log("Search results:", data);
        setSearchResults(data?.users || []);
        setHasSearched(true);
        if (data?.users?.length === 0) {
          toast.info("لم يتم العثور على نتائج");
        } else {
          toast.success(`تم العثور على ${data?.users?.length} مستخدم`);
        }
      },
      onError: ({ error }) => {
        console.error("Search error:", error);
        toast.error(error.serverError || "حدث خطأ أثناء البحث");
        setHasSearched(true);
      },
    }
  );

  const { execute: executeCreate, isExecuting: isCreating } = useAction(
    createDeputyAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data?.message || "تم إنشاء ملف النائب بنجاح");
        setTimeout(() => {
          router.push("/app_admin/deputies");
        }, 1500);
      },
      onError: ({ error }) => {
        console.error("Create deputy error:", error);
        toast.error(error.serverError || "حدث خطأ أثناء إنشاء ملف النائب");
      },
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      setHasSearched(false);
      executeSearch({ query: searchQuery });
    } else {
      toast.error("الرجاء إدخال نص للبحث");
    }
  };

  const handleCreateDeputy = (userId: string, userName: string) => {
    if (window.confirm(`هل أنت متأكد من ترقية ${userName} إلى نائب؟`)) {
      console.log("Creating deputy for user:", userId);
      executeCreate({ userId, deputyStatus: "active" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app_admin/deputies">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-2">
          <Typography.H1 className="text-3xl font-bold tracking-tight">
            إضافة نائب جديد
          </Typography.H1>
          <Typography.P className="text-muted-foreground">
            ابحث عن مستخدم لتحويله إلى نائب
          </Typography.P>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>البحث عن مستخدم</CardTitle>
          <CardDescription>
            ابحث بالاسم أو البريد الإلكتروني أو رقم الهاتف
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">
                  البحث
                </Label>
                <Input
                  id="search"
                  placeholder="اكتب الاسم أو البريد الإلكتروني أو رقم الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSearching}
                />
              </div>
              <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري البحث...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    بحث
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {hasSearched && searchResults.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              لم يتم العثور على نتائج. حاول البحث بكلمات مختلفة.
            </p>
          </CardContent>
        </Card>
      )}

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>نتائج البحث</CardTitle>
            <CardDescription>
              تم العثور على {searchResults.length} مستخدم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>المحافظة</TableHead>
                  <TableHead>الحزب</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || "غير محدد"}
                    </TableCell>
                    <TableCell>{user.email || "غير محدد"}</TableCell>
                    <TableCell>{user.phone || "غير محدد"}</TableCell>
                    <TableCell>
                      {user.governorates?.name_ar || "غير محدد"}
                    </TableCell>
                    <TableCell>{user.parties?.name_ar || "غير محدد"}</TableCell>
                    <TableCell>
                      {user.isDeputy ? (
                        <Badge variant="secondary">نائب بالفعل</Badge>
                      ) : (
                        <Badge variant="outline">مستخدم عادي</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!user.isDeputy ? (
                        <Button
                          size="sm"
                          onClick={() => handleCreateDeputy(user.id, user.full_name || user.email)}
                          disabled={isCreating}
                        >
                          {isCreating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              جاري التحويل...
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              تحويل إلى نائب
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          نائب بالفعل
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

### الحل 3: إضافة صفحة تعديل ملف النائب

إنشاء صفحة جديدة لتعديل معلومات النائب:

**المسار:** `/src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/deputies/[deputyId]/edit/page.tsx`

```typescript
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Link } from "@/components/intl-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { updateDeputyAction, getCouncilsAction } from "@/data/admin/deputies";

interface DeputyEditPageProps {
  params: Promise<{
    deputyId: string;
  }>;
}

export default function DeputyEditPage({ params }: DeputyEditPageProps) {
  const { deputyId } = use(params);
  const router = useRouter();
  const [councils, setCouncils] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    bio: "",
    officeAddress: "",
    officePhone: "",
    officeHours: "",
    electoralSymbol: "",
    electoralNumber: "",
    electoralProgram: "",
    achievements: "",
    events: "",
    websiteUrl: "",
    socialMediaFacebook: "",
    socialMediaTwitter: "",
    socialMediaInstagram: "",
    socialMediaYoutube: "",
    councilId: "",
  });

  // Load councils
  const { execute: loadCouncils } = useAction(getCouncilsAction, {
    onSuccess: ({ data }) => {
      setCouncils(data?.councils || []);
    },
  });

  useEffect(() => {
    loadCouncils();
  }, []);

  // Update deputy
  const { execute: updateDeputy, isExecuting: isUpdating } = useAction(
    updateDeputyAction,
    {
      onSuccess: () => {
        toast.success("تم تحديث معلومات النائب بنجاح");
        setTimeout(() => {
          router.push("/app_admin/deputies");
        }, 1500);
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "حدث خطأ أثناء التحديث");
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeputy({
      deputyId,
      ...formData,
      councilId: formData.councilId || null,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/app_admin/deputies">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">تعديل ملف النائب</h1>
          <p className="text-muted-foreground">
            قم بتحديث معلومات النائب والبيانات الانتخابية
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* معلومات أساسية */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات أساسية</CardTitle>
            <CardDescription>
              السيرة الذاتية والمعلومات الشخصية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">السيرة الذاتية</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="اكتب السيرة الذاتية للنائب..."
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        {/* معلومات المكتب */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات المكتب</CardTitle>
            <CardDescription>
              عنوان وبيانات الاتصال بمكتب النائب
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="officeAddress">عنوان المكتب</Label>
              <Input
                id="officeAddress"
                name="officeAddress"
                value={formData.officeAddress}
                onChange={handleChange}
                placeholder="العنوان الكامل للمكتب"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="officePhone">هاتف المكتب</Label>
                <Input
                  id="officePhone"
                  name="officePhone"
                  value={formData.officePhone}
                  onChange={handleChange}
                  placeholder="+20 xxx xxx xxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="officeHours">ساعات العمل</Label>
                <Input
                  id="officeHours"
                  name="officeHours"
                  value={formData.officeHours}
                  onChange={handleChange}
                  placeholder="من 9 صباحاً إلى 5 مساءً"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* معلومات انتخابية */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات انتخابية</CardTitle>
            <CardDescription>
              الرمز والرقم الانتخابي والبرنامج الانتخابي
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="electoralSymbol">الرمز الانتخابي</Label>
                <Input
                  id="electoralSymbol"
                  name="electoralSymbol"
                  value={formData.electoralSymbol}
                  onChange={handleChange}
                  placeholder="مثال: النجمة"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="electoralNumber">الرقم الانتخابي</Label>
                <Input
                  id="electoralNumber"
                  name="electoralNumber"
                  value={formData.electoralNumber}
                  onChange={handleChange}
                  placeholder="مثال: 123"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="councilId">المجلس</Label>
              <Select
                value={formData.councilId}
                onValueChange={(value) =>
                  setFormData({ ...formData, councilId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المجلس" />
                </SelectTrigger>
                <SelectContent>
                  {councils.map((council) => (
                    <SelectItem key={council.id} value={council.id}>
                      {council.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="electoralProgram">البرنامج الانتخابي</Label>
              <Textarea
                id="electoralProgram"
                name="electoralProgram"
                value={formData.electoralProgram}
                onChange={handleChange}
                placeholder="اكتب البرنامج الانتخابي..."
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        {/* الإنجازات والمناسبات */}
        <Card>
          <CardHeader>
            <CardTitle>الإنجازات والمناسبات</CardTitle>
            <CardDescription>
              سجل إنجازات النائب والمناسبات المهمة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="achievements">الإنجازات</Label>
              <Textarea
                id="achievements"
                name="achievements"
                value={formData.achievements}
                onChange={handleChange}
                placeholder="اكتب إنجازات النائب..."
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="events">المناسبات</Label>
              <Textarea
                id="events"
                name="events"
                value={formData.events}
                onChange={handleChange}
                placeholder="اكتب المناسبات والفعاليات..."
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        {/* روابط التواصل الاجتماعي */}
        <Card>
          <CardHeader>
            <CardTitle>روابط التواصل الاجتماعي</CardTitle>
            <CardDescription>
              روابط حسابات النائب على مواقع التواصل الاجتماعي
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">الموقع الإلكتروني</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="socialMediaFacebook">Facebook</Label>
                <Input
                  id="socialMediaFacebook"
                  name="socialMediaFacebook"
                  type="url"
                  value={formData.socialMediaFacebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="socialMediaTwitter">Twitter</Label>
                <Input
                  id="socialMediaTwitter"
                  name="socialMediaTwitter"
                  type="url"
                  value={formData.socialMediaTwitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="socialMediaInstagram">Instagram</Label>
                <Input
                  id="socialMediaInstagram"
                  name="socialMediaInstagram"
                  type="url"
                  value={formData.socialMediaInstagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="socialMediaYoutube">YouTube</Label>
                <Input
                  id="socialMediaYoutube"
                  name="socialMediaYoutube"
                  type="url"
                  value={formData.socialMediaYoutube}
                  onChange={handleChange}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* أزرار الحفظ */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                حفظ التغييرات
              </>
            )}
          </Button>
          <Link href="/app_admin/deputies">
            <Button type="button" variant="outline">
              إلغاء
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
```

---

## ملاحظات مهمة

### 1. الجداول المنفصلة

لاحظ أن هناك جداول منفصلة للإنجازات والمناسبات:
- `deputy_achievements` - للإنجازات
- `events` - للمناسبات (مرتبط بـ deputy_id)

يجب إنشاء واجهات منفصلة لإدارة هذه البيانات بدلاً من استخدام حقول text في جدول deputy_profiles.

### 2. البرامج الانتخابية

هناك جدول منفصل `electoral_programs` يجب استخدامه لتخزين البرامج الانتخابية بشكل منظم.

### 3. التقييمات

النظام يدعم تقييمات أولية (`initial_rating_count`, `initial_rating_average`) يمكن استخدامها لتعيين تقييم افتراضي للنائب.

---

## خطوات التنفيذ

### المرحلة 1: إصلاح المشاكل الحالية (أولوية عالية)
1. تطبيق الحل 1 لإصلاح زر "ترقية إلى نائب"
2. تطبيق الحل 2 لإصلاح صفحة "إضافة نائب جديد"
3. اختبار كلا الطريقتين للتأكد من عملهما

### المرحلة 2: إضافة صفحة التعديل (أولوية متوسطة)
1. إنشاء صفحة تعديل ملف النائب
2. إضافة جميع الحقول المطلوبة
3. اختبار عملية الحفظ والتحديث

### المرحلة 3: تحسين النظام (أولوية منخفضة)
1. إنشاء واجهات لإدارة الإنجازات (CRUD operations)
2. إنشاء واجهات لإدارة المناسبات
3. إنشاء واجهة لإدارة البرامج الانتخابية
4. إضافة رفع الصور للنائب
5. إضافة نظام التقييمات

---

## الخلاصة

النظام الحالي يحتوي على بنية قاعدة بيانات جيدة وشاملة، لكن هناك مشاكل في الواجهة الأمامية تمنع عملية تحويل المواطن إلى نائب. الحلول المقترحة أعلاه ستعالج هذه المشاكل وتوفر نظام إدارة نواب كامل ومتكامل.

**التوصية:** البدء بتطبيق المرحلة 1 فوراً لإصلاح المشاكل الحرجة، ثم التخطيط للمراحل التالية بناءً على الأولويات.

