
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  crm: string;
  title?: string;
  bio?: string;
  role: 'admin' | 'clinic_admin' | 'doctor' | 'nurse' | 'receptionist' | 'staff';
}

// Remove ProfileFormData interface since it's now exported from the schema
