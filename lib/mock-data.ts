// Mock data — Kigali, Rwanda only. Used as fallback when DB is empty.

export interface MockModel {
  id: string;
  name: string;
  agencyName: string;
  avatarUrl: string;
  gender: "Female" | "Male";
  category: "Runway" | "Commercial" | "Editorial" | "Fitness" | "Beauty" | "Plus-size" | "Petite" | "Influencer";
  height: number;
  waist: number;
  hips: number;
  chest?: number;
  shoeSize: number;
  location: string;
  isVerified: boolean;
  profileCompletion: number;
  viewsCount: number;
  experienceYears: number;
  bio: string;
  portfolioImages: string[];
  portfolioVideos: string[];
  reviews: { id: string; authorName: string; rating: number; comment: string; date: string }[];
  experienceTimeline: { id: string; year: string; title: string; description: string }[];
}

export interface MockAgency {
  id: string;
  name: string;
  logoUrl: string;
  location: string;
  description: string;
  isVerified: boolean;
  modelsCount: number;
}

export interface MockCasting {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  date: string;
  budget: number;
  postedBy: string;
  postedByAvatar: string;
  postedByRole: "Agency" | "Client";
  applicationStatus: "Applied" | "Pending" | "Approved" | "Rejected" | "None";
}

export interface MockService {
  id: string;
  title: string;
  providerName: string;
  providerRole: "Fashion Photographer" | "Makeup Artist" | "Runway Coach" | "Fashion Stylist" | "Studio Rental" | "Event Organizer";
  description: string;
  price: number;
  location: string;
  imageUrl: string;
  rating: number;
}

export const mockAgencies: MockAgency[] = [
  {
    id: "agency-1",
    name: "Kigali Elite Models",
    logoUrl: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=300&q=80",
    location: "Kigali, Rwanda",
    description: "Rwanda's premier editorial and runway modeling management agency.",
    isVerified: true,
    modelsCount: 42,
  },
];

// Intentionally empty — app will show real DB data or empty state in production.
// These are kept only for development reference.
export const mockModels: MockModel[] = [];

export const mockCastings: MockCasting[] = [];

export const mockServices: MockService[] = [];
