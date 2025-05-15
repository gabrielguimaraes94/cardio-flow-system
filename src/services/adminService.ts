
import { supabase } from '@/integrations/supabase/client';

// Tipos para a função registerClinic
type AdminData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string | null;
  crm: string;
  role: 'clinic_admin';
};

type ClinicData = {
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
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
      .rpc('is_clinic_admin', { user_uuid: userId, clinic_uuid: clinicId });
    
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
        crm: admin.crm,
        role: admin.role
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    // 3. Criar a clínica
    const { data: clinicData, error: clinicError } = await supabase
      .from('clinics')
      .insert({
        name: clinic.name,
        city: clinic.city,
        address: clinic.address,
        phone: clinic.phone,
        email: clinic.email,
        created_by: userId,
      })
      .select()
      .single();

    if (clinicError) throw clinicError;

    // 4. Associar o usuário à clínica como administrador
    const { error: staffError } = await supabase
      .from('clinic_staff')
      .insert({
        user_id: userId,
        clinic_id: clinicData.id,
        is_admin: true,
        role: 'doctor',
      });

    if (staffError) throw staffError;

    console.log('Clínica e administrador registrados com sucesso');
  } catch (error) {
    console.error('Erro ao registrar clínica:', error);
    throw error;
  }
};
