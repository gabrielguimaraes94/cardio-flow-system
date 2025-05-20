
// Define a common Clinic interface that's used throughout the application
export interface Clinic {
  id: string;
  name: string;
  address: string;  // Made required to match PDFViewer usage
  phone: string;    // Made required to match PDFViewer usage
  city?: string;
  email?: string;
  logo_url?: string;
  active?: boolean;
  zipCode?: string;
  logo?: string;
}
