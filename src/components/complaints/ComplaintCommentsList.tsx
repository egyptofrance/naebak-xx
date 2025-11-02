import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, User } from "lucide-react";

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  performed_by: string;
  user_profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

interface ComplaintCommentsListProps {
  comments: Comment[];
}

export function ComplaintCommentsList({ comments }: ComplaintCommentsListProps) {
  if (!comments || comments.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6 text-center text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>لا توجد تعليقات حتى الآن</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id} className="border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">
                    {comment.user_profiles?.full_name || comment.user_profiles?.email || "مستخدم"}
                  </p>
                  <time className="text-xs text-gray-500" dateTime={comment.created_at}>
                    {new Date(comment.created_at).toLocaleDateString("ar-EG", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {comment.comment}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
