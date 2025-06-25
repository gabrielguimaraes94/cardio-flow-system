import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  crm: string;
  phone: string | null;
  role: Database["public"]["Enums"]["user_role"];
  created_at: string;
  updated_at: string;
  title: string | null;
  bio: string | null;
  notification_preferences: any;
}

export const getAllProfiles = async (): Promise<ProfileData[]> => {
  try {
    console.log('=== FETCHING ALL PROFILES DIRECTLY ===');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('=== PROFILES QUERY RESULT ===');
    console.log('Error:', error);
    console.log('Raw data:', data);
    console.log('Profiles count:', data?.length || 0);
    
    if (error) {
      console.error('Error in profiles query:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ NO PROFILES FOUND');
      return [];
    }
    
    console.log('=== PROFILES FOUND ===');
    data.forEach((profile, index) => {
      console.log(`Profile ${index + 1}:`, {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        role: profile.role,
        created_at: profile.created_at
      });
    });
    
    return data as ProfileData[];
    
  } catch (error) {
    console.error('❌ ERROR fetching profiles:', error);
    throw error;
  }
};