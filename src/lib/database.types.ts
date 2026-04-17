export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: { id: string; name: string; slug: string; display_order: number; created_at: string }
        Insert: { id?: string; name: string; slug: string; display_order?: number; created_at?: string }
        Update: { id?: string; name?: string; slug?: string; display_order?: number; created_at?: string }
        Relationships: []
      }
      products: {
        Row: {
          id: string; name: string; slug: string; description: string | null
          category_id: string | null; image_url: string | null
          image_urls: Json | null  // array of all image URLs; index 0 = primary
          is_available: boolean; is_featured: boolean; price_type: string
          display_order: number; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; name: string; slug: string; description?: string | null
          category_id?: string | null; image_url?: string | null; image_urls?: Json | null
          is_available?: boolean; is_featured?: boolean; price_type?: string
          display_order?: number; created_at?: string; updated_at?: string
        }
        Update: {
          id?: string; name?: string; slug?: string; description?: string | null
          category_id?: string | null; image_url?: string | null; image_urls?: Json | null
          is_available?: boolean; is_featured?: boolean; price_type?: string
          display_order?: number; updated_at?: string
        }
        Relationships: [{ foreignKeyName: 'products_category_id_fkey'; columns: ['category_id']; isOneToOne: false; referencedRelation: 'categories'; referencedColumns: ['id'] }]
      }
      enquiries: {
        Row: { id: string; items: Json; whatsapp_message: string | null; customer_name: string | null; status: string; created_at: string }
        Insert: { id?: string; items: Json; whatsapp_message?: string | null; customer_name?: string | null; status?: string; created_at?: string }
        Update: { status?: string }
        Relationships: []
      }
      testimonials: {
        Row: { id: string; customer_name: string; business_name: string | null; initials: string | null; quote: string; is_visible: boolean; display_order: number; created_at: string }
        Insert: { id?: string; customer_name: string; business_name?: string | null; initials?: string | null; quote: string; is_visible?: boolean; display_order?: number }
        Update: { customer_name?: string; business_name?: string | null; initials?: string | null; quote?: string; is_visible?: boolean; display_order?: number }
        Relationships: []
      }
      settings: {
        Row: { key: string; value: string; updated_at: string }
        Insert: { key: string; value: string; updated_at?: string }
        Update: { value?: string; updated_at?: string }
        Relationships: []
      }
      product_requests: {
        Row: { id: string; product_name: string; product_size: string | null; quantity: number | null; notes: string | null; status: string; created_at: string }
        Insert: { id?: string; product_name: string; product_size?: string | null; quantity?: number | null; notes?: string | null; status?: string; created_at?: string }
        Update: { status?: string }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type DBCategory        = Database['public']['Tables']['categories']['Row']
export type DBProduct         = Database['public']['Tables']['products']['Row']
export type DBEnquiry         = Database['public']['Tables']['enquiries']['Row']
export type DBTestimonial     = Database['public']['Tables']['testimonials']['Row']
export type DBProductRequest  = Database['public']['Tables']['product_requests']['Row']
export type DBProductWithCategory = DBProduct & { categories: DBCategory | null }