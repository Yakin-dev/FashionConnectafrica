export interface MockModel {
  id: string;
  name: string;
  agencyName: string;
  avatarUrl: string;
  gender: "Female" | "Male";
  category: "Runway" | "Commercial" | "Editorial" | "Fitness" | "Beauty" | "Plus-size" | "Petite" | "Influencer";
  height: number; // cm
  waist: number; // cm
  hips: number; // cm
  chest?: number; // cm
  shoeSize: number;
  location: string;
  isVerified: boolean;
  profileCompletion: number; // percentage
  viewsCount: number;
  experienceYears: number;
  bio: string;
  portfolioImages: string[];
  portfolioVideos: string[];
  reviews: {
    id: string;
    authorName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  experienceTimeline: {
    id: string;
    year: string;
    title: string;
    description: string;
  }[];
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

export interface MockConversation {
  id: string;
  contactName: string;
  contactAvatar: string;
  contactRole: "Model" | "Agency" | "Client";
  messages: {
    id: string;
    senderId: "me" | "them";
    content: string;
    timestamp: string;
  }[];
}

export const mockAgencies: MockAgency[] = [
  {
    id: "agency-1",
    name: "Kigali Elite Models",
    logoUrl: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=300&q=80",
    location: "Kigali, Rwanda",
    description: "East Africa's premier editorial and runway modeling management agency.",
    isVerified: true,
    modelsCount: 42,
  },
  {
    id: "agency-2",
    name: "Lagos Fashion Talent",
    logoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    location: "Lagos, Nigeria",
    description: "Connecting West African creators and runway superstars to international shows.",
    isVerified: true,
    modelsCount: 68,
  },
  {
    id: "agency-3",
    name: "Nairobi Runway House",
    logoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    location: "Nairobi, Kenya",
    description: "Developing exceptional Commercial, Fitness, and Runway models in Kenya.",
    isVerified: true,
    modelsCount: 35,
  },
  {
    id: "agency-4",
    name: "Accra Model Bureau",
    logoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    location: "Accra, Ghana",
    description: "A boutique style scouting agency focused on diverse modeling representations.",
    isVerified: false,
    modelsCount: 19,
  },
];

export const mockModels: MockModel[] = [
  {
    id: "model-1",
    name: "Amina Uwase",
    agencyName: "Kigali Elite Models",
    avatarUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    gender: "Female",
    category: "Runway",
    height: 180,
    waist: 61,
    hips: 89,
    chest: 84,
    shoeSize: 39,
    location: "Kigali, Rwanda",
    isVerified: true,
    profileCompletion: 95,
    viewsCount: 2450,
    experienceYears: 4,
    bio: "Editorial and runway fashion model based in Kigali. Walked for Kigali Fashion Week and Paris Autumn collections. Passionate about promoting African sustainable textile brands to the international scene.",
    portfolioImages: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80"
    ],
    portfolioVideos: [
      "https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-glitter-makeup-40113-large.mp4"
    ],
    reviews: [
      {
        id: "r-1",
        authorName: "Mimi Haute Couture",
        rating: 5,
        comment: "Amina displays absolute elegance and timing on the runway. Highly professional and punctual.",
        date: "2026-04-12",
      },
      {
        id: "r-2",
        authorName: "J. K. Studio Photography",
        rating: 5,
        comment: "Excellent expressions and visual versatility. Will definitely book again.",
        date: "2026-03-01",
      }
    ],
    experienceTimeline: [
      {
        id: "t-1",
        year: "2025",
        title: "Kigali Fashion Week Main Runway",
        description: "Opened the showcase for local designers with 4 different silhouettes.",
      },
      {
        id: "t-2",
        year: "2024",
        title: "Vogue Africa Editorial Shoot",
        description: "Featured in the East African new talents collection print edition.",
      }
    ]
  },
  {
    id: "model-2",
    name: "Keza Mutesi",
    agencyName: "Kigali Elite Models",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    gender: "Female",
    category: "Editorial",
    height: 176,
    waist: 59,
    hips: 87,
    chest: 81,
    shoeSize: 38,
    location: "Kigali, Rwanda",
    isVerified: true,
    profileCompletion: 88,
    viewsCount: 1890,
    experienceYears: 2,
    bio: "High fashion editorial and beauty model. Keen eye for avant-garde styling, active collaborator with digital creators across Lagos and Nairobi.",
    portfolioImages: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"
    ],
    portfolioVideos: [],
    reviews: [
      {
        id: "r-3",
        authorName: "Kigali Beauty Lab",
        rating: 4,
        comment: "Her skin texture and visual posture are top-notch. Stellar results.",
        date: "2026-05-15",
      }
    ],
    experienceTimeline: [
      {
        id: "t-3",
        year: "2025",
        title: "Kigali Haute Editorial",
        description: "Lead model for the digital launch campaign of Rwanda's premium jewelry collection.",
      }
    ]
  },
  {
    id: "model-3",
    name: "Brian Ishimwe",
    agencyName: "Nairobi Runway House",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    gender: "Male",
    category: "Fitness",
    height: 188,
    waist: 78,
    hips: 95,
    chest: 104,
    shoeSize: 44,
    location: "Nairobi, Kenya",
    isVerified: true,
    profileCompletion: 92,
    viewsCount: 3120,
    experienceYears: 5,
    bio: "Fitness, sportswear, and runway modeling specialist. Certified fitness advisor with deep ties to sportswear modeling campaigns in Cape Town and Nairobi.",
    portfolioImages: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80"
    ],
    portfolioVideos: [],
    reviews: [],
    experienceTimeline: []
  },
  {
    id: "model-4",
    name: "Nadia Kamanzi",
    agencyName: "Lagos Fashion Talent",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    gender: "Female",
    category: "Commercial",
    height: 173,
    waist: 63,
    hips: 91,
    chest: 86,
    shoeSize: 39,
    location: "Lagos, Nigeria",
    isVerified: true,
    profileCompletion: 100,
    viewsCount: 4210,
    experienceYears: 6,
    bio: "Versatile Commercial model and Digital Fashion Influencer with a reach of over 150k followers. Works with skincare, lifestyle and high-street luxury apparel labels.",
    portfolioImages: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"
    ],
    portfolioVideos: [],
    reviews: [],
    experienceTimeline: []
  },
  {
    id: "model-5",
    name: "Eliane Mugisha",
    agencyName: "Accra Model Bureau",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    gender: "Female",
    category: "Beauty",
    height: 172,
    waist: 60,
    hips: 88,
    chest: 83,
    shoeSize: 38,
    location: "Accra, Ghana",
    isVerified: false,
    profileCompletion: 70,
    viewsCount: 950,
    experienceYears: 1,
    bio: "Upcoming cosmetic and beauty hand model based in Accra. Passionate about hair and organic makeup advertising campaigns.",
    portfolioImages: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
    ],
    portfolioVideos: [],
    reviews: [],
    experienceTimeline: []
  },
  {
    id: "model-6",
    name: "David Niyonzima",
    agencyName: "Kigali Elite Models",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    gender: "Male",
    category: "Runway",
    height: 187,
    waist: 76,
    hips: 92,
    chest: 98,
    shoeSize: 43,
    location: "Kigali, Rwanda",
    isVerified: true,
    profileCompletion: 80,
    viewsCount: 1540,
    experienceYears: 3,
    bio: "High fashion avant-garde Runway specialist. Expressive catwalk style, worked with contemporary East-African designers.",
    portfolioImages: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"
    ],
    portfolioVideos: [],
    reviews: [],
    experienceTimeline: []
  }
];

export const mockCastings: MockCasting[] = [
  {
    id: "casting-1",
    title: "Vogue Africa Editorial Runway Show",
    description: "Looking for high-fashion runway models to launch the Fall/Winter African Collection in Kigali. High editorial and expressive walking required.",
    requirements: "Height: 175cm+ (Females), 185cm+ (Males). Clean portfolio, strong catwalk capability.",
    location: "Kigali, Rwanda",
    date: "2026-06-25",
    budget: 1500,
    postedBy: "Kigali Elite Models",
    postedByAvatar: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=100&q=80",
    postedByRole: "Agency",
    applicationStatus: "Applied",
  },
  {
    id: "casting-2",
    title: "EcoSport Activewear Campaign",
    description: "A commercial lifestyle and sportswear catalog print shoot in Nairobi. Looking for athletic, enthusiastic models.",
    requirements: "Fit physique, active sports capability, expressive friendly look.",
    location: "Nairobi, Kenya",
    date: "2026-07-10",
    budget: 800,
    postedBy: "Nairobi Runway House",
    postedByAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80",
    postedByRole: "Agency",
    applicationStatus: "Pending",
  },
  {
    id: "casting-3",
    title: "Cosmetic & Glow Skincare Campaign",
    description: "Visual close-ups and video reels showcasing natural glow skincare products in Lagos.",
    requirements: "Clear skin texture, rich skin tones, camera-comfortable facial expressions.",
    location: "Lagos, Nigeria",
    date: "2026-08-01",
    budget: 2000,
    postedBy: "Glow Skin Cosmetics Ltd",
    postedByAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
    postedByRole: "Client",
    applicationStatus: "None",
  }
];

export const mockServices: MockService[] = [
  {
    id: "service-1",
    title: "High-Fashion Editorial Shoot",
    providerName: "Kofi Boateng",
    providerRole: "Fashion Photographer",
    description: "Specialized in high-contrast editorial photography with advanced studio setups. Includes mood board curation and 12 fully edited digital assets.",
    price: 350,
    location: "Accra, Ghana",
    imageUrl: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=500&q=80",
    rating: 4.9,
  },
  {
    id: "service-2",
    title: "Catwalk Mastery Masterclass",
    providerName: "Zola Dlamini",
    providerRole: "Runway Coach",
    description: "1-on-1 intensive runway posing, posture adjustment, confidence, and stride lessons for runway candidates.",
    price: 90,
    location: "Johannesburg, South Africa",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=500&q=80",
    rating: 5.0,
  },
  {
    id: "service-3",
    title: "Editorial Makeup & Glow Artistry",
    providerName: "Kecia Mutua",
    providerRole: "Makeup Artist",
    description: "Premium runway and camera-ready cosmetic application. Includes skin preparation and long-stay glow finishes.",
    price: 120,
    location: "Nairobi, Kenya",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
    rating: 4.8,
  },
  {
    id: "service-4",
    title: "Minimalist Loft Studio Rental",
    providerName: "Studio 250",
    providerRole: "Studio Rental",
    description: "Bright industrial space with large grid windows, modular clothing racks, vanity lights, and backdrop selectors.",
    price: 50, // hourly
    location: "Kigali, Rwanda",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80",
    rating: 4.7,
  }
];

export const mockConversations: MockConversation[] = [
  {
    id: "conv-1",
    contactName: "Amina Uwase",
    contactAvatar: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=100&q=80",
    contactRole: "Model",
    messages: [
      { id: "m-1", senderId: "them", content: "Hello! I am excited about the Vogue Africa casting call.", timestamp: "10:15 AM" },
      { id: "m-2", senderId: "me", content: "Hi Amina! We loved your portfolio. Are you available for a brief fittings session this Wednesday at our Kigali Studio?", timestamp: "10:20 AM" },
      { id: "m-3", senderId: "them", content: "Yes, definitely. Wednesday morning works great for me. Should I bring specific footwear?", timestamp: "10:24 AM" },
      { id: "m-4", senderId: "me", content: "Please bring plain black heels. See you on Wednesday at 10 AM!", timestamp: "10:27 AM" }
    ]
  },
  {
    id: "conv-2",
    contactName: "Lagos Fashion Talent",
    contactAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80",
    contactRole: "Agency",
    messages: [
      { id: "m-5", senderId: "them", content: "Hi there, we have three model packages matching your commercial activewear specs.", timestamp: "Yesterday" },
      { id: "m-6", senderId: "me", content: "Perfect, could you send over their shoe sizes and updated runway reels?", timestamp: "Yesterday" }
    ]
  }
];
