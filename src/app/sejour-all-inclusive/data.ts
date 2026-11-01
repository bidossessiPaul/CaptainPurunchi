export type Duration = 7 | 10;
export type Travelers = "solo" | "couple";

export interface RoomTier {
  key: string;
  name: string;
  tagline: string;
  features: string[];
  icon: string;
  badge?: string;
  prices: Record<Travelers, Record<Duration, number>>;
}

export const ROOM_TIERS: RoomTier[] = [
  {
    key: "standard",
    name: "Chambre Curaçao ou Marine",
    tagline: "Confort essentiel, climatisée",
    features: ["Chambre très confortable", "Climatisation", "Wi-Fi"],
    icon: "fa-bed",
    prices: { solo: { 7: 700, 10: 1000 }, couple: { 7: 1000, 10: 1500 } },
  },
  {
    key: "junior",
    name: "Suite Junior Caraïbes",
    tagline: "Suite avec kitchenette",
    features: ["Suite avec kitchenette", "Climatisation", "Wi-Fi"],
    icon: "fa-home",
    badge: "Le plus choisi",
    prices: { solo: { 7: 750, 10: 1100 }, couple: { 7: 1100, 10: 1600 } },
  },
  {
    key: "senior",
    name: "Suite Senior Les Arcadins / Les Grenadines",
    tagline: "Kitchenette + salon privé",
    features: ["Kitchenette et salon", "Climatisation", "Wi-Fi"],
    icon: "fa-star",
    badge: "Prestige",
    prices: { solo: { 7: 800, 10: 1200 }, couple: { 7: 1200, 10: 1700 } },
  },
];

export const INCLUDED = [
  { icon: "fa-plane", title: "Accueil & transferts aéroport", text: "Réception à l'arrivée et dépose à l'aéroport à votre départ." },
  { icon: "fa-bed", title: "Hébergement climatisé", text: "Chambres ou suites très confortables, climatisées." },
  { icon: "fa-cutlery", title: "3 repas par jour", text: "Dont 1 pique-nique à midi, signés d'un restaurant de haute gastronomie marine." },
  { icon: "fa-camera", title: "Visites & découvertes", text: "Les sites touristiques majeurs du Bénin, guidés." },
  { icon: "fa-car", title: "Transport inclus", text: "Déplacements vers les sites avec le véhicule de l'hôtel à disposition." },
];

export interface Stop {
  n: number;
  name: string;
  tag: string;
  text: string;
  image?: string;
}

export const STOPS: Stop[] = [
  { n: 1, name: "Cotonou", tag: "Culture", text: "Place des Amazones, mur du patrimoine, village des Arts.", image: "/images/sejour/amazone.webp" },
  { n: 2, name: "Ouidah", tag: "Histoire", text: "Arène Vodou, Temple des Pythons, Porte du Non-Retour.", image: "/images/sejour/ouidah.webp" },
  { n: 3, name: "Ganvié", tag: "Cité lacustre", text: "La cité sur pilotis et la rencontre avec les Tofinu." },
  { n: 4, name: "Possotomé", tag: "Nature", text: "La cascade et la détente dans les eaux thermales.", image: "/images/sejour/possotome.webp" },
  { n: 5, name: "Gogotinkpon", tag: "Bien-être", text: "Bain de boue thérapeutique et bienfaits naturels.", image: "/images/sejour/gogotinkpon.webp" },
  { n: 6, name: "Adjarra", tag: "Rivière", text: "La Rivière Noire et ses paysages naturels.", image: "/images/sejour/adjarra.webp" },
  { n: 7, name: "Abomey", tag: "Royaume", text: "Cité royale, palais des rois, musées et histoire.", image: "/images/sejour/abomey.webp" },
  { n: 8, name: "Eldorado", tag: "Plage", text: "Détente, pique-nique, baignade et sports nautiques.", image: "/images/sejour/eldorado.webp" },
];

export const AUDIENCES = [
  { icon: "fa-bolt", title: "Jeunes", items: ["Activités sportives", "Découvertes culturelles", "Soirées & détente"] },
  { icon: "fa-heart", title: "Adultes", items: ["Détente & bien-être", "Découverte culturelle", "Gastronomie"] },
  { icon: "fa-users", title: "Familles", items: ["Activités adaptées", "Excursions ludiques", "Sécurité & confort"] },
];

export const FALLBACK_WHATSAPP = "2290191277070";
export const FALLBACK_PHONE = "+229 01 91 27 70 70";

export const eur = (n: number) => `${n.toLocaleString("fr-FR")} €`;
export const cfa = (n: number) => `${Math.round(n * 655.957).toLocaleString("fr-FR")} FCFA`;
