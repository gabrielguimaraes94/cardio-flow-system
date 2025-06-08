
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
    // Use the RPC function which handles permissions properly
    const { data, error } = await supabase
      .rpc('add_clinic_staff', {
        p_user_id: userId,
        p_clinic_id: clinicId,
        p_is_admin: isAdmin,
        p_role: role
      });
    
    if (error) throw error;
    
    // Return success indicator since RPC returns boolean
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

// Buscar todos os funcionários de uma clínica - VERSÃO CORRIGIDA
export const fetchClinicStaff = async (clinicId: string) => {
  try {
    console.log('=== FETCHCLINICSTAFF ===');
    console.log('Buscando funcionários para clínica:', clinicId);
    
    const { data: staffData, error: staffError } = await supabase
      .from('clinic_staff')
      .select(`
        id,
        user_id,
        clinic_id,
        role,
        is_admin,
        active,
        created_at,
        updated_at,
        profiles:user_id(*)
      `)
      .eq('clinic_id', clinicId)
      .eq('active', true);
    
    if (staffError) {
      console.error('Erro ao buscar staff:', staffError);
      throw staffError;
    }
    
    console.log('Dados brutos do staff:', staffData);
    
    // Filtrar registros onde profiles é null e mapear os válidos
    const validStaff = staffData
      .filter((staff: any) => {
        const hasProfile = staff.profiles !== null;
        if (!hasProfile) {
          console.warn(`⚠️ Staff ${staff.id} tem profiles null - usuário pode ter sido deletado`);
        }
        return hasProfile;
      })
      .map((staff: any) => ({
        id: staff.id,
        user: {
          id: staff.profiles.id,
          firstName: staff.profiles.first_name || '',
          lastName: staff.profiles.last_name || '',
          email: staff.profiles.email || '',
          phone: staff.profiles.phone || null,
          crm: staff.profiles.crm || '',
          title: staff.profiles.title || '',
          bio: staff.profiles.bio || '',
          role: staff.profiles.role || 'staff'
        },
        role: staff.role,
        isAdmin: staff.is_admin
      }));
    
    console.log('Staff processado:', validStaff);
    return validStaff;
    
  } catch (error) {
    console.error('Error fetching clinic staff:', error);
    throw error;
  }
};
