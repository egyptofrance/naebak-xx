'use client';

import { JobWithStatistics } from '@/types/jobs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { deleteJob } from '@/data/jobs/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface JobsTableProps {
  jobs: JobWithStatistics[];
}

export default function JobsTable({ jobs }: JobsTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (jobId: string) => {
    setJobToDelete(jobId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    setIsDeleting(true);
    const result = await deleteJob(jobToDelete);

    if (result.success) {
      toast.success('تم حذف الوظيفة بنجاح');
      router.refresh();
    } else {
      toast.error(result.error || 'فشل حذف الوظيفة');
    }

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setJobToDelete(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">نشط</Badge>;
      case 'closed':
        return <Badge variant="secondary">مغلق</Badge>;
      case 'draft':
        return <Badge variant="outline">مسودة</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">لا توجد وظائف متاحة</p>
        <Button asChild className="mt-4">
          <Link href="/app_admin/jobs/new">إضافة وظيفة جديدة</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>الفئة</TableHead>
              <TableHead>الموقع</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>المشاهدات</TableHead>
              <TableHead>الطلبات</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.category?.name_ar || 'غير محدد'}</TableCell>
                <TableCell>{job.governorate?.name_ar || 'غير محدد'}</TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell>{job.statistics?.views_count || 0}</TableCell>
                <TableCell>{job.statistics?.applications_count || 0}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/jobs/${job.id}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/app_admin/jobs/${job.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(job.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الوظيفة نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
