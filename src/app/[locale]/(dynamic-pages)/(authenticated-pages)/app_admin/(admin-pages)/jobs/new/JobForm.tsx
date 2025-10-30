'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createJob, uploadJobImage } from '@/data/jobs/actions';
import {
  JOB_CATEGORIES,
  WORK_LOCATIONS,
  EMPLOYMENT_TYPES,
  GOVERNORATES,
  JOB_STATUSES,
} from '@/types/jobs';
import { Loader2, Save } from 'lucide-react';
import JobImageUpload from './JobImageUpload';

export default function JobForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageData, setImageData] = useState<{
    fileData: string;
    fileName: string;
    fileType: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    work_location: '',
    employment_type: '',
    governorate: '',
    address: '',
    salary_min: '',
    salary_max: '',
    working_hours: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    status: 'draft',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (fileData: string, fileName: string, fileType: string) => {
    setImageData({ fileData, fileName, fileType });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category || !formData.governorate) {
        toast.error('يرجى ملء جميع الحقول المطلوبة');
        setIsSubmitting(false);
        return;
      }

      // Create job
      const jobData = {
        ...formData,
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : undefined,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : undefined,
        requirements: formData.requirements ? formData.requirements.split('\n').filter(r => r.trim()) : undefined,
        responsibilities: formData.responsibilities ? formData.responsibilities.split('\n').filter(r => r.trim()) : undefined,
        benefits: formData.benefits ? formData.benefits.split('\n').filter(b => b.trim()) : undefined,
      };

      const result = await createJob(jobData as any);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'فشل إنشاء الوظيفة');
      }

      // Upload image if provided
      if (imageData && result.data.id) {
        const uploadResult = await uploadJobImage(
          imageData.fileData,
          imageData.fileName,
          imageData.fileType,
          result.data.id
        );

        if (uploadResult.success && uploadResult.url) {
          // Update job with image URL
          // Note: يمكن إضافة دالة updateJob هنا إذا لزم الأمر
        }
      }

      toast.success('تم إضافة الوظيفة بنجاح!');
      router.push('/app_admin/jobs');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء إضافة الوظيفة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">المعلومات الأساسية</h3>

        <div className="space-y-2">
          <Label htmlFor="title">
            عنوان الوظيفة <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="مثال: موظف إدخال بيانات"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            الوصف <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            placeholder="وصف مختصر عن الوظيفة"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">
              الفئة <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange('category', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {JOB_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.labelAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="governorate">
              المحافظة <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.governorate}
              onValueChange={(value) => handleSelectChange('governorate', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المحافظة" />
              </SelectTrigger>
              <SelectContent>
                {GOVERNORATES.map((gov) => (
                  <SelectItem key={gov.value} value={gov.value}>
                    {gov.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">العنوان التفصيلي</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="مثال: 5 عمارات العبور، طريق صلاح سالم، مصر الجديدة"
          />
        </div>
      </div>

      {/* Salary & Hours */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">الراتب ومواعيد العمل</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="salary_min">الحد الأدنى للراتب (جنيه)</Label>
            <Input
              id="salary_min"
              name="salary_min"
              type="number"
              value={formData.salary_min}
              onChange={handleInputChange}
              placeholder="3000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary_max">الحد الأقصى للراتب (جنيه)</Label>
            <Input
              id="salary_max"
              name="salary_max"
              type="number"
              value={formData.salary_max}
              onChange={handleInputChange}
              placeholder="5000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="working_hours">ساعات العمل</Label>
          <Input
            id="working_hours"
            name="working_hours"
            value={formData.working_hours}
            onChange={handleInputChange}
            placeholder="مثال: من 9 صباحاً إلى 5 مساءً"
          />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">التفاصيل</h3>

        <div className="space-y-2">
          <Label htmlFor="requirements">المتطلبات (سطر لكل متطلب)</Label>
          <Textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleInputChange}
            placeholder="خبرة سنة على الأقل&#10;إجادة برامج Office&#10;مهارات تواصل جيدة"
            rows={5}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="responsibilities">المسؤوليات (سطر لكل مسؤولية)</Label>
          <Textarea
            id="responsibilities"
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleInputChange}
            placeholder="إدخال البيانات في النظام&#10;مراجعة الدقة&#10;إعداد التقارير"
            rows={5}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="benefits">المزايا (سطر لكل ميزة)</Label>
          <Textarea
            id="benefits"
            name="benefits"
            value={formData.benefits}
            onChange={handleInputChange}
            placeholder="تأمين صحي&#10;بدل مواصلات&#10;إجازات سنوية"
            rows={5}
          />
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">صورة الوظيفة</h3>
        <JobImageUpload onImageSelect={handleImageSelect} />
      </div>

      {/* Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">حالة الوظيفة</h3>

        <div className="space-y-2">
          <Label htmlFor="status">الحالة</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الحالة" />
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
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          إلغاء
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" />
              حفظ الوظيفة
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
