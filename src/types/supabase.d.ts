import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: Property;
        Insert: NewProperty;
        Update: Partial<Property>;
        Relationships: [];
      };
      bookings: {
        Row: Booking;
        Insert: NewBooking;
        Update: Partial<Booking>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
  };
};

export type BasicSupabaseClient = ReturnType<typeof createServerClient<Database>>;

declare module "hono" {
  interface ContextVariableMap {
    supabase: BasicSupabaseClient;
    user: User | null;
  }
}
