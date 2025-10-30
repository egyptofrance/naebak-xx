'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Loader2 } from 'lucide-react';
import { updateJobApplication } from '@/data/jobs/actions';
import { toast } from 'sonner';
import { ApplicationStatus } from '@/types/jobs';

const APPLICATION_STATUSES = [
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'reviewing', label: 'قيد المراجعة' },
  { value: 'shortlisted', label: 'مرشح' },
  { value: 'accepted', label: 'مقبول' },
  { value: 'rejected', label: 'مرفوض' },
];

interface ApplicationStatusUpdateProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
}

export default function ApplicationStatusUpdate({
  applicationId,
  currentStatus,
}: ApplicationStatusUpdateProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);
  const [adminNotes, setAdminNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await updateJobApplication(applicationId, {
      status,
      admin_notes: adminNotes || undefined,
    });

    if (result.success) {
      toast.success('تم تحديث حالة الطلب بنجاح');
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || 'فشل تحديث حالة الطلب');
    }

    setIsSubmitting(false);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="ml-2 h-4 w-4" />
          تحديث الحالة
          <span className="mr-2">{getStatusBadge(currentStatus)}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>تحديث حالة الطلب</DialogTitle>
            <DialogDescription>
              قم بتغيير حالة الطلب وإضافة ملاحظات إذا لزم الأمر
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">الحالة الجديدة</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as ApplicationStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin_notes">ملاحظات الإدارة (اختياري)</Label>
              <Textarea
                id="admin_notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="أضف أي ملاحظات هنا..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
