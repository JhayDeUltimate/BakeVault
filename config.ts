const rawWhatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER?.trim() ?? '';

export const WHATSAPP_NUMBER = rawWhatsappNumber.replace(/\D/g, '');
export const WHATSAPP_URL = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : '';
export const WHATSAPP_DISPLAY_NUMBER = rawWhatsappNumber ? (rawWhatsappNumber.startsWith('+') ? rawWhatsappNumber : `+${rawWhatsappNumber}`) : '';
