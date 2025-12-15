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
      attendance: {
        Row: {
          id: string
          member_id: string
          timestamp: string
          method: string
          entry_time: string
          exit_time: string | null
          recorded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          member_id: string
          timestamp?: string
          method?: string
          entry_time?: string
          exit_time?: string | null
          recorded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          timestamp?: string
          method?: string
          entry_time?: string
          exit_time?: string | null
          recorded_by?: string | null
          created_at?: string
        }
      }
      members: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          age: number
          gender: string
          plan: string
          plan_start_date: string
          plan_end_date: string
          status: string
          join_date: string
          last_visit_date: string | null
          photo_url: string | null
          face_descriptor: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          age?: number
          gender: string
          plan: string
          plan_start_date: string
          plan_end_date: string
          status?: string
          join_date?: string
          last_visit_date?: string | null
          photo_url?: string | null
          face_descriptor?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          age?: number
          gender?: string
          plan?: string
          plan_start_date?: string
          plan_end_date?: string
          status?: string
          join_date?: string
          last_visit_date?: string | null
          photo_url?: string | null
          face_descriptor?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
