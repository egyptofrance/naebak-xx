"use client";

interface ComplaintActionsHistoryProps {
  actions: any[];
}

export function ComplaintActionsHistory({ actions }: ComplaintActionsHistoryProps) {
  const actionTypeLabels: Record<string, string> = {
    status_change: "تغيير الحالة",
    priority_change: "تغيير الأولوية",
    assignment: "إسناد",
    comment: "تعليق",
    rejection: "رفض",
    hold: "تعليق",
    resolution: "حل",
  };

  if (actions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        لا توجد إجراءات مسجلة بعد
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {actions.map((action: any) => (
        <div key={action.id} className="border-l-2 border-primary pl-4 pb-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-sm font-semibold">
                {actionTypeLabels[action.action_type] || action.action_type}
              </span>
              <p className="text-xs text-muted-foreground">
                {new Date(action.created_at).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {action.old_value && action.new_value && (
            <p className="text-sm text-muted-foreground mb-1">
              من: <span className="font-medium">{action.old_value}</span> →{" "}
              إلى: <span className="font-medium">{action.new_value}</span>
            </p>
          )}

          {action.comment && (
            <p className="text-sm bg-muted/50 p-2 rounded mt-2">
              {action.comment}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            بواسطة: {action.performed_by.slice(0, 8)}
          </p>
        </div>
      ))}
    </div>
  );
}

