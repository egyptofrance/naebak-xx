'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { submitJobApplication, uploadCV } from '@/data/jobs/actions';
import { EDUCATION_LEVELS, GOVERNORATES } from '@/types/jobs';
import { Loader2, Upload, CheckCircle } from 'lucide-react';

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
}

export default function JobApplicationForm({ jobId, jobTitle }: JobApplicationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    governorate: '',
    address: '',
    date_of_birth: '',
    education_level: '',
    education_field: '',
    university: '',
    years_of_experience: '',
    current_job_title: '',
    current_company: '',
    skills: '',
    why_interested: '',
    additional_info: '',
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

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'خطأ',
          description: 'حجم الملف يجب أن لا يتجاوز 5 ميجابايت',
          variant: 'destructive',
        });
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'خطأ',
          description: 'نوع الملف غير مدعوم. يرجى رفع ملف PDF أو Word',
          variant: 'destructive',
        });
        return;
      }

      setCvFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.full_name || !formData.email || !formData.phone || !formData.governorate) {
        toast({
          title: 'خطأ',
          description: 'يرجى ملء جميع الحقول المطلوبة',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Upload CV if provided
      let cvUrl = null;
      if (cvFile) {
        setCvUploading(true);
        const uploadResult = await uploadCV(cvFile, jobId);
        if (uploadResult.success && uploadResult.url) {
          cvUrl = uploadResult.url;
        } else {
          throw new Error('فشل رفع السيرة الذاتية');
        }
        setCvUploading(false);
      }

      // Submit application
      const applicationData = {
        job_id: jobId,
        ...formData,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : null,
        cv_url: cvUrl,
      };

      const result = await submitJobApplication(applicationData);

      if (result.success) {
        toast({
          title: 'تم الإرسال بنجاح! 🎉',
          description: 'تم استلام طلبك وسيتم التواصل معك قريباً',
        });

        // Redirect to success page or job details
        setTimeout(() => {
          router.push(`/jobs/${jobId}?applied=true`);
        }, 2000);
      } else {
        throw new Error(result.error || 'حدث خطأ أثناء إرسال الطلب');
      }
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء إرسال الطلب',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">المعلومات الشخصية</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">
              الاسم الكامل <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
              placeholder="أدخل اسمك الكامل"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              البريد الإلكتروني <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="example@email.com"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              رقم الهاتف <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="01xxxxxxxxx"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">تاريخ الميلاد</Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleInputChange}
            />
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

          <div className="space-y-2">
            <Label htmlFor="address">العنوان</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="العنوان التفصيلي"
            />
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">المؤهلات الدراسية</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="education_level">المستوى التعليمي</Label>
            <Select
              value={formData.education_level}
              onValueChange={(value) => handleSelectChange('education_level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المستوى التعليمي" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATION_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.labelAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education_field">التخصص</Label>
            <Input
              id="education_field"
              name="education_field"
              value={formData.education_field}
              onChange={handleInputChange}
              placeholder="مثال: علوم الحاسب"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="university">الجامعة/المعهد</Label>
            <Input
              id="university"
              name="university"
              value={formData.university}
              onChange={handleInputChange}
              placeholder="اسم الجامعة أو المعهد"
            />
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">الخبرة العملية</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="years_of_experience">سنوات الخبرة</Label>
            <Input
              id="years_of_experience"
              name="years_of_experience"
              type="number"
              min="0"
              value={formData.years_of_experience}
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_job_title">المسمى الوظيفي الحالي</Label>
            <Input
              id="current_job_title"
              name="current_job_title"
              value={formData.current_job_title}
              onChange={handleInputChange}
              placeholder="مثال: مطور ويب"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="current_company">جهة العمل الحالية</Label>
            <Input
              id="current_company"
              name="current_company"
              value={formData.current_company}
              onChange={handleInputChange}
              placeholder="اسم الشركة أو المؤسسة"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="skills">المهارات</Label>
            <Textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              placeholder="اذكر مهاراتك الرئيسية (مفصولة بفاصلة)"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">معلومات إضافية</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="why_interested">لماذا أنت مهتم بهذه الوظيفة؟</Label>
            <Textarea
              id="why_interested"
              name="why_interested"
              value={formData.why_interested}
              onChange={handleInputChange}
              placeholder="أخبرنا لماذا تريد الانضمام إلى فريقنا"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional_info">معلومات إضافية</Label>
            <Textarea
              id="additional_info"
              name="additional_info"
              value={formData.additional_info}
              onChange={handleInputChange}
              placeholder="أي معلومات أخرى تود إضافتها"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* CV Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">السيرة الذاتية</h3>

        <div className="space-y-2">
          <Label htmlFor="cv">رفع السيرة الذاتية (PDF أو Word)</Label>
          <div className="flex items-center gap-2">
            <Input
              id="cv"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleCvChange}
              className="cursor-pointer"
            />
            {cvFile && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
          {cvFile && (
            <p className="text-sm text-muted-foreground">
              تم اختيار: {cvFile.name}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            الحد الأقصى لحجم الملف: 5 ميجابايت
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || cvUploading}
          className="px-12"
        >
          {isSubmitting || cvUploading ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              {cvUploading ? 'جاري رفع السيرة الذاتية...' : 'جاري الإرسال...'}
            </>
          ) : (
            <>
              <Upload className="ml-2 h-4 w-4" />
              إرسال الطلب
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
