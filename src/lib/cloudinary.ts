import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "video" = "image"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `captain-purunchi/${folder}`,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Upload failed"));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    stream.end(buffer);
  });
}

export async function deleteFromCloudinary(url: string): Promise<void> {
  if (!url || !url.includes("res.cloudinary.com")) return;

  try {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/<cloud>/image/upload/v123/captain-purunchi/gallery/abc.jpg
    const parts = url.split("/upload/");
    if (parts.length < 2) return;

    const afterUpload = parts[1];
    // Remove version prefix (v123456/) if present
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");
    // Remove file extension
    const publicId = withoutVersion.replace(/\.[^.]+$/, "");

    // Determine resource type from URL
    const resourceType = url.includes("/video/upload/") ? "video" : "image";

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch {
    // Silently fail - image may have already been deleted
  }
}

export default cloudinary;
