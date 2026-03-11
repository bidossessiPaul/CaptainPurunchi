import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

const initialSlides = [
  { src: "/images/hero/1-2.webp", order: 0 },
  { src: "/images/hero/seafood-beach-feast.webp", order: 1 },
  { src: "/images/hero/greek-whole-snapper.jpg", order: 2 },
  { src: "/images/hero/gourmet-seafood-feast.webp", order: 3 },
];

const initialSpecialties = [
  {
    title: "HOMARD GRILLÉ",
    description: "Homard frais grillé au beurre d'ail et herbes, servi avec sa sauce créolée maison.",
    src: "/images/special-menu-1.jpg",
    order: 0,
  },
  {
    title: "POISSON BRASÉ",
    description: "Poisson entier brasé aux épices africaines, accompagné de bananes plantains et piment frais.",
    src: "/images/special-menu-2.jpg",
    order: 1,
  },
  {
    title: "CREVETTES FLAMBÉES",
    description: "Crevettes géantes flambées au cognac, déglacées à la crème et servies sur lit de riz parfumé.",
    src: "/images/special-menu-3.jpg",
    order: 2,
  },
  {
    title: "PLATEAU FRUITS DE MER",
    description: "Sélection de fruits de mer frais du jour : huîtres, crabes, crevettes et langoustines.",
    src: "/images/special-menu-1.jpg",
    order: 3,
  },
  {
    title: "BROCHETTES CAPITAINE",
    description: "Brochettes mixtes de poisson et crevettes marinées, grillées au feu de bois avec sauce piquante.",
    src: "/images/special-menu-2.jpg",
    order: 4,
  },
];

const initialMenu: { name: string; icon: string; items: { name: string; description: string; price: string }[] }[] = [
  {
    name: "Cocktails",
    icon: "martini",
    items: [
      { name: "Cocktail Purunchi", description: "Le cocktail signature de la maison.", price: "3.000 F" },
      { name: "Cojack", description: "Rhum blanc, jus de fruit de la passion, jus d'ananas, sirop de sucre.", price: "3.000 F" },
      { name: "Sunset", description: "Gin, jus de pamplemousse, jus d'orange, grenadine.", price: "3.000 F" },
      { name: "Mojito", description: "Rhum blanc, jus de citron vert, sirop de sucre, menthe fraîche.", price: "3.000 F" },
      { name: "Tropical Breez", description: "Vodka, jus d'ananas, jus de fruit de la passion, sirop de coco.", price: "3.000 F" },
      { name: "Cotonou", description: "Rhum blanc, jus de citron vert, sirop de gingembre, menthe fraîche.", price: "3.000 F" },
    ],
  },
  {
    name: "Liqueurs",
    icon: "wine",
    items: [
      { name: "Red Label", description: "Whisky", price: "25.000 / 2.500 F" },
      { name: "William Lawsons", description: "Whisky", price: "25.000 / 2.500 F" },
      { name: "Vodka Absolut", description: "Vodka", price: "25.000 / 2.500 F" },
      { name: "Label 5", description: "Whisky", price: "25.000 / 2.500 F" },
      { name: "JB", description: "Whisky", price: "25.000 / 2.500 F" },
      { name: "Martini", description: "Apéritif", price: "25.000 / 2.500 F" },
      { name: "Ricard", description: "Pastis", price: "25.000 / 2.000 F" },
      { name: "Baileys", description: "Crème de whisky", price: "30.000 / 3.000 F" },
      { name: "Jack Daniel", description: "Tennessee Whiskey", price: "35.000 / 4.000 F" },
      { name: "Black Label", description: "Whisky premium", price: "40.000 / 5.000 F" },
    ],
  },
  {
    name: "Boissons Chaudes",
    icon: "coffee",
    items: [
      { name: "Expresso", description: "Café serré", price: "1.000 F" },
      { name: "Café au lait", description: "Café avec lait chaud", price: "1.500 F" },
      { name: "Cappuccino", description: "Café avec mousse de lait", price: "2.500 F" },
      { name: "Citron chaud", description: "Infusion de citron", price: "1.000 F" },
      { name: "Infusion", description: "Tisane aux plantes", price: "1.000 F" },
    ],
  },
  {
    name: "Jus Nature",
    icon: "citrus",
    items: [
      { name: "Ananas", description: "Jus d'ananas frais pressé", price: "1.000 F" },
      { name: "Gingembre", description: "Jus de gingembre frais", price: "1.000 F" },
      { name: "Orange", description: "Jus d'orange pressée", price: "1.000 F" },
      { name: "Citron", description: "Jus de citron frais", price: "1.000 F" },
      { name: "Bissap", description: "Jus de fleur d'hibiscus", price: "1.000 F" },
    ],
  },
  {
    name: "Bières & Sodas",
    icon: "beer",
    items: [
      { name: "Sucrerie", description: "Boisson sucrée", price: "500 F" },
      { name: "Chill", description: "Boisson fraîche", price: "600 F" },
      { name: "Béninoise 33cl", description: "Bière locale", price: "600 F" },
      { name: "Béninoise 65cl", description: "Bière locale grand format", price: "800 F" },
      { name: "Beaufort 33cl", description: "Bière", price: "600 F" },
      { name: "Beaufort 50cl", description: "Bière grand format", price: "800 F" },
      { name: "Doppel", description: "Bière", price: "800 F" },
      { name: "Flag", description: "Bière", price: "800 F" },
      { name: "Castel", description: "Bière", price: "800 F" },
      { name: "Guiness", description: "Stout", price: "1.000 F" },
      { name: "Awoyo", description: "Bière artisanale", price: "1.200 F" },
      { name: "Fifa 1,5L", description: "Eau minérale", price: "700 F" },
      { name: "Gazeuse", description: "Eau gazeuse", price: "700 F" },
      { name: "Pils P", description: "Bière Pils", price: "700 F" },
      { name: "Pils G", description: "Bière Pils grand format", price: "1.000 F" },
    ],
  },
  {
    name: "Énergisantes",
    icon: "zap",
    items: [
      { name: "Rox", description: "Boisson énergisante", price: "700 F" },
      { name: "Red Bull", description: "Boisson énergisante", price: "1.000 F" },
      { name: "Vody", description: "Boisson énergisante", price: "700 F" },
      { name: "Châteaux de France", description: "Boisson énergisante", price: "700 F" },
    ],
  },
];

const initialGallery = [
  { src: "/images/gallery_01.jpg", alt: "Ambiance rooftop", order: 0 },
  { src: "/images/gallery_02.jpg", alt: "Plateau fruits de mer", order: 1 },
  { src: "/images/gallery_03.jpg", alt: "Cocktails signatures", order: 2 },
  { src: "/images/gallery_04.jpg", alt: "Grillades au feu de bois", order: 3 },
  { src: "/images/gallery_05.jpg", alt: "Vue sur Cotonou", order: 4 },
  { src: "/images/gallery_06.jpg", alt: "Soirée Captain Purunchi", order: 5 },
  { src: "/images/gallery_07.jpg", alt: "Notre terrasse", order: 6 },
  { src: "/images/gallery_08.jpg", alt: "Poisson brasé", order: 7 },
  { src: "/images/gallery_09.jpg", alt: "Espace lounge", order: 8 },
  { src: "/images/gallery_10.jpg", alt: "Desserts maison", order: 9 },
];

const initialRooms = [
  {
    name: "Chambre Standard",
    shortDesc: "Chambre confortable avec vue sur la cour.",
    price: "15.000 F / nuit",
    thumb: "/images/gallery_01.jpg",
    capacity: "2 personnes",
    features: ["Climatisation", "Wi-Fi gratuit", "Salle de bain privée", "Télévision"],
    description: "Une chambre confortable et bien équipée, idéale pour un séjour agréable à Cotonou. Profitez d\u2019un espace calme avec tout le confort nécessaire pour vous reposer après une soirée chez Captain Purunchi.",
    gallery: ["/images/gallery_01.jpg", "/images/gallery_05.jpg", "/images/gallery_09.jpg"],
  },
  {
    name: "Chambre Confort",
    shortDesc: "Espace spacieux avec balcon privé.",
    price: "25.000 F / nuit",
    thumb: "/images/gallery_05.jpg",
    capacity: "2 personnes",
    features: ["Climatisation", "Wi-Fi gratuit", "Balcon privé", "Mini-bar", "Télévision"],
    description: "Une chambre spacieuse avec balcon privé offrant une vue agréable. Équipée d\u2019un mini-bar et d\u2019un espace de travail, elle est parfaite pour un séjour en toute sérénité.",
    gallery: ["/images/gallery_05.jpg", "/images/gallery_01.jpg", "/images/gallery_07.jpg"],
  },
  {
    name: "Suite Capitaine",
    shortDesc: "Notre suite premium avec vue panoramique.",
    price: "40.000 F / nuit",
    thumb: "/images/gallery_07.jpg",
    capacity: "2-3 personnes",
    features: ["Climatisation", "Wi-Fi gratuit", "Salon privé", "Mini-bar", "Vue panoramique", "Room service"],
    description: "La suite Capitaine est notre offre premium. Avec son salon privé, sa vue panoramique sur Cotonou et ses équipements haut de gamme, c\u2019est l\u2019expérience ultime pour un séjour inoubliable.",
    gallery: ["/images/gallery_07.jpg", "/images/gallery_03.jpg", "/images/gallery_09.jpg"],
  },
  {
    name: "Chambre Familiale",
    shortDesc: "Idéale pour les familles, grande et lumineuse.",
    price: "35.000 F / nuit",
    thumb: "/images/gallery_09.jpg",
    capacity: "4 personnes",
    features: ["Climatisation", "Wi-Fi gratuit", "2 lits doubles", "Salle de bain privée", "Télévision"],
    description: "Spacieuse et lumineuse, notre chambre familiale dispose de deux lits doubles et de tout le confort nécessaire pour accueillir votre famille dans les meilleures conditions.",
    gallery: ["/images/gallery_09.jpg", "/images/gallery_05.jpg", "/images/gallery_01.jpg"],
  },
];

const initialEvents = [
  {
    featured: true,
    tag: "Soirée",
    title: "Soirée DJ — Tropical Vibes",
    shortDesc: "Rejoignez-nous pour une soirée inoubliable sur le rooftop avec DJ Kwame aux platines. Cocktails spéciaux et ambiance garantie.",
    description: "Une soirée exceptionnelle sur notre rooftop avec vue panoramique sur Cotonou. DJ Kwame vous fera vibrer avec les meilleurs sons afro, dancehall et tropical house. Profitez de nos cocktails signatures à prix spécial et d\u2019une ambiance électrique jusqu\u2019au bout de la nuit. Dress code : chic décontracté.",
    day: "15",
    month: "MAR",
    time: "20h – 03h",
    location: "Rooftop",
    price: "Entrée : 5.000 F",
    thumb: "/images/featured-image-01.jpg",
    gallery: ["/images/featured-image-01.jpg", "/images/gallery_06.jpg", "/images/gallery_03.jpg"],
    includes: ["Accès rooftop VIP", "1 cocktail offert", "DJ set live", "Parking gratuit"],
  },
  {
    featured: false,
    tag: "Brunch",
    title: "Brunch du Dimanche",
    shortDesc: "Un brunch généreux avec fruits de mer frais, pâtisseries et jus naturels. Parfait pour un dimanche en famille.",
    description: "Chaque dimanche, Captain Purunchi vous invite à un brunch copieux et raffiné sur notre terrasse. Au programme : plateau de fruits de mer, pâtisseries maison, œufs bénedíct, jus frais pressés et café de qualité. Un moment convivial en famille ou entre amis dans un cadre exceptionnel.",
    day: "17",
    month: "MAR",
    time: "10h – 15h",
    location: "Terrasse",
    price: "Formule : 12.000 F",
    thumb: "/images/featured-image-02.jpg",
    gallery: ["/images/featured-image-02.jpg", "/images/gallery_02.jpg", "/images/gallery_10.jpg"],
    includes: ["Buffet à volonté", "Jus frais inclus", "Espace enfants", "Musique d\u2019ambiance"],
  },
  {
    featured: false,
    tag: "Musique Live",
    title: "Soirée Acoustique",
    shortDesc: "Savourez vos plats préférés en écoutant les meilleurs artistes locaux dans une ambiance intimiste.",
    description: "Découvrez les talents musicaux de Cotonou dans une atmosphère chaleureuse et intimiste. Nos artistes invités vous offriront un concert acoustique accompagnant parfaitement votre dîner. Guitare, voix et percussions pour une soirée mémorable.",
    day: "22",
    month: "MAR",
    time: "19h – 23h",
    location: "Salle principale",
    price: "Entrée libre",
    thumb: "/images/featured-image-03.jpg",
    gallery: ["/images/featured-image-03.jpg", "/images/gallery_01.jpg", "/images/gallery_09.jpg"],
    includes: ["Concert live", "Menu spécial soirée", "Ambiance cosy", "Réservation recommandée"],
  },
  {
    featured: false,
    tag: "Atelier",
    title: "Atelier Grillades & Cocktails",
    shortDesc: "Apprenez les secrets de nos grillades au feu de bois et préparez vos propres cocktails avec notre barman.",
    description: "Un atelier unique où notre chef vous révèle les techniques de grillade au feu de bois et notre barman vous apprend à réaliser 3 cocktails signatures. Repartez avec les recettes et le savoir-faire Captain Purunchi. Places limitées à 15 personnes.",
    day: "29",
    month: "MAR",
    time: "15h – 19h",
    location: "Cuisine ouverte",
    price: "15.000 F / personne",
    thumb: "/images/featured-image-04.jpg",
    gallery: ["/images/featured-image-04.jpg", "/images/gallery_04.jpg", "/images/gallery_08.jpg"],
    includes: ["Tablier offert", "Dégustation incluse", "Recettes à emporter", "15 places max"],
  },
  {
    featured: false,
    tag: "Spécial",
    title: "Anniversaire Captain Purunchi",
    shortDesc: "Célébrons ensemble avec un menu spécial, cocktails gratuits et musique live toute la soirée.",
    description: "Captain Purunchi fête son anniversaire et vous êtes tous invités ! Au programme : menu dégustation spécial, premier cocktail offert, musique live avec des artistes surprises et une ambiance festive dans tout l\u2019établissement. Un événement à ne pas manquer !",
    day: "05",
    month: "AVR",
    time: "18h – 02h",
    location: "Tout l\u2019établissement",
    price: "Entrée : 3.000 F",
    thumb: "/images/gallery_06.jpg",
    gallery: ["/images/gallery_06.jpg", "/images/gallery_05.jpg", "/images/gallery_07.jpg"],
    includes: ["1er cocktail offert", "Menu spécial", "Musique live", "Surprises"],
  },
];

const initialBlogPosts = [
  {
    title: "RETOUR SUR LA SOIRÉE TROPICAL VIBES",
    date: "15 FÉVRIER 2025",
    author: "L'équipe Captain Purunchi",
    thumb: "/images/featured-image-01.jpg",
  },
  {
    title: "LES SECRETS DU POISSON BRASÉ PARFAIT",
    date: "28 JANVIER 2025",
    author: "Chef Arnaud",
    thumb: "/images/featured-image-02.jpg",
  },
  {
    title: "NOS 5 COCKTAILS SIGNATURES À DÉCOUVRIR",
    date: "10 JANVIER 2025",
    author: "Le Barman",
    thumb: "/images/featured-image-03.jpg",
  },
  {
    title: "NOUVEAU MENU FRUITS DE MER SAISON 2025",
    date: "22 DÉCEMBRE 2024",
    author: "Chef Arnaud",
    thumb: "/images/featured-image-04.jpg",
  },
];

const initialTestimonials = [
  {
    text: "Un cadre magnifique avec une vue imprenable depuis le rooftop. Les fruits de mer sont d\u2019une fraîcheur exceptionnelle et le service est impeccable. On revient chaque week-end !",
    name: "Amina K.",
    role: "Cliente régulière",
    stars: 5,
  },
  {
    text: "J\u2019ai organisé l\u2019anniversaire de ma femme ici et tout était parfait. L\u2019équipe a été aux petits soins, la décoration superbe et la nourriture délicieuse. Merci Captain Purunchi !",
    name: "Patrick D.",
    role: "Événement privé",
    stars: 5,
  },
  {
    text: "Les cocktails sont incroyables, surtout le Cocktail Purunchi ! L\u2019ambiance des soirées DJ est top. Le meilleur spot de Cotonou pour sortir entre amis.",
    name: "Sarah M.",
    role: "Passionnée de cocktails",
    stars: 4.5,
  },
  {
    text: "Nous avons séjourné dans la Suite Capitaine et c\u2019était un rêve. La chambre est spacieuse, la vue magnifique et le petit-déjeuner copieux. Une adresse à recommander sans hésiter.",
    name: "Jean-Marc & Linda",
    role: "Séjour en couple",
    stars: 5,
  },
  {
    text: "Le poisson brasé est tout simplement le meilleur de Cotonou. On sent la qualité des produits frais. Le personnel est accueillant et souriant. Bravo !",
    name: "Rachid B.",
    role: "Gourmet",
    stars: 5,
  },
  {
    text: "Super endroit pour un brunch en famille le dimanche. Les enfants ont adoré et nous aussi. Le buffet était généreux et varié. On y retourne très bientôt !",
    name: "Clémence A.",
    role: "Brunch en famille",
    stars: 5,
  },
];

async function main() {
  // Seed hero slides
  const heroCount = await prisma.heroSlide.count();
  if (heroCount > 0) {
    console.log(`DB already has ${heroCount} hero slides. Skipping.`);
  } else {
    for (const slide of initialSlides) {
      await prisma.heroSlide.create({
        data: { src: slide.src, order: slide.order, active: true },
      });
    }
    console.log(`Seeded ${initialSlides.length} hero slides.`);
  }

  // Seed specialties
  const specCount = await prisma.specialty.count();
  if (specCount > 0) {
    console.log(`DB already has ${specCount} specialties. Skipping.`);
  } else {
    for (const item of initialSpecialties) {
      await prisma.specialty.create({
        data: { title: item.title, description: item.description, src: item.src, order: item.order, active: true },
      });
    }
    console.log(`Seeded ${initialSpecialties.length} specialties.`);
  }

  // Seed menu categories + items
  const menuCount = await prisma.menuCategory.count();
  if (menuCount > 0) {
    console.log(`DB already has ${menuCount} menu categories. Skipping.`);
  } else {
    for (let ci = 0; ci < initialMenu.length; ci++) {
      const cat = initialMenu[ci];
      const created = await prisma.menuCategory.create({
        data: { name: cat.name, icon: cat.icon, order: ci, active: true },
      });
      for (let ii = 0; ii < cat.items.length; ii++) {
        const item = cat.items[ii];
        await prisma.menuItem.create({
          data: {
            categoryId: created.id,
            name: item.name,
            description: item.description,
            price: item.price,
            order: ii,
            active: true,
          },
        });
      }
    }
    console.log(`Seeded ${initialMenu.length} menu categories with items.`);
  }

  // Seed gallery images
  const galleryCount = await prisma.galleryImage.count();
  if (galleryCount > 0) {
    console.log(`DB already has ${galleryCount} gallery images. Skipping.`);
  } else {
    for (const img of initialGallery) {
      await prisma.galleryImage.create({
        data: { src: img.src, alt: img.alt, order: img.order, active: true },
      });
    }
    console.log(`Seeded ${initialGallery.length} gallery images.`);
  }

  // Seed rooms
  const roomCount = await prisma.room.count();
  if (roomCount > 0) {
    console.log(`DB already has ${roomCount} rooms. Skipping.`);
  } else {
    for (let i = 0; i < initialRooms.length; i++) {
      const r = initialRooms[i];
      await prisma.room.create({
        data: {
          name: r.name,
          shortDesc: r.shortDesc,
          price: r.price,
          thumb: r.thumb,
          capacity: r.capacity,
          features: JSON.stringify(r.features),
          description: r.description,
          gallery: JSON.stringify(r.gallery),
          order: i,
          active: true,
        },
      });
    }
    console.log(`Seeded ${initialRooms.length} rooms.`);
  }

  // Seed events
  const eventCount = await prisma.event.count();
  if (eventCount > 0) {
    console.log(`DB already has ${eventCount} events. Skipping.`);
  } else {
    for (let i = 0; i < initialEvents.length; i++) {
      const e = initialEvents[i];
      await prisma.event.create({
        data: {
          featured: e.featured,
          tag: e.tag,
          title: e.title,
          shortDesc: e.shortDesc,
          description: e.description,
          day: e.day,
          month: e.month,
          time: e.time,
          location: e.location,
          price: e.price,
          thumb: e.thumb,
          gallery: JSON.stringify(e.gallery),
          includes: JSON.stringify(e.includes),
          order: i,
          active: true,
        },
      });
    }
    console.log(`Seeded ${initialEvents.length} events.`);
  }

  // Seed blog posts
  const blogCount = await prisma.blogPost.count();
  if (blogCount > 0) {
    console.log(`DB already has ${blogCount} blog posts. Skipping.`);
  } else {
    for (let i = 0; i < initialBlogPosts.length; i++) {
      const p = initialBlogPosts[i];
      await prisma.blogPost.create({
        data: {
          title: p.title,
          date: p.date,
          author: p.author,
          thumb: p.thumb,
          order: i,
          active: true,
        },
      });
    }
    console.log(`Seeded ${initialBlogPosts.length} blog posts.`);
  }

  // Seed testimonials
  const testimonialCount = await prisma.testimonial.count();
  if (testimonialCount > 0) {
    console.log(`DB already has ${testimonialCount} testimonials. Skipping.`);
  } else {
    for (let i = 0; i < initialTestimonials.length; i++) {
      const t = initialTestimonials[i];
      await prisma.testimonial.create({
        data: {
          text: t.text,
          name: t.name,
          role: t.role,
          stars: t.stars,
          order: i,
          active: true,
        },
      });
    }
    console.log(`Seeded ${initialTestimonials.length} testimonials.`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
