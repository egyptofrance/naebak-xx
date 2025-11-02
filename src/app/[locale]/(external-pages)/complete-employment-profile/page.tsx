import { redirect } from 'next/navigation';
import { getUserProfile } from '@/data/user/queries';
import { hasEmploymentProfile } from '@/data/employment/queries';
import EmploymentProfileForm from './EmploymentProfileForm';

export default async function CompleteEmploymentProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string; returnTo?: string }>;
}) {
  const params = await searchParams;
  const user = await getUserProfile();

  if (!user) {
    redirect('/sign-in');
  }

  const hasProfile = await hasEmploymentProfile();

  if (hasProfile) {
    // If already has profile, redirect to my-cv or returnTo
    if (params.returnTo) {
      redirect(params.returnTo);
    } else if (params.jobId) {
      redirect(`/jobs/${params.jobId}`);
    } else {
      redirect('/my-cv');
    }
  }

  return (
    <div className="min-h-screen bg-background py-12" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">أكمل ملفك الوظيفي</h1>
          <p className="text-muted-foreground">
            يرجى إكمال بياناتك الوظيفية للتقديم على الوظائف
          </p>
        </div>

        <EmploymentProfileForm jobId={params.jobId} returnTo={params.returnTo} />
      </div>
    </div>
  );
}
