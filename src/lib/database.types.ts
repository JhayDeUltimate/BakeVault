export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: { user_id: string }
        Insert: { user_id: string }
        Update: { user_id?: string }
        Relationships: []
      }
      profiles: {
        Row:    { id: string; role: string }
        Insert: { id: string; role?: string }
        Update: { role?: string }
        Relationships: []
      }
      categories: {
        Row: { id: string; name: string; slug: string; display_order: number; seo_title: string | null; seo_description: string | null; created_at: string }
        Insert: { id?: string; name: string; slug: string; display_order?: number; seo_title?: string | null; seo_description?: string | null; created_at?: string }
        Update: { id?: string; name?: string; slug?: string; display_order?: number; seo_title?: string | null; seo_description?: string | null; created_at?: string }
        Relationships: []
      }
      products: {
        Row: {
          id: string; name: string; slug: string; description: string | null
          category_id: string | null; image_url: string | null
          image_urls: string[] | null
          is_available: boolean; is_featured: boolean; price_type: string
          display_order: number; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; name: string; slug: string; description?: string | null
          category_id?: string | null; image_url?: string | null; image_urls?: string[] | null
          is_available?: boolean; is_featured?: boolean; price_type?: string
          display_order?: number; created_at?: string; updated_at?: string
        }
        Update: {
          id?: string; name?: string; slug?: string; description?: string | null
          category_id?: string | null; image_url?: string | null; image_urls?: string[] | null
          is_available?: boolean; is_featured?: boolean; price_type?: string
          display_order?: number; updated_at?: string
        }
        Relationships: [{ foreignKeyName: 'products_category_id_fkey'; columns: ['category_id']; isOneToOne: false; referencedRelation: 'categories'; referencedColumns: ['id'] }]
      }
      enquiries: {
        Row: { id: string; items: Json; whatsapp_message: string | null; customer_name: string | null; idempotency_key: string | null; status: string; created_at: string }
        Insert: { id?: string; items: Json; whatsapp_message?: string | null; customer_name?: string | null; idempotency_key?: string | null; status?: string; created_at?: string }
        Update: { idempotency_key?: string | null; status?: string }
        Relationships: []
      }
      testimonials: {
        Row: { id: string; customer_name: string; business_name: string | null; initials: string | null; quote: string; rating: number; is_visible: boolean; display_order: number; created_at: string; admin_notified_at: string | null }
        Insert: { id?: string; customer_name: string; business_name?: string | null; initials?: string | null; quote: string; rating?: number; is_visible?: boolean; display_order?: number; admin_notified_at?: string | null }
        Update: { customer_name?: string; business_name?: string | null; initials?: string | null; quote?: string; rating?: number; is_visible?: boolean; display_order?: number; admin_notified_at?: string | null }
        Relationships: []
      }
      settings: {
        Row: { key: string; value: string; updated_at: string }
        Insert: { key: string; value: string; updated_at?: string }
        Update: { value?: string; updated_at?: string }
        Relationships: []
      }
      faq_categories: {
        Row: {
          id: string
          title: string
          icon: string
          display_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          icon?: string
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          icon?: string
          display_order?: number
          is_visible?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          id: string
          category_id: string
          question: string
          answer: string
          display_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          question: string
          answer: string
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          question?: string
          answer?: string
          display_order?: number
          is_visible?: boolean
          updated_at?: string
        }
        Relationships: [{ foreignKeyName: 'faq_items_category_id_fkey'; columns: ['category_id']; isOneToOne: false; referencedRelation: 'faq_categories'; referencedColumns: ['id'] }]
      }
      product_requests: {
        Row: {
          id: string; product_name: string; product_size: string | null
          quantity: number | null; notes: string | null
          contact_info: string | null
          status: string; created_at: string; admin_notified_at: string | null
        }
        Insert: {
          id?: string; product_name: string; product_size?: string | null
          quantity?: number | null; notes?: string | null
          contact_info?: string | null
          status?: string; created_at?: string; admin_notified_at?: string | null
        }
        Update: { status?: string; admin_notified_at?: string | null }
        Relationships: []
      }
      analytics_events: {
        Row: { id: string; event_type: string; event_data: Json; session_id: string | null; page: string | null; created_at: string }
        Insert: { id?: string; event_type: string; event_data?: Json; session_id?: string | null; page?: string | null; created_at?: string }
        Update: Record<string, never>
        Relationships: []
      }
      admin_activity_logs: {
        Row: {
          id: string
          admin_id: string | null
          admin_email: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          details: Json | null
          session_id: string | null
          page: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          admin_email?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          session_id?: string | null
          page?: string | null
          created_at?: string
        }
        Update: {
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          session_id?: string | null
          page?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      analytics_daily_summary: {
        Row: {
          day: string
          page_views: number
          product_views: number
          add_to_cart: number
          checkouts: number
        }
        Relationships: []
      }
      analytics_top_products: {
        Row: {
          product_id: string
          product_name: string | null
          add_count: number
        }
        Relationships: []
      }
    }
    Functions: {
      get_analytics_totals: {
        Args: { since_ts: string }
        Returns: { event_type: string; total: number }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type DBProfile         = Database['public']['Tables']['profiles']['Row']
export type DBCategory        = Database['public']['Tables']['categories']['Row']
export type DBProduct         = Database['public']['Tables']['products']['Row']
export type DBEnquiry         = Database['public']['Tables']['enquiries']['Row']
export type DBTestimonial     = Database['public']['Tables']['testimonials']['Row']
export type DBProductRequest  = Database['public']['Tables']['product_requests']['Row']
export type DBAnalyticsEvent  = Database['public']['Tables']['analytics_events']['Row']
export type DBAdminActivity   = Database['public']['Tables']['admin_activity_logs']['Row']
export type DBFAQCategory     = Database['public']['Tables']['faq_categories']['Row']
export type DBFAQItem         = Database['public']['Tables']['faq_items']['Row']
export type DBProductWithCategory = DBProduct & { categories: DBCategory | null }
export type DBFAQCategoryWithItems = DBFAQCategory & { faq_items: DBFAQItem[] }
