export interface BlogPost {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  thumb: string;
  order: number;
  active: boolean;
  createdAt: string;
}

export interface BlogComment {
  id: string;
  postId: string;
  name: string;
  email: string;
  text: string;
  approved: boolean;
  createdAt: string;
}
