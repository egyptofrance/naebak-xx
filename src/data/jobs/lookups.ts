/**
 * دوال جلب البيانات المرجعية للوظائف (Lookups)
 * Job Lookups Queries
 */

import { createSupabaseUserServerComponentClient } from '@/supabase-clients/user/createSupabaseUserServerComponentClient';

/**
 * نوع تصنيف الوظيفة
 */
export interface JobCategory {
  id: string;
  name_ar: string;
  name_en: string | null;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * نوع المحافظة
 */
export interface Governorate {
  id: string;
  name_ar: string;
  name_en: string | null;
  code: string | null;
  created_at: string;
  is_visible: boolean;
}

/**
 * الحصول على جميع تصنيفات الوظائف النشطة
 */
export async function getActiveJobCategories(): Promise<JobCategory[]> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    const { data, error } = await (supabase as any)
      .from('job_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[getActiveJobCategories] Error:', error);
      return [];
    }

    return (data || []) as JobCategory[];
  } catch (error) {
    console.error('[getActiveJobCategories] Exception:', error);
    return [];
  }
}

/**
 * الحصول على جميع تصنيفات الوظائف (للأدمن)
 */
export async function getAllJobCategories(): Promise<JobCategory[]> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    const { data, error } = await (supabase as any)
      .from('job_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[getAllJobCategories] Error:', error);
      return [];
    }

    return (data || []) as JobCategory[];
  } catch (error) {
    console.error('[getAllJobCategories] Exception:', error);
    return [];
  }
}

/**
 * الحصول على تصنيف وظيفة واحد بالـ ID
 */
export async function getJobCategoryById(id: string): Promise<JobCategory | null> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    const { data, error } = await (supabase as any)
      .from('job_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[getJobCategoryById] Error:', error);
      return null;
    }

    return data as JobCategory;
  } catch (error) {
    console.error('[getJobCategoryById] Exception:', error);
    return null;
  }
}

/**
 * الحصول على تصنيف وظيفة واحد بالـ slug
 */
export async function getJobCategoryBySlug(slug: string): Promise<JobCategory | null> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    const { data, error } = await (supabase as any)
      .from('job_categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('[getJobCategoryBySlug] Error:', error);
      return null;
    }

    return data as JobCategory;
  } catch (error) {
    console.error('[getJobCategoryBySlug] Exception:', error);
    return null;
  }
}

/**
 * الحصول على جميع المحافظات
 */
export async function getAllGovernorates(): Promise<Governorate[]> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    const { data, error } = await supabase
      .from('governorates')
      .select('*')
      .order('name_ar', { ascending: true });

    if (error) {
      console.error('[getAllGovernorates] Error:', error);
      return [];
    }

    return (data || []) as Governorate[];
  } catch (error) {
    console.error('[getAllGovernorates] Exception:', error);
    return [];
  }
}

/**
 * الحصول على محافظة واحدة بالـ ID
 */
export async function getGovernorateById(id: string): Promise<Governorate | null> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    const { data, error } = await supabase
      .from('governorates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[getGovernorateById] Error:', error);
      return null;
    }

    return data as Governorate;
  } catch (error) {
    console.error('[getGovernorateById] Exception:', error);
    return null;
  }
}
