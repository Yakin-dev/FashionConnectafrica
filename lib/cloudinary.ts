/**
 * Cloudinary Helper for ModelConnect.Africa
 * Provides helpers to validate files safely and handle simulated direct uploads.
 */

export interface UploadResult {
  url: string;
  publicId: string;
  folder: string;
  uploadedAt: string;
}

export interface FileValidation {
  valid: boolean;
  error?: string;
}

/**
 * Validates files on size and type before sending to Cloudinary
 */
export function validateMediaFile(
  fileName: string,
  fileSizeInBytes: number,
  allowedTypes: string[] = ["image/jpeg", "image/png", "image/webp", "video/mp4"]
): FileValidation {
  const extension = fileName.split(".").pop()?.toLowerCase();
  
  // Convert basic extensions to mime types
  let detectedType = "";
  if (["jpg", "jpeg"].includes(extension || "")) detectedType = "image/jpeg";
  else if (extension === "png") detectedType = "image/png";
  else if (extension === "webp") detectedType = "image/webp";
  else if (extension === "mp4") detectedType = "video/mp4";

  if (detectedType && !allowedTypes.includes(detectedType)) {
    return {
      valid: false,
      error: `File type .${extension} is not supported. Supported types: ${allowedTypes.join(", ")}`,
    };
  }

  // 10MB limit for images, 50MB for videos
  const isVideo = detectedType === "video/mp4" || extension === "mp4";
  const sizeLimit = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;

  if (fileSizeInBytes > sizeLimit) {
    return {
      valid: false,
      error: `File size exceeds the limit. Max size allowed is ${isVideo ? "50MB" : "10MB"}.`,
    };
  }

  return { valid: true };
}

/**
 * Direct Cloudinary upload simulation.
 * Safe to be imported inside Next.js Client Components without bringing Node.js 'fs' dependencies.
 * 
 * NOTE: For server-side Node.js environment production uploads:
 * In a real-world deployment, you would place this logic inside a Next.js Server Action with a 
 * "use server"; directive or inside an API route like `/app/api/upload/route.ts` to ensure 
 * standard server-side Cloudinary SDK configuration runs exclusively on the server.
 */
export async function uploadMediaToCloudinary(
  fileBase64: string,
  fileName: string,
  folder: string = "modelconnect_portfolios"
): Promise<UploadResult> {
  // High fidelity client-side visual simulation with simulated delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Determine if it's video or image from the fileName or base64 structure
  const isVideo = fileName.endsWith(".mp4") || fileBase64.includes("video/mp4");
  
  // Return premium placeholders
  const mockUrl = isVideo
    ? "https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-glitter-makeup-40113-large.mp4"
    : "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80";

  return {
    url: mockUrl,
    publicId: `mock_cloudinary_${Math.random().toString(36).substring(7)}`,
    folder: folder,
    uploadedAt: new Date().toISOString(),
  };
}

