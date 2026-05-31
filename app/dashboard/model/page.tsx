"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DashboardSidebar from "@/components/dashboard-sidebar";
import StatCard from "@/components/stat-card";
import UploadBox from "@/components/upload-box";
import EmptyState from "@/components/empty-state";
import { mockModels } from "@/lib/mock-data";
import { User, Image as ImageIcon, Calendar, BookOpen, MessageSquare, TrendingUp, Sparkles, CheckCircle } from "lucide-react";

export default function ModelDashboard() {
  const model = mockModels[0]; // Amina Uwase as active model
  const [profileCompletion, setProfileCompletion] = useState(model.profileCompletion);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(model.portfolioImages);
  
  const [editName, setEditName] = useState(model.name);
  const [editHeight, setEditHeight] = useState(model.height);
  const [editCategory, setEditCategory] = useState(model.category);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);

  // Sidebar Items
  const sidebarItems = [
    { name: "My Profile", href: "/dashboard/model", icon: User },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Castings Hub", href: "/castings", icon: BookOpen },
  ];

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccessMsg(true);
    if (profileCompletion < 100) setProfileCompletion(100);
    setTimeout(() => {
      setShowSuccessMsg(false);
    }, 3000);
  };

  const handlePhotoUploadSuccess = (url: string) => {
    setUploadedPhotos((prev) => [url, ...prev]);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Sidebar navigation */}
            <DashboardSidebar
              title={model.name}
              subtitle={`${model.category} Model`}
              items={sidebarItems}
              role="MODEL"
            />

            {/* Main Workspace */}
            <div className="flex-1 w-full space-y-8">
              
              {/* Profile Completion Bar */}
              <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D1A16] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-[#C8A96A]" />
                    <span>Profile Completion Progress</span>
                  </span>
                  <span className="text-xs font-bold text-[#C8A96A]">{profileCompletion}% Complete</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#F8F5EF] overflow-hidden">
                  <div
                    className="h-full bg-[#C8A96A] transition-all duration-1000"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>

              {/* Statistics Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard
                  title="Profile Impressions"
                  value={model.viewsCount}
                  change="+18% THIS WEEK"
                  trend="up"
                  icon={TrendingUp}
                />
                <StatCard
                  title="Confirmed Bookings"
                  value="4 Active"
                  change="VOGUE, KFW"
                  icon={Calendar}
                />
                <StatCard
                  title="Audition Requests"
                  value="2 Pending"
                  change="LAGOS INC."
                  icon={BookOpen}
                />
              </div>

              {/* Grid 2 Columns: Edit Stats and Portfolio Uploader */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Profile Edit Panel */}
                <div className="lg:col-span-7 rounded-2xl border border-[#E7DED1] bg-white p-6 sm:p-8 shadow-sm space-y-6">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3">
                    Physical Specifications
                  </h3>

                  {showSuccessMsg && (
                    <div className="rounded-xl bg-emerald-100/10 border border-emerald-500/20 p-4 text-emerald-600 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Specifications updated successfully!</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">Catwalk Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/30 p-3 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">Height (cm)</label>
                        <input
                          type="number"
                          value={editHeight}
                          onChange={(e) => setEditHeight(Number(e.target.value))}
                          className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/30 p-3 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">Modeling Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as any)}
                        className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/30 p-3 text-xs focus:outline-none"
                      >
                        <option value="Runway">Runway cat</option>
                        <option value="Editorial">Editorial beauty</option>
                        <option value="Commercial">Commercial look</option>
                        <option value="Fitness">Fitness athletic</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="rounded-full bg-[#1D1A16] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all"
                    >
                      Save Specifications
                    </button>
                  </form>
                </div>

                {/* Portfolio Uploader */}
                <div className="lg:col-span-5 rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3">
                    Add Photo to Editorial Book
                  </h3>
                  <UploadBox
                    label="Editorial Photo"
                    onUploadSuccess={handlePhotoUploadSuccess}
                  />
                </div>
              </div>

              {/* Portfolio Roster list */}
              <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-6">
                <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3">
                  My Active Editorial Book ({uploadedPhotos.length} Photos)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {uploadedPhotos.map((url, i) => (
                    <div key={i} className="aspect-[3/4] relative overflow-hidden rounded-xl bg-[#F8F5EF] border border-[#E7DED1]/60">
                      <img src={url} alt={`Book page ${i}`} className="object-cover w-full h-full" />
                    </div>
                  ))}
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
