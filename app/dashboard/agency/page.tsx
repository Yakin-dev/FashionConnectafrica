"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DashboardSidebar from "@/components/dashboard-sidebar";
import StatCard from "@/components/stat-card";
import EmptyState from "@/components/empty-state";
import { mockModels, MockModel } from "@/lib/mock-data";
import { Users, BookOpen, UserPlus, Eye, Sparkles, CheckCircle, Trash2, Calendar } from "lucide-react";

export default function AgencyDashboard() {
  const [roster, setRoster] = useState<MockModel[]>(
    mockModels.filter((m) => m.agencyName.includes("Kigali Elite Models"))
  );
  
  // Add model form states
  const [modelName, setModelName] = useState("");
  const [modelCategory, setModelCategory] = useState("Runway");
  const [modelHeight, setModelHeight] = useState(175);
  const [success, setSuccess] = useState(false);

  // Sidebar navigation
  const sidebarItems = [
    { name: "Represented Models", href: "/dashboard/agency", icon: Users },
    { name: "Manage Castings", href: "/castings", icon: BookOpen },
  ];

  const handleAddNewModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName.trim()) return;

    const newModel: MockModel = {
      id: `model-${Date.now()}`,
      name: modelName,
      agencyName: "Kigali Elite Models",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      gender: "Female",
      category: modelCategory as any,
      height: Number(modelHeight),
      waist: 60,
      hips: 89,
      shoeSize: 39,
      location: "Kigali, Rwanda",
      isVerified: true,
      profileCompletion: 80,
      viewsCount: 100,
      experienceYears: 1,
      bio: "Newly recruited talent under development program.",
      portfolioImages: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"],
      portfolioVideos: [],
      reviews: [],
      experienceTimeline: [],
    };

    setRoster((prev) => [newModel, ...prev]);
    setSuccess(true);
    
    // Clear inputs
    setModelName("");
    setModelCategory("Runway");
    setModelHeight(175);

    setTimeout(() => {
      setSuccess(false);
    }, 2500);
  };

  const handleDeleteModel = (id: string) => {
    setRoster((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Dashboard Navigation */}
            <DashboardSidebar
              title="Kigali Elite Models"
              subtitle="Registered HQ Agency Node"
              items={sidebarItems}
              role="AGENCY"
            />

            {/* main screen */}
            <div className="flex-1 w-full space-y-8">
              
              {/* Analytics metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <StatCard
                  title="Total Roster Talent"
                  value={roster.length}
                  change="HQ MANAGED"
                  icon={Users}
                />
                <StatCard
                  title="Total Bookings"
                  value="12 Confirmed"
                  change="+4 THIS MONTH"
                  trend="up"
                  icon={CheckCircle}
                />
                <StatCard
                  title="Active Castings"
                  value="3 Open"
                  change="VOGUE, ECO"
                  icon={BookOpen}
                />
                <StatCard
                  title="Roster Views"
                  value="8.4K Pageviews"
                  change="+24%"
                  trend="up"
                  icon={Eye}
                />
              </div>

              {/* Grid: roster manage and new face registration */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Roster management table */}
                <div className="lg:col-span-8 rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-6">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3">
                    Represented Models Roster
                  </h3>

                  {roster.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#E7DED1] text-[9px] uppercase font-bold tracking-widest text-[#6B6257]">
                            <th className="pb-3">Model</th>
                            <th className="pb-3">Category</th>
                            <th className="pb-3">Height</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E7DED1]/50 text-xs">
                          {roster.map((model) => (
                            <tr key={model.id} className="group">
                              <td className="py-3.5 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full overflow-hidden bg-[#E7DED1]">
                                  <img src={model.avatarUrl} alt={model.name} className="object-cover h-full w-full" />
                                </div>
                                <span className="font-bold text-[#1D1A16] uppercase">{model.name}</span>
                              </td>
                              <td className="py-3.5 text-[#6B6257]">{model.category}</td>
                              <td className="py-3.5 text-[#6B6257]">{model.height} cm</td>
                              <td className="py-3.5 text-right">
                                <button
                                  onClick={() => handleDeleteModel(model.id)}
                                  className="text-[#6B6257] hover:text-rose-600 transition-colors p-1.5"
                                  title="Archive model from represented roster"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      title="No represented models"
                      description="You do not have any active models registered on your roster panel. Add a model on the right to start."
                    />
                  )}
                </div>

                {/* Add model quick form */}
                <div className="lg:col-span-4 rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3 flex items-center gap-1.5">
                    <UserPlus className="h-4.5 w-4.5 text-[#C8A96A]" />
                    <span>Recruit New Face</span>
                  </h3>

                  {success && (
                    <div className="rounded-xl bg-emerald-100/10 border border-emerald-500/20 p-3 text-emerald-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Model Roster additions saved!</span>
                    </div>
                  )}

                  <form onSubmit={handleAddNewModel} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">Model Catwalk Name</label>
                      <input
                        type="text"
                        required
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        placeholder="ENTER NAME"
                        className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/30 p-3 text-xs focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">Height Group (cm)</label>
                      <input
                        type="number"
                        required
                        value={modelHeight}
                        onChange={(e) => setModelHeight(Number(e.target.value))}
                        className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/30 p-3 text-xs focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">Category</label>
                      <select
                        value={modelCategory}
                        onChange={(e) => setModelCategory(e.target.value)}
                        className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/30 p-3 text-xs focus:outline-none focus:bg-white"
                      >
                        <option value="Runway">Runway</option>
                        <option value="Editorial">Editorial</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Fitness">Fitness</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-full bg-[#1D1A16] py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors"
                    >
                      Recruit Talent
                    </button>
                  </form>
                </div>

              </div>

            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
