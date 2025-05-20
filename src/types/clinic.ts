
// Define a common Clinic interface that's used throughout the application
export interface Clinic {
  id: string;
  name: string;
  address?: string; // Made optional to match clinicService
  phone?: string;   // Made optional to match clinicService
  city?: string;
  email?: string;
  logo_url?: string;
  active?: boolean;
  zipCode?: string;
  logo?: string;
}
