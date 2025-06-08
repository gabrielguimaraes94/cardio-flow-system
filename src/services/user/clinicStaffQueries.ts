
import { supabase } from '@/integrations/supabase/client';

// Buscar todos os funcionários de uma clínica
export const fetchClinicStaff = async (clinicId: string) => {
  try {
    console.log('=== FETCHCLINICSTAFF ===');
    console.log('Buscando funcionários para clínica:', clinicId);
    
    // Query corrigida - especificando a relação exata para evitar ambiguidade
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
        profiles!clinic_staff_user_id_fkey (
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
