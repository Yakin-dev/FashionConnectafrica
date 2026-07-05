"use client"

import { UseFormRegister, UseFormSetValue, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  agencySchema, clientSchema, eventOrganizerSchema,
  photographerSchema, designerSchema, studioSchema,
  makeupArtistSchema, fashionStylistSchema, hairStylistSchema, videographerSchema,
  calculateOperationMonths, getAgencyAgeError, MIN_AGENCY_OPERATION_MONTHS,
  FIELD_OPTIONS,
  type AgencyFormData, type ClientFormData,
  type EventOrganizerFormData, type PhotographerFormData,
  type DesignerFormData, type StudioFormData,
  type MakeupArtistFormData, type FashionStylistFormData,
  type HairStylistFormData, type VideographerFormData,
} from "@/lib/onboarding-schemas"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

// ─── Shared UI ─────────────────────────────────────────────────────────
const inputClass =
  "w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF] px-4 py-3 text-sm text-[#1D1A16] placeholder-[#9B9189] focus:outline-none focus:border-[#C8A96A] focus:bg-white transition-colors"
const inputErrorClass =
  "w-full rounded-xl border border-red-400 bg-red-50 px-4 py-3 text-sm text-[#1D1A16] placeholder-[#9B9189] focus:outline-none focus:border-red-500 focus:bg-red-50 transition-colors"
const labelClass = "block text-xs font-bold uppercase tracking-widest text-[#6B6257] mb-1.5"
const errorClass = "text-xs text-red-500 mt-1"
const hintClass = "text-[10px] text-[#9B9189] mt-0.5"

function FieldError({ error }: { error?: string }) {
  if (!error) return null
  return <p className={errorClass} role="alert">{error}</p>
}

function TextField({
  register, name, label, placeholder, required, error, hint, type = "text",
}: {
  register: UseFormRegister<any>
  name: string
  label: string
  placeholder?: string
  required?: boolean
  error?: string
  hint?: string
  type?: string
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}{required ? " *" : ""}
      </label>
      <input
        id={name}
        type={type}
        {...register(name)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={error ? inputErrorClass : inputClass}
      />
      {hint && !error && <p className={hintClass}>{hint}</p>}
      {error && <p id={`${name}-error`} className={errorClass} role="alert">{error}</p>}
    </div>
  )
}

function SelectField({
  register, name, label, options, required, error, placeholder,
}: {
  register: UseFormRegister<any>
  name: string
  label: string
  options: readonly { value: string; label: string }[]
  required?: boolean
  error?: string
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}{required ? " *" : ""}
      </label>
      <select
        id={name}
        {...register(name)}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={error ? inputErrorClass : inputClass}
      >
        <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p id={`${name}-error`} className={errorClass} role="alert">{error}</p>}
    </div>
  )
}

function MultiSelectField({
  name, label, options, selected, setValue, error, required,
}: {
  name: string
  label: string
  options: readonly string[]
  selected: string[]
  setValue: UseFormSetValue<any>
  error?: string
  required?: boolean
}) {
  const toggle = (opt: string) => {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt]
    setValue(name, next, { shouldValidate: true })
  }

  return (
    <div>
      <label className={labelClass}>
        {label}{required ? " *" : ""}
      </label>
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
      {error && <p className={errorClass} role="alert">{error}</p>}
    </div>
  )
}

function TextAreaField({
  register, name, label, placeholder, required, error, hint, minLength,
}: {
  register: UseFormRegister<any>
  name: string
  label: string
  placeholder?: string
  required?: boolean
  error?: string
  hint?: string
  minLength?: number
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}{required ? " *" : ""}
      </label>
      <textarea
        id={name}
        {...register(name)}
        placeholder={placeholder}
        rows={4}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={error ? inputErrorClass : inputClass}
      />
      {hint && !error && <p className={hintClass}>{hint}</p>}
      {error && <p id={`${name}-error`} className={errorClass} role="alert">{error}</p>}
    </div>
  )
}

function CheckboxField({
  register, name, label, error,
}: {
  register: UseFormRegister<any>
  name: string
  label: string
  error?: string
}) {
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          {...register(name)}
          className="mt-0.5 h-4 w-4 rounded border-[#E7DED1] text-[#1D1A16] focus:ring-[#C8A96A]"
          aria-invalid={!!error}
        />
        <span className="text-xs text-[#6B6257] leading-relaxed">{label}</span>
      </label>
      {error && <p className={errorClass} role="alert" style={{ marginLeft: "1.75rem" }}>{error}</p>}
    </div>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/50 px-4 py-3 text-sm text-[#6B6257]">
        {value}
      </div>
    </div>
  )
}

// ─── Year dropdown options ─────────────────────────────────────────────
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => ({
  value: String(1990 + i),
  label: String(1990 + i),
}))

// ─── Role-specific slide variants ───────────────────────────────────────
const slideVariants = {
  enter: { opacity: 0, x: 32 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -32 },
}

// ═══════════════════════════════════════════════════════════════════════
// AGENCY FORM
// ═══════════════════════════════════════════════════════════════════════
export function AgencyForm({
  onBack, onSuccess, formData,
}: {
  onBack: () => void
  onSuccess: (data: AgencyFormData) => void
  formData?: Record<string, any>
}) {
  const {
    register, handleSubmit, formState: { errors }, setValue, watch,
  } = useForm<AgencyFormData>({
    resolver: zodResolver(agencySchema),
    defaultValues: formData as any || {},
  })

  const establishedYear = watch("establishedYear")
  const registrationStatus = watch("registrationStatus")

  const operationMonths = establishedYear ? calculateOperationMonths(establishedYear) : 0
  const yearsOp = establishedYear ? Math.floor(operationMonths / 12) : 0
  const monthsOp = establishedYear ? operationMonths % 12 : 0
  const ageError = establishedYear ? getAgencyAgeError(operationMonths) : null

  const needsRegNumber = registrationStatus && registrationStatus !== "Not yet formally registered"

  const onSubmit = (data: AgencyFormData) => {
    if (ageError) return
    onSuccess(data)
  }

  return (
    <motion.div
      key="agency-form"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="font-serif text-xl font-bold text-center uppercase mb-1">Agency Verification Details</h2>
      <p className="text-sm text-[#6B6257] text-center mb-2">
        Help us verify your agency and set up your talent-management workspace.
      </p>
      <p className="text-[10px] text-[#9B9189] text-center mb-6 italic">
        Your details are reviewed to help maintain a trusted professional fashion network.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextField register={register} name="legalName" label="Agency Legal/Business Name" placeholder="e.g. Kigali Elite Models" required error={errors.legalName?.message} />
        <TextField register={register} name="publicName" label="Public Agency Name (if different)" placeholder="e.g. Elite Models Rwanda" />

        <SelectField register={register} name="establishedYear" label="Year Established" options={yearOptions} required error={errors.establishedYear?.message} placeholder="Select year" />

        {establishedYear && (
          <ReadOnlyField
            label="Months/Years in Operation"
            value={`${yearsOp} year${yearsOp !== 1 ? "s" : ""}, ${monthsOp} month${monthsOp !== 1 ? "s" : ""}`}
          />
        )}

        {ageError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3.5">
            <p className="text-xs text-red-600 leading-relaxed">{ageError}</p>
          </div>
        )}

        <SelectField
          register={register} name="registrationStatus" label="Business Registration Status"
          options={FIELD_OPTIONS.registrationStatus} required error={errors.registrationStatus?.message}
        />

        {needsRegNumber && (
          <TextField
            register={register} name="registrationNumber" label="Business Registration Number / Company Code"
            placeholder="e.g. RBD-2024-12345" required error={errors.registrationNumber?.message}
          />
        )}

        <TextField register={register} name="country" label="Country" placeholder="e.g. Rwanda" required error={errors.country?.message} />
        <TextField register={register} name="city" label="City / Operating Location" placeholder="e.g. Kigali" required error={errors.city?.message} />
        <TextField register={register} name="address" label="Registered Business Address" placeholder="e.g. KG 123 St, Kigali" required error={errors.address?.message} />
        <TextField register={register} name="email" label="Official Business Email" type="email" placeholder="contact@agency.rw" required error={errors.email?.message} hint="Use a business email, not a personal one." />
        <TextField register={register} name="phone" label="Official Business Phone Number" placeholder="+250 788 000 000" required error={errors.phone?.message} hint="Include country code." />
        <TextField register={register} name="websiteUrl" label="Agency Website or Professional Link" placeholder="https://" hint="Website, Instagram, LinkedIn, or portfolio page." />
        <TextField register={register} name="instagramUrl" label="Agency Instagram Handle or Portfolio URL" placeholder="@your_agency or https://instagram.com/..." required error={errors.instagramUrl?.message} />

        <SelectField
          register={register} name="representedModelCount" label="Approximate Number of Represented Models"
          options={FIELD_OPTIONS.representedModelCount} required error={errors.representedModelCount?.message}
        />

        <MultiSelectField
          name="talentCategories" label="Main Talent Categories Managed"
          options={FIELD_OPTIONS.talentCategories}
          selected={watch("talentCategories") || []}
          setValue={setValue}
          error={errors.talentCategories?.message}
          required
        />

        <MultiSelectField
          name="agencyServices" label="Primary Services Offered"
          options={FIELD_OPTIONS.agencyServices}
          selected={watch("agencyServices") || []}
          setValue={setValue}
          error={errors.agencyServices?.message}
          required
        />

        <TextAreaField
          register={register} name="description" label="Agency Description"
          placeholder="Describe your agency, your history, and the types of models and clients you work with..."
          required error={errors.description?.message}
          hint="Minimum 80 characters."
        />

        <TextField register={register} name="contactPersonName" label="Contact Person Full Name" placeholder="e.g. Jean-Paul Kagame" required error={errors.contactPersonName?.message} />

        <SelectField
          register={register} name="contactPersonRole" label="Contact Person Role"
          options={FIELD_OPTIONS.contactRoles} required error={errors.contactPersonRole?.message}
        />

        <CheckboxField
          register={register} name="confirmation" label="I confirm that I am authorized to represent this agency and the details provided are accurate."
          error={errors.confirmation?.message}
        />

        <div className="flex justify-between pt-4">
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-[#6B6257] hover:text-[#1D1A16] font-semibold text-sm uppercase tracking-wider transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            type="submit"
            disabled={!!ageError}
            className="flex items-center gap-2 bg-[#1D1A16] hover:bg-[#C8A96A] text-white px-7 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </form>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// CLIENT / BRAND FORM
// ═══════════════════════════════════════════════════════════════════════
export function ClientForm({
  onBack, onSuccess, formData,
}: {
  onBack: () => void
  onSuccess: (data: ClientFormData) => void
  formData?: Record<string, any>
}) {
  const {
    register, handleSubmit, formState: { errors }, setValue, watch,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: formData as any || {},
  })

  return (
    <motion.div
      key="client-form"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="font-serif text-xl font-bold text-center uppercase mb-1">Client or Brand Details</h2>
      <p className="text-sm text-[#6B6257] text-center mb-2">
        Tell us what your business is looking for so we can prepare your hiring and casting workspace.
      </p>
      <p className="text-[10px] text-[#9B9189] text-center mb-6 italic">
        Your details are reviewed to help maintain a trusted professional fashion network.
      </p>

      <form onSubmit={handleSubmit(onSuccess)} className="space-y-4" noValidate>
        <TextField register={register} name="companyName" label="Company or Brand Name" placeholder="e.g. Rwanda Fashion House" required error={errors.companyName?.message} />
        <SelectField register={register} name="businessType" label="Business Type" options={FIELD_OPTIONS.clientBusinessTypes} required error={errors.businessType?.message} />
        <TextField register={register} name="country" label="Country" placeholder="e.g. Rwanda" required error={errors.country?.message} />
        <TextField register={register} name="city" label="City" placeholder="e.g. Kigali" required error={errors.city?.message} />
        <TextField register={register} name="email" label="Official Email" type="email" placeholder="hello@brand.rw" required error={errors.email?.message} />
        <TextField register={register} name="phone" label="Phone Number" placeholder="+250 788 000 000" required error={errors.phone?.message} />
        <TextField register={register} name="websiteUrl" label="Website or Professional Social-Media Link" placeholder="https://" required error={errors.websiteUrl?.message} />
        
        <MultiSelectField
          name="mainPurpose" label="Main Purpose on FashionConnectAfrica"
          options={FIELD_OPTIONS.clientPurposes}
          selected={watch("mainPurpose") || []}
          setValue={setValue}
          error={errors.mainPurpose?.message}
          required
        />

        <MultiSelectField
          name="projectTypes" label="Typical Project Type"
          options={FIELD_OPTIONS.projectTypes}
          selected={watch("projectTypes") || []}
          setValue={setValue}
          error={errors.projectTypes?.message}
          required
        />

        <SelectField register={register} name="hiringFrequency" label="Estimated Hiring Frequency" options={FIELD_OPTIONS.hiringFrequencies} required error={errors.hiringFrequency?.message} />
        <TextField register={register} name="contactPersonName" label="Contact Person Full Name" placeholder="e.g. Alice Mukamana" required error={errors.contactPersonName?.message} />
        <TextField register={register} name="contactPersonRole" label="Contact Person Job Title" placeholder="e.g. Marketing Director" required error={errors.contactPersonRole?.message} />

        <TextAreaField
          register={register} name="description" label="Short Company/Project Description"
          placeholder="Describe your company and the type of fashion projects you work on..."
          required error={errors.description?.message}
          hint="Minimum 50 characters."
        />

        <CheckboxField
          register={register} name="confirmation" label="I confirm that I am authorized to act for this company or client account."
          error={errors.confirmation?.message}
        />

        <div className="flex justify-between pt-4">
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-[#6B6257] hover:text-[#1D1A16] font-semibold text-sm uppercase tracking-wider transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button type="submit" className="flex items-center gap-2 bg-[#1D1A16] hover:bg-[#C8A96A] text-white px-7 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-colors shadow-lg">
            Continue
          </button>
        </div>
      </form>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// EVENT ORGANIZER FORM
// ═══════════════════════════════════════════════════════════════════════
export function EventOrganizerForm({
  onBack, onSuccess, formData,
}: {
  onBack: () => void
  onSuccess: (data: EventOrganizerFormData) => void
  formData?: Record<string, any>
}) {
  const {
    register, handleSubmit, formState: { errors }, setValue, watch,
  } = useForm<EventOrganizerFormData>({
    resolver: zodResolver(eventOrganizerSchema),
    defaultValues: formData as any || {},
  })

  return (
    <motion.div
      key="event-form"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="font-serif text-xl font-bold text-center uppercase mb-1">Event Organizer Details</h2>
      <p className="text-sm text-[#6B6257] text-center mb-2">
        Help us prepare your workspace for sourcing agencies, talent, and fashion services for events.
      </p>
      <p className="text-[10px] text-[#9B9189] text-center mb-6 italic">
        Your details are reviewed to help maintain a trusted professional fashion network.
      </p>

      <form onSubmit={handleSubmit(onSuccess)} className="space-y-4" noValidate>
        <TextField register={register} name="organizationName" label="Organization or Event Company Name" placeholder="e.g. Kigali Fashion Week" required error={errors.organizationName?.message} />
        <SelectField register={register} name="organizerType" label="Organizer Type" options={FIELD_OPTIONS.organizerTypes} required error={errors.organizerType?.message} />
        <TextField register={register} name="country" label="Country" placeholder="e.g. Rwanda" required error={errors.country?.message} />
        <TextField register={register} name="city" label="City" placeholder="e.g. Kigali" required error={errors.city?.message} />
        <TextField register={register} name="email" label="Official Email" type="email" placeholder="info@event.rw" required error={errors.email?.message} />
        <TextField register={register} name="phone" label="Phone Number" placeholder="+250 788 000 000" required error={errors.phone?.message} />
        <TextField register={register} name="websiteUrl" label="Website or Professional Social-Media Link" placeholder="https://" />
        
        <SelectField register={register} name="eventScale" label="Event Scale" options={FIELD_OPTIONS.eventScales} required error={errors.eventScale?.message} />
        <SelectField register={register} name="eventFrequency" label="Typical Event Frequency" options={FIELD_OPTIONS.eventFrequencies} required error={errors.eventFrequency?.message} />

        <MultiSelectField
          name="requiredServices" label="Services Usually Required"
          options={FIELD_OPTIONS.requiredServices}
          selected={watch("requiredServices") || []}
          setValue={setValue}
          error={errors.requiredServices?.message}
          required
        />

        <TextField register={register} name="nextEventDate" label="Next Expected Event Date (optional)" type="date" />

        <TextAreaField
          register={register} name="description" label="Organization Description"
          placeholder="Describe your organization, past events, and what you do..."
          required error={errors.description?.message}
          hint="Minimum 60 characters."
        />

        <TextField register={register} name="contactPersonName" label="Contact Person Full Name" placeholder="e.g. Patrick Uwimana" required error={errors.contactPersonName?.message} />
        <TextField register={register} name="contactPersonRole" label="Contact Person Role/Title" placeholder="e.g. Event Director" required error={errors.contactPersonRole?.message} />

        <CheckboxField
          register={register} name="confirmation" label="I confirm that I am authorized to create opportunities on behalf of this organization."
          error={errors.confirmation?.message}
        />

        <div className="flex justify-between pt-4">
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-[#6B6257] hover:text-[#1D1A16] font-semibold text-sm uppercase tracking-wider transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button type="submit" className="flex items-center gap-2 bg-[#1D1A16] hover:bg-[#C8A96A] text-white px-7 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-colors shadow-lg">
            Continue
          </button>
        </div>
      </form>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// PHOTOGRAPHER FORM
// ═══════════════════════════════════════════════════════════════════════
export function PhotographerForm({
  onBack, onSuccess, formData,
}: {
  onBack: () => void
  onSuccess: (data: PhotographerFormData) => void
  formData?: Record<string, any>
}) {
  const {
    register, handleSubmit, formState: { errors }, setValue, watch,
  } = useForm<PhotographerFormData>({
    resolver: zodResolver(photographerSchema),
    defaultValues: formData as any || {},
  })

  return (
    <motion.div
      key="photographer-form"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="font-serif text-xl font-bold text-center uppercase mb-1">Photographer Business Details</h2>
      <p className="text-sm text-[#6B6257] text-center mb-2">
        Create a professional photography listing for agencies, brands, and event organizers.
      </p>
      <p className="text-[10px] text-[#9B9189] text-center mb-6 italic">
        Your details are reviewed to help maintain a trusted professional fashion network.
      </p>

      <form onSubmit={handleSubmit(onSuccess)} className="space-y-4" noValidate>
        <TextField register={register} name="businessName" label="Photographer Name or Studio Name" placeholder="e.g. Kwame Photography" required error={errors.businessName?.message} />
        <SelectField register={register} name="businessType" label="Business Type" options={FIELD_OPTIONS.photographerBusinessTypes} required error={errors.businessType?.message} />
        <TextField register={register} name="country" label="Country" placeholder="e.g. Rwanda" required error={errors.country?.message} />
        <TextField register={register} name="city" label="City" placeholder="e.g. Kigali" required error={errors.city?.message} />
        <TextField register={register} name="email" label="Business Email" type="email" placeholder="hello@kwamephoto.com" required error={errors.email?.message} />
        <TextField register={register} name="phone" label="Phone Number" placeholder="+250 788 000 000" required error={errors.phone?.message} />
        <TextField register={register} name="portfolioUrl" label="Portfolio URL" placeholder="https://instagram.com/... or https://behance.net/..." required error={errors.portfolioUrl?.message} hint="Website, Instagram, Behance, Flickr, or Google Drive portfolio link." />

        <MultiSelectField
          name="specialties" label="Photography Specialties"
          options={FIELD_OPTIONS.photographySpecialties}
          selected={watch("specialties") || []}
          setValue={setValue}
          error={errors.specialties?.message}
          required
        />

        <SelectField register={register} name="experienceLevel" label="Years of Professional Experience" options={FIELD_OPTIONS.experienceLevels} required error={errors.experienceLevel?.message} />
        <SelectField register={register} name="serviceArea" label="Typical Service Area" options={FIELD_OPTIONS.serviceAreas} required error={errors.serviceArea?.message} />
        <SelectField register={register} name="startingPriceRange" label="Starting Price Range (optional)" options={FIELD_OPTIONS.priceRanges} />

        <TextAreaField
          register={register} name="description" label="Short Professional Bio"
          placeholder="Describe your photography experience, style, and notable clients or projects..."
          required error={errors.description?.message}
          hint="Minimum 60 characters."
        />

        <CheckboxField
          register={register} name="confirmation" label="I confirm that the portfolio and business information belong to me or my authorized studio."
          error={errors.confirmation?.message}
        />

        <div className="flex justify-between pt-4">
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-[#6B6257] hover:text-[#1D1A16] font-semibold text-sm uppercase tracking-wider transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button type="submit" className="flex items-center gap-2 bg-[#1D1A16] hover:bg-[#C8A96A] text-white px-7 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-colors shadow-lg">
            Continue
          </button>
        </div>
      </form>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// FASHION DESIGNER FORM
// ═══════════════════════════════════════════════════════════════════════
export function DesignerForm({
  onBack, onSuccess, formData,
}: {
  onBack: () => void
  onSuccess: (data: DesignerFormData) => void
  formData?: Record<string, any>
}) {
  const {
    register, handleSubmit, formState: { errors }, setValue, watch,
  } = useForm<DesignerFormData>({
    resolver: zodResolver(designerSchema),
    defaultValues: formData as any || {},
  })

  return (
    <motion.div
      key="designer-form"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="font-serif text-xl font-bold text-center uppercase mb-1">Fashion Designer Details</h2>
      <p className="text-sm text-[#6B6257] text-center mb-2">
        Set up your designer profile so agencies, clients, and organizers can discover your work.
      </p>
      <p className="text-[10px] text-[#9B9189] text-center mb-6 italic">
        Your details are reviewed to help maintain a trusted professional fashion network.
      </p>

      <form onSubmit={handleSubmit(onSuccess)} className="space-y-4" noValidate>
        <TextField register={register} name="brandName" label="Designer Name or Label / Brand Name" placeholder="e.g. Keza Couture" required error={errors.brandName?.message} />
        <SelectField register={register} name="businessType" label="Business Type" options={FIELD_OPTIONS.designerBusinessTypes} required error={errors.businessType?.message} />
        <TextField register={register} name="country" label="Country" placeholder="e.g. Rwanda" required error={errors.country?.message} />
        <TextField register={register} name="city" label="City" placeholder="e.g. Kigali" required error={errors.city?.message} />
        <TextField register={register} name="email" label="Business Email" type="email" placeholder="hello@kezacouture.com" required error={errors.email?.message} />
        <TextField register={register} name="phone" label="Phone Number" placeholder="+250 788 000 000" required error={errors.phone?.message} />
        <TextField register={register} name="websiteUrl" label="Website, Instagram, or Portfolio URL" placeholder="https://" required error={errors.websiteUrl?.message} />

        <MultiSelectField
          name="designFocus" label="Design Focus"
          options={FIELD_OPTIONS.designFocus}
          selected={watch("designFocus") || []}
          setValue={setValue}
          error={errors.designFocus?.message}
          required
        />

        <MultiSelectField
          name="servicesOffered" label="Services Offered"
          options={FIELD_OPTIONS.designServices}
          selected={watch("servicesOffered") || []}
          setValue={setValue}
          error={errors.servicesOffered?.message}
          required
        />

        <SelectField register={register} name="experienceLevel" label="Years of Professional Experience" options={FIELD_OPTIONS.experienceLevels} required error={errors.experienceLevel?.message} />
        <SelectField register={register} name="productionCapacity" label="Typical Production Capacity" options={FIELD_OPTIONS.productionCapacities} required error={errors.productionCapacity?.message} />

        <TextAreaField
          register={register} name="description" label="Short Brand Story"
          placeholder="Tell your brand story — your design philosophy, inspirations, and what makes your work unique..."
          required error={errors.description?.message}
          hint="Minimum 80 characters."
        />

        <CheckboxField
          register={register} name="confirmation" label="I confirm that I own or am authorized to represent this fashion label or design business."
          error={errors.confirmation?.message}
        />

        <div className="flex justify-between pt-4">
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-[#6B6257] hover:text-[#1D1A16] font-semibold text-sm uppercase tracking-wider transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button type="submit" className="flex items-center gap-2 bg-[#1D1A16] hover:bg-[#C8A96A] text-white px-7 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-colors shadow-lg">
            Continue
          </button>
        </div>
      </form>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// CONTENT STUDIO OWNER FORM
// ═══════════════════════════════════════════════════════════════════════
export function StudioForm({
  onBack, onSuccess, formData,
}: {
  onBack: () => void
  onSuccess: (data: StudioFormData) => void
  formData?: Record<string, any>
}) {
  const {
    register, handleSubmit, formState: { errors }, setValue, watch,
  } = useForm<StudioFormData>({
    resolver: zodResolver(studioSchema),
    defaultValues: formData as any || {},
  })

  return (
    <motion.div
      key="studio-form"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="font-serif text-xl font-bold text-center uppercase mb-1">Content Studio Details</h2>
      <p className="text-sm text-[#6B6257] text-center mb-2">
        Create a professional studio listing for fashion shoots, campaigns, lookbooks, and creative productions.
      </p>
      <p className="text-[10px] text-[#9B9189] text-center mb-6 italic">
        Your details are reviewed to help maintain a trusted professional fashion network.
      </p>

      <form onSubmit={handleSubmit(onSuccess)} className="space-y-4" noValidate>
        <TextField register={register} name="studioName" label="Studio Name" placeholder="e.g. Studio 250 Kigali" required error={errors.studioName?.message} />
        <TextField register={register} name="country" label="Country" placeholder="e.g. Rwanda" required error={errors.country?.message} />
        <TextField register={register} name="city" label="City" placeholder="e.g. Kigali" required error={errors.city?.message} />
        <TextField register={register} name="address" label="Physical Studio Address" placeholder="e.g. KG 456 Ave, Kacyiru" required error={errors.address?.message} />
        <TextField register={register} name="email" label="Business Email" type="email" placeholder="hello@studio250.rw" required error={errors.email?.message} />
        <TextField register={register} name="phone" label="Phone Number" placeholder="+250 788 000 000" required error={errors.phone?.message} />
        <TextField register={register} name="websiteUrl" label="Website, Instagram, or Portfolio URL" placeholder="https://" required error={errors.websiteUrl?.message} />

        <MultiSelectField
          name="studioServices" label="Studio Services"
          options={FIELD_OPTIONS.studioServices}
          selected={watch("studioServices") || []}
          setValue={setValue}
          error={errors.studioServices?.message}
          required
        />

        <MultiSelectField
          name="studioFacilities" label="Studio Facilities"
          options={FIELD_OPTIONS.studioFacilities}
          selected={watch("studioFacilities") || []}
          setValue={setValue}
          error={errors.studioFacilities?.message}
          required
        />

        <SelectField register={register} name="studioAvailability" label="Studio Availability" options={FIELD_OPTIONS.studioAvailabilities} required error={errors.studioAvailability?.message} />
        <SelectField register={register} name="capacity" label="Capacity" options={FIELD_OPTIONS.studioCapacities} required error={errors.capacity?.message} />

        <TextAreaField
          register={register} name="description" label="Short Studio Description"
          placeholder="Describe your studio — space, equipment, atmosphere, and the types of productions you host..."
          required error={errors.description?.message}
          hint="Minimum 80 characters."
        />

        <CheckboxField
          register={register} name="confirmation" label="I confirm that I own or am authorized to represent this studio."
          error={errors.confirmation?.message}
        />

        <div className="flex justify-between pt-4">
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-[#6B6257] hover:text-[#1D1A16] font-semibold text-sm uppercase tracking-wider transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button type="submit" className="flex items-center gap-2 bg-[#1D1A16] hover:bg-[#C8A96A] text-white px-7 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-colors shadow-lg">
            Continue
          </button>
        </div>
      </form>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// MAKEUP ARTIST FORM
// ═══════════════════════════════════════════════════════════════════════
export function MakeupArtistForm({
  onBack, onSuccess, formData,
}: {
  onBack: () => void
  onSuccess: (data: MakeupArtistFormData) => void
  formData?: Record<string, any>
}) {
  const {
    register, handleSubmit, formState: { errors }, setValue, watch,
  } = useForm<MakeupArtistFormData>({
    resolver: zodResolver(makeupArtistSchema),
    defaultValues: formData as any || {},
  })

  return (
    <motion.div
      key="makeup-artist-form"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="font-serif text-xl font-bold text-center uppercase mb-1">Makeup Artist Details</h2>
      <p className="text-sm text-[#6B6257] text-center mb-2">
        Create a professional makeup artist profile for agencies, brands, and event organizers.
      </p>
      <p className="text-[10px] text-[#9B9189] text-center mb-6 italic">
        Your details are reviewed to help maintain a trusted professional fashion network.
      </p>

      <form onSubmit={handleSubmit(onSuccess)} className="space-y-4" noValidate>
        <TextField register={register} name="professionalName" label="Professional Name or Beauty Business Name" placeholder="e.g. Glow by Grace" required error={errors.professionalName?.message} />
        <SelectField register={register} name="businessType" label="Business Type" options={FIELD_OPTIONS.makeupBusinessTypes} required error={errors.businessType?.message} />
        <TextField register={register} name="country" label="Country" placeholder="e.g. Rwanda" required error={errors.country?.message} />
        <TextField register={register} name="city" label="City" placeholder="e.g. Kigali" required error={errors.city?.message} />
        <TextField register={register} name="email" label="Professional Email" type="email" placeholder="hello@glowbygrace.com" required error={errors.email?.message} />
        <TextField register={register} name="phone" label="Phone Number" placeholder="+250 788 000 000" required error={errors.phone?.message} />
        <TextField register={register} name="portfolioUrl" label="Instagram or Portfolio URL" placeholder="https://instagram.com/..." required error={errors.portfolioUrl?.message} />

        <MultiSelectField
          name="specialties" label="Makeup Specialties"
          options={FIELD_OPTIONS.makeupSpecialties}
          selected={watch("specialties") || []}
          setValue={setValue}
          error={errors.specialties?.message}
          required
        />

        <SelectField register={register} name="experienceLevel" label="Years of Professional Experience" options={FIELD_OPTIONS.experienceLevels} required error={errors.experienceLevel?.message} />
        <SelectField register={register} name="serviceArea" label="Typical Service Area" options={FIELD_OPTIONS.serviceAreas} required error={errors.serviceArea?.message} />
        <SelectField register={register} name="startingPriceRange" label="Starting Price Range (optional)" options={FIELD_OPTIONS.priceRanges} />

        <TextAreaField
          register={register} name="description" label="Short Professional Bio"
          placeholder="Describe your makeup experience, style, and notable clients or projects..."
          required error={errors.description?.message}
          hint="Minimum 60 characters."
        />

        <CheckboxField
          register={register} name="confirmation" label="I confirm that the portfolio and business information belong to me or my authorized studio."
          error={errors.confirmation?.message}
        />

        <div className="flex justify-between pt-4">
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-[#6B6257] hover:text-[#1D1A16] font-semibold text-sm uppercase tracking-wider transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button type="submit" className="flex items-center gap-2 bg-[#1D1A16] hover:bg-[#C8A96A] text-white px-7 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-colors shadow-lg">
            Continue
          </button>
        </div>
      </form>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// FASHION STYLIST FORM
// ═══════════════════════════════════════════════════════════════════════
export function FashionStylistForm({
  onBack, onSuccess, formData,
}: {
  onBack: () => void
  onSuccess: (data: FashionStylistFormData) => void
  formData?: Record<string, any>
}) {
  const {
    register, handleSubmit, formState: { errors }, setValue, watch,
  } = useForm<FashionStylistFormData>({
    resolver: zodResolver(fashionStylistSchema),
    defaultValues: formData as any || {},
  })

  return (
    <motion.div
      key="fashion-stylist-form"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="font-serif text-xl font-bold text-center uppercase mb-1">Fashion Stylist Details</h2>
      <p className="text-sm text-[#6B6257] text-center mb-2">
        Create a professional styling profile for editorial, runway, and campaign work.
      </p>
      <p className="text-[10px] text-[#9B9189] text-center mb-6 italic">
        Your details are reviewed to help maintain a trusted professional fashion network.
      </p>

      <form onSubmit={handleSubmit(onSuccess)} className="space-y-4" noValidate>
        <TextField register={register} name="professionalName" label="Professional Name or Styling Business Name" placeholder="e.g. Styled by Amina" required error={errors.professionalName?.message} />
        <TextField register={register} name="country" label="Country" placeholder="e.g. Rwanda" required error={errors.country?.message} />
        <TextField register={register} name="city" label="City" placeholder="e.g. Kigali" required error={errors.city?.message} />
        <TextField register={register} name="email" label="Professional Email" type="email" placeholder="hello@styledbyamina.com" required error={errors.email?.message} />
        <TextField register={register} name="phone" label="Phone Number" placeholder="+250 788 000 000" required error={errors.phone?.message} />
        <TextField register={register} name="portfolioUrl" label="Portfolio, Instagram, or Website URL" placeholder="https://" required error={errors.portfolioUrl?.message} />

        <MultiSelectField
          name="stylingServices" label="Styling Services"
          options={FIELD_OPTIONS.stylingServices}
          selected={watch("stylingServices") || []}
          setValue={setValue}
          error={errors.stylingServices?.message}
          required
        />

        <MultiSelectField
          name="styleSpecialties" label="Style Specialties"
          options={FIELD_OPTIONS.styleSpecialties}
          selected={watch("styleSpecialties") || []}
          setValue={setValue}
          error={errors.styleSpecialties?.message}
          required
        />

        <SelectField register={register} name="experienceLevel" label="Years of Professional Experience" options={FIELD_OPTIONS.experienceLevels} required error={errors.experienceLevel?.message} />
        <SelectField register={register} name="serviceArea" label="Typical Service Area" options={FIELD_OPTIONS.serviceAreas} required error={errors.serviceArea?.message} />

        <TextAreaField
          register={register} name="description" label="Short Professional Bio"
          placeholder="Describe your styling experience, aesthetic, and notable clients or publications..."
          required error={errors.description?.message}
          hint="Minimum 60 characters."
        />

        <CheckboxField
          register={register} name="confirmation" label="I confirm that the portfolio and business information belong to me."
          error={errors.confirmation?.message}
        />

        <div className="flex justify-between pt-4">
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-[#6B6257] hover:text-[#1D1A16] font-semibold text-sm uppercase tracking-wider transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button type="submit" className="flex items-center gap-2 bg-[#1D1A16] hover:bg-[#C8A96A] text-white px-7 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-colors shadow-lg">
            Continue
          </button>
        </div>
      </form>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// HAIR STYLIST FORM
// ═══════════════════════════════════════════════════════════════════════
export function HairStylistForm({
  onBack, onSuccess, formData,
}: {
  onBack: () => void
  onSuccess: (data: HairStylistFormData) => void
  formData?: Record<string, any>
}) {
  const {
    register, handleSubmit, formState: { errors }, setValue, watch,
  } = useForm<HairStylistFormData>({
    resolver: zodResolver(hairStylistSchema),
    defaultValues: formData as any || {},
  })

  return (
    <motion.div
      key="hair-stylist-form"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="font-serif text-xl font-bold text-center uppercase mb-1">Hair Stylist Details</h2>
      <p className="text-sm text-[#6B6257] text-center mb-2">
        Create a professional hair styling profile for runway, editorial, and commercial work.
      </p>
      <p className="text-[10px] text-[#9B9189] text-center mb-6 italic">
        Your details are reviewed to help maintain a trusted professional fashion network.
      </p>

      <form onSubmit={handleSubmit(onSuccess)} className="space-y-4" noValidate>
        <TextField register={register} name="professionalName" label="Professional Name or Salon/Studio Name" placeholder="e.g. Crown Hair Studio" required error={errors.professionalName?.message} />
        <TextField register={register} name="country" label="Country" placeholder="e.g. Rwanda" required error={errors.country?.message} />
        <TextField register={register} name="city" label="City" placeholder="e.g. Kigali" required error={errors.city?.message} />
        <TextField register={register} name="email" label="Professional Email" type="email" placeholder="hello@crownhair.rw" required error={errors.email?.message} />
        <TextField register={register} name="phone" label="Phone Number" placeholder="+250 788 000 000" required error={errors.phone?.message} />
        <TextField register={register} name="portfolioUrl" label="Website or Portfolio URL" placeholder="https://" required error={errors.portfolioUrl?.message} />

        <MultiSelectField
          name="specialties" label="Hair Specialties"
          options={FIELD_OPTIONS.hairSpecialties}
          selected={watch("specialties") || []}
          setValue={setValue}
          error={errors.specialties?.message}
          required
        />

        <SelectField register={register} name="experienceLevel" label="Years of Professional Experience" options={FIELD_OPTIONS.experienceLevels} required error={errors.experienceLevel?.message} />
        <SelectField register={register} name="serviceArea" label="Typical Service Area" options={FIELD_OPTIONS.serviceAreas} required error={errors.serviceArea?.message} />

        <TextAreaField
          register={register} name="description" label="Short Professional Bio"
          placeholder="Describe your hair styling experience, specialties, and notable work..."
          required error={errors.description?.message}
          hint="Minimum 60 characters."
        />

        <CheckboxField
          register={register} name="confirmation" label="I confirm that the portfolio and business information belong to me."
          error={errors.confirmation?.message}
        />

        <div className="flex justify-between pt-4">
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-[#6B6257] hover:text-[#1D1A16] font-semibold text-sm uppercase tracking-wider transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button type="submit" className="flex items-center gap-2 bg-[#1D1A16] hover:bg-[#C8A96A] text-white px-7 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-colors shadow-lg">
            Continue
          </button>
        </div>
      </form>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// VIDEOGRAPHER / PRODUCTION STUDIO FORM
// ═══════════════════════════════════════════════════════════════════════
export function VideographerForm({
  onBack, onSuccess, formData,
}: {
  onBack: () => void
  onSuccess: (data: VideographerFormData) => void
  formData?: Record<string, any>
}) {
  const {
    register, handleSubmit, formState: { errors }, setValue, watch,
  } = useForm<VideographerFormData>({
    resolver: zodResolver(videographerSchema),
    defaultValues: formData as any || {},
  })

  return (
    <motion.div
      key="videographer-form"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="font-serif text-xl font-bold text-center uppercase mb-1">Videographer / Production Studio Details</h2>
      <p className="text-sm text-[#6B6257] text-center mb-2">
        Create a videography or production profile for fashion films, campaigns, and content.
      </p>
      <p className="text-[10px] text-[#9B9189] text-center mb-6 italic">
        Your details are reviewed to help maintain a trusted professional fashion network.
      </p>

      <form onSubmit={handleSubmit(onSuccess)} className="space-y-4" noValidate>
        <TextField register={register} name="professionalName" label="Professional or Studio Name" placeholder="e.g. Kigali Film Collective" required error={errors.professionalName?.message} />
        <TextField register={register} name="country" label="Country" placeholder="e.g. Rwanda" required error={errors.country?.message} />
        <TextField register={register} name="city" label="City" placeholder="e.g. Kigali" required error={errors.city?.message} />
        <TextField register={register} name="email" label="Business Email" type="email" placeholder="hello@kigalifilm.com" required error={errors.email?.message} />
        <TextField register={register} name="phone" label="Phone Number" placeholder="+250 788 000 000" required error={errors.phone?.message} />
        <TextField register={register} name="portfolioUrl" label="Portfolio or Video Reel URL" placeholder="https://vimeo.com/..." required error={errors.portfolioUrl?.message} />

        <MultiSelectField
          name="specialties" label="Video Specialties"
          options={FIELD_OPTIONS.videoSpecialties}
          selected={watch("specialties") || []}
          setValue={setValue}
          error={errors.specialties?.message}
          required
        />

        <SelectField register={register} name="experienceLevel" label="Years of Professional Experience" options={FIELD_OPTIONS.experienceLevels} required error={errors.experienceLevel?.message} />
        <SelectField register={register} name="serviceArea" label="Typical Service Area" options={FIELD_OPTIONS.serviceAreas} required error={errors.serviceArea?.message} />

        <TextAreaField
          register={register} name="description" label="Short Professional Bio"
          placeholder="Describe your video production experience, style, and notable projects..."
          required error={errors.description?.message}
          hint="Minimum 60 characters."
        />

        <CheckboxField
          register={register} name="confirmation" label="I confirm that the portfolio and business information belong to me or my authorized studio."
          error={errors.confirmation?.message}
        />

        <div className="flex justify-between pt-4">
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-[#6B6257] hover:text-[#1D1A16] font-semibold text-sm uppercase tracking-wider transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button type="submit" className="flex items-center gap-2 bg-[#1D1A16] hover:bg-[#C8A96A] text-white px-7 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-colors shadow-lg">
            Continue
          </button>
        </div>
      </form>
    </motion.div>
  )
}
