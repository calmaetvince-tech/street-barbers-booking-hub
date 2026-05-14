export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      barber_schedule_overrides: {
        Row: {
          barber_id: string
          created_at: string
          end_time: string
          id: string
          is_working: boolean
          override_date: string
          start_time: string
        }
        Insert: {
          barber_id: string
          created_at?: string
          end_time?: string
          id?: string
          is_working?: boolean
          override_date: string
          start_time?: string
        }
        Update: {
          barber_id?: string
          created_at?: string
          end_time?: string
          id?: string
          is_working?: boolean
          override_date?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "barber_schedule_overrides_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      barber_working_hours: {
        Row: {
          barber_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_working: boolean
          start_time: string
        }
        Insert: {
          barber_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_working?: boolean
          start_time: string
        }
        Update: {
          barber_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_working?: boolean
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "barber_working_hours_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      barbers: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          location_id: string
          name: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          location_id: string
          name: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          location_id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barbers_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_dates: {
        Row: {
          barber_id: string | null
          blocked_date: string
          created_at: string
          id: string
          location_id: string | null
          reason: string | null
        }
        Insert: {
          barber_id?: string | null
          blocked_date: string
          created_at?: string
          id?: string
          location_id?: string | null
          reason?: string | null
        }
        Update: {
          barber_id?: string | null
          blocked_date?: string
          created_at?: string
          id?: string
          location_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_dates_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_time_slots: {
        Row: {
          barber_id: string | null
          blocked_date: string
          blocked_time: string
          created_at: string
          id: string
          location_id: string | null
          reason: string | null
        }
        Insert: {
          barber_id?: string | null
          blocked_date: string
          blocked_time: string
          created_at?: string
          id?: string
          location_id?: string | null
          reason?: string | null
        }
        Update: {
          barber_id?: string | null
          blocked_date?: string
          blocked_time?: string
          created_at?: string
          id?: string
          location_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_time_slots_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_time_slots_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          barber_id: string
          booking_date: string
          booking_time: string
          confirmation_sent_at: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          duration_at_booking: number | null
          id: string
          location_id: string
          price_at_booking: number | null
          reminder_sent_at: string | null
          service_id: string
          status: string
        }
        Insert: {
          barber_id: string
          booking_date: string
          booking_time: string
          confirmation_sent_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          duration_at_booking?: number | null
          id?: string
          location_id: string
          price_at_booking?: number | null
          reminder_sent_at?: string | null
          service_id: string
          status?: string
        }
        Update: {
          barber_id?: string
          booking_date?: string
          booking_time?: string
          created_at?: string
          confirmation_sent_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          duration_at_booking?: number | null
          id?: string
          location_id?: string
          price_at_booking?: number | null
          reminder_sent_at?: string | null
          service_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          id: string
          booking_id: string | null
          email_type: string
          recipient: string
          status: string
          error_message: string | null
          sent_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          email_type: string
          recipient: string
          status: string
          error_message?: string | null
          sent_at?: string
        }
        Update: {
          id?: string
          booking_id?: string | null
          email_type?: string
          recipient?: string
          status?: string
          error_message?: string | null
          sent_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string
          created_at: string
          id: string
          maps_embed_url: string | null
          name: string
          phone: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          maps_embed_url?: string | null
          name: string
          phone: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          maps_embed_url?: string | null
          name?: string
          phone?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          name: string
          price: number
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_reminder_bookings: {
        Args: Record<string, never>
        Returns: {
          id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          booking_date: string
          booking_time: string
          price_at_booking: number | null
          barber_name: string
          service_name: string
          location_name: string
          location_address: string
          location_phone: string
        }[]
      }
      get_booked_slots: {
        Args: { _barber_id: string; _date: string }
        Returns: {
          booking_time: string
          duration_at_booking: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "barber" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
