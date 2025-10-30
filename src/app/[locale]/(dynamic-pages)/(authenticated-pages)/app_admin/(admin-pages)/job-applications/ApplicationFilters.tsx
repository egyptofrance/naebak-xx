'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const APPLICATION_STATUSES = [
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'reviewing', label: 'قيد المراجعة' },
  { value: 'shortlisted', label: 'مرشح' },
  { value: 'accepted', label: 'مقبول' },
  { value: 'rejected', label: 'مرفوض' },
];

export default function ApplicationFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get('status') || '';

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    router.push(`?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push('/app_admin/job-applications');
  };

  const hasFilters = currentStatus;

  return (
    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
      <div className="flex-1 flex items-center gap-4">
        <Select value={currentStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">جميع الحالات</SelectItem>
            {APPLICATION_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          <X className="ml-2 h-4 w-4" />
          مسح الفلاتر
        </Button>
      )}
    </div>
  );
}
