"use server";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export const getGovernorates = async () => {
  const supabase = await createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from("governorates")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Error fetching governorates:", error);
    return [];
  }

  return data || [];
};

export const getParties = async () => {
  const supabase = await createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from("parties")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Error fetching parties:", error);
    return [];
  }

  return data || [];
};

