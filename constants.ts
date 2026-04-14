import { Category, Product, Testimonial } from './types';

const rawWhatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER?.trim() ?? '';

export const CATEGORIES: Category[] = [
  'Yogurt & Dairy Starters',
  'Milk Flavorings & Essences',
  'Preservatives & Additives',
  'Syrups & Toppings',
  'Milk Flavouring Powders (Bulk)',
  'Margarine & Spreads',
  'Baking Ingredients',
  'Food Coloring',
  'Other Products'
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Yogourmet Yogurt Starter',
    category: 'Yogurt & Dairy Starters',
    price: 'Wholesale',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=1200',
    description: 'The gold standard for home and commercial yogurt production. Achieve a smooth, creamy texture and perfect tang every single time.'
  },
  {
    id: '4',
    name: 'Lux Essence Milk Flavour',
    category: 'Milk Flavorings & Essences',
    price: 'Wholesale',
    image: 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?auto=format&fit=crop&q=80&w=1200',
    description: 'A highly concentrated premium essence that delivers a rich, creamy aroma to breads, cakes, and dairy products. The secret to that signature bakery scent.'
  },
  {
    id: '17',
    name: "Hershey's Chocolate Syrup",
    category: 'Syrups & Toppings',
    price: 'Wholesale',
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&q=80&w=1200',
    description: 'Genuine chocolate flavor that remains smooth and decadent. Perfect for drizzling over masterpieces or mixing into rich batters.'
  },
  {
    id: '23',
    name: 'Havana Active Baking Powder',
    category: 'Baking Ingredients',
    price: 'Wholesale',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1200',
    description: 'Engineered for high-altitude and tropical climates. Ensures a consistent, reliable rise for all your breads and pastries.'
  },
  { id: '2', name: 'Yogourmet Probiotic Yogurt Starter', category: 'Yogurt & Dairy Starters', price: 'Wholesale', image: 'https://picsum.photos/seed/yogurt2/400/300' },
  { id: '3', name: 'Milk Tantaliza Ex (Urban Foods)', category: 'Milk Flavorings & Essences', price: 'Wholesale', image: 'https://picsum.photos/seed/milk1/400/300' },
  { id: '5', name: 'Urch Gold Raw Milk (Concentrated)', category: 'Milk Flavorings & Essences', price: 'Wholesale', image: 'https://picsum.photos/seed/milk3/400/300' },
  { id: '6', name: 'IK Best Milk Flavouring Powder', category: 'Milk Flavorings & Essences', price: 'Wholesale', image: 'https://picsum.photos/seed/powder1/400/300' },
  { id: '7', name: 'Havana Milk Flavour Powder', category: 'Milk Flavorings & Essences', price: 'Wholesale', image: 'https://picsum.photos/seed/powder2/400/300' },
  { id: '8', name: 'Conflaco Butter Scotch', category: 'Milk Flavorings & Essences', price: 'Wholesale', image: 'https://picsum.photos/seed/flavor1/400/300' },
  { id: '9', name: 'Conflaco Cream Vanilla Ex', category: 'Milk Flavorings & Essences', price: 'Wholesale', image: 'https://picsum.photos/seed/flavor2/400/300' },
  { id: '10', name: 'Conflaco Butter Milk', category: 'Milk Flavorings & Essences', price: 'Wholesale', image: 'https://picsum.photos/seed/flavor3/400/300' },
  { id: '11', name: 'Conflaco Condensed Milk', category: 'Milk Flavorings & Essences', price: 'Wholesale', image: 'https://picsum.photos/seed/flavor4/400/300' },
  { id: '12', name: 'Super Milk Oil Flavour 288', category: 'Milk Flavorings & Essences', price: 'Wholesale', image: 'https://picsum.photos/seed/oil1/400/300' },
  { id: '13', name: 'Pearl Foods & Beverages Milk Oil', category: 'Milk Flavorings & Essences', price: 'Wholesale', image: 'https://picsum.photos/seed/oil2/400/300' },
  { id: '14', name: 'Sorbic Acid (Wang Long brand)', category: 'Preservatives & Additives', price: 'Wholesale', image: 'https://picsum.photos/seed/acid1/400/300' },
  { id: '15', name: 'CEED Bread Softener', category: 'Preservatives & Additives', price: 'Wholesale', image: 'https://picsum.photos/seed/soften/400/300' },
  { id: '16', name: 'Bravo Calcium Propionate', category: 'Preservatives & Additives', price: 'Wholesale', image: 'https://picsum.photos/seed/calcium/400/300' },
  { id: '18', name: "Hershey's Syrup (Strawberry)", category: 'Syrups & Toppings', price: 'Wholesale', image: 'https://picsum.photos/seed/straw/400/300' },
  { id: '19', name: "Hershey's Syrup (Caramel)", category: 'Syrups & Toppings', price: 'Wholesale', image: 'https://picsum.photos/seed/cara/400/300' },
  { id: '20', name: 'La Royal Milk Flavouring Powder', category: 'Milk Flavouring Powders (Bulk)', price: 'Wholesale', image: 'https://picsum.photos/seed/bulk1/400/300' },
  { id: '21', name: 'Rhoda Margarine', category: 'Margarine & Spreads', price: 'Wholesale', image: 'https://picsum.photos/seed/marg1/400/300' },
  { id: '22', name: 'Super Delicacy Margarine', category: 'Margarine & Spreads', price: 'Wholesale', image: 'https://picsum.photos/seed/marg2/400/300' },
  { id: '24', name: 'Rose Baking Powder', category: 'Baking Ingredients', price: 'Wholesale', image: 'https://picsum.photos/seed/baking2/400/300' },
  { id: '25', name: 'Silver Crown Baking Powder', category: 'Baking Ingredients', price: 'Wholesale', image: 'https://picsum.photos/seed/baking3/400/300' },
  { id: '26', name: 'Dynami (Bread Improver) 5kg', category: 'Baking Ingredients', price: 'Wholesale', image: 'https://picsum.photos/seed/bread/400/300' },
  { id: '27', name: 'Bravo Food Colour - Chocolate Brown', category: 'Food Coloring', price: 'Wholesale', image: 'https://picsum.photos/seed/color1/400/300' },
  { id: '28', name: 'Bravo Food Colour - Egg Yellow', category: 'Food Coloring', price: 'Wholesale', image: 'https://picsum.photos/seed/color2/400/300' },
  { id: '29', name: 'Twist Tie (10cm, 100pcs)', category: 'Other Products', price: 'Wholesale', image: 'https://picsum.photos/seed/tie/400/300' },
  { id: '30', name: 'Coconut Flakes/Chips', category: 'Other Products', price: 'Wholesale', image: 'https://picsum.photos/seed/coco/400/300' },
  { id: '31', name: 'Cake Boards/Discs (Multicolor)', category: 'Other Products', price: 'Wholesale', image: 'https://picsum.photos/seed/boards/400/300' },
  { id: '32', name: 'Big Bake Bread Improver', category: 'Other Products', price: 'Wholesale', image: 'https://picsum.photos/seed/bake/400/300' },
  { id: '33', name: 'STK Royal Food Additive', category: 'Other Products', price: 'Wholesale', image: 'https://picsum.photos/seed/stk/400/300' },
  { id: '34', name: 'Cee Calcium Propionate', category: 'Other Products', price: 'Wholesale', image: 'https://picsum.photos/seed/cee/400/300' },
  { id: '35', name: 'Premium Icing Sugar (Leviti)', category: 'Other Products', price: 'Wholesale', image: 'https://picsum.photos/seed/icing/400/300' }
];

export const TESTIMONIALS: Testimonial[] = [
  { id: 1, name: 'Amaka O.', role: 'Lagos Pastries', quote: 'BakeVault is my go-to for Havana Active. Always fresh.', initials: 'AO' },
  { id: 2, name: 'Tunde W.', role: 'Mainline Breads', quote: 'Wholesale prices saved our bakery 15%. Fast delivery!', initials: 'TW' },
  { id: 3, name: 'Mrs. Adeyemi', role: 'The Cake Studio', quote: 'Finally a supplier that understands Lagos urgency!', initials: 'MA' }
];

export const WHATSAPP_NUMBER = rawWhatsappNumber.replace(/\D/g, '');
export const WHATSAPP_URL = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : '';
export const WHATSAPP_DISPLAY_NUMBER = rawWhatsappNumber ? (rawWhatsappNumber.startsWith('+') ? rawWhatsappNumber : `+${rawWhatsappNumber}`) : '';
