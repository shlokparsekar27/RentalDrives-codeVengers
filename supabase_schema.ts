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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string
          dropoff_location: string | null
          end_date: string
          id: string
          invoice_no: string | null
          invoice_url: string | null
          start_date: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          dropoff_location?: string | null
          end_date: string
          id?: string
          invoice_no?: string | null
          invoice_url?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price: number
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          dropoff_location?: string | null
          end_date?: string
          id?: string
          invoice_no?: string | null
          invoice_url?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string
          id: string
          payment_gateway: string
          payment_method: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          refund_amount: number | null
          refund_id: string | null
          refund_reason: string | null
          refund_status: string | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string
          id?: string
          payment_gateway?: string
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          refund_amount?: number | null
          refund_id?: string | null
          refund_reason?: string | null
          refund_status?: string | null
          refunded_at?: string | null
          status: Database["public"]["Enums"]["payment_status"]
          user_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          payment_gateway?: string
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          refund_amount?: number | null
          refund_id?: string | null
          refund_reason?: string | null
          refund_status?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          business_document_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_license_verified: boolean | null
          is_verified: boolean | null
          license_document_url: string | null
          phone_primary: string | null
          phone_secondary: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          business_document_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_license_verified?: boolean | null
          is_verified?: boolean | null
          license_document_url?: string | null
          phone_primary?: string | null
          phone_secondary?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          business_document_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_license_verified?: boolean | null
          is_verified?: boolean | null
          license_document_url?: string | null
          phone_primary?: string | null
          phone_secondary?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          user_id: string
          vehicle_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          user_id: string
          vehicle_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          certification_url: string | null
          created_at: string
          dropoff_available: boolean | null
          dropoff_charge: number | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          host_id: string
          id: string
          image_urls: string[] | null
          insurance_document_url: string | null
          is_certified: boolean | null
          license_plate: string
          make: string
          model: string
          pickup_available: boolean | null
          pickup_charge: number | null
          price_per_day: number
          rc_document_url: string | null
          seating_capacity: number
          status: Database["public"]["Enums"]["vehicle_status"]
          transmission: Database["public"]["Enums"]["transmission_type"]
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
          year: number
        }
        Insert: {
          certification_url?: string | null
          created_at?: string
          dropoff_available?: boolean | null
          dropoff_charge?: number | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          host_id: string
          id?: string
          image_urls?: string[] | null
          insurance_document_url?: string | null
          is_certified?: boolean | null
          license_plate: string
          make: string
          model: string
          pickup_available?: boolean | null
          pickup_charge?: number | null
          price_per_day: number
          rc_document_url?: string | null
          seating_capacity: number
          status?: Database["public"]["Enums"]["vehicle_status"]
          transmission: Database["public"]["Enums"]["transmission_type"]
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
          year: number
        }
        Update: {
          certification_url?: string | null
          created_at?: string
          dropoff_available?: boolean | null
          dropoff_charge?: number | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          host_id?: string
          id?: string
          image_urls?: string[] | null
          insurance_document_url?: string | null
          is_certified?: boolean | null
          license_plate?: string
          make?: string
          model?: string
          pickup_available?: boolean | null
          pickup_charge?: number | null
          price_per_day?: number
          rc_document_url?: string | null
          seating_capacity?: number
          status?: Database["public"]["Enums"]["vehicle_status"]
          transmission?: Database["public"]["Enums"]["transmission_type"]
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_host_id_fkey1"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_bookings_for_host: {
        Args: { host_id_input: string }
        Returns: {
          end_date: string
          id: string
          start_date: string
          status: string
          tourist_email: string
          tourist_name: string
          vehicle_make: string
          vehicle_model: string
        }[]
      }
    }
    Enums: {
      booking_status: "confirmed" | "cancelled" | "pending"
      fuel_type: "Petrol" | "Diesel" | "Electric"
      payment_status: "pending" | "paid" | "failed"
      refund_status: "initiated" | "processed" | "completed"
      transmission_type: "Manual" | "Automatic"
      user_role: "tourist" | "host" | "admin"
      vehicle_status: "pending" | "approved" | "rejected" | "archived"
      vehicle_type: "Car" | "Bike" | "Scooter"
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
      booking_status: ["confirmed", "cancelled", "pending"],
      fuel_type: ["Petrol", "Diesel", "Electric"],
      payment_status: ["pending", "paid", "failed"],
      refund_status: ["initiated", "processed", "completed"],
      transmission_type: ["Manual", "Automatic"],
      user_role: ["tourist", "host", "admin"],
      vehicle_status: ["pending", "approved", "rejected", "archived"],
      vehicle_type: ["Car", "Bike", "Scooter"],
    },
  },
} as const
