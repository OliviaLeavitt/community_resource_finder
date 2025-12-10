export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          website: string | null
          phone: string | null
          email: string | null
          data_source: string
          external_id: string | null
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          website?: string | null
          phone?: string | null
          email?: string | null
          data_source: string
          external_id?: string | null
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          website?: string | null
          phone?: string | null
          email?: string | null
          data_source?: string
          external_id?: string | null
          last_updated?: string
          created_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          organization_id: string | null
          name: string
          description: string | null
          category: string
          subcategory: string | null
          phone: string | null
          email: string | null
          website: string | null
          data_source: string
          external_id: string | null
          is_active: boolean
          last_verified: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          name: string
          description?: string | null
          category: string
          subcategory?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          data_source: string
          external_id?: string | null
          is_active?: boolean
          last_verified?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          name?: string
          description?: string | null
          category?: string
          subcategory?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          data_source?: string
          external_id?: string | null
          is_active?: boolean
          last_verified?: string
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          resource_id: string | null
          address_line1: string | null
          address_line2: string | null
          city: string
          state: string
          zip_code: string | null
          latitude: number | null
          longitude: number | null
          created_at: string
        }
        Insert: {
          id?: string
          resource_id?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city: string
          state: string
          zip_code?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          resource_id?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string
          state?: string
          zip_code?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
      }
      eligibility_rules: {
        Row: {
          id: string
          resource_id: string | null
          rule_type: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          resource_id?: string | null
          rule_type: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          resource_id?: string | null
          rule_type?: string
          description?: string
          created_at?: string
        }
      }
      open_hours: {
        Row: {
          id: string
          resource_id: string | null
          day_of_week: number
          opens_at: string | null
          closes_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          resource_id?: string | null
          day_of_week: number
          opens_at?: string | null
          closes_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          resource_id?: string | null
          day_of_week?: number
          opens_at?: string | null
          closes_at?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      embeddings: {
        Row: {
          id: string
          resource_id: string | null
          content: string
          embedding: number[] | null
          created_at: string
        }
        Insert: {
          id?: string
          resource_id?: string | null
          content: string
          embedding?: number[] | null
          created_at?: string
        }
        Update: {
          id?: string
          resource_id?: string | null
          content?: string
          embedding?: number[] | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
