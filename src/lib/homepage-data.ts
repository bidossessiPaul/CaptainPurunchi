import { pool } from "./db";

/**
 * Fetches ALL homepage data using a SINGLE database connection.
 * Reduces from 9 separate connections to 1, with 60s in-memory cache.
 */

let cache: { data: HomepageData; expiresAt: number } | null = null;

export interface HomepageData {
  heroSlides: any[];
  specialties: any[];
  galleryImages: any[];
  rooms: any[];
  events: any[];
  blogPosts: any[];
  testimonials: any[];
  contact: any;
  todaysDishes: any[];
}

export async function getHomepageData(): Promise<HomepageData> {
  // Return cached data if still valid (60s TTL)
  if (cache && cache.expiresAt > Date.now()) {
    return cache.data;
  }

  // Use a SINGLE connection for all 9 queries
  const conn = await pool.getConnection();
  try {
    const today = new Date().toISOString().split("T")[0];

    const [
      [heroSlides],
      [specialties],
      [galleryImages],
      [rooms],
      [events],
      [blogPosts],
      [testimonials],
      [contactRows],
      [todaysDishes],
    ] = await Promise.all([
      conn.execute("SELECT * FROM hero_slides WHERE active = 1 ORDER BY `order` ASC"),
      conn.execute("SELECT * FROM specialties WHERE active = 1 ORDER BY `order` ASC"),
      conn.execute("SELECT * FROM gallery_images WHERE active = 1 ORDER BY `order` ASC"),
      conn.execute("SELECT * FROM rooms WHERE active = 1 ORDER BY `order` ASC"),
      conn.execute("SELECT * FROM events WHERE active = 1 ORDER BY `order` ASC"),
      conn.execute("SELECT * FROM blog_posts WHERE active = 1 ORDER BY createdAt DESC LIMIT 6"),
      conn.execute("SELECT * FROM testimonials WHERE active = 1 ORDER BY `order` ASC"),
      conn.execute("SELECT * FROM contact_info LIMIT 1"),
      conn.execute("SELECT * FROM daily_dishes WHERE availableDate = ? AND active = 1 ORDER BY `order` ASC", [today]),
    ]);

    const safeJsonArray = (val: unknown): string[] => {
      try { const p = JSON.parse(val as string || '[]'); return Array.isArray(p) ? p : []; } catch { return []; }
    };

    const data: HomepageData = {
      heroSlides: heroSlides as any[],
      specialties: specialties as any[],
      galleryImages: galleryImages as any[],
      rooms: (rooms as any[]).map(r => ({
        ...r,
        active: r.active === 1,
        gallery: safeJsonArray(r.gallery),
        features: safeJsonArray(r.features),
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      })),
      events: events as any[],
      blogPosts: blogPosts as any[],
      testimonials: testimonials as any[],
      contact: (contactRows as any[])[0] || null,
      todaysDishes: todaysDishes as any[],
    };

    // Cache for 60 seconds
    cache = { data, expiresAt: Date.now() + 60_000 };

    return data;
  } finally {
    conn.release();
  }
}
