
import { supabase } from '@/integrations/supabase/client';
import { checkUserIsClinicAdmin } from './clinicStaffPermissions';

// Adicionar ou associar um funcionário a uma clínica usando a função RPC
export const addClinicStaff = async (
  clinicId: string, 
  userId: string, 
  role: string, 
  isAdmin: boolean
): Promise<string> => {
  try {
    console.log('=== ADICIONANDO FUNCIONÁRIO ===');
    console.log('clinicId:', clinicId);
    console.log('userId:', userId);
    console.log('role:', role);
    console.log('isAdmin:', isAdmin);

    // Use the RPC function which handles permissions properly
    const { data, error } = await supabase
      .rpc('add_clinic_staff', {
        p_user_id: userId,
        p_clinic_id: clinicId,
        p_is_admin: isAdmin,
        p_role: role
      });
    
    if (error) {
      console.error('Erro ao adicionar funcionário via RPC:', error);
      throw error;
    }
    
    console.log('✅ Funcionário adicionado com sucesso via RPC');
    return 'success';
  } catch (error) {
    console.error('Error adding clinic staff:', error);
    throw error;
  }
};

// Remover um funcionário (soft delete) - apenas admins podem remover outros funcionários
export const removeClinicStaff = async (staffId: string, adminUserId: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('=== REMOVENDO FUNCIONÁRIO ===');
    console.log('staffId:', staffId);
    console.log('adminUserId:', adminUserId);

    // Primeiro, buscar informações do funcionário que será removido
    const { data: staffToRemove, error: staffError } = await supabase
      .from('clinic_staff')
      .select('user_id, clinic_id')
      .eq('id', staffId)
      .eq('active', true)
      .single();

    if (staffError || !staffToRemove) {
      console.error('Funcionário não encontrado:', staffError);
      return { success: false, message: 'Funcionário não encontrado' };
    }

    // Verificar se o admin está tentando se remover
    if (staffToRemove.user_id === adminUserId) {
      console.log('❌ Admin tentando se auto-remover');
      return { success: false, message: 'Você não pode remover a si mesmo da clínica' };
    }

    // Verificar se o usuário atual é admin da clínica
    const isAdmin = await checkUserIsClinicAdmin(adminUserId, staffToRemove.clinic_id);
    
    if (!isAdmin) {
      console.log('❌ Usuário não é admin da clínica');
      return { success: false, message: 'Apenas administradores podem remover funcionários' };
    }

    // Usar a função RPC para remover o funcionário
    const { data, error } = await supabase
      .rpc('remove_clinic_staff', {
        staff_id: staffId,
        admin_user_id: adminUserId
      });
    
    if (error) {
      console.error('Erro ao remover funcionário via RPC:', error);
      throw error;
    }
    
    if (data) {
      console.log('✅ Funcionário removido com sucesso');
      return { success: true, message: 'Funcionário removido com sucesso' };
    } else {
      console.log('❌ Falha ao remover funcionário');
      return { success: false, message: 'Falha ao remover funcionário' };
    }
  } catch (error) {
    console.error('Error removing clinic staff:', error);
    return { success: false, message: 'Erro ao remover funcionário' };
  }
};
