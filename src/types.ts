export interface LooksmaxxingRating {
  facialStructure: number; // 1-10
  hairGrooming: number; // 1-10
  styleAndFit: number; // 1-10
  physique: number; // 1-10
  glowUpPotential: number; // 1-10
  adviceTag?: string;
  comment?: string;
  ratedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'nonbinary';
  city: string;
  country: string;
  countryId?: string;
  cityId?: string;
  distanceKm: number;
  bio: string;
  heightCm: number;
  occupation?: string;
  workout?: string;
  photos: string[];
  tags: string[];
  glowUpScore: number; // 1.0 - 10.0
  ratingsSummary: {
    facialStructure: number;
    hairGrooming: number;
    styleAndFit: number;
    physique: number;
    glowUpPotential: number;
    totalRatings: number;
  };
  verified: boolean;
  isPremium?: boolean;
  latitude?: number;
  longitude?: number;
  searchRadiusKm?: number;
  isGeoVerified?: boolean;
  languages?: string[];
  verificationGesture?: string;
  verificationPhotoUrl?: string;
}

export type SupportedLanguage = 'ru' | 'en' | 'es' | 'de' | 'fr';

export interface OnboardingData {
  ageConfirmed: boolean;
  termsAccepted: boolean;
  uiLanguage: SupportedLanguage;
  spokenLanguages: string[];
  name: string;
  age: number;
  gender: 'male' | 'female' | 'nonbinary';
  interestedIn: 'male' | 'female' | 'all';
  city: string;
  country: string;
  countryId?: string;
  cityId?: string;
  heightCm: number;
  bio: string;
  photos: string[];
  verified: boolean;
  latitude?: number;
  longitude?: number;
  searchRadiusKm?: number;
  isGeoVerified?: boolean;
  verificationGesture?: string;
  verificationPhotoUrl?: string;
}

export interface FilterSettings {
  gender: 'all' | 'male' | 'female' | 'nonbinary';
  minAge: number;
  maxAge: number;
  maxDistanceKm: number;
  city: string;
  country: string;
  countryId?: string;
  cityId?: string;
  selectedTags: string[];
}

export interface Match {
  id: string;
  user: UserProfile;
  matchedAt: string;
  lastMessage?: string;
  unreadCount?: number;
  theirRatingForYou?: LooksmaxxingRating;
  yourRatingForThem?: LooksmaxxingRating;
}

export interface WhoLikedItem {
  id: string;
  user: UserProfile;
  likedAt: string;
  ratingGiven?: LooksmaxxingRating;
  isUnlocked: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isLooksmaxxingTip?: boolean;
}

export interface StarsPackage {
  id: string;
  title: string;
  badge?: string;
  stars: number;
  description: string;
  type: 'premium' | 'who_liked' | 'swipes' | 'boost';
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}
