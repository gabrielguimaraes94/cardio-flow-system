import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { UserProfile } from '@/types/profile';

// Tipos para a função registerClinic
type AdminData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string | null;
  role: 'clinic_admin';
  crm?: string; // Make crm optional
};

type ClinicData = {
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  tradingName?: string; // New field for trading name
  cnpj?: string; // New field for CNPJ
};

// Interface para o retorno da função create_clinic
interface CreateClinicResponse {
  id: string;
}

// Parâmetros para a função create_clinic
type CreateClinicParams = {
  p_name: string;
  p_city: string;
  p_address: string;
  p_phone: string;
  p_email: string;
  p_created_by: string;
  p_trading_name?: string; // New field for trading name
  p_cnpj?: string; // New field for CNPJ
}

// Parâmetros para a função add_clinic_staff
type AddClinicStaffParams = {
  p_user_id: string;
  p_clinic_id: string;
  p_is_admin: boolean;
  p_role: string;
}

// Interfaces para retorno dos dados de todas as clínicas e usuários
export interface AdminClinic {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  logo_url: string | null;
}

export interface AdminUser extends UserProfile {
  created_at: string;
  updated_at: string;
}

// Obter todas as clínicas para o painel de administração
export const getAllClinics = async (
  filters?: { active?: boolean; city?: string; name?: string; createdAfter?: string; createdBefore?: string }
): Promise<AdminClinic[]> => {
  try {
    let query = supabase
      .from('clinics')
      .select('*');
    
    // Aplicar filtros se fornecidos
    if (filters) {
      if (filters.active !== undefined) {
        query = query.eq('active', filters.active);
      }
      
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      
      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
      }
      
      if (filters.createdAfter) {
        query = query.gte('created_at', filters.createdAfter);
      }
      
      if (filters.createdBefore) {
        query = query.lte('created_at', filters.createdBefore);
      }
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data as AdminClinic[];
  } catch (error) {
    console.error('Erro ao buscar todas as clínicas:', error);
    throw error;
  }
};

// Obter todos os usuários para o painel de administração
export const getAllUsers = async (
  filters?: { role?: Database['public']['Enums']['user_role']; createdAfter?: string; createdBefore?: string; name?: string }
): Promise<AdminUser[]> => {
  try {
    let query = supabase
      .from('profiles')
      .select('*');
    
    // Aplicar filtros se fornecidos
    if (filters) {
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      
      if (filters.createdAfter) {
        query = query.gte('created_at', filters.createdAfter);
      }
      
      if (filters.createdBefore) {
        query = query.lte('created_at', filters.createdBefore);
      }
      
      if (filters.name) {
        query = query.or(`first_name.ilike.%${filters.name}%,last_name.ilike.%${filters.name}%`);
      }
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map((user: any) => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      crm: user.crm,
      title: user.title || '',
      bio: user.bio || '',
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    })) as AdminUser[];
  } catch (error) {
    console.error('Erro ao buscar todos os usuários:', error);
    throw error;
  }
};

// Verifica se um usuário é administrador global
export const isGlobalAdmin = async (userId: string): Promise<boolean> => {
  try {
    console.log('Verificando se usuário é admin global:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Erro ao verificar permissões de admin:', error);
      throw error;
    }
    
    // O usuário é um administrador global se tiver a role 'admin'
    const isAdmin = data?.role === 'admin';
    console.log('Usuário é admin global?', isAdmin, 'Role:', data?.role);
    
    return isAdmin;
  } catch (error) {
    console.error('Erro ao verificar se usuário é admin global:', error);
    return false;
  }
};

// Verifica se um usuário é administrador de uma clínica específica
export const isClinicAdmin = async (userId: string, clinicId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('is_clinic_admin', { 
        user_uuid: userId, 
        clinic_uuid: clinicId 
      });
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Erro ao verificar se usuário é admin da clínica:', error);
    return false;
  }
};

// Registra uma nova clínica e seu administrador
export const registerClinic = async ({
  admin,
  clinic,
}: {
  admin: AdminData;
  clinic: ClinicData;
}): Promise<void> => {
  try {
    // 1. Primeiro verificamos se o usuário já existe para evitar o erro de limite de taxa
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', admin.email)
      .maybeSingle();
    
    let userId: string;
    
    if (existingUser) {
      // Se o usuário já existe, usamos seu ID
      console.log('Usuário já existe, usando ID existente:', existingUser.id);
      userId = existingUser.id;
    } else {
      // Caso contrário, criamos um novo usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: admin.email,
        password: admin.password,
        options: {
          data: {
            first_name: admin.firstName,
            last_name: admin.lastName,
            crm: admin.crm || '', // Use crm if provided or empty string
          },
        },
      });

      if (authError) {
        // Se o erro for de limite de taxa, exibimos uma mensagem mais amigável
        if (authError.status === 429) {
          throw new Error('Limite de cadastros excedido. Por favor, aguarde alguns segundos antes de tentar novamente.');
        }
        throw authError;
      }
      
      if (!authData.user) throw new Error('Falha ao criar usuário');
      userId = authData.user.id;
      
      // Aguardamos um momento para garantir que o perfil foi criado pelo trigger
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 2. Atualizar o perfil do usuário com os dados adicionais
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: admin.firstName,
        last_name: admin.lastName,
        crm: admin.crm || '', // Use crm if provided or empty string
        phone: admin.phone,
        role: admin.role // Ensure admin.role is 'clinic_admin'
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    // 3. Criar a clínica usando RPC com os novos campos
    const { data: clinicData, error: clinicError } = await supabase
      .rpc('create_clinic', { 
        p_name: clinic.name,
        p_city: clinic.city,
        p_address: clinic.address,
        p_phone: clinic.phone,
        p_email: clinic.email,
        p_created_by: userId,
        p_trading_name: clinic.tradingName, // Pass the trading name
        p_cnpj: clinic.cnpj // Pass the CNPJ
      });

    if (clinicError) {
      console.error('Erro ao criar clínica:', clinicError);
      throw clinicError;
    }

    // Vamos verificar se a clínica foi realmente criada
    if (!clinicData) {
      throw new Error('A clínica não foi criada. Verifique se a função RPC está configurada corretamente.');
    }

    // Fix the type issue by properly handling the JSON response
    let clinicId: string;
    
    // Check if clinicData is an object with an id property
    if (
      typeof clinicData === 'object' && 
      clinicData !== null && 
      !Array.isArray(clinicData) && 
      'id' in clinicData
    ) {
      clinicId = clinicData.id as string;
    } else {
      throw new Error('ID da clínica não recebido no formato esperado. Verifique a função RPC.');
    }

    console.log('Clínica criada com ID:', clinicId);

    // 4. Associar o usuário à clínica como administrador
    const { error: staffError } = await supabase
      .rpc('add_clinic_staff', {
        p_user_id: userId,
        p_clinic_id: clinicId,
        p_is_admin: true,
        p_role: 'doctor'
      });

    if (staffError) {
      console.error('Erro ao adicionar administrador à clínica:', staffError);
      throw staffError;
    }

    console.log('Clínica e administrador registrados com sucesso');
  } catch (error) {
    console.error('Erro ao registrar clínica:', error);
    throw error;
  }
};

// Atualizar o status de uma clínica (ativar/desativar)
export const updateClinicStatus = async (clinicId: string, active: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('clinics')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', clinicId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar status da clínica:', error);
    throw error;
  }
};

// Excluir uma clínica
export const deleteClinic = async (clinicId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('clinics')
      .delete()
      .eq('id', clinicId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao excluir clínica:', error);
    throw error;
  }
};
