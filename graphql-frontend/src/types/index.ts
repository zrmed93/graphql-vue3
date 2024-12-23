export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
}

export interface Category {
  id: string;
  name: string;
}

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
}

export type UserRole = 'admin' | 'user';