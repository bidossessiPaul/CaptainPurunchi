export interface Testimonial {
  id: string;
  text: string;
  name: string;
  role: string;
  image: string | null;
  avatar: string | null;
  stars: number;
  order: number;
  active: boolean;
  createdAt: string;
}
