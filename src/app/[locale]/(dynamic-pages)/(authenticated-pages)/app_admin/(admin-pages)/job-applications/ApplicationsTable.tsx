'use client';

import { JobApplicationWithJob } from '@/types/jobs';
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
import { Eye, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { deleteJobApplication } from '@/data/jobs/actions';
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

interface ApplicationsTableProps {
  applications: JobApplicationWithJob[];
}

export default function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (applicationId: string) => {
    setApplicationToDelete(applicationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!applicationToDelete) return;

    setIsDeleting(true);
    const result = await deleteJobApplication(applicationToDelete);

    if (result.success) {
      toast.success('تم حذف الطلب بنجاح');
      router.refresh();
    } else {
      toast.error(result.error || 'فشل حذف الطلب');
    }

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setApplicationToDelete(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">قيد الانتظار</Badge>;
      case 'reviewing':
        return <Badge variant="secondary">قيد المراجعة</Badge>;
      case 'shortlisted':
        return <Badge className="bg-blue-500">مرشح</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500">مقبول</Badge>;
      case 'rejected':
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">لا توجد طلبات متاحة</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>الوظيفة</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ التقديم</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">{application.full_name}</TableCell>
                <TableCell>
                  {application.job ? (
                    <Link
                      href={`/jobs/${application.job_id}`}
                      className="text-primary hover:underline"
                      target="_blank"
                    >
                      {application.job.title}
                    </Link>
                  ) : (
                    application.job_id
                  )}
                </TableCell>
                <TableCell dir="ltr" className="text-right">{application.email}</TableCell>
                <TableCell dir="ltr" className="text-right">{application.phone}</TableCell>
                <TableCell>{getStatusBadge(application.status)}</TableCell>
                <TableCell>{formatDate(application.created_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {application.cv_url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={application.cv_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/app_admin/job-applications/${application.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(application.id)}
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
              سيتم حذف الطلب نهائياً ولا يمكن التراجع عن هذا الإجراء.
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
