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

const NEW_SPECIALTIES = [
  {
    file: "image copy 2.png",
    title: "Tartare de Crevettes",
    description: "Tartare de crevettes fraîches sur lit de guacamole maison, une entrée raffinée aux saveurs iodées.",
  },
  {
    file: "image copy 3.png",
    title: "Assiette du Capitaine",
    description: "Poisson entier grillé, crevettes dorées et pommes de terre au beurre — le meilleur de la mer en une assiette.",
  },
  {
    file: "image copy 4.png",
    title: "Plateau Prestige",
    description: "Sélection royale de grosses crevettes grillées, crabe et garnitures — à partager entre amateurs de fruits de mer.",
  },
  {
    file: "image copy 5.png",
    title: "Grand Plateau Familial",
    description: "Notre grand plateau signature : poisson et crevettes grillés au feu de bois, servis avec citron vert et tomates fraîches.",
  },
  {
    file: "image copy 6.png",
    title: "Fruits de Mer au Champagne",
    description: "Belle assiette de crustacés grillés — crevettes et crabe — avec pommes de terre persillées, accord parfait avec le champagne.",
  },
  {
    file: "image copy 7.png",
    title: "Langoustes au Beurre Persillé",
    description: "Langoustes entières grillées au beurre ail-persil, servies avec vin blanc — un classique incontournable du Captain Purunchi.",
  },
];

function slugify(text) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

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

  const [existing] = await pool.execute("SELECT MAX(`order`) as maxOrder FROM specialties");
  let order = (existing[0].maxOrder || 0) + 1;

  console.log(`🚀 Ajout de ${NEW_SPECIALTIES.length} nouvelles spécialités...\n`);

  for (let i = 0; i < NEW_SPECIALTIES.length; i++) {
    const s = NEW_SPECIALTIES[i];
    const filePath = path.join(IMAGES_DIR, s.file);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Fichier introuvable : ${s.file}`);
      continue;
    }

    process.stdout.write(`[${i + 1}/${NEW_SPECIALTIES.length}] ${s.title} — upload...`);
    const src = await uploadImage(filePath);
    console.log(" ✓");

    const id = require("crypto").randomUUID();
    const slug = slugify(s.title);

    await pool.execute(
      "INSERT INTO specialties (id, title, slug, description, details, src, `order`, active, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [id, s.title, slug, s.description, null, src, order++, 1]
    );
    console.log(`   → Inséré (slug: ${slug})\n`);
  }

  console.log("✅ Terminé.");
  await pool.end();
}

main().catch((err) => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
