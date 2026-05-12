import type { Category } from './lib/types'

const rawWhatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER?.trim() ?? ''

export const CATEGORIES: Category[] = [
  'Yogurt & Dairy Starters',
  'Milk Flavorings & Essences',
  'Preservatives & Additives',
  'Syrups & Toppings',
  'Milk Flavouring Powders (Bulk)',
  'Margarine & Spreads',
  'Baking Ingredients',
  'Food Coloring',
  'Other Products',
]

export const WHATSAPP_NUMBER         = rawWhatsappNumber.replace(/\D/g, '')
export const WHATSAPP_URL            = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : ''
export const WHATSAPP_DISPLAY_NUMBER = rawWhatsappNumber
  ? (rawWhatsappNumber.startsWith('+') ? rawWhatsappNumber : `+${rawWhatsappNumber}`)
  : ''
export const WHATSAPP_CTA_LABEL = import.meta.env.VITE_WHATSAPP_CTA_LABEL ?? 'Order on WhatsApp'
export const WHATSAPP_CTA_PREFILL = import.meta.env.VITE_WHATSAPP_CTA_PREFILL ?? ''
