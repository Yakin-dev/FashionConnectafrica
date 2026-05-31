"use client";

import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, Video, X, Check, Loader2 } from "lucide-react";
import { validateMediaFile } from "@/lib/cloudinary";

interface UploadBoxProps {
  label: string;
  onUploadSuccess: (url: string) => void;
  allowedTypes?: string[];
  maxSizeMB?: number;
}

export default function UploadBox({
  label,
  onUploadSuccess,
  allowedTypes = ["image/jpeg", "image/png", "image/webp"],
}: UploadBoxProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate using helper
    const validation = validateMediaFile(selectedFile.name, selectedFile.size, allowedTypes);
    if (!validation.valid) {
      setError(validation.error || "File validation failed.");
      return;
    }

    setFile(selectedFile);

    // Setup preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Run simulated upload
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess(true);
      onUploadSuccess(objectUrl); // Simulating successful return
    } catch (err) {
      setError("Failed to upload file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isVideo = file?.name.endsWith(".mp4") || file?.type.includes("video");

  return (
    <div className="space-y-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">{label}</span>
      
      <div className="relative rounded-2xl border border-dashed border-[#E7DED1] bg-white p-6 transition-all hover:bg-[#F8F5EF]/30 flex flex-col items-center justify-center text-center">
        {previewUrl ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#F8F5EF] flex items-center justify-center border border-[#E7DED1]">
            {isVideo ? (
              <video src={previewUrl} controls className="max-h-full" />
            ) : (
              <img src={previewUrl} alt="Upload Preview" className="object-cover max-h-full w-full" />
            )}
            
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 rounded-full bg-[#1D1A16]/80 p-1.5 text-white hover:bg-[#C8A96A] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {loading && (
              <div className="absolute inset-0 bg-[#1D1A16]/50 flex flex-col items-center justify-center text-white gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-[#C8A96A]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Uploading...</span>
              </div>
            )}

            {success && !loading && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-emerald-600 text-white rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider">
                <Check className="h-3 w-3" />
                <span>Upload Verified</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept={allowedTypes.join(",")}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full bg-[#F8F5EF] p-4 text-[#C8A96A] hover:bg-[#E7DED1]/50 transition-colors"
            >
              <UploadCloud className="h-6 w-6" />
            </button>
            
            <h4 className="mt-3 font-serif text-sm font-bold text-[#1D1A16] uppercase">Drag & Drop or Click</h4>
            <p className="text-[10px] text-[#6B6257] mt-1 max-w-xs leading-relaxed uppercase tracking-wider">
              {allowedTypes.includes("video/mp4") ? "Videos up to 50MB" : "Images (JPEG, PNG, WEBP) up to 10MB"}
            </p>
          </>
        )}

        {error && (
          <div className="mt-3 text-[10px] font-bold text-rose-600 uppercase tracking-wide">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
