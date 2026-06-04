// Upload la vidéo promo vers Cloudinary
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Recherche du fichier mp4 (le nom contient des caractères Unicode spéciaux)
const IMAGES_DIR = path.join(__dirname, "../public/images captain");
const mp4Files = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith(".mp4"));
if (mp4Files.length === 0) {
  console.error("❌ Aucun fichier .mp4 trouvé dans", IMAGES_DIR);
  process.exit(1);
}
const VIDEO_PATH = path.join(IMAGES_DIR, mp4Files[0]);
console.log("📁 Fichier trouvé :", mp4Files[0]);

async function main() {
  const stats = fs.statSync(VIDEO_PATH);
  console.log(`📹 Fichier : ${(stats.size / 1024 / 1024).toFixed(1)} Mo`);
  console.log("🚀 Upload vers Cloudinary (peut prendre quelques secondes)...\n");

  const result = await cloudinary.uploader.upload(VIDEO_PATH, {
    folder: "captain-purunchi/videos",
    resource_type: "video",
    public_id: "promo-culinaire",
  });

  console.log("✅ Upload terminé !");
  console.log("   URL :", result.secure_url);
  console.log("\n--- Copie cette URL dans le composant ---");
  console.log(result.secure_url);
}

main().catch((err) => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
