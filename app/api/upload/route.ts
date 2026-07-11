import { getCurrentUser } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary-server"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const ALLOWED_VIDEO_TYPES = ["video/mp4"]
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_VIDEO_SIZE = 50 * 1024 * 1024

/**
 * Magic bytes signatures for file type validation.
 * Validates the actual file content, not just the MIME type header.
 */
const MAGIC_BYTES: Record<string, Uint8Array[]> = {
  "image/jpeg": [new Uint8Array([0xFF, 0xD8, 0xFF])],
  "image/png": [new Uint8Array([0x89, 0x50, 0x4E, 0x47])],
  "image/webp": [new Uint8Array([0x52, 0x49, 0x46, 0x46])], // RIFF header
  "video/mp4": [new Uint8Array([0x00, 0x00, 0x00]), new Uint8Array([0x66, 0x74, 0x79, 0x70])], // ftyp box
}

/**
 * Validate file type using magic bytes (file signature).
 * This prevents MIME type spoofing attacks.
 */
function validateMagicBytes(buffer: Uint8Array, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType]
  if (!signatures) return false

  return signatures.some((sig) => {
    if (buffer.length < sig.length) return false
    for (let i = 0; i < sig.length; i++) {
      if (buffer[i] !== sig[i]) return false
    }
    return true
  })
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 })
    }

    // Validate MIME type from Content-Type header
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: `File type ${file.type} not supported. Allowed: JPEG, PNG, WebP, MP4` },
        { status: 400 }
      )
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max: ${isVideo ? "50MB" : "10MB"}` },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Magic byte validation to prevent MIME spoofing
    if (!validateMagicBytes(new Uint8Array(buffer), file.type)) {
      return NextResponse.json(
        { error: "File content does not match its declared type. Upload rejected." },
        { status: 400 }
      )
    }

    const result = await uploadToCloudinary(buffer, {
      folder: "modelconnect-africa",
      resourceType: isVideo ? "video" : "image",
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[upload]", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
