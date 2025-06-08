
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
    
    // 2. Buscar os dados dos usuários na tabela profiles usando RPC ou query administrativa
    const userIds = staffData.map(staff => staff.user_id);
    console.log('IDs dos usuários para buscar profiles:', userIds);
    
    // Tentar primeiro uma query normal
    let profilesData;
    let profilesError;
    
    try {
      const result = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      profilesData = result.data;
      profilesError = result.error;
      
      console.log('Query normal - Profiles encontrados:', profilesData?.length || 0);
      
      // Se não trouxe todos os profiles, pode ser RLS - vamos tentar uma abordagem diferente
      if (!profilesError && profilesData && profilesData.length < userIds.length) {
        console.log('RLS pode estar bloqueando - tentando buscar um por vez...');
        
        const allProfiles = [];
        for (const userId of userIds) {
          try {
            const { data: singleProfile, error: singleError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();
              
            if (singleProfile && !singleError) {
              allProfiles.push(singleProfile);
            } else {
              console.warn('Não foi possível buscar profile para userId:', userId, singleError);
            }
          } catch (err) {
            console.warn('Erro ao buscar profile individual:', userId, err);
          }
        }
        
        if (allProfiles.length > profilesData.length) {
          profilesData = allProfiles;
          console.log('Busca individual trouxe mais profiles:', allProfiles.length);
        }
      }
      
    } catch (error) {
      console.error('Erro ao buscar profiles:', error);
      profilesError = error;
    }
    
    if (profilesError && !profilesData) {
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
        // Retornar dados básicos mesmo sem profile completo
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
            role: 'staff'
          },
          role: staffRecord.role,
          isAdmin: staffRecord.is_admin
        };
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
    });
    
    console.log('Funcionários válidos processados:', combinedData.length);
    console.log('Dados finais:', combinedData);
    
    return combinedData;
    
  } catch (error) {
    console.error('Error fetching clinic staff:', error);
    throw error;
  }
};
