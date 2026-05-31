"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DashboardSidebar from "@/components/dashboard-sidebar";
import StatCard from "@/components/stat-card";
import EmptyState from "@/components/empty-state";
import { Users, Shield, Sparkles, BookOpen, UserCheck, AlertCircle, ShoppingBag, Eye } from "lucide-react";

export default function AdminDashboard() {
  // Pending profile approvals state
  const [approvals, setApprovals] = useState([
    { id: "1", name: "Eliane Mugisha", role: "MODEL", detail: "Beauty Model based in Accra, Ghana." },
    { id: "2", name: "Accra Model Bureau", role: "AGENCY", detail: "Boutique talent scouting agency, 19 models." }
  ]);

  // Marketplace items to moderate
  const [services, setServices] = useState([
    { id: "s1", title: "Loft Studio Space Rental", provider: "Studio 250", location: "Kigali, Rwanda" }
  ]);

  const handleApprove = (id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  const handleReject = (id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  const handleModerateService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  // Sidebar navigation
  const sidebarItems = [
    { name: "Platform Admin", href: "/dashboard/admin", icon: Shield },
    { name: "Models Hub", href: "/models", icon: Users },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Dashboard Sidebar */}
            <DashboardSidebar
              title="System Control"
              subtitle="Super Administrator Node"
              items={sidebarItems}
              role="ADMIN"
            />

            {/* main admin panel */}
            <div className="flex-1 w-full space-y-8">
              
              {/* Analytics metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <StatCard
                  title="Total Platforms Users"
                  value="1,240 Users"
                  change="+45 THIS WEEK"
                  trend="up"
                  icon={Users}
                />
                <StatCard
                  title="Verified Agencies"
                  value="12 Partner Agencies"
                  change="ACCROSS AFRICA"
                  icon={Shield}
                />
                <StatCard
                  title="Casting Submissions"
                  value="42 Applications"
                  change="80% SUCCESS RATE"
                  icon={BookOpen}
                />
                <StatCard
                  title="Active Services Listed"
                  value="18 Services"
                  change="2 PENDING VIEW"
                  icon={ShoppingBag}
                />
              </div>

              {/* Grid: approvals and marketplace moderation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Approvals Table */}
                <div className="lg:col-span-7 rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-6">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3 flex items-center gap-2">
                    <UserCheck className="h-4.5 w-4.5 text-[#C8A96A]" />
                    <span>Pending Verification Requests ({approvals.length})</span>
                  </h3>

                  {approvals.length > 0 ? (
                    <div className="space-y-4">
                      {approvals.map((app) => (
                        <div key={app.id} className="rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/30 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-[#1D1A16] uppercase">{app.name}</h4>
                              <span className="rounded bg-[#C8A96A]/10 text-[#C8A96A] text-[8px] font-bold px-2 py-0.5 uppercase tracking-wider block mt-1 w-fit">
                                {app.role}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#6B6257]">{app.detail}</span>
                          </div>

                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleReject(app.id)}
                              className="rounded-full border border-rose-300 text-rose-600 px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest hover:bg-rose-50"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(app.id)}
                              className="rounded-full bg-[#1D1A16] text-white px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest hover:bg-[#C8A96A] transition-colors"
                            >
                              Approve & Verify
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="Approvals queue clear"
                      description="There are currently no pending verification requests. All model and agency listings are fully processed."
                    />
                  )}
                </div>

                {/* Marketplace Moderation Box */}
                <div className="lg:col-span-5 rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-6">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3 flex items-center gap-2">
                    <AlertCircle className="h-4.5 w-4.5 text-[#C8A96A]" />
                    <span>Service Moderation ({services.length})</span>
                  </h3>

                  {services.length > 0 ? (
                    <div className="space-y-4">
                      {services.map((s) => (
                        <div key={s.id} className="rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/30 p-4 space-y-2">
                          <div>
                            <h4 className="text-xs font-bold text-[#1D1A16] uppercase">{s.title}</h4>
                            <span className="text-[9px] text-[#6B6257] block mt-0.5">By {s.provider} in {s.location}</span>
                          </div>
                          
                          <button
                            onClick={() => handleModerateService(s.id)}
                            className="w-full rounded-full bg-[#1D1A16] text-white py-2 text-[9px] font-bold uppercase tracking-widest hover:bg-[#C8A96A] transition-colors"
                          >
                            Approve Listing
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No listings to moderate"
                      description="Marketplace creative service directories are clean and moderated."
                    />
                  )}
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
