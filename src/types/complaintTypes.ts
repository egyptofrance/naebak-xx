import { Database } from "@/lib/database.types";

// Extract enum types from database
export type ComplaintStatus = Database["public"]["Enums"]["complaint_status"];
export type ComplaintPriority = Database["public"]["Enums"]["complaint_priority"];
export type ComplaintCategory = Database["public"]["Enums"]["complaint_category"];
export type ComplaintActionType = Database["public"]["Enums"]["complaint_action_type"];

// Extract table types from database
export type Complaint = Database["public"]["Tables"]["complaints"]["Row"];
export type ComplaintInsert = Database["public"]["Tables"]["complaints"]["Insert"];
export type ComplaintUpdate = Database["public"]["Tables"]["complaints"]["Update"];

// Additional types for UI and forms
export type ComplaintWithDetails = Complaint & {
  citizen_name?: string;
  deputy_name?: string;
};

export type ComplaintFormData = {
  title: string;
  description: string;
  category: ComplaintCategory;
  governorate?: string | null;
  district?: string | null;
  address?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  citizen_phone?: string | null;
  citizen_email?: string | null;
};

export type ComplaintFilters = {
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  category?: ComplaintCategory;
  assigned_deputy_id?: string;
  citizen_id?: string;
  governorate?: string;
  search?: string;
};

