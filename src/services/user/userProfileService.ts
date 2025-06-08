
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/profile';

// Buscar usuários por clínica
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

// Nova função para buscar usuários para seleção (ex: equipe cirúrgica)
export const fetchUsersForSelection = async (clinicId: string): Promise<UserProfile[]> => {
  try {
    console.log('=== FETCH USERS FOR SELECTION ===');
    console.log('Buscando usuários para seleção na clínica:', clinicId);
    
    // Buscar todos os funcionários ativos da clínica usando join inner especificando a FK
    const { data: staffData, error: staffError } = await supabase
      .from('clinic_staff')
      .select(`
        user_id,
        profiles!fk_clinic_staff_user(
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
