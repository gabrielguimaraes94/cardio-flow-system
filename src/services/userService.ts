
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

// Buscar todos os funcionários de uma clínica - VERSÃO COM INNER JOIN
export const fetchClinicStaff = async (clinicId: string) => {
  try {
    console.log('=== FETCHCLINICSTAFF ===');
    console.log('Buscando funcionários para clínica:', clinicId);
    
    // Usar INNER JOIN explícito do Supabase para garantir que apenas registros válidos sejam retornados
    const { data: staffData, error: staffError } = await supabase
      .from('clinic_staff')
      .select(`
        id,
        clinic_id,
        role,
        is_admin,
        active,
        created_at,
        user:profiles!inner(
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
    
    // Mapear os dados para o formato esperado
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
