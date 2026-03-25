export const ROLES = {
  super_admin: "Super Admin",
  director: "Directeur",
  manager: "Manager",
  accountant: "Comptable",
  cashier: "Caissier",
  waiter: "Serveur",
  receptionist: "Réceptionniste",
  chef: "Chef Cuisinier",
} as const;

export type Role = keyof typeof ROLES;

export const ROLE_LIST = Object.entries(ROLES).map(([value, label]) => ({ value, label }));

// Admin pages
export type AdminPage =
  | "dashboard"
  | "reservations"
  | "calendar"
  | "orders"
  | "menu"
  | "daily-menu"
  | "hero"
  | "specialties"
  | "gallery"
  | "rooms"
  | "events"
  | "testimonials"
  | "blog"
  | "comments"
  | "contact"
  | "team"
  | "activity"
  | "finance"
  | "caisse"
  | "factures"
  | "stock"
  | "ravitaillement"
  | "qrcode";

type Action = "read" | "create" | "update" | "delete" | "approve";

// Map URL paths to page keys
const PATH_TO_PAGE: Record<string, AdminPage> = {
  "/admin": "dashboard",
  "/admin/reservations": "reservations",
  "/admin/calendar": "calendar",
  "/admin/orders": "orders",
  "/admin/menu": "menu",
  "/admin/daily-menu": "daily-menu",
  "/admin/hero": "hero",
  "/admin/specialties": "specialties",
  "/admin/gallery": "gallery",
  "/admin/rooms": "rooms",
  "/admin/events": "events",
  "/admin/testimonials": "testimonials",
  "/admin/blog": "blog",
  "/admin/comments": "comments",
  "/admin/contact": "contact",
  "/admin/team": "team",
  "/admin/activity": "activity",
  "/admin/finance": "finance",
  "/admin/caisse": "caisse",
  "/admin/factures": "factures",
  "/admin/stock": "stock",
  "/admin/ravitaillement": "ravitaillement",
  "/admin/qrcode": "qrcode",
};

// Map API paths to page keys
const API_TO_PAGE: Record<string, AdminPage> = {
  "/api/table-reservations": "reservations",
  "/api/room-reservations": "reservations",
  "/api/event-reservations": "reservations",
  "/api/calendar": "calendar",
  "/api/orders": "orders",
  "/api/menu": "menu",
  "/api/daily-dishes": "daily-menu",
  "/api/hero": "hero",
  "/api/specialties": "specialties",
  "/api/gallery": "gallery",
  "/api/rooms": "rooms",
  "/api/events": "events",
  "/api/testimonials": "testimonials",
  "/api/blog": "blog",
  "/api/comments": "comments",
  "/api/contact": "contact",
  "/api/contact-messages": "contact",
  "/api/users": "team",
  "/api/activity-logs": "activity",
  "/api/finance": "finance",
  "/api/stock": "stock",
};

// Permission matrix: role → page → allowed actions
const PERMISSIONS: Record<Role, Record<AdminPage, Action[]>> = {
  super_admin: {
    dashboard: ["read"],
    reservations: ["read", "create", "update", "delete"],
    calendar: ["read", "create", "update"],
    orders: ["read", "create", "update", "delete"],
    menu: ["read", "create", "update", "delete"],
    "daily-menu": ["read", "create", "update", "delete"],
    hero: ["read", "create", "update", "delete"],
    specialties: ["read", "create", "update", "delete"],
    gallery: ["read", "create", "update", "delete"],
    rooms: ["read", "create", "update", "delete"],
    events: ["read", "create", "update", "delete"],
    testimonials: ["read", "create", "update", "delete"],
    blog: ["read", "create", "update", "delete"],
    comments: ["read", "create", "update", "delete"],
    contact: ["read", "create", "update", "delete"],
    team: ["read", "create", "update", "delete"],
    activity: ["read"],
    finance: ["read", "create", "update", "delete", "approve"],
    caisse: ["read", "create", "update", "delete"],
    factures: ["read", "create", "update", "delete"],
    stock: ["read", "create", "update", "delete"],
    ravitaillement: ["read", "create", "update", "delete"],
    qrcode: ["read"],
  },
  director: {
    dashboard: ["read"],
    reservations: ["read", "create", "update", "delete"],
    calendar: ["read", "create", "update"],
    orders: ["read", "create", "update", "delete"],
    menu: ["read", "create", "update", "delete"],
    "daily-menu": ["read", "create", "update", "delete"],
    hero: ["read", "create", "update", "delete"],
    specialties: ["read", "create", "update", "delete"],
    gallery: ["read", "create", "update", "delete"],
    rooms: ["read", "create", "update", "delete"],
    events: ["read", "create", "update", "delete"],
    testimonials: ["read", "create", "update", "delete"],
    blog: ["read", "create", "update", "delete"],
    comments: ["read", "create", "update", "delete"],
    contact: ["read", "create", "update", "delete"],
    team: ["read", "create", "update"],
    activity: ["read"],
    finance: ["read", "create", "update", "delete", "approve"],
    caisse: ["read", "create", "update", "delete"],
    factures: ["read", "create", "update", "delete"],
    stock: ["read", "create", "update", "delete"],
    ravitaillement: ["read", "create", "update", "delete"],
    qrcode: ["read"],
  },
  manager: {
    dashboard: ["read"],
    reservations: ["read", "create", "update", "delete"],
    calendar: ["read", "create", "update"],
    orders: ["read", "create", "update", "delete"],
    menu: ["read", "create", "update", "delete"],
    "daily-menu": ["read", "create", "update", "delete"],
    hero: ["read", "create", "update", "delete"],
    specialties: ["read", "create", "update", "delete"],
    gallery: ["read", "create", "update", "delete"],
    rooms: ["read", "create", "update", "delete"],
    events: ["read", "create", "update", "delete"],
    testimonials: ["read", "create", "update", "delete"],
    blog: ["read", "create", "update", "delete"],
    comments: ["read", "create", "update", "delete"],
    contact: ["read", "update"],
    team: [],
    activity: ["read"],
    finance: ["read", "create", "update", "approve"],
    caisse: ["read", "create", "update"],
    factures: ["read", "create", "update"],
    stock: ["read", "create", "update", "delete"],
    ravitaillement: ["read", "create", "update", "delete"],
    qrcode: ["read"],
  },
  accountant: {
    dashboard: ["read"],
    reservations: ["read"],
    calendar: ["read"],
    orders: ["read"],
    menu: ["read"],
    "daily-menu": ["read"],
    hero: [],
    specialties: [],
    gallery: [],
    rooms: ["read"],
    events: ["read"],
    testimonials: [],
    blog: [],
    comments: [],
    contact: ["read"],
    team: [],
    activity: [],
    finance: ["read", "create", "update", "delete"],
    caisse: ["read", "create", "update"],
    factures: ["read", "create", "update", "delete"],
    stock: ["read"],
    ravitaillement: ["read"],
    qrcode: ["read"],
  },
  cashier: {
    dashboard: ["read"],
    reservations: ["read"],
    calendar: ["read"],
    orders: ["read", "update"],
    menu: ["read"],
    "daily-menu": ["read"],
    hero: [],
    specialties: [],
    gallery: [],
    rooms: [],
    events: [],
    testimonials: [],
    blog: [],
    comments: [],
    contact: [],
    team: [],
    activity: [],
    finance: ["read", "create"],
    caisse: ["read", "create"],
    factures: [],
    stock: [],
    ravitaillement: [],
    qrcode: ["read"],
  },
  waiter: {
    dashboard: ["read"],
    reservations: ["read"],
    calendar: ["read"],
    orders: ["read", "update"],
    menu: ["read"],
    "daily-menu": ["read"],
    hero: [],
    specialties: [],
    gallery: [],
    rooms: [],
    events: [],
    testimonials: [],
    blog: [],
    comments: [],
    contact: [],
    team: [],
    activity: [],
    finance: [],
    caisse: [],
    factures: [],
    stock: [],
    ravitaillement: [],
    qrcode: ["read"],
  },
  receptionist: {
    dashboard: ["read"],
    reservations: ["read", "create", "update"],
    calendar: ["read", "create", "update"],
    orders: ["read"],
    menu: ["read"],
    "daily-menu": ["read"],
    hero: [],
    specialties: [],
    gallery: [],
    rooms: ["read"],
    events: ["read"],
    testimonials: [],
    blog: [],
    comments: [],
    contact: ["read"],
    team: [],
    activity: [],
    finance: [],
    caisse: [],
    factures: [],
    stock: [],
    ravitaillement: [],
    qrcode: ["read"],
  },
  chef: {
    dashboard: ["read"],
    reservations: [],
    calendar: [],
    orders: ["read", "update"],
    menu: ["read", "create", "update", "delete"],
    "daily-menu": ["read", "create", "update", "delete"],
    hero: [],
    specialties: ["read", "update"],
    gallery: [],
    rooms: [],
    events: [],
    testimonials: [],
    blog: [],
    comments: [],
    contact: [],
    team: [],
    activity: [],
    finance: [],
    caisse: [],
    factures: [],
    stock: ["read", "create", "update"],
    ravitaillement: ["read", "create", "update"],
    qrcode: ["read"],
  },
};

export function canAccess(role: string, page: AdminPage): boolean {
  const perms = PERMISSIONS[role as Role];
  if (!perms) return false;
  return (perms[page]?.length ?? 0) > 0;
}

export function canAction(role: string, page: AdminPage, action: Action): boolean {
  const perms = PERMISSIONS[role as Role];
  if (!perms) return false;
  return perms[page]?.includes(action) ?? false;
}

export function getPageFromPath(pathname: string): AdminPage | null {
  // Exact match first
  if (PATH_TO_PAGE[pathname]) return PATH_TO_PAGE[pathname];
  // Try prefix match for sub-pages (e.g. /admin/blog/xxx)
  for (const [path, page] of Object.entries(PATH_TO_PAGE)) {
    if (pathname.startsWith(path + "/")) return page;
  }
  return null;
}

export function getPageFromApiPath(pathname: string): AdminPage | null {
  // Strip trailing ID segments: /api/orders/abc → /api/orders
  for (const [prefix, page] of Object.entries(API_TO_PAGE)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return page;
  }
  return null;
}

export function getAccessiblePages(role: string): AdminPage[] {
  const perms = PERMISSIONS[role as Role];
  if (!perms) return [];
  return Object.entries(perms)
    .filter(([, actions]) => actions.length > 0)
    .map(([page]) => page as AdminPage);
}

export function getPermissionsForPage(role: string, page: AdminPage): Action[] {
  const perms = PERMISSIONS[role as Role];
  if (!perms) return [];
  return perms[page] ?? [];
}
