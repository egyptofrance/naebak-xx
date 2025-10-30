import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import JobForm from './JobForm';

export const metadata = {
  title: 'إضافة وظيفة جديدة - لوحة التحكم',
  description: 'إضافة وظيفة جديدة إلى منصة نائبك',
};

export default function NewJobPage() {
  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="ghost" asChild>
          <Link href="/app_admin/jobs">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة إلى قائمة الوظائف
          </Link>
        </Button>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">إضافة وظيفة جديدة</h1>
          <p className="text-muted-foreground mt-2">
            أضف وظيفة جديدة إلى منصة التوظيف
          </p>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>بيانات الوظيفة</CardTitle>
            <CardDescription>
              يرجى ملء جميع الحقول المطلوبة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
