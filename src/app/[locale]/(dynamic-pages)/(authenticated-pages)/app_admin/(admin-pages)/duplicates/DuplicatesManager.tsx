'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Loader2, Search, Trash2, AlertTriangle, CheckCircle2, Users } from 'lucide-react';
import {
  findDuplicateDeputies,
  deleteDeputy,
  type DeputyDuplicateGroup,
} from '@/app/actions/admin/findDuplicateDeputies';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function DuplicatesManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DeputyDuplicateGroup[]>([]);
  const [totalDuplicates, setTotalDuplicates] = useState(0);
  const [similarityThreshold, setSimilarityThreshold] = useState(85);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deputyToDelete, setDeputyToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFindDuplicates = async () => {
    setIsLoading(true);
    try {
      const result = await findDuplicateDeputies(similarityThreshold / 100);
      
      if (result.success && result.duplicateGroups) {
        setDuplicateGroups(result.duplicateGroups);
        setTotalDuplicates(result.totalDuplicates || 0);
        
        if (result.duplicateGroups.length === 0) {
          toast.success('لم يتم العثور على تكرارات');
        } else {
          toast.success(`تم العثور على ${result.duplicateGroups.length} مجموعة من التكرارات`);
        }
      } else {
        toast.error(result.error || 'فشل في البحث عن التكرارات');
      }
    } catch (error) {
      console.error('Error finding duplicates:', error);
      toast.error('حدث خطأ أثناء البحث عن التكرارات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeputyToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deputyToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteDeputy(deputyToDelete.id);
      
      if (result.success) {
        toast.success('تم حذف النائب بنجاح');
        setDeleteDialogOpen(false);
        setDeputyToDelete(null);
        
        // Refresh the duplicates list
        handleFindDuplicates();
      } else {
        toast.error(result.error || 'فشل في حذف النائب');
      }
    } catch (error) {
      console.error('Error deleting deputy:', error);
      toast.error('حدث خطأ أثناء حذف النائب');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      current: { label: 'نائب حالي', variant: 'default' },
      candidate: { label: 'مرشح', variant: 'secondary' },
      former: { label: 'نائب سابق', variant: 'destructive' },
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'default' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.95) return 'text-red-600 font-bold';
    if (similarity >= 0.85) return 'text-orange-600 font-semibold';
    return 'text-yellow-600';
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث عن التكرارات
          </CardTitle>
          <CardDescription>
            اضبط نسبة التشابه المطلوبة واضغط على "بحث" للعثور على التكرارات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                نسبة التشابه المطلوبة: {similarityThreshold}%
              </label>
              <span className="text-xs text-muted-foreground">
                (كلما زادت النسبة، كلما كانت النتائج أكثر دقة)
              </span>
            </div>
            <Slider
              value={[similarityThreshold]}
              onValueChange={(value) => setSimilarityThreshold(value[0])}
              min={50}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50% - تشابه منخفض</span>
              <span>75% - تشابه متوسط</span>
              <span>100% - تطابق تام</span>
            </div>
          </div>

          <Button
            onClick={handleFindDuplicates}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري البحث...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                بحث عن التكرارات
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {duplicateGroups.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                تم العثور على <strong>{duplicateGroups.length}</strong> مجموعة من التكرارات
                تحتوي على <strong>{totalDuplicates}</strong> سجل مكرر
              </span>
              <Badge variant="destructive" className="mr-2">
                {totalDuplicates} تكرار
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* No Duplicates Message */}
      {!isLoading && duplicateGroups.length === 0 && totalDuplicates === 0 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            لم يتم العثور على تكرارات. جميع الأسماء فريدة!
          </AlertDescription>
        </Alert>
      )}

      {/* Duplicate Groups */}
      <div className="space-y-4">
        {duplicateGroups.map((group, groupIndex) => (
          <Card key={groupIndex} className="border-2 border-orange-200">
            <CardHeader className="bg-orange-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  مجموعة تكرار #{groupIndex + 1}
                </CardTitle>
                <Badge variant="destructive">
                  {group.count} سجل مكرر
                </Badge>
              </div>
              <CardDescription className="mt-2">
                <strong>الاسم المطابق:</strong> {group.normalized}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {group.deputies.map((deputy, deputyIndex) => {
                  const fullName = deputy.display_name || deputy.full_name || 'غير محدد';

                  return (
                    <div
                      key={deputy.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-lg">{fullName}</span>
                          {getStatusBadge(deputy.deputy_status)}
                          <span className={`text-sm ${getSimilarityColor(deputy.similarity)}`}>
                            تشابه: {(deputy.similarity * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          {deputy.council_name && (
                            <div>
                              <strong>المجلس:</strong> {deputy.council_name}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(deputy.id, fullName)}
                        className="mr-4"
                      >
                        <Trash2 className="h-4 w-4 ml-2" />
                        حذف
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف النائب <strong>{deputyToDelete?.name}</strong>؟
              <br />
              <br />
              <span className="text-red-600 font-semibold">
                تحذير: سيتم حذف جميع البيانات المرتبطة بهذا النائب بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  حذف نهائي
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

