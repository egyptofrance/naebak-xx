// Type definitions for deputy profiles and related entities

export type DeputyStatus = "current" | "candidate" | "former";
export type CandidateType = "individual" | "list" | "both";
export type CouncilType = "parliament" | "senate" | "local";
export type Gender = "male" | "female";
export type DistrictType = "individual" | "list";

// Electoral District
export interface ElectoralDistrict {
  id: string;
  name: string;
  name_en: string | null;
  governorate_id: string;
  district_type: DistrictType;
  created_at: string;
  updated_at: string;
}

// Governorate
export interface Governorate {
  id: string;
  name_ar: string;
  name_en: string;
}

// Party
export interface Party {
  id: string;
  name_ar: string;
  name_en: string;
}

// Council
export interface Council {
  id: string;
  name_ar: string;
  name_en: string;
}

// Deputy Profile (from database)
export interface DeputyProfile {
  id: string;
  user_id: string;
  deputy_status: DeputyStatus;
  council_id: string | null;
  council_type: CouncilType | null;
  bio: string | null;
  office_address: string | null;
  office_phone: string | null;
  office_hours: string | null;
  electoral_symbol: string | null;
  electoral_number: string | null;
  electoral_program: string | null;
  achievements: string | null;
  events: string | null;
  website_url: string | null;
  social_media_facebook: string | null;
  social_media_twitter: string | null;
  social_media_instagram: string | null;
  social_media_youtube: string | null;
  gender: Gender | null;
  governorate: string | null;
  slug: string | null;
  banner_image: string | null;
  rating_average: number | null;
  rating_count: number | null;
  candidate_type: CandidateType | null;
  electoral_district_id: string | null;
  created_at: string;
  updated_at: string;
}

// User Profile
export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  governorate_id: string | null;
  party_id: string | null;
}

// Complete Deputy Data (with relations)
export interface DeputyData {
  deputy: DeputyProfile;
  user: UserProfile;
  governorate: Governorate | null;
  party: Party | null;
  council: Council | null;
  electoralDistrict: ElectoralDistrict | null;
  bannerImage?: string | null;
  slug?: string;
}

// Deputy Card Data (for list views)
export interface DeputyCardData {
  deputy: {
    id: string;
    user_id: string;
    deputy_status: DeputyStatus;
    council_id: string | null;
    rating_average: number | null;
    rating_count: number | null;
    candidate_type: CandidateType | null;
    electoral_district_id: string | null;
  };
  user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    governorate_id: string | null;
    party_id: string | null;
  };
  governorate: Governorate | null;
  party: Party | null;
  council: Council | null;
  electoralDistrict: ElectoralDistrict | null;
  slug: string;
}

// Electoral District with Governorate
export interface ElectoralDistrictWithGovernorate extends ElectoralDistrict {
  governorates?: Governorate;
}

// Form data types for admin panel
export interface CreateDeputyFormData {
  userId: string;
  deputyStatus: DeputyStatus;
}

export interface UpdateDeputyFormData {
  deputyId: string;
  deputyStatus?: DeputyStatus;
  bio?: string;
  officeAddress?: string;
  officePhone?: string;
  officeHours?: string;
  electoralSymbol?: string;
  electoralNumber?: string;
  electoralProgram?: string;
  achievements?: string;
  events?: string;
  websiteUrl?: string;
  socialMediaFacebook?: string;
  socialMediaTwitter?: string;
  socialMediaInstagram?: string;
  socialMediaYoutube?: string;
  councilId?: string | null;
  councilType?: CouncilType;
  gender?: Gender;
  governorate?: string;
  slug?: string;
  userId?: string;
  partyId?: string | null;
  initialRatingAverage?: string;
  initialRatingCount?: string;
  candidateType?: CandidateType;
  electoralDistrictId?: string | null;
}

