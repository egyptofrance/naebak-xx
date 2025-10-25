import { Metadata } from 'next';
import MessagesList from './MessagesList';

export const metadata: Metadata = {
  title: 'الرسائل - لوحة التحكم',
  description: 'إدارة رسائل التواصل',
};

export default function MessagesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">الرسائل</h1>
        <p className="text-muted-foreground mt-2">
          إدارة رسائل التواصل الواردة من نموذج اتصل بنا
        </p>
      </div>
      
      <MessagesList />
    </div>
  );
}

