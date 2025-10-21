export interface Council {
  id: string;
  name_ar: string;
  name_en: string;
  code: string;
  description_ar: string | null;
  description_en: string | null;
  is_active: boolean | null;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

