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
      anamnesis: {
        Row: {
          aas: boolean | null
          angioplasty_date: string | null
          angioplasty_stents: string | null
          angioplasty_vessels: string | null
          anticoagulants: boolean | null
          antiplatelets: boolean | null
          apixaban: boolean | null
          bmi: string | null
          chest_pain: boolean | null
          chest_pain_characteristics: string | null
          chest_pain_duration: string | null
          chest_pain_radiation: string | null
          cholesterol: string | null
          clopidogrel: boolean | null
          created_at: string
          created_by: string
          dabigatran: boolean | null
          diabetes: boolean | null
          diabetes_control: string | null
          diabetes_meds: string | null
          diabetes_type: string | null
          dialysis: boolean | null
          doctor_crm: string | null
          doctor_name: string | null
          dyslipidemia: boolean | null
          dyslipidemia_meds: string | null
          dyspnea: boolean | null
          dyspnea_class: string | null
          edema: boolean | null
          edema_intensity: string | null
          edema_location: string | null
          edoxaban: boolean | null
          family_history: boolean | null
          family_history_details: string | null
          hdl: string | null
          heart_failure: boolean | null
          heart_failure_class: string | null
          hypertension: boolean | null
          hypertension_meds: string | null
          hypertension_time: string | null
          iam_date: string | null
          iam_location: string | null
          iam_treatment: string | null
          id: string
          ldl: string | null
          medications: Json | null
          obesity: boolean | null
          other_comorbidities: boolean | null
          other_comorbidities_details: string | null
          pad: boolean | null
          pad_severity: string | null
          pad_treatment: string | null
          palpitations: boolean | null
          palpitations_characteristics: string | null
          patient_id: string
          physical_activity: string | null
          prasugrel: boolean | null
          previous_angioplasty: boolean | null
          previous_iam: boolean | null
          renal_disease: boolean | null
          renal_stage: string | null
          respiratory_control: string | null
          respiratory_disease: boolean | null
          respiratory_type: string | null
          revascularization: boolean | null
          revascularization_date: string | null
          revascularization_grafts: string | null
          rivaroxaban: boolean | null
          sedentary: boolean | null
          smoking: string | null
          smoking_years: string | null
          stroke: boolean | null
          stroke_date: string | null
          stroke_sequelae: string | null
          stroke_type: string | null
          syncope: boolean | null
          syncope_frequency: string | null
          ticagrelor: boolean | null
          triglycerides: string | null
          updated_at: string
          valvopathy: boolean | null
          valvopathy_severity: string | null
          valvopathy_type: string | null
          warfarin: boolean | null
        }
        Insert: {
          aas?: boolean | null
          angioplasty_date?: string | null
          angioplasty_stents?: string | null
          angioplasty_vessels?: string | null
          anticoagulants?: boolean | null
          antiplatelets?: boolean | null
          apixaban?: boolean | null
          bmi?: string | null
          chest_pain?: boolean | null
          chest_pain_characteristics?: string | null
          chest_pain_duration?: string | null
          chest_pain_radiation?: string | null
          cholesterol?: string | null
          clopidogrel?: boolean | null
          created_at?: string
          created_by: string
          dabigatran?: boolean | null
          diabetes?: boolean | null
          diabetes_control?: string | null
          diabetes_meds?: string | null
          diabetes_type?: string | null
          dialysis?: boolean | null
          doctor_crm?: string | null
          doctor_name?: string | null
          dyslipidemia?: boolean | null
          dyslipidemia_meds?: string | null
          dyspnea?: boolean | null
          dyspnea_class?: string | null
          edema?: boolean | null
          edema_intensity?: string | null
          edema_location?: string | null
          edoxaban?: boolean | null
          family_history?: boolean | null
          family_history_details?: string | null
          hdl?: string | null
          heart_failure?: boolean | null
          heart_failure_class?: string | null
          hypertension?: boolean | null
          hypertension_meds?: string | null
          hypertension_time?: string | null
          iam_date?: string | null
          iam_location?: string | null
          iam_treatment?: string | null
          id?: string
          ldl?: string | null
          medications?: Json | null
          obesity?: boolean | null
          other_comorbidities?: boolean | null
          other_comorbidities_details?: string | null
          pad?: boolean | null
          pad_severity?: string | null
          pad_treatment?: string | null
          palpitations?: boolean | null
          palpitations_characteristics?: string | null
          patient_id: string
          physical_activity?: string | null
          prasugrel?: boolean | null
          previous_angioplasty?: boolean | null
          previous_iam?: boolean | null
          renal_disease?: boolean | null
          renal_stage?: string | null
          respiratory_control?: string | null
          respiratory_disease?: boolean | null
          respiratory_type?: string | null
          revascularization?: boolean | null
          revascularization_date?: string | null
          revascularization_grafts?: string | null
          rivaroxaban?: boolean | null
          sedentary?: boolean | null
          smoking?: string | null
          smoking_years?: string | null
          stroke?: boolean | null
          stroke_date?: string | null
          stroke_sequelae?: string | null
          stroke_type?: string | null
          syncope?: boolean | null
          syncope_frequency?: string | null
          ticagrelor?: boolean | null
          triglycerides?: string | null
          updated_at?: string
          valvopathy?: boolean | null
          valvopathy_severity?: string | null
          valvopathy_type?: string | null
          warfarin?: boolean | null
        }
        Update: {
          aas?: boolean | null
          angioplasty_date?: string | null
          angioplasty_stents?: string | null
          angioplasty_vessels?: string | null
          anticoagulants?: boolean | null
          antiplatelets?: boolean | null
          apixaban?: boolean | null
          bmi?: string | null
          chest_pain?: boolean | null
          chest_pain_characteristics?: string | null
          chest_pain_duration?: string | null
          chest_pain_radiation?: string | null
          cholesterol?: string | null
          clopidogrel?: boolean | null
          created_at?: string
          created_by?: string
          dabigatran?: boolean | null
          diabetes?: boolean | null
          diabetes_control?: string | null
          diabetes_meds?: string | null
          diabetes_type?: string | null
          dialysis?: boolean | null
          doctor_crm?: string | null
          doctor_name?: string | null
          dyslipidemia?: boolean | null
          dyslipidemia_meds?: string | null
          dyspnea?: boolean | null
          dyspnea_class?: string | null
          edema?: boolean | null
          edema_intensity?: string | null
          edema_location?: string | null
          edoxaban?: boolean | null
          family_history?: boolean | null
          family_history_details?: string | null
          hdl?: string | null
          heart_failure?: boolean | null
          heart_failure_class?: string | null
          hypertension?: boolean | null
          hypertension_meds?: string | null
          hypertension_time?: string | null
          iam_date?: string | null
          iam_location?: string | null
          iam_treatment?: string | null
          id?: string
          ldl?: string | null
          medications?: Json | null
          obesity?: boolean | null
          other_comorbidities?: boolean | null
          other_comorbidities_details?: string | null
          pad?: boolean | null
          pad_severity?: string | null
          pad_treatment?: string | null
          palpitations?: boolean | null
          palpitations_characteristics?: string | null
          patient_id?: string
          physical_activity?: string | null
          prasugrel?: boolean | null
          previous_angioplasty?: boolean | null
          previous_iam?: boolean | null
          renal_disease?: boolean | null
          renal_stage?: string | null
          respiratory_control?: string | null
          respiratory_disease?: boolean | null
          respiratory_type?: string | null
          revascularization?: boolean | null
          revascularization_date?: string | null
          revascularization_grafts?: string | null
          rivaroxaban?: boolean | null
          sedentary?: boolean | null
          smoking?: string | null
          smoking_years?: string | null
          stroke?: boolean | null
          stroke_date?: string | null
          stroke_sequelae?: string | null
          stroke_type?: string | null
          syncope?: boolean | null
          syncope_frequency?: string | null
          ticagrelor?: boolean | null
          triglycerides?: string | null
          updated_at?: string
          valvopathy?: boolean | null
          valvopathy_severity?: string | null
          valvopathy_type?: string | null
          warfarin?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "anamnesis_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      angioplasty_requests: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          clinic_id: string
          coronary_angiography: string
          created_at: string
          created_by: string
          id: string
          insurance_id: string
          insurance_name: string
          materials: Json
          patient_id: string
          patient_name: string
          proposed_treatment: string
          request_number: string
          status: Database["public"]["Enums"]["angioplasty_status"]
          surgical_team: Json
          tuss_procedures: Json
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          clinic_id: string
          coronary_angiography: string
          created_at?: string
          created_by: string
          id?: string
          insurance_id: string
          insurance_name: string
          materials?: Json
          patient_id: string
          patient_name: string
          proposed_treatment: string
          request_number: string
          status?: Database["public"]["Enums"]["angioplasty_status"]
          surgical_team: Json
          tuss_procedures?: Json
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          clinic_id?: string
          coronary_angiography?: string
          created_at?: string
          created_by?: string
          id?: string
          insurance_id?: string
          insurance_name?: string
          materials?: Json
          patient_id?: string
          patient_name?: string
          proposed_treatment?: string
          request_number?: string
          status?: Database["public"]["Enums"]["angioplasty_status"]
          surgical_team?: Json
          tuss_procedures?: Json
        }
        Relationships: [
          {
            foreignKeyName: "angioplasty_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "angioplasty_requests_insurance_id_fkey"
            columns: ["insurance_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "angioplasty_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clinic_id"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_insurance_id"
            columns: ["insurance_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_id"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_staff: {
        Row: {
          active: boolean
          clinic_id: string
          created_at: string
          id: string
          is_admin: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          clinic_id: string
          created_at?: string
          id?: string
          is_admin?: boolean
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          clinic_id?: string
          created_at?: string
          id?: string
          is_admin?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_staff_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          active: boolean
          address: string
          city: string
          cnpj: string | null
          created_at: string
          created_by: string
          email: string
          id: string
          logo_url: string | null
          name: string
          phone: string
          trading_name: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address: string
          city: string
          cnpj?: string | null
          created_at?: string
          created_by: string
          email: string
          id?: string
          logo_url?: string | null
          name: string
          phone: string
          trading_name?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string
          city?: string
          cnpj?: string | null
          created_at?: string
          created_by?: string
          email?: string
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string
          trading_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      insurance_audit_rules: {
        Row: {
          authorization_documents: string[] | null
          created_at: string
          created_by: string
          id: string
          insurance_company_id: string
          material_limits: Json
          pre_approved_justifications: string[] | null
          procedure_code: string
          procedure_name: string
          requires_prior_authorization: boolean
          requires_second_opinion: boolean
          updated_at: string
        }
        Insert: {
          authorization_documents?: string[] | null
          created_at?: string
          created_by: string
          id?: string
          insurance_company_id: string
          material_limits?: Json
          pre_approved_justifications?: string[] | null
          procedure_code: string
          procedure_name: string
          requires_prior_authorization?: boolean
          requires_second_opinion?: boolean
          updated_at?: string
        }
        Update: {
          authorization_documents?: string[] | null
          created_at?: string
          created_by?: string
          id?: string
          insurance_company_id?: string
          material_limits?: Json
          pre_approved_justifications?: string[] | null
          procedure_code?: string
          procedure_name?: string
          requires_prior_authorization?: boolean
          requires_second_opinion?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_audit_rules_insurance_company_id_fkey"
            columns: ["insurance_company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_companies: {
        Row: {
          active: boolean
          ans_registry: string
          city: string
          clinic_id: string
          cnpj: string
          company_name: string
          complement: string | null
          contact_person: string | null
          created_at: string
          created_by: string
          email: string
          id: string
          logo_url: string | null
          neighborhood: string
          number: string
          phone: string
          state: string
          street: string
          trading_name: string
          updated_at: string
          zip_code: string
        }
        Insert: {
          active?: boolean
          ans_registry: string
          city: string
          clinic_id: string
          cnpj: string
          company_name: string
          complement?: string | null
          contact_person?: string | null
          created_at?: string
          created_by: string
          email: string
          id?: string
          logo_url?: string | null
          neighborhood: string
          number: string
          phone: string
          state: string
          street: string
          trading_name: string
          updated_at?: string
          zip_code: string
        }
        Update: {
          active?: boolean
          ans_registry?: string
          city?: string
          clinic_id?: string
          cnpj?: string
          company_name?: string
          complement?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: string
          email?: string
          id?: string
          logo_url?: string | null
          neighborhood?: string
          number?: string
          phone?: string
          state?: string
          street?: string
          trading_name?: string
          updated_at?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_companies_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_contracts: {
        Row: {
          active: boolean
          contract_number: string
          created_at: string
          created_by: string
          document_urls: string[] | null
          end_date: string
          fee_table: string
          id: string
          insurance_company_id: string
          multiplication_factor: number
          payment_deadline_days: number
          start_date: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          contract_number: string
          created_at?: string
          created_by: string
          document_urls?: string[] | null
          end_date: string
          fee_table: string
          id?: string
          insurance_company_id: string
          multiplication_factor?: number
          payment_deadline_days?: number
          start_date: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          contract_number?: string
          created_at?: string
          created_by?: string
          document_urls?: string[] | null
          end_date?: string
          fee_table?: string
          id?: string
          insurance_company_id?: string
          multiplication_factor?: number
          payment_deadline_days?: number
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_contracts_insurance_company_id_fkey"
            columns: ["insurance_company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_form_configs: {
        Row: {
          allowed_file_types: string[]
          created_at: string
          created_by: string
          form_title: string
          id: string
          insurance_company_id: string
          max_file_size: number
          required_fields: string[]
          updated_at: string
          validation_rules: Json
        }
        Insert: {
          allowed_file_types?: string[]
          created_at?: string
          created_by: string
          form_title: string
          id?: string
          insurance_company_id: string
          max_file_size?: number
          required_fields?: string[]
          updated_at?: string
          validation_rules?: Json
        }
        Update: {
          allowed_file_types?: string[]
          created_at?: string
          created_by?: string
          form_title?: string
          id?: string
          insurance_company_id?: string
          max_file_size?: number
          required_fields?: string[]
          updated_at?: string
          validation_rules?: Json
        }
        Relationships: [
          {
            foreignKeyName: "insurance_form_configs_insurance_company_id_fkey"
            columns: ["insurance_company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_addresses: {
        Row: {
          cep: string
          city: string
          complement: string | null
          created_at: string
          id: string
          neighborhood: string
          number: string
          patient_id: string
          state: string
          street: string
          updated_at: string
        }
        Insert: {
          cep: string
          city: string
          complement?: string | null
          created_at?: string
          id?: string
          neighborhood: string
          number: string
          patient_id: string
          state: string
          street: string
          updated_at?: string
        }
        Update: {
          cep?: string
          city?: string
          complement?: string | null
          created_at?: string
          id?: string
          neighborhood?: string
          number?: string
          patient_id?: string
          state?: string
          street?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_addresses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          birthdate: string
          clinic_id: string
          cpf: string
          created_at: string
          created_by: string
          email: string | null
          gender: string
          id: string
          name: string
          phone: string | null
          rg: string | null
          updated_at: string
        }
        Insert: {
          birthdate: string
          clinic_id: string
          cpf: string
          created_at?: string
          created_by: string
          email?: string | null
          gender: string
          id?: string
          name: string
          phone?: string | null
          rg?: string | null
          updated_at?: string
        }
        Update: {
          birthdate?: string
          clinic_id?: string
          cpf?: string
          created_at?: string
          created_by?: string
          email?: string | null
          gender?: string
          id?: string
          name?: string
          phone?: string | null
          rg?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      procedure_multiplication_factors: {
        Row: {
          contract_id: string | null
          created_at: string
          created_by: string
          id: string
          insurance_company_id: string
          multiplication_factor: number
          procedure_code: string
          procedure_name: string
          updated_at: string
        }
        Insert: {
          contract_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          insurance_company_id: string
          multiplication_factor: number
          procedure_code: string
          procedure_name: string
          updated_at?: string
        }
        Update: {
          contract_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          insurance_company_id?: string
          multiplication_factor?: number
          procedure_code?: string
          procedure_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "procedure_multiplication_factors_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "insurance_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedure_multiplication_factors_insurance_company_id_fkey"
            columns: ["insurance_company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          crm: string
          email: string
          first_name: string
          id: string
          last_name: string
          notification_preferences: Json | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          title: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          crm: string
          email: string
          first_name: string
          id: string
          last_name: string
          notification_preferences?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          crm?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          notification_preferences?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_clinic_staff: {
        Args: {
          p_user_id: string
          p_clinic_id: string
          p_is_admin: boolean
          p_role: string
        }
        Returns: boolean
      }
      create_clinic: {
        Args:
          | {
              p_name: string
              p_city: string
              p_address: string
              p_phone: string
              p_email: string
              p_created_by: string
            }
          | {
              p_name: string
              p_city: string
              p_address: string
              p_phone: string
              p_email: string
              p_created_by: string
              p_trading_name?: string
              p_cnpj?: string
            }
        Returns: Json
      }
      get_user_clinics: {
        Args: { user_uuid: string }
        Returns: {
          clinic_id: string
          clinic_name: string
          clinic_city: string
          clinic_address: string
          clinic_phone: string
          clinic_email: string
          clinic_logo_url: string
          clinic_active: boolean
          is_admin: boolean
          staff_id: string
          staff_role: string
          staff_active: boolean
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_clinic_admin: {
        Args: { user_uuid: string; clinic_uuid: string }
        Returns: boolean
      }
      is_clinic_member: {
        Args: { user_uuid: string; clinic_uuid: string }
        Returns: boolean
      }
      is_clinic_staff_member: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_global_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      remove_clinic_staff: {
        Args: { staff_id: string; admin_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      angioplasty_status: "active" | "cancelled"
      user_role:
        | "admin"
        | "doctor"
        | "nurse"
        | "receptionist"
        | "clinic_admin"
        | "staff"
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
    Enums: {
      angioplasty_status: ["active", "cancelled"],
      user_role: [
        "admin",
        "doctor",
        "nurse",
        "receptionist",
        "clinic_admin",
        "staff",
      ],
    },
  },
} as const
