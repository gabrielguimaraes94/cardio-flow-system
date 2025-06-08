
import { supabase } from '@/integrations/supabase/client';

// Buscar todos os funcionários de uma clínica
export const fetchClinicStaff = async (clinicId: string) => {
  try {
    console.log('=== FETCHCLINICSTAFF ===');
    console.log('Buscando funcionários para clínica:', clinicId);
    
    // 1. Buscar todos os registros de clinic_staff da clínica
    const { data: staffData, error: staffError } = await supabase
      .from('clinic_staff')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('active', true)
      .order('created_at', { ascending: false });
    
    if (staffError) {
      console.error('Erro ao buscar funcionários:', staffError);
      throw staffError;
    }
    
    console.log('Registros de clinic_staff encontrados:', staffData?.length || 0);
    
    if (!staffData || staffData.length === 0) {
      console.log('Nenhum funcionário encontrado para a clínica:', clinicId);
      return [];
    }
    
    // 2. Buscar os dados dos usuários na tabela profiles
    const userIds = staffData.map(staff => staff.user_id);
    console.log('IDs dos usuários para buscar profiles:', userIds);
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
    
    if (profilesError) {
      console.error('Erro ao buscar profiles:', profilesError);
      throw profilesError;
    }
    
    console.log('Profiles encontrados:', profilesData?.length || 0);
    console.log('Dados dos profiles:', profilesData);
    
    // 3. Combinar os dados
    const combinedData = staffData.map((staffRecord) => {
      const profile = profilesData?.find(p => p.id === staffRecord.user_id);
      
      if (!profile) {
        console.warn('Profile não encontrado para user_id:', staffRecord.user_id);
        return null;
      }
      
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
    }).filter(Boolean); // Remove registros nulos
    
    console.log('Funcionários válidos processados:', combinedData.length);
    console.log('Dados finais:', combinedData);
    
    return combinedData;
    
  } catch (error) {
    console.error('Error fetching clinic staff:', error);
    throw error;
  }
};
