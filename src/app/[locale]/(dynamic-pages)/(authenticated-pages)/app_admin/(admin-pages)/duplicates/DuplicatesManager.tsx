'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  Search, 
  Trash2, 
  AlertTriangle, 
  Users, 
  ExternalLink, 
  Star,
  Trash
} from 'lucide-react';
import {
  findDuplicateDeputies,
  deleteDeputy,
  type DeputyDuplicateGroup,
  type DeputyDuplicate,
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
  
  // Track which deputy is marked as "original" for each group
  const [originalDeputies, setOriginalDeputies] = useState<Record<number, string>>({});
  
  // Delete dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deputyToDelete, setDeputyToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [groupToDeleteAll, setGroupToDeleteAll] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFindDuplicates = async () => {
    setIsLoading(true);
    setOriginalDeputies({});
    try {
      const result = await findDuplicateDeputies(similarityThreshold / 100);
      
      if (result.success && result.duplicateGroups) {
        setDuplicateGroups(result.duplicateGroups);
        setTotalDuplicates(result.totalDuplicates || 0);
        
        // Auto-select first deputy as original for each group
        const initialOriginals: Record<number, string> = {};
        result.duplicateGroups.forEach((group, index) => {
          if (group.deputies.length > 0) {
            initialOriginals[index] = group.deputies[0].id;
          }
        });
        setOriginalDeputies(initialOriginals);
        
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

  const handleSetOriginal = (groupIndex: number, deputyId: string) => {
    setOriginalDeputies(prev => ({
      ...prev,
      [groupIndex]: deputyId
    }));
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeputyToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteAllClick = (groupIndex: number) => {
    setGroupToDeleteAll(groupIndex);
    setDeleteAllDialogOpen(true);
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

  const handleConfirmDeleteAll = async () => {
    if (groupToDeleteAll === null) return;

    const group = duplicateGroups[groupToDeleteAll];
    const originalId = originalDeputies[groupToDeleteAll];
    const duplicatesToDelete = group.deputies.filter(d => d.id !== originalId);

    if (duplicatesToDelete.length === 0) {
      toast.error('لا يوجد مكررات لحذفها');
      setDeleteAllDialogOpen(false);
      return;
    }

    setIsDeleting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const deputy of duplicatesToDelete) {
        try {
          const result = await deleteDeputy(deputy.id);
          if (result.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`تم حذف ${successCount} سجل مكرر بنجاح`);
      }
      if (failCount > 0) {
        toast.error(`فشل حذف ${failCount} سجل`);
      }

      setDeleteAllDialogOpen(false);
      setGroupToDeleteAll(null);
      
      // Refresh the duplicates list
      handleFindDuplicates();
    } catch (error) {
      console.error('Error deleting duplicates:', error);
      toast.error('حدث خطأ أثناء حذف المكررات');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePreview = (deputyId: string) => {
    window.open(`/deputy/${deputyId}`, '_blank');
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
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري البحث...
              </>
            ) : (
              <>
                <Search className="ml-2 h-4 w-4" />
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
            تم العثور على <strong>{duplicateGroups.length}</strong> مجموعة من التكرارات
            تحتوي على <strong>{totalDuplicates}</strong> سجل مكرر
          </AlertDescription>
        </Alert>
      )}

      {/* Duplicate Groups */}
      <div className="space-y-6">
        {duplicateGroups.map((group, groupIndex) => {
          const originalId = originalDeputies[groupIndex];
          const duplicatesCount = group.deputies.filter(d => d.id !== originalId).length;

          return (
            <Card key={groupIndex} className="border-2 border-orange-200">
              <CardHeader className="bg-orange-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    مجموعة تكرار #{groupIndex + 1}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">
                      {group.count} سجل
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      {duplicatesCount} مكرر
                    </Badge>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  <strong>الاسم المطابق:</strong> {group.normalized}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Original Selection */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-3">
                      <Star className="inline h-4 w-4 ml-1" />
                      حدد السجل الأصلي (سيتم الاحتفاظ به):
                    </p>
                    <RadioGroup
                      value={originalId}
                      onValueChange={(value) => handleSetOriginal(groupIndex, value)}
                    >
                      {group.deputies.map((deputy) => {
                        const fullName = deputy.display_name || deputy.full_name || 'غير محدد';
                        const isOriginal = deputy.id === originalId;

                        return (
                          <div
                            key={deputy.id}
                            className={`flex items-center space-x-2 space-x-reverse p-3 rounded-lg border-2 transition-all ${
                              isOriginal
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <RadioGroupItem value={deputy.id} id={`original-${deputy.id}`} />
                            <Label
                              htmlFor={`original-${deputy.id}`}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    {isOriginal && (
                                      <Star className="h-4 w-4 text-blue-600 fill-blue-600" />
                                    )}
                                    <span className="font-semibold">{fullName}</span>
                                    {getStatusBadge(deputy.deputy_status)}
                                    <span className={`text-sm ${getSimilarityColor(deputy.similarity)}`}>
                                      {(deputy.similarity * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                  {deputy.council_name && (
                                    <div className="text-sm text-muted-foreground">
                                      <strong>المجلس:</strong> {deputy.council_name}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handlePreview(deputy.id);
                                    }}
                                  >
                                    <ExternalLink className="h-4 w-4 ml-1" />
                                    معاينة
                                  </Button>

                                  {!isOriginal && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleDeleteClick(deputy.id, fullName);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 ml-1" />
                                      حذف
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>

                  {/* Delete All Duplicates Button */}
                  {duplicatesCount > 0 && (
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteAllClick(groupIndex)}
                        className="gap-2"
                      >
                        <Trash className="h-4 w-4" />
                        حذف جميع المكررات ({duplicatesCount})
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delete Single Deputy Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              تأكيد حذف النائب
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                هل أنت متأكد من حذف <strong>{deputyToDelete?.name}</strong>؟
              </p>
              <p className="text-red-600 font-semibold">
                ⚠️ سيتم حذف جميع البيانات المرتبطة بهذا النائب بشكل نهائي ولا يمكن
                التراجع عن هذا الإجراء.
              </p>
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
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف نهائي'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Duplicates Dialog */}
      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              تأكيد حذف جميع المكررات
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {groupToDeleteAll !== null && (
                <>
                  <p>
                    هل أنت متأكد من حذف جميع السجلات المكررة في هذه المجموعة؟
                  </p>
                  <p>
                    سيتم حذف{' '}
                    <strong>
                      {duplicateGroups[groupToDeleteAll]?.deputies.filter(
                        d => d.id !== originalDeputies[groupToDeleteAll]
                      ).length}
                    </strong>{' '}
                    سجل مكرر
                  </p>
                  <p className="text-blue-600 font-semibold">
                    ✓ سيتم الاحتفاظ بالسجل الأصلي المحدد
                  </p>
                  <p className="text-red-600 font-semibold">
                    ⚠️ لا يمكن التراجع عن هذا الإجراء
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteAll}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف جميع المكررات'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

