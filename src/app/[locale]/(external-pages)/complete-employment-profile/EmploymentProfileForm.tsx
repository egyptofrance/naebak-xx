'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { upsertEmploymentProfile } from '@/data/employment/actions';
import type { UserEmploymentProfile } from '@/types/employment';

interface Props {
  initialData?: UserEmploymentProfile | null;
  returnTo?: string;
}

export default function EmploymentProfileForm({ initialData, returnTo }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    
    try {
      await upsertEmploymentProfile({
        full_name: formData.get('full_name') as string,
        phone: formData.get('phone') as string,
        date_of_birth: formData.get('date_of_birth') as string || undefined,
        gender: formData.get('gender') as any || undefined,
        education_level: formData.get('education_level') as any || undefined,
        major: formData.get('major') as string || undefined,
        graduation_year: formData.get('graduation_year') ? parseInt(formData.get('graduation_year') as string) : undefined,
        years_of_experience: formData.get('years_of_experience') ? parseInt(formData.get('years_of_experience') as string) : 0,
        bio: formData.get('bio') as string || undefined,
      });
      
      // Redirect to return URL or jobs
      router.push(returnTo || '/jobs');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ البيانات');
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {/* Personal Info */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">المعلومات الشخصية</h2>
        
        <div>
          <Label htmlFor="full_name">الاسم الكامل *</Label>
          <Input
            id="full_name"
            name="full_name"
            required
            defaultValue={initialData?.full_name}
            className="text-right"
          />
        </div>
        
        <div>
          <Label htmlFor="phone">رقم الهاتف *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            pattern="^01[0-9]{9}$"
            placeholder="01xxxxxxxxx"
            defaultValue={initialData?.phone}
            className="text-right"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date_of_birth">تاريخ الميلاد</Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              defaultValue={initialData?.date_of_birth || ''}
            />
          </div>
          
          <div>
            <Label htmlFor="gender">الجنس</Label>
            <Select name="gender" defaultValue={initialData?.gender || ''}>
              <SelectTrigger>
                <SelectValue placeholder="اختر..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">ذكر</SelectItem>
                <SelectItem value="female">أنثى</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Education */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">التعليم</h2>
        
        <div>
          <Label htmlFor="education_level">المؤهل الدراسي</Label>
          <Select name="education_level" defaultValue={initialData?.education_level || ''}>
            <SelectTrigger>
              <SelectValue placeholder="اختر المؤهل..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high-school">ثانوية عامة</SelectItem>
              <SelectItem value="diploma">دبلوم</SelectItem>
              <SelectItem value="bachelor">بكالوريوس</SelectItem>
              <SelectItem value="master">ماجستير</SelectItem>
              <SelectItem value="phd">دكتوراه</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="major">التخصص</Label>
            <Input
              id="major"
              name="major"
              defaultValue={initialData?.major || ''}
              className="text-right"
            />
          </div>
          
          <div>
            <Label htmlFor="graduation_year">سنة التخرج</Label>
            <Input
              id="graduation_year"
              name="graduation_year"
              type="number"
              min="1950"
              max="2030"
              defaultValue={initialData?.graduation_year || ''}
            />
          </div>
        </div>
      </div>
      
      {/* Experience */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">الخبرة</h2>
        
        <div>
          <Label htmlFor="years_of_experience">سنوات الخبرة</Label>
          <Input
            id="years_of_experience"
            name="years_of_experience"
            type="number"
            min="0"
            max="50"
            defaultValue={initialData?.years_of_experience || 0}
          />
        </div>
        
        <div>
          <Label htmlFor="bio">نبذة عنك</Label>
          <Textarea
            id="bio"
            name="bio"
            rows={4}
            placeholder="اكتب نبذة مختصرة عن خبراتك ومهاراتك..."
            defaultValue={initialData?.bio || ''}
            className="text-right"
          />
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'جاري الحفظ...' : 'حفظ واستكمال'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
}
