'use client';

import { useEffect, useState } from 'react';
import { getContactMessages, updateContactMessageStatus, deleteContactMessage } from '@/app/actions/contact/getContactMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, Calendar, Trash2, Eye } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  message_type: string;
  status: string;
  created_at: string;
  admin_notes: string | null;
}

export default function MessagesList() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const loadMessages = async () => {
    setLoading(true);
    const filters: any = {};
    if (filterStatus !== 'all') filters.status = filterStatus;
    if (filterType !== 'all') filters.message_type = filterType;

    const result = await getContactMessages(filters);
    if (result.success && result.data) {
      setMessages(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, [filterStatus, filterType]);

  const handleStatusChange = async (messageId: string, newStatus: string) => {
    const result = await updateContactMessageStatus(messageId, newStatus);
    if (result.success) {
      toast({
        title: 'تم التحديث',
        description: result.message,
      });
      loadMessages();
    } else {
      toast({
        title: 'خطأ',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedMessage) return;

    const result = await updateContactMessageStatus(
      selectedMessage.id,
      selectedMessage.status,
      adminNotes
    );

    if (result.success) {
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ الملاحظات بنجاح',
      });
      setSelectedMessage(null);
      setAdminNotes('');
      loadMessages();
    } else {
      toast({
        title: 'خطأ',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    const result = await deleteContactMessage(messageId);
    if (result.success) {
      toast({
        title: 'تم الحذف',
        description: result.message,
      });
      loadMessages();
    } else {
      toast({
        title: 'خطأ',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      new: { label: 'جديدة', variant: 'default' },
      in_review: { label: 'قيد المراجعة', variant: 'secondary' },
      replied: { label: 'تم الرد', variant: 'outline' },
      archived: { label: 'مؤرشفة', variant: 'outline' },
    };
    const { label, variant } = statusMap[status] || { label: status, variant: 'default' };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; color: string }> = {
      general: { label: 'استفسار عام', color: 'bg-blue-100 text-blue-800' },
      sponsorship: { label: 'طلب رعاية', color: 'bg-green-100 text-green-800' },
      support: { label: 'دعم فني', color: 'bg-orange-100 text-orange-800' },
      suggestion: { label: 'اقتراح', color: 'bg-purple-100 text-purple-800' },
    };
    const { label, color } = typeMap[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={color}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>تصفية الرسائل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">الحالة</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="new">جديدة</SelectItem>
                  <SelectItem value="in_review">قيد المراجعة</SelectItem>
                  <SelectItem value="replied">تم الرد</SelectItem>
                  <SelectItem value="archived">مؤرشفة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">نوع الرسالة</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="general">استفسار عام</SelectItem>
                  <SelectItem value="sponsorship">طلب رعاية</SelectItem>
                  <SelectItem value="support">دعم فني</SelectItem>
                  <SelectItem value="suggestion">اقتراح</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      {loading ? (
        <div className="text-center py-8">جاري التحميل...</div>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            لا توجد رسائل
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{message.subject}</CardTitle>
                    <div className="flex gap-2">
                      {getStatusBadge(message.status)}
                      {getTypeBadge(message.message_type)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMessage(message);
                        setAdminNotes(message.admin_notes || '');
                      }}
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      عرض
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(message.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{message.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${message.email}`} className="text-primary hover:underline">
                      {message.email}
                    </a>
                  </div>
                  {message.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${message.phone}`} className="text-primary hover:underline">
                        {message.phone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(message.created_at).toLocaleString('ar-EG')}
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                </div>

                <div className="flex gap-2">
                  <Select
                    value={message.status}
                    onValueChange={(value) => handleStatusChange(message.id, value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">جديدة</SelectItem>
                      <SelectItem value="in_review">قيد المراجعة</SelectItem>
                      <SelectItem value="replied">تم الرد</SelectItem>
                      <SelectItem value="archived">مؤرشفة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Message Details Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              تفاصيل الرسالة وإضافة ملاحظات
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">الاسم:</span> {selectedMessage.name}
                </div>
                <div>
                  <span className="font-medium">البريد:</span> {selectedMessage.email}
                </div>
                {selectedMessage.phone && (
                  <div>
                    <span className="font-medium">الهاتف:</span> {selectedMessage.phone}
                  </div>
                )}
                <div>
                  <span className="font-medium">التاريخ:</span>{' '}
                  {new Date(selectedMessage.created_at).toLocaleString('ar-EG')}
                </div>
              </div>

              <div>
                <span className="font-medium text-sm">الرسالة:</span>
                <div className="bg-muted/50 p-4 rounded-lg mt-2">
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">ملاحظات الإدارة</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="أضف ملاحظاتك هنا..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                  إلغاء
                </Button>
                <Button onClick={handleSaveNotes}>حفظ الملاحظات</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

