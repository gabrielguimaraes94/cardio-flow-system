
import { supabase } from '@/integrations/supabase/client';

// Verifica se um usuário é administrador global
export const isGlobalAdmin = async (userId: string): Promise<boolean> => {
  try {
    console.log('Verificando se usuário é admin global:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Erro ao verificar permissões de admin:', error);
      throw error;
    }
    
    // O usuário é um administrador global se tiver a role 'admin'
    const isAdmin = data?.role === 'admin';
    console.log('Usuário é admin global?', isAdmin, 'Role:', data?.role);
    
    return isAdmin;
  } catch (error) {
    console.error('Erro ao verificar se usuário é admin global:', error);
    return false;
  }
};

// Verifica se um usuário é administrador de uma clínica específica
export const isClinicAdmin = async (userId: string, clinicId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('is_clinic_admin', { user_uuid: userId, clinic_uuid: clinicId });
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Erro ao verificar se usuário é admin da clínica:', error);
    return false;
  }
};
