export const PAYMENT_METHODS = [
  { value: "", label: "Non spécifié" },
  { value: "especes", label: "Espèces" },
  { value: "carte", label: "Carte bancaire" },
  { value: "mtn_money", label: "MTN Money" },
  { value: "moov_money", label: "Moov Money" },
  { value: "virement", label: "Virement bancaire" },
] as const;

export const PAYMENT_LABELS: Record<string, string> = Object.fromEntries(
  PAYMENT_METHODS.filter((m) => m.value).map((m) => [m.value, m.label])
);

export const REVENUE_SOURCES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "bar", label: "Bar" },
  { value: "hebergement", label: "Hébergement" },
  { value: "evenement", label: "Événements" },
  { value: "autre", label: "Autre" },
] as const;

export const REVENUE_SOURCE_LABELS: Record<string, string> = Object.fromEntries(
  REVENUE_SOURCES.map((s) => [s.value, s.label])
);

export const EXPENSE_CATEGORIES = [
  { value: "fournisseurs", label: "Achats fournisseurs" },
  { value: "salaires", label: "Salaires" },
  { value: "charges", label: "Charges fixes" },
  { value: "entretien", label: "Entretien & réparations" },
  { value: "marketing", label: "Marketing" },
  { value: "divers", label: "Divers" },
] as const;

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.value, c.label])
);

export const INVOICE_STATUSES = [
  { value: "draft", label: "Brouillon" },
  { value: "sent", label: "Envoyée" },
  { value: "paid", label: "Payée" },
  { value: "cancelled", label: "Annulée" },
] as const;

export const INVOICE_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  INVOICE_STATUSES.map((s) => [s.value, s.label])
);

// ── Stock ──────────────────────────────

export const STOCK_CATEGORIES = [
  { value: "ingredients", label: "Ingrédients" },
  { value: "boissons", label: "Boissons" },
  { value: "fournitures", label: "Fournitures" },
  { value: "emballages", label: "Emballages" },
  { value: "nettoyage", label: "Produits de nettoyage" },
  { value: "autre", label: "Autre" },
] as const;

export const STOCK_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  STOCK_CATEGORIES.map((c) => [c.value, c.label])
);

export const STOCK_UNITS = [
  { value: "kg", label: "Kilogramme (kg)" },
  { value: "g", label: "Gramme (g)" },
  { value: "l", label: "Litre (L)" },
  { value: "cl", label: "Centilitre (cl)" },
  { value: "piece", label: "Pièce" },
  { value: "bouteille", label: "Bouteille" },
  { value: "carton", label: "Carton" },
  { value: "sachet", label: "Sachet" },
  { value: "paquet", label: "Paquet" },
] as const;

export const STOCK_UNIT_LABELS: Record<string, string> = Object.fromEntries(
  STOCK_UNITS.map((u) => [u.value, u.label])
);

export const STOCK_MOVEMENT_TYPES = [
  { value: "entry", label: "Entrée" },
  { value: "exit", label: "Sortie" },
  { value: "waste", label: "Perte / Déchet" },
  { value: "adjustment", label: "Ajustement" },
] as const;

export const STOCK_MOVEMENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  STOCK_MOVEMENT_TYPES.map((t) => [t.value, t.label])
);
