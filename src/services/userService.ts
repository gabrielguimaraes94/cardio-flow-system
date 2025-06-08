
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/profile';

export const fetchUsers = async (clinicId?: string): Promise<UserProfile[]> => {
  try {
    console.log('Fetching users, clinicId:', clinicId);
    
    let query = supabase
      .from('profiles')
      .select('*');
      
    // Se temos um clinicId, buscar apenas os usuários associados a essa clínica
    if (clinicId) {
      const { data: staffData, error: staffError } = await supabase
        .from('clinic_staff')
        .select('user_id')
        .eq('clinic_id', clinicId)
        .eq('active', true);
      
      if (staffError) throw staffError;
      
      if (staffData && staffData.length > 0) {
        const userIds = staffData.map(staff => staff.user_id);
        query = query.in('id', userIds);
      } else {
        // Se não há funcionários nessa clínica, retornar lista vazia
        return [];
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    console.log('Fetched users:', data);
    
    return data.map((user: any) => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      crm: user.crm,
      title: user.title || '',
      bio: user.bio || '',
      role: user.role
    }));
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    throw error;
  }
};

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

// Atualizar um funcionário existente
export const updateUser = async (userData: UserProfile) => {
  try {
    console.log('Updating user:', userData);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        crm: userData.crm,
        phone: userData.phone,
        title: userData.title,
        bio: userData.bio,
        role: userData.role
      })
      .eq('id', userData.id);
    
    if (error) throw error;
    
    return userData;
  } catch (error) {
    console.error('Error updating user:', error);
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

// Buscar todos os funcionários de uma clínica - VERSÃO CORRIGIDA PARA TRAZER TODOS OS FUNCIONÁRIOS
export const fetchClinicStaff = async (clinicId: string) => {
  try {
    console.log('=== FETCHCLINICSTAFF ===');
    console.log('Buscando funcionários para clínica:', clinicId);
    
    // Primeiro, vamos buscar todos os registros ativos de clinic_staff
    const { data: staffRecords, error: staffError } = await supabase
      .from('clinic_staff')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('active', true);
    
    if (staffError) {
      console.error('Erro ao buscar registros de clinic_staff:', staffError);
      throw staffError;
    }
    
    console.log('Registros de clinic_staff encontrados:', staffRecords?.length || 0);
    console.log('Registros brutos de clinic_staff:', staffRecords);
    
    if (!staffRecords || staffRecords.length === 0) {
      console.log('Nenhum registro ativo encontrado na tabela clinic_staff');
      return [];
    }
    
    // Agora vamos buscar os profiles correspondentes
    const userIds = staffRecords.map(staff => staff.user_id);
    console.log('IDs de usuários para buscar profiles:', userIds);
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
    
    if (profilesError) {
      console.error('Erro ao buscar profiles:', profilesError);
      throw profilesError;
    }
    
    console.log('Profiles encontrados:', profilesData?.length || 0);
    console.log('Profiles data:', profilesData);
    
    // Mapear os dados combinando clinic_staff com profiles
    const staffWithProfiles = staffRecords
      .map((staffRecord) => {
        const profile = profilesData?.find(p => p.id === staffRecord.user_id);
        
        if (!profile) {
          console.warn(`⚠️ Staff ${staffRecord.id} (user_id: ${staffRecord.user_id}) não tem profile correspondente - usuário pode ter sido deletado`);
          return null;
        }
        
        console.log(`✅ Staff ${staffRecord.id} combinado com profile ${profile.id} (${profile.first_name} ${profile.last_name})`);
        
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
      })
      .filter(item => item !== null); // Remove registros sem profile
    
    console.log('Staff processado final:', staffWithProfiles);
    console.log('Quantidade final de funcionários válidos:', staffWithProfiles.length);
    
    return staffWithProfiles;
    
  } catch (error) {
    console.error('Error fetching clinic staff:', error);
    throw error;
  }
};

// Nova função para buscar usuários para seleção (ex: equipe cirúrgica)
export const fetchUsersForSelection = async (clinicId: string): Promise<UserProfile[]> => {
  try {
    console.log('=== FETCH USERS FOR SELECTION ===');
    console.log('Buscando usuários para seleção na clínica:', clinicId);
    
    // Buscar todos os funcionários ativos da clínica usando join inner
    const { data: staffData, error: staffError } = await supabase
      .from('clinic_staff')
      .select(`
        user_id,
        profiles!inner(
          id,
          first_name,
          last_name,
          email,
          phone,
          crm,
          title,
          bio,
          role
        )
      `)
      .eq('clinic_id', clinicId)
      .eq('active', true);
    
    if (staffError) {
      console.error('Erro ao buscar staff para seleção:', staffError);
      throw staffError;
    }
    
    if (!staffData || staffData.length === 0) {
      console.log('Nenhum funcionário encontrado para seleção na clínica:', clinicId);
      return [];
    }
    
    // Filtrar e mapear usuários válidos
    const users = staffData
      .filter((staff: any) => staff.profiles !== null)
      .map((staff: any) => ({
        id: staff.profiles.id,
        firstName: staff.profiles.first_name || '',
        lastName: staff.profiles.last_name || '',
        email: staff.profiles.email || '',
        phone: staff.profiles.phone || null,
        crm: staff.profiles.crm || '',
        title: staff.profiles.title || '',
        bio: staff.profiles.bio || '',
        role: staff.profiles.role || 'staff'
      }));
    
    console.log('Usuários para seleção:', users);
    return users;
    
  } catch (error) {
    console.error('Error fetching users for selection:', error);
    throw error;
  }
};
