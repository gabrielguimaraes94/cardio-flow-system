
// Define a common Clinic interface that's used throughout the application
export interface Clinic {
  id: string;
  name: string;
  address: string;  // Required
  phone: string;    // Required
  city?: string;
  email?: string;
  logo_url?: string;
  active?: boolean;
  zipCode?: string;
  logo?: string;
}
