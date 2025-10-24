/**
 * Deputy Profile Types
 * Types for deputy public profile page
 */

export interface DeputyProfile {
  id: string;
  user_id: string;
  deputy_status: "current" | "candidate" | "former";
  office_address: string | null;
  bio: string | null;
  electoral_symbol: string | null;
  electoral_number: string | null;
  electoral_program: string | null;
  achievements: string | null;
  events: string | null;
  social_media_facebook: string | null;
  social_media_twitter: string | null;
  social_media_instagram: string | null;
  social_media_youtube: string | null;
  website_url: string | null;
  office_phone: string | null;
  office_hours: string | null;
  council_id: string | null;
  points: number;
  gender: "male" | "female";
  governorate: string;
  council_type: "parliament" | "senate" | "local";
  party_id: string | null;
  banner_image: string | null;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  governorate_id: string | null;
  city: string | null;
  district: string | null;
  village: string | null;
  job_title: string | null;
  party_id: string | null;
  electoral_district: string | null;
  address: string | null;
  role: string | null;
  gender: string | null;
  english_name: string | null;
}

export interface Party {
  id: string;
  name_ar: string;
  name_en: string | null;
  abbreviation: string | null;
  logo_url: string | null;
  description: string | null;
  founded_date: string | null;
  website_url: string | null;
}

export interface Council {
  id: string;
  name_ar: string;
  name_en: string | null;
  code: string | null;
  description: string | null;
}

export interface Governorate {
  id: string;
  name_ar: string;
  name_en: string | null;
  code: string | null;
}

export interface DeputyRating {
  average: number;
  count: number;
}

export interface DeputyStats {
  points: number;
  complaints_count: number;
  rank: number | null;
}

/**
 * Full Deputy Data with all related information
 */
export interface DeputyFullData {
  // Deputy Profile
  deputy: DeputyProfile;
  
  // User Profile
  user: UserProfile;
  
  // Related Data
  party: Party | null;
  council: Council | null;
  governorate: Governorate | null;
  
  // Ratings & Stats
  rating: DeputyRating;
  stats: DeputyStats;
}

