"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ModelCard from "@/components/model-card";
import AgencyCard, { type AgencyCardData } from "@/components/agency-card";
import EmptyState from "@/components/empty-state";
import { mockModels } from "@/lib/mock-data";
import { SlidersHorizontal, Search, X, Loader2, Building2 } from "lucide-react";

interface SidebarContentProps {
  selectedGender: string;
  selectedCategory: string;
  selectedLocation: string;
  selectedHeight: string;
  selectedExperience: string;
  onGenderChange: (gender: string) => void;
  onCategoryChange: (category: string) => void;
  onLocationChange: (location: string) => void;
  onHeightChange: (height: string) => void;
  onExperienceChange: (experience: string) => void;
  onReset: () => void;
}

const locations = ["All", "Kigali, Rwanda"];
const categories = ["All", "Runway", "Editorial", "Fitness", "Beauty", "Commercial", "Influencer"];

// Inner component that uses useSearchParams — wrapped in Suspense by parent
function SearchContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const initialQuery = searchParams.get("q") ?? "";

  const showAgencies = typeParam === "agencies";

  if (showAgencies) {
    return <AgenciesView initialQuery={initialQuery} />;
  }

  return <ModelsView initialQuery={initialQuery} />;
}

const SidebarContent = ({
  selectedGender,
  selectedCategory,
  selectedLocation,
  selectedHeight,
  selectedExperience,
  onGenderChange,
  onCategoryChange,
  onLocationChange,
  onHeightChange,
  onExperienceChange,
  onReset,
}: SidebarContentProps) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between border-b border-[#E7DED1] pb-4">
      <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-[#1D1A16]">Filters</h3>
      <button
        onClick={onReset}
        className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] hover:underline"
      >
        Reset All
      </button>
    </div>

    {/* Gender Filter */}
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Gender</label>
      <div className="flex gap-2">
        {["All", "Female", "Male"].map((g) => (
          <button
            key={g}
            onClick={() => onGenderChange(g)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold uppercase tracking-wider border transition-all ${
              selectedGender === g
                ? "bg-[#1D1A16] text-white border-transparent"
                : "border-[#E7DED1] text-[#6B6257] hover:bg-white"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>

    {/* Category Filter */}
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Category</label>
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none focus:border-[#C8A96A]"
      >
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>

    {/* Location Filter */}
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Location</label>
      <select
        value={selectedLocation}
        onChange={(e) => onLocationChange(e.target.value)}
        className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none focus:border-[#C8A96A]"
      >
        {locations.map((loc) => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>
    </div>

    {/* Height bounds */}
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Height Group</label>
      <select
        value={selectedHeight}
        onChange={(e) => onHeightChange(e.target.value)}
        className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none focus:border-[#C8A96A]"
      >
        <option value="All">All Heights</option>
        <option value="tall">Tall (180cm+)</option>
        <option value="medium">Medium (170cm - 179cm)</option>
        <option value="petite">Petite (Under 170cm)</option>
      </select>
    </div>

    {/* Experience Range */}
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Experience</label>
      <select
        value={selectedExperience}
        onChange={(e) => onExperienceChange(e.target.value)}
        className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none focus:border-[#C8A96A]"
      >
        <option value="All">All Experience levels</option>
        <option value="experienced">Elite Elite (4+ Years)</option>
        <option value="intermediate">Rising Star (2 - 3 Years)</option>
        <option value="new">New Face (Under 2 Years)</option>
      </select>
    </div>
  </div>
);

function AgenciesView({ initialQuery }: { initialQuery: string }) {
  const [agencies, setAgencies] = useState<AgencyCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    const fetchAgencies = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("limit", "50");
        if (searchQuery) params.set("q", searchQuery);
        const res = await fetch(`/api/agencies?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setAgencies(data.agencies ?? []);
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    void fetchAgencies();
  }, [searchQuery]);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C8A96A]/10 border border-[#C8A96A]/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C8A96A] mb-4">
              <Building2 className="h-3.5 w-3.5" /> Kigali Agencies
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase text-[#1D1A16]">
              Partner Agencies
            </h1>
            <p className="text-sm text-[#6B6257] mt-2">
              Browse verified modeling and talent agencies in Kigali.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-md mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-[#6B6257]" />
              <input
                type="text"
                placeholder="Search agencies by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E7DED1] rounded-xl py-3 pl-12 pr-4 text-xs font-semibold text-[#1D1A16] placeholder-[#6B6257] focus:outline-none focus:ring-1 focus:ring-[#C8A96A]"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-24 text-[#6B6257]">
              <Loader2 className="h-5 w-5 animate-spin text-[#C8A96A]" />
              <span className="text-sm">Loading agencies...</span>
            </div>
          ) : agencies.length === 0 ? (
            <EmptyState
              title="No agencies found"
              description="There are currently no verified agencies listed. Check back soon or adjust your search."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {agencies.map((agency) => (
                <AgencyCard key={agency.id} agency={agency} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function ModelsView({ initialQuery }: { initialQuery: string }) {
  // State variables for search and filtering
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGender, setSelectedGender] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [selectedHeight, setSelectedHeight] = useState<string>("All");
  const [selectedExperience, setSelectedExperience] = useState<string>("All");
  const [sortBy, setSortBy] = useState("views");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Extract unique locations and categories dynamically
  const locationsArray = ["All", "Kigali, Rwanda"];
  const categoriesArray = ["All", "Runway", "Editorial", "Fitness", "Beauty", "Commercial", "Influencer"];

  const handleReset = () => {
    setSearchQuery("");
    setSelectedGender("All");
    setSelectedCategory("All");
    setSelectedLocation("All");
    setSelectedHeight("All");
    setSelectedExperience("All");
  };

  // Core filter logic
  const filteredModels = useMemo(() => {
    return mockModels
      .filter((model) => {
        // Query search
        const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          model.agencyName.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Gender check
        const matchesGender = selectedGender === "All" || model.gender === selectedGender;
        
        // Category check
        const matchesCategory = selectedCategory === "All" || model.category === selectedCategory;

        // Location check
        const matchesLocation = selectedLocation === "All" || model.location === selectedLocation;

        // Height filter bounds
        let matchesHeight = true;
        if (selectedHeight === "tall") {
          matchesHeight = model.height >= 180;
        } else if (selectedHeight === "medium") {
          matchesHeight = model.height >= 170 && model.height < 180;
        } else if (selectedHeight === "petite") {
          matchesHeight = model.height < 170;
        }

        // Experience filter
        let matchesExperience = true;
        if (selectedExperience === "experienced") {
          matchesExperience = model.experienceYears >= 4;
        } else if (selectedExperience === "intermediate") {
          matchesExperience = model.experienceYears >= 2 && model.experienceYears < 4;
        } else if (selectedExperience === "new") {
          matchesExperience = model.experienceYears < 2;
        }

        return matchesSearch && matchesGender && matchesCategory && matchesLocation && matchesHeight && matchesExperience;
      })
      .sort((a, b) => {
        if (sortBy === "views") return b.viewsCount - a.viewsCount;
        if (sortBy === "experience") return b.experienceYears - a.experienceYears;
        if (sortBy === "height") return b.height - a.height;
        return 0;
      });
  }, [searchQuery, selectedGender, selectedCategory, selectedLocation, selectedHeight, selectedExperience, sortBy]);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Top Search bar area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white border border-[#E7DED1] rounded-2xl p-4 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-[#6B6257]" />
              <input
                type="text"
                placeholder="Search models, agency names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8F5EF]/50 rounded-xl py-3 pl-12 pr-4 text-xs font-semibold text-[#1D1A16] placeholder-[#6B6257] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#C8A96A]"
              />
            </div>

            <div className="flex gap-3 items-center justify-between md:justify-end">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-[#E7DED1] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#6B6257] md:hidden hover:bg-[#F8F5EF]"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-[#E7DED1] bg-white px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#6B6257] focus:outline-none"
              >
                <option value="views">Most Viewed</option>
                <option value="experience">Most Experienced</option>
                <option value="height">Tallest First</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden md:block w-64 shrink-0 bg-white border border-[#E7DED1] rounded-2xl p-5 shadow-sm">
              <SidebarContent
                selectedGender={selectedGender}
                selectedCategory={selectedCategory}
                selectedLocation={selectedLocation}
                selectedHeight={selectedHeight}
                selectedExperience={selectedExperience}
                onGenderChange={setSelectedGender}
                onCategoryChange={setSelectedCategory}
                onLocationChange={setSelectedLocation}
                onHeightChange={setSelectedHeight}
                onExperienceChange={setSelectedExperience}
                onReset={handleReset}
              />
            </aside>

            {/* Results Grid */}
            <div className="flex-1 w-full">
              {filteredModels.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredModels.map((model) => (
                    <ModelCard key={model.id} model={model} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No models found"
                  description="We couldn't find any portfolios matching your filter parameters. Try checking another category or reset your inputs."
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Drawer Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-80 bg-[#F8F5EF] h-full p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16]">Filters</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="rounded-full bg-white p-2 border border-[#E7DED1] hover:text-[#C8A96A]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SidebarContent
                selectedGender={selectedGender}
                selectedCategory={selectedCategory}
                selectedLocation={selectedLocation}
                selectedHeight={selectedHeight}
                selectedExperience={selectedExperience}
                onGenderChange={setSelectedGender}
                onCategoryChange={setSelectedCategory}
                onLocationChange={setSelectedLocation}
                onHeightChange={setSelectedHeight}
                onExperienceChange={setSelectedExperience}
                onReset={handleReset}
              />
            </div>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full bg-[#1D1A16] text-white rounded-full py-3.5 text-xs font-bold uppercase tracking-widest mt-8 hover:bg-[#C8A96A] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <>
        <Navbar />
        <main className="flex-1 bg-[#F8F5EF] py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-24 text-[#6B6257]">
              <Loader2 className="h-5 w-5 animate-spin text-[#C8A96A] mr-2" />
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        </main>
        <Footer />
      </>
    }>
      <SearchContent />
    </Suspense>
  );
}
