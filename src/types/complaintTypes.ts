import { Database } from "@/lib/database.types";

// Extract complaint table types from database
export type Complaint = Database["public"]["Tables"]["complaints"]["Row"];
export type ComplaintInsert = Database["public"]["Tables"]["complaints"]["Insert"];
export type ComplaintUpdate = Database["public"]["Tables"]["complaints"]["Update"];

// Extract ENUMs
export type ComplaintStatus = Database["public"]["Enums"]["complaint_status"];
export type ComplaintPriority = Database["public"]["Enums"]["complaint_priority"];
export type ComplaintCategory = Database["public"]["Enums"]["complaint_category"];

