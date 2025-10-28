'use server';

import { createClient } from '@/utils/supabase/server';
import { findDuplicates, type DuplicateGroup } from '@/utils/arabicNormalizer';

export interface DeputyDuplicate {
  id: string;
  display_name: string;
  first_name: string;
  father_name: string;
  grandfather_name: string;
  family_name: string;
  deputy_status: string;
  council_name: string | null;
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
    const supabase = await createClient();

    // التحقق من صلاحيات المستخدم
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'غير مصرح' };
    }

    // التحقق من أن المستخدم admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'application_admin') {
      return { success: false, error: 'غير مصرح - يتطلب صلاحيات admin' };
    }

    // جلب جميع النواب مع معلوماتهم
    const { data: deputies, error: fetchError } = await supabase
      .from('deputy_profiles')
      .select(
        `
        id,
        display_name,
        deputy_status,
        user_profiles!inner (
          first_name,
          father_name,
          grandfather_name,
          family_name
        ),
        councils (
          name
        )
      `
      )
      .order('user_profiles(first_name)', { ascending: true });

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

    // تحويل البيانات للبحث عن التكرارات
    const deputiesWithNames = deputies.map((deputy: any) => {
      const userProfile = deputy.user_profiles;
      const fullName = deputy.display_name || 
        `${userProfile.first_name || ''} ${userProfile.father_name || ''} ${userProfile.grandfather_name || ''} ${userProfile.family_name || ''}`.trim();

      return {
        id: deputy.id,
        text: fullName,
        display_name: deputy.display_name,
        first_name: userProfile.first_name,
        father_name: userProfile.father_name,
        grandfather_name: userProfile.grandfather_name,
        family_name: userProfile.family_name,
        deputy_status: deputy.deputy_status,
        council_name: deputy.councils?.name || null,
      };
    });

    // البحث عن التكرارات
    const duplicateGroups = findDuplicates(
      deputiesWithNames.map((d: any) => ({ id: d.id, text: d.text })),
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
            first_name: deputy.first_name,
            father_name: deputy.father_name,
            grandfather_name: deputy.grandfather_name,
            family_name: deputy.family_name,
            deputy_status: deputy.deputy_status,
            council_name: deputy.council_name,
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
    const supabase = await createClient();

    // التحقق من صلاحيات المستخدم
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'غير مصرح' };
    }

    // التحقق من أن المستخدم admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'application_admin') {
      return { success: false, error: 'غير مصرح - يتطلب صلاحيات admin' };
    }

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

