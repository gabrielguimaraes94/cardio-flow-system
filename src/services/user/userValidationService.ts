
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/profile';

// Função para verificar se um usuário já existe no sistema (por email ou CRM)
export const checkUserExists = async (email: string, crm: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`email.eq.${email},crm.eq.${crm}`)
      .maybeSingle();
    
    if (error) throw error;
    
    if (data) {
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        crm: data.crm,
        title: data.title || '',
        bio: data.bio || '',
        role: data.role
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    throw error;
  }
};
