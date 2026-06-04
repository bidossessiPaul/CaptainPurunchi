// Met à jour les images des spécialités existantes avec les vraies photos du restaurant
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const cloudinary = require("cloudinary").v2;
const mysql = require("mysql2/promise");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGES_DIR = path.join(__dirname, "../public/images captain/specialite");

// Matching : slug de la spécialité → fichier image
const UPDATES = [
  { slug: "poisson-braise-du-jour",        file: "image copy.png" },
  { slug: "crevettes-sautees-a-l-ail",     file: "image.png" },
  { slug: "gambas-royales",                file: "WhatsApp Image 2026-06-02 at 17.05.02 (1).jpeg" },
  { slug: "homard-grille",                 file: "WhatsApp Image 2026-06-02 at 17.06.42.jpeg" },
  { slug: "langouste-sauce-armoricaine",   file: "WhatsApp Image 2026-06-02 at 17.06.03.jpeg" },
];

async function uploadImage(filePath) {
  const buffer = fs.readFileSync(filePath);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "captain-purunchi/specialties", resource_type: "image" },
      (error, result) => {
        if (error || !result) reject(error || new Error("Upload failed"));
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

async function main() {
  const pool = await mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.MYSQL_PORT) || 3306,
    connectionLimit: 3,
    connectTimeout: 30000,
  });

  console.log("🚀 Mise à jour des images des spécialités...\n");

  for (let i = 0; i < UPDATES.length; i++) {
    const { slug, file } = UPDATES[i];
    const filePath = path.join(IMAGES_DIR, file);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Fichier introuvable : ${file}`);
      continue;
    }

    // Récupère l'ID depuis la DB
    const [rows] = await pool.execute("SELECT id, title FROM specialties WHERE slug = ?", [slug]);
    if (rows.length === 0) {
      // Essai avec slug alternatif (tirets vs apostrophes)
      console.warn(`⚠️  Spécialité introuvable pour slug "${slug}" — vérification en cours...`);
      const [all] = await pool.execute("SELECT id, title, slug FROM specialties");
      console.log("   Slugs disponibles :", all.map(r => r.slug).join(", "));
      continue;
    }

    const { id, title } = rows[0];
    process.stdout.write(`[${i + 1}/${UPDATES.length}] ${title} — upload...`);
    const src = await uploadImage(filePath);
    console.log(" ✓");

    await pool.execute("UPDATE specialties SET src = ? WHERE id = ?", [src, id]);
    console.log(`   → Image mise à jour\n`);
  }

  console.log("✅ Terminé.");
  await pool.end();
}

main().catch((err) => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
