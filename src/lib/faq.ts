import type { DBFAQCategoryWithItems } from './database.types'

export interface FAQItemData {
  id?: string
  question: string
  answer: string
  display_order?: number
  is_visible?: boolean
}

export interface FAQCategoryData {
  id?: string
  title: string
  icon: string
  display_order?: number
  is_visible?: boolean
  items: FAQItemData[]
}

export const FAQ_FALLBACK: FAQCategoryData[] = [
  {
    title: 'Ordering & Payment',
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
    items: [
      {
        question: 'Where can I buy baking supplies online in Lagos?',
        answer:
          'Browse the catalog, add the items you want to your order, then tap "Request a Quote on WhatsApp." We\'ll send you a price breakdown, confirm availability, and process your order from there. The whole thing usually takes a few minutes.',
      },
      {
        question: 'Where can I buy wholesale baking ingredients in Lagos?',
        answer:
          'Both. If you\'re a bakery or buy in bulk, you\'ll get wholesale pricing on orders above ₦50,000. For smaller quantities, our standard retail rates apply. Either way, you\'re getting the same quality products; just let us know what you need when you reach out.',
      },
      {
        question: 'What is the minimum order for baking supplies?',
        answer:
          'There is no strict minimum for retail orders. For wholesale pricing to apply, your order needs to be above ₦50,000. If you\'re not sure which applies to you, just send us what you need and we\'ll work it out.',
      },
      {
        question: 'How do I pay for baking ingredients online in Nigeria?',
        answer:
          'We accept bank transfers. Once your order is confirmed via WhatsApp, we\'ll send you our account details. We don\'t process payment until you\'ve seen and confirmed the final price, so no surprises.',
      },
      {
        question: 'Can I pick up my order instead of getting it delivered?',
        answer:
          'Yes. If you\'re in Lagos and prefer to collect, we can arrange that. Let us know when you\'re ordering and we\'ll confirm a pickup time. It\'s a good option if you\'re in a hurry and you\'re close to us.',
      },
    ],
  },
  {
    title: 'Delivery',
    icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
    items: [
      {
        question: 'Who does same-day delivery of baking ingredients in Lagos?',
        answer:
          'Yes, for Lagos orders placed and confirmed before 2PM. Order in the morning, bake in the afternoon. If you\'re cutting it close, send us a message and we\'ll tell you honestly whether it\'s possible.',
      },
      {
        question: 'How much does baking supply delivery cost in Lagos?',
        answer:
          'Lagos delivery ranges from ₦1,500 to ₦10,000 depending on your location within the city. For nationwide shipping, we calculate the fee based on courier rates and the weight of your order. We\'ll quote you the exact amount before you confirm; nothing hidden.',
      },
      {
        question: 'Can I get baking ingredients delivered outside Lagos?',
        answer:
          'Yes. We ship nationwide through reliable courier partners. Delivery timelines outside Lagos are typically 1 to 3 business days depending on your state.',
      },
      {
        question: 'How long does baking supply delivery take in Nigeria?',
        answer:
          'Same day for Lagos orders before 2PM. For orders after 2PM, delivery is the next business day. Nationwide orders take 1 to 3 business days. We\'ll always give you an estimated time when your order is confirmed.',
      },
    ],
  },
  {
    title: 'Products',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    items: [
      {
        question: 'Where can I buy yogurt starter culture in Lagos Nigeria?',
        answer:
          'We carry a wide range of premium baking ingredients: milk flavourings and essences, yogurt and dairy starters, margarine and spreads, baking powder and improvers, food colours, syrups and toppings, preservatives and additives, and specialty ingredients. Browse the full catalog on the site. If you don\'t see what you need, request it and we\'ll look into sourcing it.',
      },
      {
        question: 'Are your products authentic and original?',
        answer:
          'Yes. We source directly from verified manufacturers and trusted distributors. Every product we stock meets our quality standards before it gets to you. If something ever falls short, we want to know; that\'s what the 24-hour issue window is for.',
      },
      {
        question: 'What if I need a product that\'s not on the website?',
        answer:
          'Use the "Request a Product" form on the catalog page. Tell us the product name, size, and how much you need. We source on request for both retail and bulk quantities and will update you once we\'ve looked into it.',
      },
      {
        question: 'How do I choose the right baking ingredient for my recipe?',
        answer:
          'Yes. Each product page has an AI assistant that can answer specific usage questions: dosage, substitutes, what it works best for. For more detailed advice, send us a WhatsApp message and our team will give you a direct answer. We know our products well.',
      },
      {
        question: 'Do you sell to home bakers or only professional bakeries?',
        answer:
          'Both. Whether you\'re making one celebration cake or running a high-volume production kitchen, you\'re welcome here. We adjust pricing based on quantity, not on who you are.',
      },
    ],
  },
  {
    title: 'Returns & Refunds',
    icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
    items: [
      {
        question: 'What is the return policy for baking ingredients bought online?',
        answer:
          'If your order arrives damaged, defective, or incorrect, we\'ll replace or refund it, no argument. You need to report it within 24 hours of delivery with clear photos via WhatsApp. For change-of-mind cancellations after an order is confirmed and dispatched, we don\'t offer refunds, so please check your order carefully before confirming. Opened or used products cannot be returned.',
      },
      {
        question: 'How long does a refund take to process?',
        answer:
          'Once we\'ve confirmed the issue, refunds are processed within 3 to 5 business days via bank transfer to the account you paid from.',
      },
      {
        question: 'What should I do if my order arrives damaged?',
        answer:
          'The moment you notice something wrong. Either wrong item, damaged packaging, missing product. Please take clear photos and send them to us on WhatsApp straight away. Don\'t wait. The 24-hour window starts from when your order is delivered. The faster you report it, the faster we fix it.',
      },
    ],
  },
]

export function mapDBFAQs(rows: DBFAQCategoryWithItems[]): FAQCategoryData[] {
  return rows
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map(category => ({
      id: category.id,
      title: category.title,
      icon: category.icon,
      display_order: category.display_order,
      is_visible: category.is_visible,
      items: (category.faq_items ?? [])
        .slice()
        .sort((a, b) => a.display_order - b.display_order)
        .map(item => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
          display_order: item.display_order,
          is_visible: item.is_visible,
        })),
    }))
}
