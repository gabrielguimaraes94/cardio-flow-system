
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/profile';

// Função específica para buscar um perfil pelo ID
export const fetchProfileById = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('=== BUSCANDO PROFILE POR ID ===');
    console.log('User ID:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao buscar profile por ID:', error);
      return null;
    }
    
    if (!data) {
      console.log('Nenhum profile encontrado para ID:', userId);
      return null;
    }
    
    console.log('Profile encontrado:', data);
    
    return {
      id: data.id,
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      email: data.email || '',
      phone: data.phone || null,
      crm: data.crm || '',
      title: data.title || '',
      bio: data.bio || '',
      role: data.role || 'staff'
    };
    
  } catch (error) {
    console.error('Erro na função fetchProfileById:', error);
    return null;
  }
};

// Função para buscar múltiplos perfis pelos IDs
export const fetchProfilesByIds = async (userIds: string[]): Promise<UserProfile[]> => {
  try {
    console.log('=== BUSCANDO MÚLTIPLOS PROFILES ===');
    console.log('User IDs:', userIds);
    
    const profiles: UserProfile[] = [];
    
    // Buscar cada perfil individualmente
    for (const userId of userIds) {
      const profile = await fetchProfileById(userId);
      if (profile) {
        profiles.push(profile);
      }
    }
    
    console.log('Profiles encontrados:', profiles.length);
    return profiles;
    
  } catch (error) {
    console.error('Erro na função fetchProfilesByIds:', error);
    return [];
  }
};
