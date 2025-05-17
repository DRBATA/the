export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          duration_min: number
          id: number
          intensity: string
          potassium_loss_mg: number
          sodium_loss_mg: number
          timestamp: string
          user_id: string
        }
        Insert: {
          activity_type: string
          duration_min: number
          id?: number
          intensity: string
          potassium_loss_mg: number
          sodium_loss_mg: number
          timestamp: string
          user_id: string
        }
        Update: {
          activity_type?: string
          duration_min?: number
          id?: number
          intensity?: string
          potassium_loss_mg?: number
          sodium_loss_mg?: number
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      body_composition_logs: {
        Row: {
          body_fat_pct: number
          height_cm: number | null
          id: number
          measured_at: string
          notes: string | null
          user_id: string
          weight_kg: number
        }
        Insert: {
          body_fat_pct: number
          height_cm?: number | null
          id?: number
          measured_at: string
          notes?: string | null
          user_id: string
          weight_kg: number
        }
        Update: {
          body_fat_pct?: number
          height_cm?: number | null
          id?: number
          measured_at?: string
          notes?: string | null
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          calories: number | null
          carbs_g: number | null
          fat_g: number | null
          food_item: string
          id: number
          magnesium_mg: number | null
          notes: string | null
          potassium_mg: number | null
          protein_g: number | null
          serving_qty: number
          serving_unit: string
          sodium_mg: number | null
          timestamp: string
          user_id: string | null
          water_ml: number | null
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          food_item: string
          id?: never
          magnesium_mg?: number | null
          notes?: string | null
          potassium_mg?: number | null
          protein_g?: number | null
          serving_qty: number
          serving_unit: string
          sodium_mg?: number | null
          timestamp?: string
          user_id?: string | null
          water_ml?: number | null
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          food_item?: string
          id?: never
          magnesium_mg?: number | null
          notes?: string | null
          potassium_mg?: number | null
          protein_g?: number | null
          serving_qty?: number
          serving_unit?: string
          sodium_mg?: number | null
          timestamp?: string
          user_id?: string | null
          water_ml?: number | null
        }
        Relationships: []
      }
      hydration_logs: {
        Row: {
          bottle_saved: boolean | null
          brand: string | null
          caffeine_present: boolean | null
          carbon_kg: number | null
          drink_id: string | null
          drink_type: string | null
          electrolyte_support: boolean | null
          id: string
          notes: string | null
          serving_size_ml: number | null
          source: string | null
          timestamp: string
          urine_color: number | null
          user_id: string
          volume_ml: number | null
        }
        Insert: {
          bottle_saved?: boolean | null
          brand?: string | null
          caffeine_present?: boolean | null
          carbon_kg?: number | null
          drink_id?: string | null
          drink_type?: string | null
          electrolyte_support?: boolean | null
          id?: string
          notes?: string | null
          serving_size_ml?: number | null
          source?: string | null
          timestamp?: string
          urine_color?: number | null
          user_id: string
          volume_ml?: number | null
        }
        Update: {
          bottle_saved?: boolean | null
          brand?: string | null
          caffeine_present?: boolean | null
          carbon_kg?: number | null
          drink_id?: string | null
          drink_type?: string | null
          electrolyte_support?: boolean | null
          id?: string
          notes?: string | null
          serving_size_ml?: number | null
          source?: string | null
          timestamp?: string
          urine_color?: number | null
          user_id?: string
          volume_ml?: number | null
        }
        Relationships: []
      }
      hydration_stats: {
        Row: {
          fluids_in_ml: number
          fluids_need_ml: number
          id: number
          percent_hydrated: number | null
          potassium_in_mg: number
          potassium_need_mg: number
          sodium_in_mg: number
          sodium_need_mg: number
          stats_date: string
          user_id: string
        }
        Insert: {
          fluids_in_ml: number
          fluids_need_ml: number
          id?: number
          percent_hydrated?: number | null
          potassium_in_mg?: number
          potassium_need_mg?: number
          sodium_in_mg?: number
          sodium_need_mg?: number
          stats_date: string
          user_id: string
        }
        Update: {
          fluids_in_ml?: number
          fluids_need_ml?: number
          id?: number
          percent_hydrated?: number | null
          potassium_in_mg?: number
          potassium_need_mg?: number
          sodium_in_mg?: number
          sodium_need_mg?: number
          stats_date?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          date_of_birth: string | null
          year_of_birth: number | null
          birthdate_is_exact: boolean | null
          email: string
          id: string
          sex: string | null
          stripe_customer_id: string | null
          water_subscription_status: string | null
        }
        Insert: {
          date_of_birth?: string | null
          year_of_birth?: number | null
          birthdate_is_exact?: boolean | null
          email: string
          id: string
          sex?: string | null
          stripe_customer_id?: string | null
          water_subscription_status?: string | null
        }
        Update: {
          date_of_birth?: string | null
          year_of_birth?: number | null
          birthdate_is_exact?: boolean | null
          email?: string
          id?: string
          sex?: string | null
          stripe_customer_id?: string | null
          water_subscription_status?: string | null
        }
        Relationships: []
      }
      weather_logs: {
      },
      user_greeting_preferences: {
        Row: {
          id: string;
          name: string;
          tone: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          tone: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          tone?: string;
          created_at?: string;
        };
        Relationships: []
      },
        Row: {
          humidity: number
          id: number
          lat: number
          logged_at: string | null
          lon: number
          temperature: number
          unit: string | null
          user_id: string
        }
        Insert: {
          humidity: number
          id?: number
          lat: number
          logged_at?: string | null
          lon: number
          temperature: number
          unit?: string | null
          user_id: string
        }
        Update: {
          humidity?: number
          id?: number
          lat?: number
          logged_at?: string | null
          lon?: number
          temperature?: number
          unit?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weather_logs_user_id_fkey"
            columns: ["user_id"]
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
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
