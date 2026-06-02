import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("[cloudinary] Missing env variables — uploads will be mocked");
    return;
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  configured = true;
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  fileSize: number;
}

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options: { folder?: string; resourceType?: "image" | "video" | "auto" } = {}
): Promise<CloudinaryUploadResult> {
  ensureConfigured();

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.log("[cloudinary] Mock upload — credentials not set");
    return {
      url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
      publicId: `mock_${Date.now()}`,
      resourceType: "image",
      format: "jpg",
      fileSize: fileBuffer.length,
    };
  }

  const folder = options.folder ?? "modelconnect-africa";
  const resourceType = options.resourceType ?? "auto";

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: resourceType }, (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          fileSize: result.bytes,
        });
      })
      .end(fileBuffer);
  });
}
