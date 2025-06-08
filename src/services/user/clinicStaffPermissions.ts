
import { supabase } from '@/integrations/supabase/client';

// Verificar se o usuário atual é admin da clínica
export const checkUserIsClinicAdmin = async (userId: string, clinicId: string): Promise<boolean> => {
  try {
    console.log('=== VERIFICANDO SE USUÁRIO É ADMIN ===');
    console.log('userId:', userId);
    console.log('clinicId:', clinicId);

    const { data, error } = await supabase
      .from('clinic_staff')
      .select('is_admin')
      .eq('user_id', userId)
      .eq('clinic_id', clinicId)
      .eq('active', true)
      .single();

    if (error) {
      console.error('Erro ao verificar se usuário é admin:', error);
      return false;
    }

    const isAdmin = data?.is_admin || false;
    console.log('Usuário é admin?', isAdmin);
    return isAdmin;
  } catch (error) {
    console.error('Erro ao verificar permissões de admin:', error);
    return false;
  }
};
