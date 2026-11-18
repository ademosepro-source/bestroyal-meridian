/**
 * Hand-written types matching supabase/migrations/0001_init.sql.
 *
 * Once the Supabase CLI is set up, regenerate this file from the live schema with:
 *   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
 * and it will stay in sync automatically as later phases add tables.
 */

export type UserRole =
  | "super_admin"
  | "principal"
  | "teacher"
  | "bursar"
  | "admissions_officer"
  | "parent";

export type StudentStatus = "active" | "withdrawn" | "graduated";
export type SchoolLevel = "nursery" | "primary";
export type ApplicationStatus = "pending" | "under_review" | "accepted" | "rejected" | "enrolled";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type ReportCardStatus = "draft" | "submitted" | "approved" | "published";
export type PaymentMethod = "cash" | "bank_transfer" | "pos" | "paystack";
export type PaymentStatus = "pending" | "successful" | "failed" | "reversed";
export type AnnouncementAudience = "public" | "parents" | "staff" | "class";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          is_active: boolean;
          must_change_password: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      school_settings: {
        Row: {
          id: boolean;
          school_name: string;
          motto: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          map_embed_url: string | null;
          logo_url: string | null;
          social_links: Record<string, string>;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["school_settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["school_settings"]["Row"]>;
        Relationships: [];
      };
      academic_sessions: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["academic_sessions"]["Row"]> & {
          name: string;
          start_date: string;
          end_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["academic_sessions"]["Row"]>;
        Relationships: [];
      };
      terms: {
        Row: {
          id: string;
          session_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["terms"]["Row"]> & {
          session_id: string;
          name: string;
          start_date: string;
          end_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["terms"]["Row"]>;
        Relationships: [];
      };
      classes: {
        Row: {
          id: string;
          name: string;
          level: SchoolLevel;
          order_index: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["classes"]["Row"]> & {
          name: string;
          level: SchoolLevel;
          order_index: number;
        };
        Update: Partial<Database["public"]["Tables"]["classes"]["Row"]>;
        Relationships: [];
      };
      class_arms: {
        Row: {
          id: string;
          class_id: string;
          name: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["class_arms"]["Row"]> & {
          class_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["class_arms"]["Row"]>;
        Relationships: [];
      };
      staff: {
        Row: {
          id: string;
          staff_number: string;
          position: string;
          department: string | null;
          date_joined: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["staff"]["Row"]> & {
          id: string;
          position: string;
        };
        Update: Partial<Database["public"]["Tables"]["staff"]["Row"]>;
        Relationships: [];
      };
      teacher_class_assignments: {
        Row: {
          id: string;
          teacher_id: string;
          class_id: string;
          class_arm_id: string | null;
          is_class_teacher: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["teacher_class_assignments"]["Row"]> & {
          teacher_id: string;
          class_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["teacher_class_assignments"]["Row"]>;
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          admission_number: string;
          first_name: string;
          middle_name: string | null;
          surname: string;
          date_of_birth: string;
          gender: "male" | "female";
          photo_url: string | null;
          class_id: string | null;
          class_arm_id: string | null;
          admission_session_id: string | null;
          admission_date: string;
          previous_school: string | null;
          home_address: string | null;
          medical_notes: string | null;
          status: StudentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["students"]["Row"]> & {
          first_name: string;
          surname: string;
          date_of_birth: string;
          gender: "male" | "female";
        };
        Update: Partial<Database["public"]["Tables"]["students"]["Row"]>;
        Relationships: [];
      };
      parent_student: {
        Row: {
          parent_id: string;
          student_id: string;
          relationship: string;
          is_primary_contact: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["parent_student"]["Row"]> & {
          parent_id: string;
          student_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["parent_student"]["Row"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]> & {
          action: string;
          entity_type: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
        Relationships: [];
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          code: string | null;
          level: SchoolLevel | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subjects"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["subjects"]["Row"]>;
        Relationships: [];
      };
      subject_teachers: {
        Row: {
          id: string;
          class_id: string;
          subject_id: string;
          teacher_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subject_teachers"]["Row"]> & {
          class_id: string;
          subject_id: string;
          teacher_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["subject_teachers"]["Row"]>;
        Relationships: [];
      };
      admission_applications: {
        Row: {
          id: string;
          applicant_first_name: string;
          applicant_middle_name: string | null;
          applicant_surname: string;
          date_of_birth: string;
          gender: "male" | "female";
          desired_class_id: string | null;
          desired_session_id: string | null;
          previous_school: string | null;
          parent_full_name: string;
          parent_phone: string;
          parent_email: string;
          parent_relationship: string;
          home_address: string | null;
          status: ApplicationStatus;
          reviewed_by: string | null;
          review_notes: string | null;
          enrolled_student_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["admission_applications"]["Row"]> & {
          applicant_first_name: string;
          applicant_surname: string;
          date_of_birth: string;
          gender: "male" | "female";
          parent_full_name: string;
          parent_phone: string;
          parent_email: string;
        };
        Update: Partial<Database["public"]["Tables"]["admission_applications"]["Row"]>;
        Relationships: [];
      };
      attendance_records: {
        Row: {
          id: string;
          student_id: string;
          class_id: string;
          class_arm_id: string | null;
          term_id: string | null;
          date: string;
          status: AttendanceStatus;
          remarks: string | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["attendance_records"]["Row"]> & {
          student_id: string;
          class_id: string;
          date: string;
          status: AttendanceStatus;
        };
        Update: Partial<Database["public"]["Tables"]["attendance_records"]["Row"]>;
        Relationships: [];
      };
      grade_bands: {
        Row: {
          id: string;
          grade: string;
          min_score: number;
          max_score: number;
          remark: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["grade_bands"]["Row"]> & {
          grade: string;
          min_score: number;
          max_score: number;
          remark: string;
        };
        Update: Partial<Database["public"]["Tables"]["grade_bands"]["Row"]>;
        Relationships: [];
      };
      assessment_components: {
        Row: {
          id: string;
          name: string;
          max_score: number;
          order_index: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["assessment_components"]["Row"]> & {
          name: string;
          max_score: number;
          order_index: number;
        };
        Update: Partial<Database["public"]["Tables"]["assessment_components"]["Row"]>;
        Relationships: [];
      };
      exam_scores: {
        Row: {
          id: string;
          student_id: string;
          subject_id: string;
          class_id: string;
          term_id: string;
          component_id: string;
          score: number;
          recorded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["exam_scores"]["Row"]> & {
          student_id: string;
          subject_id: string;
          class_id: string;
          term_id: string;
          component_id: string;
          score: number;
        };
        Update: Partial<Database["public"]["Tables"]["exam_scores"]["Row"]>;
        Relationships: [];
      };
      report_cards: {
        Row: {
          id: string;
          student_id: string;
          class_id: string;
          term_id: string;
          teacher_comment: string | null;
          principal_comment: string | null;
          promotion_status: string | null;
          status: ReportCardStatus;
          submitted_by: string | null;
          submitted_at: string | null;
          approved_by: string | null;
          approved_at: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["report_cards"]["Row"]> & {
          student_id: string;
          class_id: string;
          term_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["report_cards"]["Row"]>;
        Relationships: [];
      };
      fee_categories: {
        Row: { id: string; name: string; description: string | null; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["fee_categories"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["fee_categories"]["Row"]>;
        Relationships: [];
      };
      fee_structures: {
        Row: {
          id: string;
          class_id: string;
          term_id: string;
          fee_category_id: string;
          amount: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["fee_structures"]["Row"]> & {
          class_id: string;
          term_id: string;
          fee_category_id: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["fee_structures"]["Row"]>;
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          student_id: string;
          class_id: string;
          term_id: string;
          due_date: string | null;
          generated_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["invoices"]["Row"]> & {
          student_id: string;
          class_id: string;
          term_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Row"]>;
        Relationships: [];
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          fee_category_id: string | null;
          description: string;
          amount: number;
        };
        Insert: Partial<Database["public"]["Tables"]["invoice_items"]["Row"]> & {
          invoice_id: string;
          description: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["invoice_items"]["Row"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string;
          student_id: string;
          amount: number;
          method: PaymentMethod;
          status: PaymentStatus;
          reference: string;
          receipt_number: string | null;
          recorded_by: string | null;
          verified_by: string | null;
          verified_at: string | null;
          paid_at: string | null;
          remarks: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & {
          invoice_id: string;
          student_id: string;
          amount: number;
          method: PaymentMethod;
          reference: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          body: string;
          audience: AnnouncementAudience;
          class_id: string | null;
          is_published: boolean;
          published_by: string | null;
          published_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["announcements"]["Row"]> & {
          title: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Row"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string | null;
          location: string | null;
          is_published: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["events"]["Row"]> & {
          title: string;
          start_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Row"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          type: string;
          title: string;
          body: string | null;
          link: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> & {
          recipient_id: string;
          type: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      student_status: StudentStatus;
      school_level: SchoolLevel;
      application_status: ApplicationStatus;
      attendance_status: AttendanceStatus;
      report_card_status: ReportCardStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      announcement_audience: AnnouncementAudience;
    };
    CompositeTypes: Record<string, never>;
  };
}
