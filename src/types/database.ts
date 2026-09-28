export type AppointmentStatus = "confirmed" | "cancelled" | "completed" | "no_show";

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [];
      };
      barbers: {
        Row: {
          id: string;
          name: string;
          role: string;
          is_active: boolean;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          is_active?: boolean;
          image_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["barbers"]["Insert"]>;
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          name: string;
          duration_minutes: number;
          price_ils: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          duration_minutes: number;
          price_ils: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [];
      };
      working_hours: {
        Row: {
          id: string;
          barber_id: string | null;
          day_of_week: number;
          is_open: boolean;
          open_time: string | null;
          close_time: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          barber_id?: string | null;
          day_of_week: number;
          is_open?: boolean;
          open_time?: string | null;
          close_time?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["working_hours"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "working_hours_barber_id_fkey";
            columns: ["barber_id"];
            isOneToOne: false;
            referencedRelation: "barbers";
            referencedColumns: ["id"];
          },
        ];
      };
      blocked_times: {
        Row: {
          id: string;
          barber_id: string | null;
          starts_at: string;
          ends_at: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          barber_id?: string | null;
          starts_at: string;
          ends_at: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blocked_times"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "blocked_times_barber_id_fkey";
            columns: ["barber_id"];
            isOneToOne: false;
            referencedRelation: "barbers";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          id: string;
          customer_id: string;
          barber_id: string;
          service_id: string;
          appointment_date: string;
          start_time: string;
          end_time: string;
          starts_at: string;
          ends_at: string;
          status: AppointmentStatus;
          booking_reference: string;
          cancellation_token: string;
          customer_notes: string | null;
          created_at: string;
          updated_at: string;
          cancelled_at: string | null;
        };
        Insert: {
          id?: string;
          customer_id: string;
          barber_id: string;
          service_id: string;
          appointment_date: string;
          start_time: string;
          end_time: string;
          starts_at?: string;
          ends_at?: string;
          status?: AppointmentStatus;
          booking_reference: string;
          cancellation_token?: string;
          customer_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          cancelled_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_barber_id_fkey";
            columns: ["barber_id"];
            isOneToOne: false;
            referencedRelation: "barbers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_messages: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          subject: string | null;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone?: string | null;
          subject?: string | null;
          message: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_barber_availability: {
        Args: {
          p_date: string;
          p_time_slot: string;
          p_service_id: string;
        };
        Returns: {
          barber_id: string;
          status: "available" | "booked" | "unavailable";
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
