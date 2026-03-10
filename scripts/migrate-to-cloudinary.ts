import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import { promises as fs } from "fs";
import path from "path";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

const PUBLIC_DIR = path.join(process.cwd(), "public");

let uploaded = 0;
let skipped = 0;
let failed = 0;

async function uploadFile(localPath: string, folder: string): Promise<string | null> {
  if (!localPath || !localPath.startsWith("/images/")) return null;

  const filePath = path.join(PUBLIC_DIR, localPath);

  try {
    await fs.access(filePath);
  } catch {
    console.log(`  SKIP (file not found): ${localPath}`);
    skipped++;
    return null;
  }

  const isVideo = localPath.match(/\.(mp4|webm)$/i);
  const resourceType = isVideo ? "video" : "image";

  try {
    const buffer = await fs.readFile(filePath);
    const url = await new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `captain-purunchi/${folder}`,
          resource_type: resourceType as "image" | "video",
        },
        (error, result) => {
          if (error || !result) reject(error || new Error("Upload failed"));
          else resolve(result.secure_url);
        }
      );
      stream.end(buffer);
    });
    uploaded++;
    console.log(`  OK: ${localPath} -> ${url}`);
    return url;
  } catch (err) {
    console.error(`  FAIL: ${localPath}`, err);
    failed++;
    return null;
  }
}

async function migrateHeroSlides() {
  console.log("\n=== Hero Slides ===");
  const slides = await prisma.heroSlide.findMany();
  for (const slide of slides) {
    const newSrc = await uploadFile(slide.src, "hero");
    if (newSrc) {
      await prisma.heroSlide.update({ where: { id: slide.id }, data: { src: newSrc } });
    }
  }
}

async function migrateSpecialties() {
  console.log("\n=== Specialties ===");
  const items = await prisma.specialty.findMany();
  for (const item of items) {
    const newSrc = await uploadFile(item.src, "specialties");
    if (newSrc) {
      await prisma.specialty.update({ where: { id: item.id }, data: { src: newSrc } });
    }
  }
}

async function migrateGallery() {
  console.log("\n=== Gallery ===");
  const images = await prisma.galleryImage.findMany();
  for (const img of images) {
    const newSrc = await uploadFile(img.src, "gallery");
    if (newSrc) {
      await prisma.galleryImage.update({ where: { id: img.id }, data: { src: newSrc } });
    }
  }
}

async function migrateRooms() {
  console.log("\n=== Rooms ===");
  const rooms = await prisma.room.findMany();
  for (const room of rooms) {
    let changed = false;

    const newThumb = await uploadFile(room.thumb, "rooms");
    const data: Record<string, string> = {};
    if (newThumb) {
      data.thumb = newThumb;
      changed = true;
    }

    const gallery: string[] = JSON.parse(room.gallery);
    const newGallery: string[] = [];
    for (const imgPath of gallery) {
      const newUrl = await uploadFile(imgPath, "rooms");
      newGallery.push(newUrl || imgPath);
      if (newUrl) changed = true;
    }

    if (changed) {
      await prisma.room.update({
        where: { id: room.id },
        data: { ...data, gallery: JSON.stringify(newGallery) },
      });
    }
  }
}

async function migrateEvents() {
  console.log("\n=== Events ===");
  const events = await prisma.event.findMany();
  for (const event of events) {
    let changed = false;

    const newThumb = await uploadFile(event.thumb, "events");
    const data: Record<string, string> = {};
    if (newThumb) {
      data.thumb = newThumb;
      changed = true;
    }

    const gallery: string[] = JSON.parse(event.gallery);
    const newGallery: string[] = [];
    for (const imgPath of gallery) {
      const newUrl = await uploadFile(imgPath, "events");
      newGallery.push(newUrl || imgPath);
      if (newUrl) changed = true;
    }

    if (changed) {
      await prisma.event.update({
        where: { id: event.id },
        data: { ...data, gallery: JSON.stringify(newGallery) },
      });
    }
  }
}

async function migrateBlog() {
  console.log("\n=== Blog Posts ===");
  const posts = await prisma.blogPost.findMany();
  for (const post of posts) {
    const newThumb = await uploadFile(post.thumb, "blog");
    if (newThumb) {
      await prisma.blogPost.update({ where: { id: post.id }, data: { thumb: newThumb } });
    }
  }
}

async function migrateTestimonials() {
  console.log("\n=== Testimonials ===");
  const items = await prisma.testimonial.findMany();
  for (const item of items) {
    const data: Record<string, string> = {};

    if (item.image) {
      const newImage = await uploadFile(item.image, "testimonials");
      if (newImage) data.image = newImage;
    }

    if (item.avatar) {
      const newAvatar = await uploadFile(item.avatar, "testimonials");
      if (newAvatar) data.avatar = newAvatar;
    }

    if (Object.keys(data).length > 0) {
      await prisma.testimonial.update({ where: { id: item.id }, data });
    }
  }
}

async function migrateDailyDishes() {
  console.log("\n=== Daily Dishes ===");
  const dishes = await prisma.dailyDish.findMany();
  for (const dish of dishes) {
    if (dish.photo) {
      const newPhoto = await uploadFile(dish.photo, "daily-dishes");
      if (newPhoto) {
        await prisma.dailyDish.update({ where: { id: dish.id }, data: { photo: newPhoto } });
      }
    }
  }
}

async function main() {
  console.log("Starting migration to Cloudinary...");
  console.log(`Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);

  await migrateHeroSlides();
  await migrateSpecialties();
  await migrateGallery();
  await migrateRooms();
  await migrateEvents();
  await migrateBlog();
  await migrateTestimonials();
  await migrateDailyDishes();

  console.log("\n=== Migration Complete ===");
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
