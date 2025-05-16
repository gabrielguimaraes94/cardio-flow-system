
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Tipos para a função registerClinic
type AdminData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string | null;
  role: 'clinic_admin';
};

type ClinicData = {
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
};

// Tipo de retorno para a função create_clinic
type CreateClinicResponse = {
  id: string;
};

// Parâmetros para a função create_clinic
type CreateClinicParams = {
  p_name: string;
  p_city: string;
  p_address: string;
  p_phone: string;
  p_email: string;
  p_created_by: string;
}

// Parâmetros para a função add_clinic_staff
type AddClinicStaffParams = {
  p_user_id: string;
  p_clinic_id: string;
  p_is_admin: boolean;
  p_role: string;
}

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
      .rpc<boolean, { user_uuid: string; clinic_uuid: string }>('is_clinic_admin', { user_uuid: userId, clinic_uuid: clinicId });
    
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
        phone: admin.phone,
        role: admin.role
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    // 3. Criar a clínica usando RPC para contornar as políticas de segurança de linha (RLS)
    const { data: clinicData, error: clinicError } = await supabase
      .rpc<CreateClinicResponse, CreateClinicParams>('create_clinic', { 
        p_name: clinic.name,
        p_city: clinic.city,
        p_address: clinic.address,
        p_phone: clinic.phone,
        p_email: clinic.email,
        p_created_by: userId
      });

    if (clinicError) {
      console.error('Erro ao criar clínica:', clinicError);
      throw clinicError;
    }

    // Vamos verificar se a clínica foi realmente criada
    if (!clinicData) {
      throw new Error('A clínica não foi criada. Verifique se a função RPC está configurada corretamente.');
    }

    // Como o retorno é do tipo Json, precisamos garantir que clinicData contenha um objeto com a propriedade id
    const clinicId = typeof clinicData === 'object' && clinicData !== null && 'id' in clinicData 
      ? (clinicData as { id: string }).id 
      : null;

    if (!clinicId) {
      throw new Error('ID da clínica não recebido. Verifique se a função RPC está retornando corretamente.');
    }

    // 4. Associar o usuário à clínica como administrador
    const { error: staffError } = await supabase
      .rpc<boolean, AddClinicStaffParams>('add_clinic_staff', {
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
