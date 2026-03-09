export interface Event {
  id: string;
  featured: boolean;
  tag: string;
  title: string;
  shortDesc: string;
  description: string;
  day: string;
  month: string;
  time: string;
  location: string;
  price: string;
  thumb: string;
  gallery: string[];
  includes: string[];
  order: number;
  active: boolean;
  createdAt: string;
}
