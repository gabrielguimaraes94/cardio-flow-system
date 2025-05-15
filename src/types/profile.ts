
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  crm: string;
  title?: string;
  bio?: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'staff';
}
