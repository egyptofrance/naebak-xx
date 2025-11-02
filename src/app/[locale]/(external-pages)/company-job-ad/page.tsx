import { Metadata } from 'next';
import CompanyJobAdForm from './CompanyJobAdForm';

export const metadata: Metadata = {
  title: 'إعلان وظيفة - نيابك',
  description: 'أضف إعلان وظيفة لشركتك',
};

export default function CompanyJobAdPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">إعلان وظيفة</h1>
          <p className="text-muted-foreground">
            أضف إعلان وظيفة لشركتك وسيتمكن المتقدمون من التواصل معك مباشرة
          </p>
        </div>
        
        <CompanyJobAdForm />
      </div>
    </div>
  );
}
