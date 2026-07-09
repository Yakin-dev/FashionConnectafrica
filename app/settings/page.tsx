"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Save, Camera, User, Info } from "lucide-react"
import Image from "next/image"

export default function SettingsPage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Form fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login?callbackUrl=/settings")
      return
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/me")
        if (res.ok) {
          const data = await res.json()
          const u = data.user
          const p = data.profile
          setName(u?.name || "")
          setEmail(u?.email || "")
          setBio(p?.bio || "")
          setPhoneNumber(p?.phoneNumber || "")
          setLocation(p?.location || "")
          setWebsite(p?.website || "")
          setInstagramUrl(p?.instagramUrl || "")
        }
      } catch { /* silent */ }
      finally { setLoading(false) }
    }

    void fetchProfile()
  }, [user, authLoading, router])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPEG, PNG, WebP images are allowed")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")

      setAvatarPreview(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const body: Record<string, any> = { name, email, bio, phoneNumber, location, website, instagramUrl }
      if (avatarPreview) body.avatarUrl = avatarPreview

      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to save")
      }

      setSuccess(true)
      await refreshUser()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const currentAvatar = avatarPreview || user?.avatarUrl

  const inputClass =
    "w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/50 px-4 py-2.5 text-sm text-[#1D1A16] placeholder-[#9B9189] focus:outline-none focus:border-[#C8A96A] focus:bg-white transition-colors"
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-[#6B6257] mb-1.5 block"

  if (loading || authLoading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-[#F8F5EF] flex items-center justify-center py-20">
          <div className="flex items-center gap-2 text-[#6B6257]">
            <Loader2 className="h-5 w-5 animate-spin text-[#C8A96A]" />
            <span className="text-sm">Loading settings...</span>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Header */}
          <div>
            <h1 className="font-serif text-3xl font-bold uppercase text-[#1D1A16]">Settings</h1>
            <p className="text-sm text-[#6B6257] mt-1">Manage your profile and account information.</p>
          </div>

          {/* Avatar Section */}
          <div className="bg-white rounded-2xl border border-[#E7DED1] p-6 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-[#C8A96A]/40 bg-[#E7DED1] flex items-center justify-center">
                  {currentAvatar ? (
                    <Image src={currentAvatar} alt="Avatar" width={80} height={80} className="object-cover w-full h-full" />
                  ) : (
                    <User className="h-8 w-8 text-[#6B6257]" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-[#1D1A16] p-2.5 hover:bg-[#C8A96A] transition-colors shadow-md">
                  <Camera className="h-3.5 w-3.5 text-white" />
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
              <div>
                <p className="font-bold text-sm text-[#1D1A16]">{user?.name}</p>
                <p className="text-xs text-[#6B6257]">{user?.email}</p>
                <p className="text-[10px] text-[#C8A96A] font-bold uppercase mt-0.5">{user?.role?.replace(/_/g, " ") || ""}</p>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="bg-white rounded-2xl border border-[#E7DED1] p-6 shadow-sm space-y-5">
            <h2 className="font-serif text-base font-bold uppercase tracking-widest text-[#1D1A16] flex items-center gap-2 border-b border-[#E7DED1]/70 pb-3">
              <User className="h-4 w-4 text-[#C8A96A]" />
              Profile Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Your name" />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="email@example.com" />
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={inputClass} placeholder="+250 7XX XXX XXX" />
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="Kigali, Rwanda" />
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} placeholder="https://" />
              </div>
              <div>
                <label className={labelClass}>Instagram</label>
                <input type="text" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} className={inputClass} placeholder="@username or https://instagram.com/..." />
              </div>
            </div>

            <div>
              <label className={labelClass}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className={inputClass + " resize-none"}
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Account Info (read-only summary) */}
          <div className="bg-white rounded-2xl border border-[#E7DED1] p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-base font-bold uppercase tracking-widest text-[#1D1A16] flex items-center gap-2 border-b border-[#E7DED1]/70 pb-3">
              <Info className="h-4 w-4 text-[#C8A96A]" />
              Account Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257] block">Role</span>
                <span className="font-semibold text-[#1D1A16]">{user?.role?.replace(/_/g, " ") || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257] block">Status</span>
                <span className={`font-semibold ${user?.status === "ACTIVE" ? "text-emerald-600" : "text-amber-600"}`}>{user?.status || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257] block">User ID</span>
                <span className="text-[#6B6257] text-xs font-mono">{user?.id?.slice(0, 12)}...</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257] block">Onboarding</span>
                <span className="font-semibold text-[#1D1A16]">{user?.onboardingCompleted ? "Completed" : "Incomplete"}</span>
              </div>
            </div>
          </div>

          {/* Save / Errors */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-600">{error}</div>
          )}

          <div className="flex items-center justify-between">
            {success && (
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                <Save className="h-3.5 w-3.5" /> Saved successfully
              </span>
            )}
            <div className="flex-1" />
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-[#1D1A16] px-7 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors disabled:opacity-50"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4" /> Save Changes</>
              )}
            </button>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
