export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  systemUpdates: boolean;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  crm: string;
  title?: string;
  bio?: string;
  notificationPreferences: NotificationSettings;
  role: 'admin' | 'doctor' | 'staff';
}
