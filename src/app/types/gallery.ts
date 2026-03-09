export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  type: "image" | "video";
  order: number;
  active: boolean;
  createdAt: string;
}
