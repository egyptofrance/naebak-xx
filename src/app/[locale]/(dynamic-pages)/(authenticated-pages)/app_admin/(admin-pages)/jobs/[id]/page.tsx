import { getJobById } from '@/data/jobs/queries';
import { notFound } from 'next/navigation';
import EditJobForm from './EditJobForm';

export const metadata = {
  title: 'تعديل الوظيفة - لوحة التحكم',
  description: 'تعديل بيانات الوظيفة',
};

interface EditJobPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">تعديل الوظيفة</h1>
          <p className="text-muted-foreground mt-2">
            تعديل بيانات الوظيفة: {job.title}
          </p>
        </div>

        <EditJobForm job={job} />
      </div>
    </div>
  );
}
