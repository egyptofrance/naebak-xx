'use client';

import { useState } from 'react';
import { submitContactMessage, ContactMessageData } from '@/app/actions/contact/submitContactMessage';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ContactFormProps {
  messageType?: 'general' | 'sponsorship' | 'support' | 'suggestion';
  defaultSubject?: string;
}

export default function ContactForm({ messageType = 'general', defaultSubject = '' }: ContactFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: defaultSubject,
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data: ContactMessageData = {
      ...formData,
      message_type: messageType
    };

    const result = await submitContactMessage(data);

    if (result.success) {
      toast({
        title: 'تم الإرسال بنجاح',
        description: result.message,
        variant: 'default'
      });
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: defaultSubject,
        message: ''
      });
    } else {
      toast({
        title: 'خطأ',
        description: result.error,
        variant: 'destructive'
      });
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          الاسم الكامل
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="أدخل اسمك الكامل"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          البريد الإلكتروني
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="example@email.com"
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-2">
          رقم الهاتف
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="01xxxxxxxxx"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-2">
          الموضوع
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="موضوع رسالتك"
          required
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          الرسالة
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="اكتب رسالتك هنا..."
          required
        ></textarea>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
      </Button>
    </form>
  );
}

