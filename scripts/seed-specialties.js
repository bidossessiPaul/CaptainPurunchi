// Script : upload des images vers Cloudinary + insertion des spécialités en DB
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

const SPECIALTIES = [
  {
    file: "WhatsApp Image 2026-06-02 at 17.05.02 (1).jpeg",
    title: "Langouste Grillée",
    description: "Langoustes grillées au beurre citronné, servies sur spaghettis sautés aux légumes croquants.",
  },
  {
    file: "WhatsApp Image 2026-06-02 at 17.06.42.jpeg",
    title: "Plateau Royal",
    description: "Notre plateau signature de langoustes et crustacés grillés sur ardoise noire, servi avec riz parfumé.",
  },
  {
    file: "image copy.png",
    title: "Poisson Braisé",
    description: "Poisson entier braisé à la sauce tomate, accompagné d'attiéké et de légumes fondants.",
  },
  {
    file: "WhatsApp Image 2026-06-02 at 17.06.03.jpeg",
    title: "Poulet Braisé",
    description: "Poulet entier braisé aux épices du chef, accompagné de riz jollof et d'une salade fraîche.",
  },
  {
    file: "image.png",
    title: "Crevettes Sautées",
    description: "Crevettes sautées à l'ail et au beurre, servies avec frites dorées croustillantes.",
  },
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

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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

  // Vérifier si des spécialités existent déjà
  const [existing] = await pool.execute("SELECT COUNT(*) as count FROM specialties");
  if (existing[0].count > 0) {
    console.log(`⚠️  ${existing[0].count} spécialité(s) déjà présente(s) en DB — script annulé pour éviter les doublons.`);
    console.log("   Supprime les entrées existantes ou relance avec FORCE=1 pour continuer.");
    await pool.end();
    return;
  }

  console.log("🚀 Début du seed des spécialités...\n");

  for (let i = 0; i < SPECIALTIES.length; i++) {
    const s = SPECIALTIES[i];
    const filePath = path.join(IMAGES_DIR, s.file);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Fichier introuvable : ${s.file}`);
      continue;
    }

    process.stdout.write(`[${i + 1}/${SPECIALTIES.length}] ${s.title} — upload Cloudinary...`);
    const src = await uploadImage(filePath);
    console.log(" ✓");

    const id = require("crypto").randomUUID();
    const slug = slugify(s.title);
    const order = i + 1;

    await pool.execute(
      "INSERT INTO specialties (id, title, slug, description, details, src, `order`, active, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [id, s.title, slug, s.description, null, src, order, 1]
    );
    console.log(`   → Inséré en DB (slug: ${slug})\n`);
  }

  console.log("✅ Seed terminé — 5 spécialités créées.");
  await pool.end();
}

main().catch((err) => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
