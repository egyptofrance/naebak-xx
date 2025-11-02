import { redirect } from 'next/navigation';
import { getUserEmploymentProfile } from '@/data/employment/queries';
import EmploymentProfileForm from '../complete-employment-profile/EmploymentProfileForm';

export const metadata = {
  title: 'سيرتي الذاتية',
  description: 'عرض وتعديل بياناتك المهنية',
};

export default async function MyCVPage() {
  const profile = await getUserEmploymentProfile();
  
  if (!profile) {
    redirect('/complete-employment-profile');
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">سيرتي الذاتية</h1>
        <p className="text-muted-foreground">
          عرض وتعديل بياناتك المهنية والشخصية
        </p>
      </div>
      
      <EmploymentProfileForm initialData={profile} />
    </div>
  );
}
