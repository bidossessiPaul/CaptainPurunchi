export interface HeroSlide {
  id: string;
  src: string;
  title?: string | null;
  subtitle?: string | null;
  caption?: string | null;
  order: number;
  active: boolean;
  createdAt: string;
}
