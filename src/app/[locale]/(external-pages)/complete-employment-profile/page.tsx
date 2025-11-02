import { redirect } from 'next/navigation';
import { getUserEmploymentProfile } from '@/data/employment/queries';
import EmploymentProfileForm from './EmploymentProfileForm';

export const metadata = {
  title: 'إكمال بيانات التوظيف',
  description: 'أكمل بياناتك للتقديم على الوظائف',
};

export default async function CompleteEmploymentProfilePage({
  searchParams,
}: {
  searchParams: { returnTo?: string };
}) {
  // Check if user already has profile
  const profile = await getUserEmploymentProfile();
  
  if (profile && profile.is_complete) {
    // Redirect to return URL or jobs page
    const returnTo = searchParams.returnTo || '/jobs';
    redirect(returnTo);
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إكمال بيانات التوظيف</h1>
        <p className="text-muted-foreground">
          لتتمكن من التقديم على الوظائف، يرجى إكمال بياناتك الشخصية والمهنية
        </p>
      </div>
      
      <EmploymentProfileForm 
        initialData={profile} 
        returnTo={searchParams.returnTo}
      />
    </div>
  );
}
