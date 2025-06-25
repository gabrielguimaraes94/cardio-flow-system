
import { supabase } from '@/integrations/supabase/client';

export interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  crm: string;
  phone: string | null;
  role: string;
  created_at: string;
  updated_at: string;
  title: string | null;
  bio: string | null;
  notification_preferences: any;
}

export const getAllProfiles = async (): Promise<ProfileData[]> => {
  try {
    console.log('=== BUSCANDO TODOS OS PROFILES DIRETAMENTE ===');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('=== RESULTADO DA QUERY PROFILES ===');
    console.log('Error:', error);
    console.log('Data bruta:', data);
    console.log('Quantidade de profiles:', data?.length || 0);
    
    if (error) {
      console.error('Erro na query de profiles:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ NENHUM PROFILE ENCONTRADO');
      return [];
    }
    
    console.log('=== PROFILES ENCONTRADOS ===');
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
    console.error('❌ ERRO ao buscar profiles:', error);
    throw error;
  }
};
