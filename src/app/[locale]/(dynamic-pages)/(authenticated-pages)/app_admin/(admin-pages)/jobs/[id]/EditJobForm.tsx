'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { updateJob } from '@/data/jobs/actions';
import {
  WORK_LOCATIONS,
  EMPLOYMENT_TYPES,
  JOB_STATUSES,
  type JobWithStatistics,
} from '@/types/jobs';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditJobFormProps {
  job: JobWithStatistics;
}

export default function EditJobForm({ job }: EditJobFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [governorates, setGovernorates] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: job.title || '',
    description: job.description || '',
    company_name: job.company_name || '',
    company_phone: job.company_phone || '',
    is_company_ad: job.is_company_ad || false,
    category_id: job.category_id || '',
    work_location: job.work_location || '',
    employment_type: job.employment_type || '',
    governorate_id: job.governorate_id || '',
    office_address: job.office_address || '',
    salary_min: job.salary_min?.toString() || '',
    salary_max: job.salary_max?.toString() || '',
    salary_currency: job.salary_currency || 'EGP',
    requirements: job.requirements?.join('\n') || '',
    benefits: job.benefits?.join('\n') || '',
    status: job.status || 'draft',
    positions_available: job.positions_available?.toString() || '1',
  });

  // Load categories and governorates
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catsRes, govsRes] = await Promise.all([
        fetch('/api/jobs/categories'),
        fetch('/api/jobs/governorates'),
      ]);

      const catsData = await catsRes.json();
      const govsData = await govsRes.json();

      if (catsData.success) {
        setCategories(catsData.data);
      }
      if (govsData.success) {
        setGovernorates(govsData.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_company_ad: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category_id) {
        toast.error('يرجى ملء جميع الحقول المطلوبة');
        setIsSubmitting(false);
        return;
      }

      // Prepare update data
      const updateData = {
        id: job.id,
        title: formData.title,
        description: formData.description,
        company_name: formData.company_name || undefined,
        company_phone: formData.company_phone || undefined,
        is_company_ad: formData.is_company_ad,
        category_id: formData.category_id,
        work_location: formData.work_location || undefined,
        employment_type: formData.employment_type || undefined,
        governorate_id: formData.governorate_id || undefined,
        office_address: formData.office_address || undefined,
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : undefined,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : undefined,
        salary_currency: formData.salary_currency,
        requirements: formData.requirements ? formData.requirements.split('\n').filter(r => r.trim()) : undefined,
        benefits: formData.benefits ? formData.benefits.split('\n').filter(b => b.trim()) : undefined,
        status: formData.status,
        positions_available: formData.positions_available ? parseInt(formData.positions_available) : 1,
      };

      const result = await updateJob(updateData as any);

      if (!result.success) {
        throw new Error(result.error || 'فشل تحديث الوظيفة');
      }

      toast.success('تم تحديث الوظيفة بنجاح!');
      router.push('/app_admin/jobs');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء تحديث الوظيفة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Button */}
      <div>
        <Button variant="outline" asChild>
          <Link href="/app_admin/jobs">
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى قائمة الوظائف
          </Link>
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>المعلومات الأساسية</CardTitle>
          <CardDescription>معلومات الوظيفة الأساسية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              عنوان الوظيفة <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="text-right"
              required
              placeholder="مثال: موظف مبيعات"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              وصف الوظيفة <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="text-right"
              required
              placeholder="اكتب وصفاً تفصيلياً للوظيفة..."
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">
              الفئة الوظيفية <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => handleSelectChange('category_id', value)}
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
            <Label htmlFor="status">
              حالة الوظيفة <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JOB_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.labelAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="positions_available">عدد الوظائف المتاحة</Label>
            <Input
              id="positions_available"
              name="positions_available"
              type="number"
              min="1"
              value={formData.positions_available}
              onChange={handleInputChange}
              className="text-right"
            />
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات الشركة</CardTitle>
          <CardDescription>للإعلانات المدفوعة من الشركات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="is_company_ad"
              checked={formData.is_company_ad}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="is_company_ad" className="cursor-pointer">
              هذا إعلان شركة (سيظهر رقم الهاتف للمتقدمين)
            </Label>
          </div>

          {formData.is_company_ad && (
            <>
              <div className="space-y-2">
                <Label htmlFor="company_name">اسم الشركة</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  className="text-right"
                  placeholder="مثال: شركة التقنية المتقدمة"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_phone">رقم تليفون الشركة</Label>
                <Input
                  id="company_phone"
                  name="company_phone"
                  type="tel"
                  value={formData.company_phone}
                  onChange={handleInputChange}
                  className="text-right"
                  placeholder="01xxxxxxxxx"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Job Details */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الوظيفة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="work_location">مكان العمل</Label>
              <Select
                value={formData.work_location}
                onValueChange={(value) => handleSelectChange('work_location', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر مكان العمل" />
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

            <div className="space-y-2">
              <Label htmlFor="employment_type">نوع الوظيفة</Label>
              <Select
                value={formData.employment_type}
                onValueChange={(value) => handleSelectChange('employment_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الوظيفة" />
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

          <div className="space-y-2">
            <Label htmlFor="governorate_id">المحافظة</Label>
            <Select
              value={formData.governorate_id}
              onValueChange={(value) => handleSelectChange('governorate_id', value)}
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
            <Label htmlFor="office_address">عنوان المقر</Label>
            <Input
              id="office_address"
              name="office_address"
              value={formData.office_address}
              onChange={handleInputChange}
              className="text-right"
              placeholder="مثال: شارع التحرير، القاهرة"
            />
          </div>
        </CardContent>
      </Card>

      {/* Salary */}
      <Card>
        <CardHeader>
          <CardTitle>الراتب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_min">الحد الأدنى (جنيه)</Label>
              <Input
                id="salary_min"
                name="salary_min"
                type="number"
                value={formData.salary_min}
                onChange={handleInputChange}
                className="text-right"
                placeholder="3000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_max">الحد الأقصى (جنيه)</Label>
              <Input
                id="salary_max"
                name="salary_max"
                type="number"
                value={formData.salary_max}
                onChange={handleInputChange}
                className="text-right"
                placeholder="5000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements & Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>المتطلبات والمزايا</CardTitle>
          <CardDescription>اكتب كل متطلب أو ميزة في سطر منفصل</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requirements">المتطلبات</Label>
            <Textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              className="text-right"
              placeholder="اكتب كل متطلب في سطر منفصل..."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">المزايا</Label>
            <Textarea
              id="benefits"
              name="benefits"
              value={formData.benefits}
              onChange={handleInputChange}
              className="text-right"
              placeholder="اكتب كل ميزة في سطر منفصل..."
              rows={5}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="ml-2 h-5 w-5" />
              حفظ التعديلات
            </>
          )}
        </Button>

        <Button type="button" variant="outline" asChild>
          <Link href="/app_admin/jobs">إلغاء</Link>
        </Button>
      </div>
    </form>
  );
}
