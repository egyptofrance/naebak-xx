'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createOrUpdateEmploymentProfile, submitJobApplication } from '@/data/employment/actions';
import { toast } from 'sonner';

export default function EmploymentProfileForm({
  jobId,
  returnTo,
}: {
  jobId?: string;
  returnTo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    national_id: '',
    date_of_birth: '',
    governorate: '',
    city: '',
    address: '',
    education_level: '',
    education_details: '',
    years_of_experience: 0,
    previous_experience: '',
    skills: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createOrUpdateEmploymentProfile({
        ...formData,
        years_of_experience: Number(formData.years_of_experience) || 0,
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()) : [],
      });

      if (result.success) {
        toast.success('تم حفظ ملفك الوظيفي بنجاح');

        // If jobId is provided, submit application automatically
        if (jobId && result.profileId) {
          const appResult = await submitJobApplication(jobId, result.profileId);
          if (appResult.success) {
            toast.success('تم تقديم طلبك بنجاح');
            router.push('/my-applications');
          } else {
            toast.error(appResult.error || 'فشل تقديم الطلب');
            router.push('/my-cv');
          }
        } else if (returnTo) {
          router.push(returnTo);
        } else {
          router.push('/my-cv');
        }
      } else {
        toast.error(result.error || 'فشل حفظ الملف الوظيفي');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>البيانات الشخصية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">الاسم الكامل *</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">البريد الإلكتروني *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">رقم الهاتف *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="national_id">الرقم القومي</Label>
              <Input
                id="national_id"
                name="national_id"
                value={formData.national_id}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="date_of_birth">تاريخ الميلاد</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="governorate">المحافظة</Label>
              <Input
                id="governorate"
                name="governorate"
                value={formData.governorate}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="city">المدينة</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">العنوان</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>المؤهلات والخبرات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="education_level">المستوى التعليمي</Label>
              <Input
                id="education_level"
                name="education_level"
                value={formData.education_level}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="years_of_experience">سنوات الخبرة</Label>
              <Input
                id="years_of_experience"
                name="years_of_experience"
                type="number"
                min="0"
                value={formData.years_of_experience}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="education_details">تفاصيل التعليم</Label>
              <Textarea
                id="education_details"
                name="education_details"
                value={formData.education_details}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="previous_experience">الخبرات السابقة</Label>
              <Textarea
                id="previous_experience"
                name="previous_experience"
                value={formData.previous_experience}
                onChange={handleChange}
                rows={4}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="skills">المهارات (افصل بينها بفاصلة)</Label>
              <Textarea
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                rows={3}
                placeholder="مثال: Microsoft Office, التواصل الفعال, إدارة الوقت"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          إلغاء
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'جاري الحفظ...' : 'حفظ وإكمال'}
        </Button>
      </div>
    </form>
  );
}
