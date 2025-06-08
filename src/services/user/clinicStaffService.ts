
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

// Remover um funcionário (soft delete)
export const removeClinicStaff = async (staffId: string, adminUserId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('remove_clinic_staff', {
        staff_id: staffId,
        admin_user_id: adminUserId
      });
    
    if (error) throw error;
    
    return data || false;
  } catch (error) {
    console.error('Error removing clinic staff:', error);
    throw error;
  }
};

// Buscar todos os funcionários de uma clínica - VERSÃO COM INNER JOIN
export const fetchClinicStaff = async (clinicId: string) => {
  try {
    console.log('=== FETCHCLINICSTAFF ===');
    console.log('Buscando funcionários para clínica:', clinicId);
    
    // Usar INNER JOIN explícito do Supabase especificando qual foreign key usar
    const { data: staffData, error: staffError } = await supabase
      .from('clinic_staff')
      .select(`
        id,
        clinic_id,
        role,
        is_admin,
        active,
        created_at,
        user:profiles!fk_clinic_staff_user(
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
    console.log('Dados dos funcionários:', staffData);
    
    if (!staffData || staffData.length === 0) {
      console.log('Nenhum funcionário encontrado para a clínica:', clinicId);
      return [];
    }
    
    // Mapear os dados para o formato esperado - com INNER JOIN não há registros null
    const mappedStaff = staffData.map((staffRecord: any) => {
      return {
        id: staffRecord.id,
        user: {
          id: staffRecord.user.id,
          firstName: staffRecord.user.first_name || '',
          lastName: staffRecord.user.last_name || '',
          email: staffRecord.user.email || '',
          phone: staffRecord.user.phone || null,
          crm: staffRecord.user.crm || '',
          title: staffRecord.user.title || '',
          bio: staffRecord.user.bio || '',
          role: staffRecord.user.role || 'staff'
        },
        role: staffRecord.role,
        isAdmin: staffRecord.is_admin
      };
    });
    
    console.log('Funcionários processados:', mappedStaff.length);
    return mappedStaff;
    
  } catch (error) {
    console.error('Error fetching clinic staff:', error);
    throw error;
  }
};
