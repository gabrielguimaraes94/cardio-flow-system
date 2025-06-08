
import { supabase } from '@/integrations/supabase/client';
import { fetchProfilesByIds, fetchAllProfilesByIds, debugCurrentUser } from './profileService';

// Buscar todos os funcionários de uma clínica
export const fetchClinicStaff = async (clinicId: string) => {
  try {
    console.log('=== FETCHCLINICSTAFF ===');
    console.log('Buscando funcionários para clínica:', clinicId);
    
    // Debug inicial do usuário
    await debugCurrentUser();
    
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
    console.log('Dados dos registros de staff:', staffData);
    
    if (!staffData || staffData.length === 0) {
      console.log('Nenhum funcionário encontrado para a clínica:', clinicId);
      return [];
    }
    
    // 2. Buscar os dados dos usuários usando diferentes métodos
    const userIds = staffData.map(staff => staff.user_id);
    console.log('IDs dos usuários para buscar profiles:', userIds);
    
    // Tentar primeiro a busca em lote
    console.log('Tentando busca em lote...');
    let profilesData = await fetchAllProfilesByIds(userIds);
    
    // Se não funcionou, tentar busca individual
    if (profilesData.length === 0 && userIds.length > 0) {
      console.log('Busca em lote falhou, tentando busca individual...');
      profilesData = await fetchProfilesByIds(userIds);
    }
    
    console.log('Profiles retornados:', profilesData.length);
    console.log('Dados dos profiles:', profilesData);
    
    // 3. Combinar os dados
    const combinedData = staffData.map((staffRecord) => {
      const profile = profilesData.find(p => p.id === staffRecord.user_id);
      
      if (!profile) {
        console.warn('Profile não encontrado para user_id:', staffRecord.user_id);
        console.warn('Dados do staff record:', staffRecord);
        console.warn('Profiles disponíveis:', profilesData.map(p => p.id));
        
        return {
          id: staffRecord.id,
          user: {
            id: staffRecord.user_id,
            firstName: 'Usuário',
            lastName: 'Sem Profile',
            email: 'email@indisponivel.com',
            phone: null,
            crm: '',
            title: '',
            bio: '',
            role: 'staff' as const
          },
          role: staffRecord.role,
          isAdmin: staffRecord.is_admin
        };
      }
      
      console.log('Combinando dados:', {
        staffRecord: staffRecord.id,
        profile: profile.id,
        userMatch: staffRecord.user_id === profile.id
      });
      
      return {
        id: staffRecord.id,
        user: {
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          crm: profile.crm,
          title: profile.title,
          bio: profile.bio,
          role: profile.role
        },
        role: staffRecord.role,
        isAdmin: staffRecord.is_admin
      };
    });
    
    console.log('Funcionários válidos processados:', combinedData.length);
    console.log('Dados finais combinados:', combinedData);
    
    return combinedData;
    
  } catch (error) {
    console.error('Error fetching clinic staff:', error);
    throw error;
  }
};
