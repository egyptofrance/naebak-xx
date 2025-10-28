import { Suspense } from 'react';
import DuplicatesManager from './DuplicatesManager';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'إدارة التكرارات - لوحة التحكم',
  description: 'اكتشاف وإدارة التكرارات في أسماء النواب والمرشحين',
};

export default function DuplicatesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة التكرارات</h1>
        <p className="text-muted-foreground">
          اكتشاف وإدارة التكرارات في أسماء النواب والمرشحين
        </p>
      </div>

      <Suspense fallback={<DuplicatesLoadingSkeleton />}>
        <DuplicatesManager />
      </Suspense>
    </div>
  );
}

function DuplicatesLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

