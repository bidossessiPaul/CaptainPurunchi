export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  order: number;
  active: boolean;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  order: number;
  active: boolean;
  createdAt: string;
}

export interface MenuCategoryWithItems extends MenuCategory {
  items: MenuItem[];
}
