"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Phone, Briefcase, MapPin, DollarSign, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { createJob } from '@/data/jobs/mutations';
import { getJobCategories, getGovernorates } from '@/data/jobs/lookups';
import type { JobCategory, Governorate } from '@/data/jobs/lookups';
import { WORK_LOCATIONS, EMPLOYMENT_TYPES } from '@/types/jobs';

export default function CompanyJobAdForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);

  // Load categories and governorates on mount
  useState(() => {
    loadData();
  });

  const loadData = async () => {
    try {
      const [cats, govs] = await Promise.all([
        getJobCategories(),
        getGovernorates(),
      ]);
      setCategories(cats);
      setGovernorates(govs);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_name: '',
    company_phone: '',
    category_id: '',
    governorate_id: '',
    work_location: 'office' as const,
    employment_type: 'full-time' as const,
    salary_min: '',
    salary_max: '',
    salary_currency: 'EGP',
    office_address: '',
    requirements: '',
    benefits: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.title || !formData.description || !formData.company_name || !formData.company_phone) {
        throw new Error('الرجاء ملء جميع الحقول المطلوبة');
      }

      if (!formData.category_id) {
        throw new Error('الرجاء اختيار الفئة الوظيفية');
      }

      // Validate phone number (Egyptian format)
      const phoneRegex = /^(01)[0-9]{9}$/;
      if (!phoneRegex.test(formData.company_phone.replace(/[\s-]/g, ''))) {
        throw new Error('رقم الهاتف غير صحيح. يجب أن يبدأ بـ 01 ويتكون من 11 رقم');
      }

      // Prepare data
      const jobData = {
        title: formData.title,
        description: formData.description,
        company_name: formData.company_name,
        company_phone: formData.company_phone,
        is_company_ad: true, // Mark as company ad
        category_id: formData.category_id,
        governorate_id: formData.governorate_id || undefined,
        work_location: formData.work_location,
        employment_type: formData.employment_type,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
        salary_currency: formData.salary_currency,
        office_address: formData.office_address || undefined,
        requirements: formData.requirements ? formData.requirements.split('\n').filter(r => r.trim()) : undefined,
        benefits: formData.benefits ? formData.benefits.split('\n').filter(b => b.trim()) : undefined,
        status: 'active' as const,
        positions_available: 1,
      };

      const result = await createJob(jobData);

      if (result.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          title: '',
          description: '',
          company_name: '',
          company_phone: '',
          category_id: '',
          governorate_id: '',
          work_location: 'office',
          employment_type: 'full-time',
          salary_min: '',
          salary_max: '',
          salary_currency: 'EGP',
          office_address: '',
          requirements: '',
          benefits: '',
        });

        // Redirect to jobs page after 2 seconds
        setTimeout(() => {
          router.push('/jobs');
        }, 2000);
      } else {
        throw new Error(result.error || 'حدث خطأ أثناء إضافة الإعلان');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="py-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold">تم إضافة الإعلان بنجاح!</h2>
            <p className="text-muted-foreground">سيتم توجيهك إلى صفحة الوظائف...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* معلومات الشركة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            معلومات الشركة
          </CardTitle>
          <CardDescription>معلومات الاتصال بشركتك</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">
              اسم الشركة <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              placeholder="مثال: شركة التقنية المتقدمة"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_phone">
              رقم تليفون الشركة <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="company_phone"
                type="tel"
                value={formData.company_phone}
                onChange={(e) => handleChange('company_phone', e.target.value)}
                placeholder="01xxxxxxxxx"
                className="pr-10"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              سيظهر هذا الرقم للمتقدمين للتواصل معك مباشرة
            </p>
          </div>
        </CardContent>
      </Card>

      {/* تفاصيل الوظيفة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            تفاصيل الوظيفة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              المسمى الوظيفي <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="مثال: موظف مبيعات"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              وصف الوظيفة <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="اكتب وصفاً تفصيلياً للوظيفة..."
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">
                الفئة الوظيفية <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleChange('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment_type">نوع الوظيفة</Label>
              <Select
                value={formData.employment_type}
                onValueChange={(value: any) => handleChange('employment_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.labelAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الموقع والراتب */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            الموقع والراتب
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="governorate_id">المحافظة</Label>
              <Select
                value={formData.governorate_id}
                onValueChange={(value) => handleChange('governorate_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المحافظة" />
                </SelectTrigger>
                <SelectContent>
                  {governorates.map((gov) => (
                    <SelectItem key={gov.id} value={gov.id}>
                      {gov.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="work_location">مكان العمل</Label>
              <Select
                value={formData.work_location}
                onValueChange={(value: any) => handleChange('work_location', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORK_LOCATIONS.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>
                      {loc.labelAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="office_address">عنوان المقر</Label>
            <Input
              id="office_address"
              value={formData.office_address}
              onChange={(e) => handleChange('office_address', e.target.value)}
              placeholder="مثال: شارع التحرير، القاهرة"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_min">الحد الأدنى للراتب (اختياري)</Label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="salary_min"
                  type="number"
                  value={formData.salary_min}
                  onChange={(e) => handleChange('salary_min', e.target.value)}
                  placeholder="3000"
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_max">الحد الأقصى للراتب (اختياري)</Label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="salary_max"
                  type="number"
                  value={formData.salary_max}
                  onChange={(e) => handleChange('salary_max', e.target.value)}
                  placeholder="5000"
                  className="pr-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* المتطلبات والمزايا */}
      <Card>
        <CardHeader>
          <CardTitle>المتطلبات والمزايا (اختياري)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requirements">المتطلبات</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleChange('requirements', e.target.value)}
              placeholder="اكتب كل متطلب في سطر منفصل..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">كل سطر سيكون متطلب منفصل</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">المزايا</Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) => handleChange('benefits', e.target.value)}
              placeholder="اكتب كل ميزة في سطر منفصل..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">كل سطر سيكون ميزة منفصلة</p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? 'جاري النشر...' : 'نشر الإعلان'}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        بنشر الإعلان، أنت توافق على أن المعلومات المقدمة صحيحة وأن رقم التليفون سيكون متاحاً للمتقدمين
      </p>
    </form>
  );
}
