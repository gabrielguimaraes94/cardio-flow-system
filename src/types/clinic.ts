
// Define a common Clinic interface that's used throughout the application
export interface Clinic {
  id: string;
  name: string;
  address: string;  // Required
  phone: string;    // Required
  city: string;     // Changed to required as it's required in the database
  email: string;    // Changed to required as it's required in the database
  logo_url?: string;
  active?: boolean;
  zipCode?: string;
  logo?: string;
}

// Define a lighter version of Clinic for dropdown selectors and lists
export interface ClinicSummary {
  id: string;
  name: string;
  city: string;     // Changed to required
  logo?: string;
}
