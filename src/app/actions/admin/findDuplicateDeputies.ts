'use server';

import { createSupabaseUserServerActionClient } from '@/supabase-clients/user/createSupabaseUserServerActionClient';
import { findDuplicates, type DuplicateGroup } from '@/utils/arabicNormalizer';
import { getIsAppAdmin } from '@/data/user/user';

export interface DeputyDuplicate {
  id: string;
  display_name: string;
  full_name: string;
  deputy_status: string;
  council_name: string | null;
  governorate_name: string | null;
  district_name: string | null;
  similarity: number;
}

export interface DeputyDuplicateGroup {
  normalized: string;
  count: number;
  deputies: DeputyDuplicate[];
}

/**
 * البحث عن التكرارات في أسماء النواب
 * Finds duplicate deputies based on name similarity
 */
export async function findDuplicateDeputies(
  similarityThreshold: number = 0.85
): Promise<{
  success: boolean;
  duplicateGroups?: DeputyDuplicateGroup[];
  totalDuplicates?: number;
  error?: string;
}> {
  try {
    // التحقق من صلاحيات المستخدم
    const isAdmin = await getIsAppAdmin();
    if (!isAdmin) {
      return { success: false, error: 'غير مصرح - يتطلب صلاحيات admin' };
    }

    const supabase = await createSupabaseUserServerActionClient();

    // جلب جميع النواب
    const { data: deputies, error: fetchError } = await supabase
      .from('deputy_profiles')
      .select('id, user_id, display_name, deputy_status, council_id, electoral_district_id')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching deputies:', fetchError);
      return { success: false, error: 'فشل في جلب بيانات النواب' };
    }

    if (!deputies || deputies.length === 0) {
      return {
        success: true,
        duplicateGroups: [],
        totalDuplicates: 0,
      };
    }

    // جلب بيانات المستخدمين والمجالس والدوائر
    const deputiesWithNames = await Promise.all(
      deputies.map(async (deputy: any) => {
        // جلب بيانات المستخدم
        const { data: user } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', deputy.user_id)
          .single();

        // جلب بيانات المجلس
        const { data: council } = deputy.council_id
          ? await supabase
              .from('councils')
              .select('name_ar')
              .eq('id', deputy.council_id)
              .single()
          : { data: null };

        // جلب بيانات الدائرة الانتخابية
        let governorateName: string | null = null;
        let districtName: string | null = null;
        
        if (deputy.electoral_district_id) {
          const { data: district } = await supabase
            .from('electoral_districts')
            .select('name')
            .eq('id', deputy.electoral_district_id)
            .single();
          
          if (district) {
            districtName = district.name;
            // استخراج اسم المحافظة من اسم الدائرة (إذا كان موجوداً)
            // مثال: "الدائرة الأولى - القاهرة"
            const parts = district.name.split('-');
            if (parts.length > 1) {
              governorateName = parts[parts.length - 1].trim();
            }
          }
        }

        // استخدام الاسم الرباعي الكامل للمقارنة
        const fullName = user?.full_name || deputy.display_name || 'غير محدد';

        return {
          id: deputy.id,
          text: fullName, // الاسم الرباعي للمقارنة
          display_name: deputy.display_name,
          full_name: user?.full_name || '',
          deputy_status: deputy.deputy_status,
          council_name: council?.name_ar || null,
          governorate_name: governorateName,
          district_name: districtName,
        };
      })
    );

    // البحث عن التكرارات مع مراعاة المحافظة والدائرة
    const duplicateGroups = findDuplicates(
      deputiesWithNames.map((d: any) => ({
        id: d.id,
        text: d.text,
        governorate: d.governorate_name,
        district: d.district_name,
      })),
      similarityThreshold
    );

    // تحويل النتائج للصيغة المطلوبة
    const formattedGroups: DeputyDuplicateGroup[] = duplicateGroups.map(
      (group) => {
        const deputies = group.items.map((item) => {
          const deputy = deputiesWithNames.find((d: any) => d.id === item.id)!;
          return {
            id: item.id,
            display_name: deputy.display_name,
            full_name: deputy.full_name,
            deputy_status: deputy.deputy_status,
            council_name: deputy.council_name,
            governorate_name: deputy.governorate_name,
            district_name: deputy.district_name,
            similarity: item.similarity,
          };
        });

        return {
          normalized: group.normalized,
          count: deputies.length,
          deputies,
        };
      }
    );

    const totalDuplicates = formattedGroups.reduce(
      (sum, group) => sum + group.count,
      0
    );

    return {
      success: true,
      duplicateGroups: formattedGroups,
      totalDuplicates,
    };
  } catch (error) {
    console.error('Error in findDuplicateDeputies:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء البحث عن التكرارات',
    };
  }
}

/**
 * حذف نائب مكرر
 * Deletes a duplicate deputy
 */
export async function deleteDeputy(
  deputyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // التحقق من صلاحيات المستخدم
    const isAdmin = await getIsAppAdmin();
    if (!isAdmin) {
      return { success: false, error: 'غير مصرح - يتطلب صلاحيات admin' };
    }

    const supabase = await createSupabaseUserServerActionClient();

    // جلب user_id من deputy_profile
    const { data: deputy, error: fetchError } = await supabase
      .from('deputy_profiles')
      .select('user_id')
      .eq('id', deputyId)
      .single();

    if (fetchError || !deputy) {
      return { success: false, error: 'النائب غير موجود' };
    }

    // حذف المستخدم (سيتم حذف deputy_profile تلقائياً بسبب ON DELETE CASCADE)
    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', deputy.user_id);

    if (deleteError) {
      console.error('Error deleting deputy:', deleteError);
      return { success: false, error: 'فشل في حذف النائب' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteDeputy:', error);
    return { success: false, error: 'حدث خطأ أثناء حذف النائب' };
  }
}

