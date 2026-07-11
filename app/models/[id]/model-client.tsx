"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ReviewStars from "@/components/review-stars"
import EmptyState from "@/components/empty-state"
import Image from "next/image"
import { MapPin, Loader2, X, Copy, Check, CheckCircle, Shield, Send, ExternalLink, Building, AlertCircle } from "lucide-react"
import Link from "next/link"
import { generateModelAltText, getCloudinaryBlurUrl } from "@/lib/images"
import { imageObjectSchema } from "@/lib/seo"

interface PortfolioMedia {
  id: string
  url: string
  mediaType: string
  altText: string | null
  sortOrder: number
  isCover: boolean
}

interface DBModel {
  id: string
  category: string
  height: number
  waist: number | null
  hips: number | null
  chest: number | null
  shoeSize: number | null
  eyeColor: string | null
  hairColor: string | null
  isVerified: boolean
  isAvailable: boolean
  profileImageUrl: string | null
  viewsCount: number
  professionalName: string | null
  nationality: string | null
  languages: string[]
  representationStatus: string | null
  travelAvailability: string | null
  categories: string[]
  experienceLevel: string | null
  bio: string | null
  notableCredits: string | null
  skills: string[]
  bustCm: number | null
  chestCm: number | null
  waistCm: number | null
  hipsCm: number | null
  inseamCm: number | null
  shoeSizeSystem: string | null
  dressSize: string | null
  jacketSize: string | null
  shirtSize: string | null
  trouserSize: string | null
  topSize: string | null
  bottomSize: string | null
  profileStatus: string
  user: {
    name: string; email: string
    profile: { bio: string | null; location: string | null; avatarUrl: string | null } | null
  }
  agency: { name: string; logoUrl: string | null; isVerified: boolean } | null
  reviews: { id: string; authorName: string; rating: number; comment: string; createdAt: string }[]
  portfolioMedia: PortfolioMedia[]
}

export default function ModelProfileClient({ id }: { id: string }) {
  const [dbModel, setDbModel] = useState<DBModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const copyProfileLink = () => {
    const url = `${window.location.origin}/models/${id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const [senderName, setSenderName] = useState("")
  const [senderEmail, setSenderEmail] = useState("")
  const [senderPhone, setSenderPhone] = useState("")
  const [bookingDate, setBookingDate] = useState("")
  const [bookingNotes, setBookingNotes] = useState("")
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchModel() {
      try {
        const res = await fetch(`/api/models/${id}`)
        if (res.ok) { const d = await res.json(); setDbModel(d.model) }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchModel()
  }, [id])

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookingLoading(true)
    setBookingError(null)
    try {
      const res = await fetch(`/api/models/${id}/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderName, senderEmail, senderPhone: senderPhone || undefined, preferredDate: bookingDate, notes: bookingNotes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send inquiry")
      setBookingSuccess(true)
      setTimeout(() => { setBookingSuccess(false); setShowBookingModal(false); setSenderName(""); setSenderEmail(""); setSenderPhone(""); setBookingDate(""); setBookingNotes("") }, 2500)
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Failed to submit inquiry")
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-[#F8F5EF] py-24 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-[#6B6257]"><Loader2 className="h-5 w-5 animate-spin" /> Loading profile...</div>
        </main>
        <Footer />
      </>
    )
  }

  if (!dbModel) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-[#F8F5EF] py-24 flex items-center justify-center">
          <EmptyState title="Profile not found" description="This model portfolio does not exist or has been archived." />
        </main>
        <Footer />
      </>
    )
  }

  const name = dbModel.user.name
  const professionalName = dbModel.professionalName || name
  const categories = dbModel.categories?.length ? dbModel.categories : [dbModel.category || "Runway"]
  const location = dbModel.user.profile?.location || ""
  const agencyName = dbModel.agency?.name || "Independent"
  const agencyVerified = dbModel.agency?.isVerified ?? false
  const bio = dbModel.bio || dbModel.user.profile?.bio || ""
  const height = dbModel.height
  const isAvailable = dbModel.isAvailable ?? true
  const portfolioMedia = dbModel.portfolioMedia ?? []
  const portfolioImages = portfolioMedia.filter(m => m.mediaType === "IMAGE").sort((a, b) => a.sortOrder - b.sortOrder)
  const reviews = dbModel.reviews ?? []

  // Generate ImageObject JSON-LD for portfolio images
  const portfolioImageSchemas = portfolioImages.map((media, i) =>
    imageObjectSchema({
      url: media.url,
      caption: generateModelAltText(professionalName, categories, location, i),
      representativeOfPage: i === 0,
    })
  )

  const measurements: { label: string; value: string | null }[] = [
    { label: "Height", value: height ? `${height} cm` : null },
    ...(dbModel.bustCm ? [{ label: "Bust", value: `${dbModel.bustCm} cm` }] : []),
    ...(dbModel.chestCm ? [{ label: "Chest", value: `${dbModel.chestCm} cm` }] : []),
    ...(dbModel.waistCm ? [{ label: "Waist", value: `${dbModel.waistCm} cm` }] : []),
    ...(dbModel.hipsCm ? [{ label: "Hips", value: `${dbModel.hipsCm} cm` }] : []),
    ...(dbModel.inseamCm ? [{ label: "Inseam", value: `${dbModel.inseamCm} cm` }] : []),
    ...(dbModel.shoeSize ? [{ label: "Shoe", value: String(dbModel.shoeSize) }] : []),
    ...(dbModel.dressSize ? [{ label: "Dress", value: dbModel.dressSize }] : []),
    ...(dbModel.hairColor ? [{ label: "Hair", value: dbModel.hairColor }] : []),
    ...(dbModel.eyeColor ? [{ label: "Eyes", value: dbModel.eyeColor }] : []),
  ]
  const hasNoMeasurements = measurements.filter(m => m.value).length <= 1

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] min-h-screen">
        {/* Portfolio ImageObject JSON-LD */}
        {portfolioImageSchemas.map((schema, i) => (
          <script key={`img-ld-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        ))}
        <div className="relative h-[50vh] min-h-[420px] bg-[#1D1A16] overflow-hidden">
          {dbModel.profileImageUrl ? (
            <Image
              src={dbModel.profileImageUrl}
              alt={generateModelAltText(professionalName, categories, location)}
              fill
              sizes="100vw"
              priority
              placeholder={getCloudinaryBlurUrl(dbModel.profileImageUrl) ? "blur" : undefined}
              blurDataURL={getCloudinaryBlurUrl(dbModel.profileImageUrl)}
              className="object-cover object-center opacity-80"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1D1A16] to-[#2D2924]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A08]/95 via-[#0C0A08]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {categories.slice(0, 3).map((cat) => (
                  <span key={cat} className="rounded-full bg-[#C8A96A]/20 border border-[#C8A96A]/40 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#C8A96A]">{cat}</span>
                ))}
                <span className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${isAvailable ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                  {isAvailable ? "Available" : "Currently Booked"}
                </span>
              </div>
              <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white uppercase leading-tight">{professionalName}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/70">
                {location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#C8A96A]" /> {location}</span>}
                <span className="text-[#C8A96A] font-bold uppercase tracking-wider">Represented by {agencyName}</span>
                {agencyVerified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] bg-[#C8A96A]/10 px-2.5 py-0.5 rounded-full">
                    <Shield className="h-3 w-3" /> Verified Agency
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-5">
                <button onClick={() => setShowBookingModal(true)} className="inline-flex items-center gap-2 rounded-full bg-[#C8A96A] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#11100E] hover:bg-[#BCA062] transition-colors shadow-lg">
                  <Send className="h-3.5 w-3.5" /> Contact Agency
                </button>
                <button onClick={copyProfileLink} className={`inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${copied ? "bg-emerald-500/20 border-emerald-400 text-emerald-400" : "text-white hover:bg-white/10"}`}>
                  {copied ? <><Check className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Share</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-10">
              <section>
                <h2 className="font-serif text-xl font-bold text-[#1D1A16] uppercase tracking-widest mb-4">About</h2>
                <p className="text-sm text-[#6B6257] leading-relaxed">{bio || "Professional biography not yet provided."}</p>
              </section>
              {dbModel.skills?.length > 0 && (
                <section>
                  <h2 className="font-serif text-xl font-bold text-[#1D1A16] uppercase tracking-widest mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {dbModel.skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-[#F8F5EF] border border-[#E7DED1] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6B6257]">{skill}</span>
                    ))}
                  </div>
                </section>
              )}
              {dbModel.experienceLevel && (
                <section className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Experience:</span>
                  <span className="text-xs font-bold text-[#1D1A16]">{dbModel.experienceLevel}</span>
                  {dbModel.notableCredits && <span className="text-[10px] text-[#C8A96A] ml-2">— {dbModel.notableCredits}</span>}
                </section>
              )}
              {dbModel.languages?.length > 0 && (
                <section className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Languages:</span>
                  {dbModel.languages.map((lang) => (<span key={lang} className="text-xs text-[#1D1A16]">{lang}</span>))}
                  {dbModel.travelAvailability && <span className="text-[10px] text-[#C8A96A] ml-2">· {dbModel.travelAvailability}</span>}
                </section>
              )}
              <section>
                <h2 className="font-serif text-xl font-bold text-[#1D1A16] uppercase tracking-widest mb-6">Portfolio</h2>
                {portfolioImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {portfolioImages.map((media, i) => (
                      <button key={media.id} onClick={() => setLightboxIndex(i)} className="group aspect-[3/4] relative overflow-hidden rounded-xl border border-[#E7DED1] bg-white p-2 shadow-sm hover:shadow-lg transition-all duration-300">
                        <div className="relative w-full h-full overflow-hidden rounded-lg bg-[#E7DED1]/30">
                          <Image
                            src={media.url}
                            alt={generateModelAltText(professionalName, categories, location, i)}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            loading="lazy"
                            placeholder={getCloudinaryBlurUrl(media.url) ? "blur" : undefined}
                            blurDataURL={getCloudinaryBlurUrl(media.url)}
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#E7DED1] bg-white p-8 text-center">
                    <p className="text-xs text-[#6B6257]">Portfolio images will appear here once uploaded.</p>
                  </div>
                )}
              </section>
            </div>

            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white border border-[#E7DED1] rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3 mb-4">Measurements</h3>
                {hasNoMeasurements ? (
                  <p className="text-xs text-[#6B6257] italic">Details available through the representing agency.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {measurements.filter(m => m.value).map(({ label, value }) => (
                      <div key={label} className="space-y-1">
                        <span className="text-[9px] uppercase font-bold text-[#6B6257] tracking-wider block">{label}</span>
                        <span className="text-sm font-bold text-[#1D1A16]">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#F8F5EF] border border-[#E7DED1] rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3 mb-4">Agency</h3>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-[#C8A96A]" />
                    <span className="text-xs font-bold text-[#1D1A16]">{agencyName}</span>
                  </div>
                  {agencyVerified && <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><Shield className="h-2.5 w-2.5" /> Verified</span>}
                </div>
                <button onClick={() => setShowBookingModal(true)} className="w-full rounded-full bg-[#1D1A16] py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors mt-3 flex items-center justify-center gap-2">
                  <Send className="h-3 w-3" /> Contact Agency
                </button>
              </div>

              {reviews.length > 0 && (
                <div className="bg-white border border-[#E7DED1] rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3">Reviews</h3>
                  {reviews.map((r) => (
                    <div key={r.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1D1A16] uppercase">{r.authorName}</span>
                        <ReviewStars rating={r.rating} />
                      </div>
                      <p className="text-xs text-[#6B6257] leading-relaxed italic">&quot;{r.comment}&quot;</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {lightboxIndex !== null && portfolioImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 text-white/70 hover:text-white z-10"><X className="h-8 w-8" /></button>
          <div className="max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={portfolioImages[lightboxIndex].url}
              alt={generateModelAltText(professionalName, categories, location, lightboxIndex)}
              width={800}
              height={1200}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#F8F5EF] rounded-2xl border border-[#E7DED1] p-6 shadow-2xl">
            {bookingSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto rounded-full bg-emerald-100 p-3 text-emerald-600 w-fit"><CheckCircle className="h-8 w-8" /></div>
                <h4 className="font-serif text-base font-bold uppercase text-[#1D1A16]">Inquiry Sent!</h4>
                <p className="text-xs text-[#6B6257] uppercase tracking-wider">The agency has been notified.</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E7DED1]/70 pb-3 mb-2">
                  <h3 className="font-serif text-xl font-bold text-[#1D1A16] uppercase">Contact Agency</h3>
                  <button type="button" onClick={() => setShowBookingModal(false)} className="text-[#6B6257] hover:text-[#1D1A16]"><X className="h-5 w-5" /></button>
                </div>
                {bookingError && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600 flex items-start gap-2"><AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />{bookingError}</div>}
                <input type="text" required value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Your Name *" className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none focus:border-[#C8A96A]" />
                <input type="email" required value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="you@company.com *" className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none focus:border-[#C8A96A]" />
                <input type="tel" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} placeholder="+250 788 000 000" className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none focus:border-[#C8A96A]" />
                <input type="date" required value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none focus:border-[#C8A96A]" />
                <textarea rows={3} required value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)} placeholder="Project requirements..." className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none focus:border-[#C8A96A] resize-none" />
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowBookingModal(false)} className="rounded-full border border-[#E7DED1] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#6B6257] hover:bg-white">Cancel</button>
                  <button type="submit" disabled={bookingLoading} className="rounded-full bg-[#1D1A16] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] disabled:opacity-60 flex items-center gap-1.5">
                    {bookingLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Send Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
