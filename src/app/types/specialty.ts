export interface Specialty {
  id: string;
  title: string;
  slug: string;
  description: string;
  details: string | null;
  src: string;
  order: number;
  active: boolean;
  createdAt: string;
}
