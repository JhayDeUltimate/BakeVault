-- Store category-specific SEO metadata with the category record so renames do
-- not detach carefully written catalog meta from the category.

alter table public.categories
  add column if not exists seo_title text,
  add column if not exists seo_description text;

update public.categories
set
  seo_title = category_meta.seo_title,
  seo_description = category_meta.seo_description
from (
  values
    ('Yogurt & Dairy Starters', 'Yogurt Starter Culture & Kefir Starters in Lagos | BakeVault', 'Buy yogurt starter culture and kefir starters in Lagos Nigeria. Yogourmet Original, Probio, Kefir, and more. Same-day delivery. Wholesale and retail. Order via WhatsApp.'),
    ('Milk Flavorings & Essences', 'Milk Flavorings & Essences in Lagos Nigeria | BakeVault', 'Shop milk flavorings, dairy essences, and flavouring concentrates in Lagos. Wholesale and retail. Same-day delivery. Order via WhatsApp.'),
    ('Preservatives & Additives', 'Food Preservatives & Additives in Lagos Nigeria | BakeVault', 'Buy food-grade preservatives, stabilisers, and additives in Lagos. Suitable for bakers, confectioners, and food producers. Wholesale pricing available. Order via WhatsApp.'),
    ('Syrups & Toppings', 'Syrups & Toppings for Baking in Lagos | BakeVault', 'Shop flavoured syrups, dessert toppings, and waffle sauces in Lagos Nigeria. Ideal for cafes, bakeries, and home bakers. Same-day delivery. Order via WhatsApp.'),
    ('Milk Flavouring Powders (Bulk)', 'Milk Flavouring Powder Bulk Supply in Lagos | BakeVault', 'Buy milk flavouring powders in bulk in Lagos Nigeria. Ideal for yogurt producers, ice cream makers, and food manufacturers. Wholesale pricing. Order via WhatsApp.'),
    ('Margarine & Spreads', 'Baking Margarine & Spreads in Lagos Nigeria | BakeVault', 'Buy baking margarine, puff pastry fat, and spreads in Lagos. Wholesale and retail. Trusted by Lagos bakeries. Same-day delivery. Order via WhatsApp.'),
    ('Baking Ingredients', 'Bread Improver & Baking Ingredients in Lagos | BakeVault', 'Buy bread improvers, yeast, baking powder, and baking ingredients in Lagos Nigeria. Wholesale and retail supply. Same-day delivery. Order via WhatsApp.'),
    ('Food Coloring', 'Food Colouring in Lagos Nigeria | BakeVault', 'Buy food-grade food colouring, gel colours, and powdered colour in Lagos. Suitable for cakes, pastries, and confectionery. Wholesale pricing. Order via WhatsApp.'),
    ('Other Products', 'Other Baking Supplies in Lagos Nigeria | BakeVault', 'Browse a wide range of baking supplies and ingredients in Lagos Nigeria. Wholesale and retail. Same-day delivery. Order via WhatsApp.')
) as category_meta(name, seo_title, seo_description)
where public.categories.name = category_meta.name
  and public.categories.seo_title is null
  and public.categories.seo_description is null;
