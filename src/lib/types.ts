export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: 'Retail' | 'Wholesale';
  image: string;
  isCustom?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}
