export type Category =
  | 'Yogurt & Dairy Starters'
  | 'Milk Flavorings & Essences'
  | 'Preservatives & Additives'
  | 'Syrups & Toppings'
  | 'Milk Flavouring Powders (Bulk)'
  | 'Margarine & Spreads'
  | 'Baking Ingredients'
  | 'Food Coloring'
  | 'Other Products';

export interface Product {
  id: string;
  name: string;
  category: Category;
  description?: string;
  price: string;
  image: string;
  isCustom?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  initials: string;
}
