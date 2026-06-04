export interface Room {
  id: string;
  name: string;
  slug: string;
  shortDesc: string;
  price: string;
  thumb: string;
  capacity: string;
  size: string | null;
  bedType: string | null;
  view: string | null;
  features: string[];
  description: string;
  gallery: string[];
  order: number;
  active: boolean;
  createdAt: string;
}
