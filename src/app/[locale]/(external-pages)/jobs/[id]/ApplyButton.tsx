'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { submitJobApplication } from '@/data/employment/actions';

interface Props {
  jobId: string;
  hasProfile: boolean;
  isCompanyAd: boolean;
  companyPhone?: string | null;
}

export default function ApplyButton({ jobId, hasProfile, isCompanyAd, companyPhone }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleApply = async () => {
    // If no profile, redirect to complete profile page with jobId
    if (!hasProfile) {
      router.push(`/complete-employment-profile?jobId=${jobId}`);
      return;
    }
    
    // If has profile, redirect to complete profile page to submit application
    router.push(`/complete-employment-profile?jobId=${jobId}`);
  };
  
  // Company ad - show call button
  if (isCompanyAd && companyPhone) {
    return (
      <Button
        size="lg"
        className="w-full"
        asChild
      >
        <a href={`tel:${companyPhone}`}>
          اتصل الآن
        </a>
      </Button>
    );
  }
  
  // Success state
  if (success) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-center">
          ✅ تم إرسال طلبك بنجاح!
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push('/my-applications')}
        >
          عرض طلباتي
        </Button>
      </div>
    );
  }
  
  // Normal apply button
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <Button
        size="lg"
        className="w-full"
        onClick={handleApply}
        disabled={loading}
      >
        {loading ? 'جاري الإرسال...' : hasProfile ? 'قدم طلبك الآن' : 'أكمل بياناتك للتقديم'}
      </Button>
      
      {!hasProfile && (
        <p className="text-sm text-muted-foreground text-center">
          يجب إكمال بياناتك المهنية أولاً للتقديم على الوظائف
        </p>
      )}
    </div>
  );
}
