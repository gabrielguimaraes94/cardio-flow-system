
import { supabase } from '@/integrations/supabase/client';

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

// Buscar todos os funcionários de uma clínica - VERSÃO CORRIGIDA
export const fetchClinicStaff = async (clinicId: string) => {
  try {
    console.log('=== FETCHCLINICSTAFF ===');
    console.log('Buscando funcionários para clínica:', clinicId);
    
    // Query corrigida - usando alias para o LEFT JOIN
    const { data: staffData, error: staffError } = await supabase
      .from('clinic_staff')
      .select(`
        id,
        clinic_id,
        user_id,
        role,
        is_admin,
        active,
        created_at,
        profiles!inner (
          id,
          email,
          first_name,
          last_name,
          crm,
          role,
          phone,
          title,
          bio
        )
      `)
      .eq('clinic_id', clinicId)
      .eq('active', true)
      .order('created_at', { ascending: false });
    
    if (staffError) {
      console.error('Erro ao buscar funcionários:', staffError);
      throw staffError;
    }
    
    console.log('Funcionários encontrados:', staffData?.length || 0);
    console.log('Dados completos dos funcionários:', staffData);
    
    if (!staffData || staffData.length === 0) {
      console.log('Nenhum funcionário encontrado para a clínica:', clinicId);
      return [];
    }
    
    // Processar os dados retornados
    const validStaff = staffData.map((staffRecord: any) => {
      const profile = staffRecord.profiles;
      
      return {
        id: staffRecord.id,
        user: {
          id: profile.id,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || null,
          crm: profile.crm || '',
          title: profile.title || '',
          bio: profile.bio || '',
          role: profile.role || 'staff'
        },
        role: staffRecord.role,
        isAdmin: staffRecord.is_admin
      };
    });
    
    console.log('Funcionários válidos processados:', validStaff.length);
    
    return validStaff;
    
  } catch (error) {
    console.error('Error fetching clinic staff:', error);
    throw error;
  }
};
