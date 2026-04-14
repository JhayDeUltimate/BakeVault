export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row:    { id: string; name: string; slug: string; display_order: number; created_at: string }
        Insert: { id?: string; name: string; slug: string; display_order?: number; created_at?: string }
        Update: { id?: string; name?: string; slug?: string; display_order?: number; created_at?: string }
      }
      products: {
        Row: {
          id: string; name: string; slug: string; description: string | null
          category_id: string | null; image_url: string | null
          is_available: boolean; is_featured: boolean; price_type: string
          display_order: number; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; name: string; slug: string; description?: string | null
          category_id?: string | null; image_url?: string | null
          is_available?: boolean; is_featured?: boolean; price_type?: string
          display_order?: number; created_at?: string; updated_at?: string
        }
        Update: {
          id?: string; name?: string; slug?: string; description?: string | null
          category_id?: string | null; image_url?: string | null
          is_available?: boolean; is_featured?: boolean; price_type?: string
          display_order?: number; updated_at?: string
        }
      }
      enquiries: {
        Row: {
          id: string; items: Json; whatsapp_message: string | null
          customer_name: string | null; status: string; created_at: string
        }
        Insert: {
          id?: string; items: Json; whatsapp_message?: string | null
          customer_name?: string | null; status?: string; created_at?: string
        }
        Update: {
          status?: string
        }
      }
      testimonials: {
        Row: {
          id: string; customer_name: string; business_name: string | null
          initials: string | null; quote: string; is_visible: boolean
          display_order: number; created_at: string
        }
        Insert: {
          id?: string; customer_name: string; business_name?: string | null
          initials?: string | null; quote: string; is_visible?: boolean
          display_order?: number
        }
        Update: {
          customer_name?: string; business_name?: string | null; initials?: string | null
          quote?: string; is_visible?: boolean; display_order?: number
        }
      }
      settings: {
        Row:    { key: string; value: string; updated_at: string }
        Insert: { key: string; value: string; updated_at?: string }
        Update: { value?: string; updated_at?: string }
      }
    }
  }
}

// ─── Convenience row types ─────────────────────────────────────────────────────
export type DBCategory    = Database['public']['Tables']['categories']['Row']
export type DBProduct     = Database['public']['Tables']['products']['Row']
export type DBEnquiry     = Database['public']['Tables']['enquiries']['Row']
export type DBTestimonial = Database['public']['Tables']['testimonials']['Row']

// Product row with its category joined in
export type DBProductWithCategory = DBProduct & {
  categories: DBCategory | null
}