"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Check, Loader2 } from "lucide-react";
import { validateMediaFile } from "@/lib/cloudinary";

interface UploadBoxProps {
  label: string;
  onUploadSuccess: (url: string, publicId?: string) => void;
  allowedTypes?: string[];
  folder?: string;
}

export default function UploadBox({
  label,
  onUploadSuccess,
  allowedTypes = ["image/jpeg", "image/png", "image/webp"],
  folder,
}: UploadBoxProps) {
  const [file, setFile]           = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validation = validateMediaFile(selected.name, selected.size, allowedTypes);
    if (!validation.valid) { setError(validation.error ?? "Invalid file"); return; }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selected);
      if (folder) formData.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      setSuccess(true);
      onUploadSuccess(data.url, data.publicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null); setPreviewUrl(null); setError(null); setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isVideo = file?.type.includes("video");

  return (
    <div className="space-y-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">{label}</span>

      <div className="relative rounded-2xl border border-dashed border-[#E7DED1] bg-white p-6 flex flex-col items-center justify-center text-center">
        {previewUrl ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#F8F5EF] border border-[#E7DED1]">
            {isVideo
              ? <video src={previewUrl} controls className="max-h-full w-full" />
              : <img src={previewUrl} alt="Preview" className="object-cover max-h-full w-full" />
            }
            <button onClick={handleClear}
              className="absolute top-2 right-2 rounded-full bg-[#1D1A16]/80 p-1.5 text-white hover:bg-[#C8A96A] transition-colors">
              <X className="h-4 w-4" />
            </button>
            {loading && (
              <div className="absolute inset-0 bg-[#1D1A16]/50 flex flex-col items-center justify-center text-white gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-[#C8A96A]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Uploading to Cloudinary...</span>
              </div>
            )}
            {success && !loading && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-emerald-600 text-white rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider">
                <Check className="h-3 w-3" /> Uploaded
              </div>
            )}
          </div>
        ) : (
          <>
            <input ref={fileInputRef} type="file" onChange={handleFileChange}
              className="hidden" accept={allowedTypes.join(",")} />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="rounded-full bg-[#F8F5EF] p-4 text-[#C8A96A] hover:bg-[#E7DED1]/50 transition-colors">
              <UploadCloud className="h-6 w-6" />
            </button>
            <h4 className="mt-3 font-serif text-sm font-bold text-[#1D1A16] uppercase">Drag & Drop or Click</h4>
            <p className="text-[10px] text-[#6B6257] mt-1 max-w-xs leading-relaxed uppercase tracking-wider">
              {allowedTypes.includes("video/mp4") ? "Videos up to 50MB" : "Images (JPEG, PNG, WebP) up to 10MB"}
            </p>
          </>
        )}
        {error && <p className="mt-3 text-[10px] font-bold text-rose-600 uppercase tracking-wide">{error}</p>}
      </div>
    </div>
  );
}
