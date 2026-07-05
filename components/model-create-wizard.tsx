"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, UploadCloud, X, Check, Loader2,
  Image as ImageIcon, Shield, User, FileText, Ruler, Camera,
  AlertCircle, Eye, Save, Send,
} from "lucide-react";
import { validateMediaFile } from "@/lib/cloudinary";

// ─── Types ─────────────────────────────────────────────────────────
export interface WizardFormData {
  // Step 1 — Identity
  name: string;
  professionalName: string;
  gender: string;
  dateOfBirth: string;
  country: string;
  city: string;
  nationality: string;
  languages: string[];
  representationStatus: string;
  availability: string;
  travelAvailability: string;
  privateContactEmail: string;

  // Step 2 — Professional Profile
  categories: string[];
  experienceLevel: string;
  yearsExperience: string;
  bio: string;
  notableCredits: string;
  skills: string[];

  // Step 3 — Measurements
  heightCm: number;
  bustCm: string;
  chestCm: string;
  waistCm: string;
  hipsCm: string;
  inseamCm: string;
  shoeSize: string;
  shoeSizeSystem: string;
  dressSize: string;
  jacketSize: string;
  shirtSize: string;
  trouserSize: string;
  topSize: string;
  bottomSize: string;
  hairColor: string;
  eyeColor: string;

  // Step 4 — Portfolio
  portfolioMedia: Array<{ url: string; publicId: string; isCover: boolean; sortOrder: number }>;

  // Step 5 — Consent
  consentManage: boolean;
  consentDisplay: boolean;
  consentAccuracy: boolean;
}

const DEFAULT_FORM_DATA: WizardFormData = {
  name: "", professionalName: "", gender: "", dateOfBirth: "",
  country: "", city: "", nationality: "", languages: [],
  representationStatus: "", availability: "Available", travelAvailability: "",
  privateContactEmail: "",
  categories: [], experienceLevel: "", yearsExperience: "",
  bio: "", notableCredits: "", skills: [],
  heightCm: 170, bustCm: "", chestCm: "", waistCm: "", hipsCm: "",
  inseamCm: "", shoeSize: "", shoeSizeSystem: "EU",
  dressSize: "", jacketSize: "", shirtSize: "", trouserSize: "",
  topSize: "", bottomSize: "", hairColor: "", eyeColor: "",
  portfolioMedia: [],
  consentManage: false, consentDisplay: false, consentAccuracy: false,
};

// ─── Field Constants ───────────────────────────────────────────────
const GENDER_OPTIONS = ["Female", "Male", "Non-binary", "Prefer not to say", "Other"];
const LANGUAGE_OPTIONS = [
  "English", "French", "Kinyarwanda", "Swahili", "Arabic",
  "Portuguese", "Spanish", "German", "Italian", "Mandarin", "Japanese", "Other",
];
const REP_STATUS_OPTIONS = [
  { value: "Exclusive representation", label: "Exclusive representation" },
  { value: "Non-exclusive representation", label: "Non-exclusive representation" },
  { value: "Development talent", label: "Development talent" },
  { value: "Freelance talent represented by agency", label: "Freelance talent represented by agency" },
];
const AVAILABILITY_OPTIONS = [
  { value: "Available", label: "Available" },
  { value: "Limited availability", label: "Limited availability" },
  { value: "Booked", label: "Booked" },
  { value: "Temporarily unavailable", label: "Temporarily unavailable" },
];
const TRAVEL_OPTIONS = [
  { value: "Local only", label: "Local only" },
  { value: "Nationwide", label: "Nationwide" },
  { value: "East Africa", label: "East Africa" },
  { value: "International", label: "International" },
];
const CATEGORY_OPTIONS = [
  "Runway", "Editorial", "Commercial", "Beauty", "Bridal",
  "Fitness", "Lifestyle", "E-commerce", "Promotional",
  "Acting / screen talent", "Influencer / content creator", "Other",
];
const EXPERIENCE_OPTIONS = [
  { value: "New face", label: "New face" },
  { value: "Emerging", label: "Emerging" },
  { value: "Experienced", label: "Experienced" },
  { value: "Professional", label: "Professional" },
  { value: "International experience", label: "International experience" },
];
const YEARS_EXP_OPTIONS = [
  { value: "Less than 1 year", label: "Less than 1 year" },
  { value: "1-2 years", label: "1–2 years" },
  { value: "3-5 years", label: "3–5 years" },
  { value: "6+ years", label: "6+ years" },
];
const SKILL_OPTIONS = [
  "Catwalk", "Posing", "Editorial expression", "Commercial acting",
  "Dance", "Public speaking", "Fitness", "Styling", "Makeup", "Other",
];
const SHOE_SIZE_SYSTEMS = ["EU", "UK", "US"];
const HAIR_COLORS = ["Black", "Brown", "Dark brown", "Blonde", "Red", "Grey", "White", "Bald", "Other"];
const EYE_COLORS = ["Brown", "Dark brown", "Blue", "Green", "Hazel", "Grey", "Amber", "Other"];

// ─── Styling ───────────────────────────────────────────────────────
const inputClass =
  "w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF] px-4 py-3 text-sm text-[#1D1A16] placeholder-[#9B9189] focus:outline-none focus:border-[#C8A96A] focus:bg-white transition-colors";
const inputErrorClass =
  "w-full rounded-xl border border-red-400 bg-red-50 px-4 py-3 text-sm text-[#1D1A16] focus:outline-none focus:border-red-500 focus:bg-red-50 transition-colors";
const labelClass = "block text-xs font-bold uppercase tracking-widest text-[#6B6257] mb-1.5";
const errorClass = "text-xs text-red-500 mt-1";
const hintClass = "text-[10px] text-[#9B9189] mt-0.5";
const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const STEPS = [
  { num: 1, title: "Identity & Representation", icon: User },
  { num: 2, title: "Professional Profile", icon: FileText },
  { num: 3, title: "Measurements", icon: Ruler },
  { num: 4, title: "Portfolio Media", icon: Camera },
  { num: 5, title: "Consent & Publish", icon: Shield },
];

// ─── Reusable UI helpers ────────────────────────────────────────────
function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className={errorClass} role="alert">{error}</p>;
}

function InputField({
  value, onChange, label, placeholder, error, hint, type = "text", required, disabled,
}: {
  value: string; onChange: (v: string) => void; label: string;
  placeholder?: string; error?: string; hint?: string; type?: string;
  required?: boolean; disabled?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>{label}{required ? " *" : ""}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={error ? inputErrorClass : inputClass}
      />
      {hint && !error && <p className={hintClass}>{hint}</p>}
      <FieldError error={error} />
    </div>
  );
}

function NumberField({
  value, onChange, label, placeholder, error, hint, min, max, required,
}: {
  value: string; onChange: (v: string) => void; label: string;
  placeholder?: string; error?: string; hint?: string; min?: number; max?: number; required?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>{label}{required ? " *" : ""}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className={error ? inputErrorClass : inputClass}
      />
      {hint && !error && <p className={hintClass}>{hint}</p>}
      <FieldError error={error} />
    </div>
  );
}

function SelectField({
  value, onChange, label, options, error, placeholder, required,
}: {
  value: string; onChange: (v: string) => void; label: string;
  options: readonly { value: string; label: string }[];
  error?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>{label}{required ? " *" : ""}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? inputErrorClass : inputClass}
      >
        <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <FieldError error={error} />
    </div>
  );
}

function PillMultiSelect({
  selected, onChange, label, options, error, required,
}: {
  selected: string[]; onChange: (v: string[]) => void; label: string;
  options: readonly string[]; error?: string; required?: boolean;
}) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };

  return (
    <div>
      <label className={labelClass}>{label}{required ? " *" : ""}</label>
      <div className="flex flex-wrap gap-2 mt-1" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-colors ${
              selected.includes(opt)
                ? "bg-[#1D1A16] text-white border-[#1D1A16]"
                : "bg-[#F8F5EF] text-[#6B6257] border-[#E7DED1] hover:border-[#C8A96A]"
            }`}
            aria-pressed={selected.includes(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      <FieldError error={error} />
    </div>
  );
}

function TextAreaField({
  value, onChange, label, placeholder, error, hint, rows = 4, required,
}: {
  value: string; onChange: (v: string) => void; label: string;
  placeholder?: string; error?: string; hint?: string; rows?: number; required?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>{label}{required ? " *" : ""}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={error ? inputErrorClass : inputClass}
      />
      {hint && !error && <p className={hintClass}>{hint}</p>}
      <FieldError error={error} />
    </div>
  );
}

// ─── Media Uploader ────────────────────────────────────────────────
function MediaUploader({
  media, onChange,
}: {
  media: Array<{ url: string; publicId: string; isCover: boolean; sortOrder: number }>;
  onChange: (m: Array<{ url: string; publicId: string; isCover: boolean; sortOrder: number }>) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    const validation = validateMediaFile(file.name, file.size, ["image/jpeg", "image/png", "image/webp"]);
    if (!validation.valid) { setUploadError(validation.error ?? "Invalid file"); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "model-africa-portfolios");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      const isCover = media.length === 0; // first image = cover
      onChange([
        ...media,
        { url: data.url, publicId: data.publicId, isCover, sortOrder: media.length },
      ]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeMedia = (index: number) => {
    const updated = media.filter((_, i) => i !== index).map((m, i) => ({
      ...m,
      isCover: i === 0 && media[index]?.isCover ? true : m.isCover,
      sortOrder: i,
    }));
    // If we removed the cover, make the first one the cover
    if (media[index]?.isCover && updated.length > 0) {
      updated[0].isCover = true;
    }
    onChange(updated);
  };

  const setCover = (index: number) => {
    onChange(media.map((m, i) => ({ ...m, isCover: i === index })));
  };

  return (
    <div className="space-y-4">
      <label className={labelClass}>Portfolio Images *</label>
      <p className={hintClass}>Upload 1 profile/cover image and 4–12 portfolio images. JPEG, PNG, WebP up to 10MB each.</p>

      {/* Upload area */}
      <div className="rounded-2xl border border-dashed border-[#E7DED1] bg-white p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleUpload}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center gap-2 mx-auto text-[#6B6257] hover:text-[#C8A96A] transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-[#C8A96A]" />
              <span className="text-xs font-bold uppercase tracking-wider">Uploading...</span>
            </>
          ) : (
            <>
              <div className="rounded-full bg-[#F8F5EF] p-4">
                <UploadCloud className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Click to upload images</span>
            </>
          )}
        </button>
        {uploadError && <p className="text-[10px] text-red-500 mt-2">{uploadError}</p>}
      </div>

      {/* Image grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {media.map((m, i) => (
            <div key={i} className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-[#E7DED1] bg-[#F8F5EF]">
              <img src={m.url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
              {m.isCover && (
                <span className="absolute top-2 left-2 rounded-full bg-[#C8A96A] text-[8px] font-bold uppercase tracking-widest text-white px-2 py-0.5">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {!m.isCover && (
                  <button
                    type="button"
                    onClick={() => setCover(i)}
                    className="rounded-full bg-white/90 p-1.5 text-[10px] font-bold text-[#1D1A16] hover:bg-white"
                    title="Set as cover"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(i)}
                  className="rounded-full bg-red-500/90 p-1.5 text-white hover:bg-red-600"
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-[#6B6257]">
        {media.length} image{media.length !== 1 ? "s" : ""} uploaded
        {media.length > 0 && media.every((m) => !m.isCover) && " — click an image to set it as the cover"}
      </p>
    </div>
  );
}

// ─── Main Wizard Component ─────────────────────────────────────────
interface ModelCreateWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  verificationStatus?: string;
}

export default function ModelCreateWizard({ isOpen, onClose, onSuccess, verificationStatus = "PENDING_REVIEW" }: ModelCreateWizardProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardFormData>(DEFAULT_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveMode, setSaveMode] = useState<"draft" | "publish">("draft");

  const canPublish = verificationStatus === "APPROVED";

  const updateField = useCallback(<K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }, []);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setForm(DEFAULT_FORM_DATA);
      setErrors({});
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  // Unsaved changes warning
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (step > 1 || form.name || form.professionalName) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isOpen, step, form.name, form.professionalName]);

  // ─── Validation per step ─────────────────────────────────────
  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};
    const f = form;

    if (s === 1) {
      if (!f.name.trim()) newErrors.name = "Full legal name is required.";
      if (!f.professionalName.trim()) newErrors.professionalName = "Professional name is required.";
      if (!f.gender) newErrors.gender = "Gender identity is required.";
      if (!f.country.trim()) newErrors.country = "Country is required.";
      if (!f.city.trim()) newErrors.city = "City is required.";
      if (f.languages.length === 0) newErrors.languages = "Select at least one language.";
    }

    if (s === 2) {
      if (f.categories.length === 0) newErrors.categories = "Select at least one category.";
      if (!f.experienceLevel) newErrors.experienceLevel = "Experience level is required.";
      if (f.bio.length < 80) newErrors.bio = `Bio must be at least 80 characters (${80 - f.bio.length} more).`;
      if (f.bio.length > 900) newErrors.bio = "Bio must be 900 characters or fewer.";
    }

    if (s === 3) {
      if (!f.heightCm || f.heightCm < 50 || f.heightCm > 280) newErrors.heightCm = "Height must be between 50–280 cm.";
    }

    if (s === 4) {
      if (f.portfolioMedia.length === 0) newErrors.portfolioMedia = "Upload at least one profile image.";
    }

    if (s === 5) {
      if (!f.consentManage) newErrors.consentManage = "You must confirm authorization.";
      if (!f.consentDisplay) newErrors.consentDisplay = "You must confirm images may be displayed.";
      if (!f.consentAccuracy) newErrors.consentAccuracy = "You must confirm accuracy.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 5));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  // ─── Submit ──────────────────────────────────────────────────
  const handleSubmit = async (mode: "draft" | "publish") => {
    // Validate all steps
    for (let s = 1; s <= 5; s++) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSaveMode(mode);

    try {
      const body = {
        // Step 1
        name: form.name,
        professionalName: form.professionalName,
        email: form.privateContactEmail || undefined,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth || undefined,
        country: form.country,
        city: form.city,
        nationality: form.nationality || undefined,
        languages: form.languages,
        representationStatus: form.representationStatus || undefined,
        availability: form.availability,
        travelAvailability: form.travelAvailability || undefined,
        privateContactEmail: form.privateContactEmail || undefined,
        // Step 2
        categories: form.categories,
        experienceLevel: form.experienceLevel || undefined,
        yearsExperience: form.yearsExperience || undefined,
        bio: form.bio,
        notableCredits: form.notableCredits || undefined,
        skills: form.skills,
        // Step 3
        heightCm: form.heightCm,
        bustCm: form.bustCm ? parseFloat(form.bustCm) : undefined,
        chestCm: form.chestCm ? parseFloat(form.chestCm) : undefined,
        waistCm: form.waistCm ? parseFloat(form.waistCm) : undefined,
        hipsCm: form.hipsCm ? parseFloat(form.hipsCm) : undefined,
        inseamCm: form.inseamCm ? parseFloat(form.inseamCm) : undefined,
        shoeSize: form.shoeSize ? parseFloat(form.shoeSize) : undefined,
        shoeSizeSystem: form.shoeSizeSystem || undefined,
        dressSize: form.dressSize || undefined,
        jacketSize: form.jacketSize || undefined,
        shirtSize: form.shirtSize || undefined,
        trouserSize: form.trouserSize || undefined,
        topSize: form.topSize || undefined,
        bottomSize: form.bottomSize || undefined,
        hairColor: form.hairColor || undefined,
        eyeColor: form.eyeColor || undefined,
        isAvailable: form.availability === "Available",
        profileStatus: mode === "publish" ? "PUBLISHED" : "DRAFT",
        // Consent
        consentManage: true,
        consentDisplay: true,
        consentAccuracy: true,
      };

      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create model profile");

      // Upload portfolio media if any
      if (form.portfolioMedia.length > 0 && data.model?.id) {
        await Promise.all(
          form.portfolioMedia.map((media, i) =>
            fetch(`/api/models/${data.model.id}/media`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                url: media.url,
                publicId: media.publicId,
                mediaType: "IMAGE",
                sortOrder: i,
                isCover: i === 0,
              }),
            })
          )
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create model profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isGenderFemale = form.gender === "Female";
  const isGenderMale = form.gender === "Male";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="w-full max-w-3xl bg-[#F8F5EF] rounded-3xl border border-[#E7DED1] shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-white border-b border-[#E7DED1] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="font-serif text-lg font-bold uppercase text-[#1D1A16]">Create Model Profile</h2>
            <p className="text-[10px] text-[#6B6257] mt-0.5">Step {step} of 5 — {STEPS[step - 1]?.title}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-[#F8F5EF] text-[#6B6257] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[#E7DED1]">
          <div className="h-full bg-[#C8A96A] transition-all duration-400" style={{ width: `${(step / 5) * 100}%` }} />
        </div>

        {/* Step indicators */}
        <div className="px-6 pt-4 pb-2 flex items-center gap-0 overflow-x-auto">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <div key={s.num} className="flex items-center gap-0 min-w-0">
                <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  isActive ? "bg-[#1D1A16] text-white" : isDone ? "bg-emerald-100 text-emerald-700" : "text-[#6B6257]"
                }`}>
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{s.title}</span>
                </div>
                {s.num < 5 && <div className={`h-px w-6 mx-1 ${isDone ? "bg-emerald-300" : "bg-[#E7DED1]"}`} />}
              </div>
            );
          })}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-6 mt-3 rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Form body */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: Identity ──────────────────────────────── */}
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-4">
                <p className="text-[10px] text-[#9B9189] italic mb-2">Fields marked * are required. Private fields are never shown publicly.</p>
                <InputField value={form.name} onChange={(v) => updateField("name", v)} label="Full Legal Name" placeholder="e.g. Jean-Paul Mugisha" required error={errors.name} hint="Private — only visible to your agency." />
                <InputField value={form.professionalName} onChange={(v) => updateField("professionalName", v)} label="Professional / Stage Name" placeholder="e.g. JP Mugisha" required error={errors.professionalName} hint="This is the main public display name." />
                <SelectField value={form.gender} onChange={(v) => updateField("gender", v)} label="Gender Identity" options={GENDER_OPTIONS.map((g) => ({ value: g, label: g }))} required error={errors.gender} />
                <InputField value={form.dateOfBirth} onChange={(v) => updateField("dateOfBirth", v)} label="Date of Birth" type="date" hint="Private — not displayed publicly." />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField value={form.country} onChange={(v) => updateField("country", v)} label="Country" placeholder="e.g. Rwanda" required error={errors.country} />
                  <InputField value={form.city} onChange={(v) => updateField("city", v)} label="City / Current Location" placeholder="e.g. Kigali" required error={errors.city} />
                </div>
                <InputField value={form.nationality} onChange={(v) => updateField("nationality", v)} label="Nationality (optional)" placeholder="e.g. Rwandan" />
                <PillMultiSelect selected={form.languages} onChange={(v) => updateField("languages", v)} label="Languages Spoken" options={LANGUAGE_OPTIONS} required error={errors.languages} />
                <SelectField value={form.representationStatus} onChange={(v) => updateField("representationStatus", v)} label="Agency Representation Status" options={REP_STATUS_OPTIONS} placeholder="Select status" />
                <SelectField value={form.availability} onChange={(v) => updateField("availability", v)} label="Current Availability" options={AVAILABILITY_OPTIONS} required />
                <SelectField value={form.travelAvailability} onChange={(v) => updateField("travelAvailability", v)} label="Willing to Travel" options={TRAVEL_OPTIONS} placeholder="Select travel willingness" />
                <InputField value={form.privateContactEmail} onChange={(v) => updateField("privateContactEmail", v)} label="Private Model Contact Email (optional)" type="email" placeholder="model@example.com" hint="Not displayed publicly. Do not require it." />
              </motion.div>
            )}

            {/* ── STEP 2: Professional Profile ──────────────────── */}
            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-4">
                <PillMultiSelect selected={form.categories} onChange={(v) => updateField("categories", v)} label="Main Modelling Categories" options={CATEGORY_OPTIONS} required error={errors.categories} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField value={form.experienceLevel} onChange={(v) => updateField("experienceLevel", v)} label="Experience Level" options={EXPERIENCE_OPTIONS} required error={errors.experienceLevel} />
                  <SelectField value={form.yearsExperience} onChange={(v) => updateField("yearsExperience", v)} label="Years of Experience" options={YEARS_EXP_OPTIONS} placeholder="Select" />
                </div>
                <TextAreaField value={form.bio} onChange={(v) => updateField("bio", v)} label="Professional Biography" placeholder="Describe the model's experience, style, runway history, campaigns, and unique qualities..." required error={errors.bio} hint={`Minimum 80 characters. Currently ${form.bio.length}/900.`} rows={5} />
                <TextAreaField value={form.notableCredits} onChange={(v) => updateField("notableCredits", v)} label="Notable Work or Credits (optional)" placeholder="e.g. Kigali Fashion Week 2024, Vogue Italia editorial, Brand X campaign" rows={3} />
                <PillMultiSelect selected={form.skills} onChange={(v) => updateField("skills", v)} label="Skills" options={SKILL_OPTIONS} />
              </motion.div>
            )}

            {/* ── STEP 3: Measurements ──────────────────────────── */}
            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-4">
                <p className="text-[10px] text-[#9B9189] italic mb-2">All measurements in centimetres unless noted. Missing fields are hidden from public view.</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <NumberField value={String(form.heightCm)} onChange={(v) => updateField("heightCm", parseFloat(v) || 0)} label="Height (cm)" required error={errors.heightCm} min={50} max={280} />
                  <NumberField value={form.shoeSize} onChange={(v) => updateField("shoeSize", v)} label="Shoe Size" />
                  <SelectField value={form.shoeSizeSystem} onChange={(v) => updateField("shoeSizeSystem", v)} label="Shoe Size System" options={SHOE_SIZE_SYSTEMS.map((s) => ({ value: s, label: s }))} />
                </div>

                <div className="border-t border-[#E7DED1]/50 pt-4 mt-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] mb-3">Body Measurements</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {/* Female-specific */}
                    {isGenderFemale && <NumberField value={form.bustCm} onChange={(v) => updateField("bustCm", v)} label="Bust (cm)" />}
                    {/* Male-specific */}
                    {isGenderMale && <NumberField value={form.chestCm} onChange={(v) => updateField("chestCm", v)} label="Chest (cm)" />}
                    {/* Both */}
                    {!isGenderFemale && !isGenderMale && (
                      <>
                        <NumberField value={form.bustCm} onChange={(v) => updateField("bustCm", v)} label="Bust / Chest (cm)" />
                      </>
                    )}
                    <NumberField value={form.waistCm} onChange={(v) => updateField("waistCm", v)} label="Waist (cm)" />
                    <NumberField value={form.hipsCm} onChange={(v) => updateField("hipsCm", v)} label="Hips (cm)" />
                    {isGenderMale && <NumberField value={form.inseamCm} onChange={(v) => updateField("inseamCm", v)} label="Inseam (cm)" />}
                  </div>
                </div>

                <div className="border-t border-[#E7DED1]/50 pt-4 mt-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] mb-3">Clothing Sizes</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {isGenderFemale && <InputField value={form.dressSize} onChange={(v) => updateField("dressSize", v)} label="Dress Size" placeholder="e.g. 6, 8, 10" />}
                    {isGenderFemale && <InputField value={form.topSize} onChange={(v) => updateField("topSize", v)} label="Top Size" placeholder="e.g. XS, S, M" />}
                    {isGenderFemale && <InputField value={form.bottomSize} onChange={(v) => updateField("bottomSize", v)} label="Bottom Size" placeholder="e.g. 6, 8, 10" />}
                    {isGenderMale && <InputField value={form.jacketSize} onChange={(v) => updateField("jacketSize", v)} label="Jacket Size" placeholder="e.g. 38, 40, 42" />}
                    {isGenderMale && <InputField value={form.shirtSize} onChange={(v) => updateField("shirtSize", v)} label="Shirt Size" placeholder="e.g. 15, 15.5, 16" />}
                    {isGenderMale && <InputField value={form.trouserSize} onChange={(v) => updateField("trouserSize", v)} label="Trouser Size" placeholder="e.g. 30, 32, 34" />}
                  </div>
                </div>

                <div className="border-t border-[#E7DED1]/50 pt-4 mt-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] mb-3">Appearance</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <SelectField value={form.hairColor} onChange={(v) => updateField("hairColor", v)} label="Hair Color" options={HAIR_COLORS.map((h) => ({ value: h, label: h }))} placeholder="Select" />
                    <SelectField value={form.eyeColor} onChange={(v) => updateField("eyeColor", v)} label="Eye Color" options={EYE_COLORS.map((e) => ({ value: e, label: e }))} placeholder="Select" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: Portfolio Media ────────────────────────── */}
            {step === 4 && (
              <motion.div key="step4" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-4">
                <MediaUploader
                  media={form.portfolioMedia}
                  onChange={(media) => setForm((prev) => ({ ...prev, portfolioMedia: media }))}
                />
                {errors.portfolioMedia && <p className={errorClass} role="alert">{errors.portfolioMedia}</p>}
              </motion.div>
            )}

            {/* ── STEP 5: Consent & Publish ──────────────────────── */}
            {step === 5 && (
              <motion.div key="step5" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5">
                <div className="rounded-2xl bg-white border border-[#E7DED1] p-5 space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A]">Required Confirmations</h4>
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.consentManage}
                      onChange={(e) => updateField("consentManage", e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[#E7DED1] text-[#1D1A16] focus:ring-[#C8A96A]"
                    />
                    <span className="text-xs text-[#6B6257] leading-relaxed">
                      I confirm that this agency has authorization to create and manage this model&apos;s profile.
                    </span>
                  </label>
                  {errors.consentManage && <p className={errorClass} style={{ marginLeft: "28px" }}>{errors.consentManage}</p>}

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.consentDisplay}
                      onChange={(e) => updateField("consentDisplay", e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[#E7DED1] text-[#1D1A16] focus:ring-[#C8A96A]"
                    />
                    <span className="text-xs text-[#6B6257] leading-relaxed">
                      I confirm that the images and portfolio content may be displayed on FashionConnectAfrica.
                    </span>
                  </label>
                  {errors.consentDisplay && <p className={errorClass} style={{ marginLeft: "28px" }}>{errors.consentDisplay}</p>}

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.consentAccuracy}
                      onChange={(e) => updateField("consentAccuracy", e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[#E7DED1] text-[#1D1A16] focus:ring-[#C8A96A]"
                    />
                    <span className="text-xs text-[#6B6257] leading-relaxed">
                      I confirm that the information provided is accurate to the best of the agency&apos;s knowledge.
                    </span>
                  </label>
                  {errors.consentAccuracy && <p className={errorClass} style={{ marginLeft: "28px" }}>{errors.consentAccuracy}</p>}
                </div>

                {/* Publishing info */}
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Profile Visibility
                  </p>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    New profiles default to <strong>Draft</strong>. Only published profiles appear publicly.
                  </p>
                  {!canPublish && (
                    <p className="text-xs text-amber-700 mt-1">
                      Your agency is <strong>{verificationStatus === "PENDING_REVIEW" ? "under review" : "not verified"}</strong>. You can save as draft now and publish once verified.
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="rounded-2xl bg-white border border-[#E7DED1] p-5">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] mb-3">Profile Summary</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><span className="text-[#6B6257]">Professional name:</span> <span className="font-bold text-[#1D1A16]">{form.professionalName || "—"}</span></div>
                    <div><span className="text-[#6B6257]">Gender:</span> <span className="font-bold text-[#1D1A16]">{form.gender || "—"}</span></div>
                    <div><span className="text-[#6B6257]">Categories:</span> <span className="font-bold text-[#1D1A16]">{form.categories.length} selected</span></div>
                    <div><span className="text-[#6B6257]">Height:</span> <span className="font-bold text-[#1D1A16]">{form.heightCm} cm</span></div>
                    <div><span className="text-[#6B6257]">Portfolio images:</span> <span className="font-bold text-[#1D1A16]">{form.portfolioMedia.length}</span></div>
                    <div><span className="text-[#6B6257]">Status:</span> <span className="font-bold text-[#1D1A16]">{saveMode === "publish" ? "PUBLISHED" : "DRAFT"}</span></div>
                  </div>
                </div>

                {/* Consent confirmation */}
                <p className="text-[10px] text-[#9B9189] italic">
                  Once saved, you can edit this profile anytime from the agency dashboard.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="border-t border-[#E7DED1] bg-white px-6 py-4 flex items-center justify-between sticky bottom-0">
          <button
            type="button"
            onClick={step === 1 ? onClose : goBack}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#6B6257] hover:text-[#1D1A16] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {step === 1 ? "Cancel" : "Back"}
          </button>

          <div className="flex items-center gap-3">
            {step === 5 ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSubmit("draft")}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-full border border-[#E7DED1] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#6B6257] hover:bg-[#F8F5EF] transition-colors disabled:opacity-50"
                >
                  {loading && saveMode === "draft" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save as Draft
                </button>
                {canPublish && (
                  <button
                    type="button"
                    onClick={() => handleSubmit("publish")}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-full bg-[#1D1A16] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors disabled:opacity-50"
                  >
                    {loading && saveMode === "publish" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Publish Profile
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-1.5 rounded-full bg-[#1D1A16] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors"
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
