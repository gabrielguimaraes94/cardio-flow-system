
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/profile';

interface ClinicAdmin {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string | null;
  crm: string;
  role: 'clinic_admin';
}

interface Clinic {
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
}

interface RegistrationData {
  admin: ClinicAdmin;
  clinic: Clinic;
}

// Verificar se um usuário é administrador global do sistema
export const isGlobalAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data.role === 'admin';
  } catch (error) {
    console.error('Erro ao verificar permissões de administrador:', error);
    return false;
  }
};

// Registrar uma nova clínica e seu administrador
export const registerClinic = async (data: RegistrationData): Promise<void> => {
  try {
    // 1. Criar o usuário no sistema de autenticação do Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.admin.email,
      password: data.admin.password
    });
    
    if (authError) {
      throw new Error(`Erro ao criar usuário: ${authError.message}`);
    }
    
    if (!authData.user) {
      throw new Error('Erro ao criar usuário: dados de usuário não retornados');
    }
    
    const userId = authData.user.id;
    
    // 2. Atualizar o perfil do usuário
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: data.admin.firstName,
        last_name: data.admin.lastName,
        email: data.admin.email,
        phone: data.admin.phone,
        crm: data.admin.crm,
        role: data.admin.role
      })
      .eq('id', userId);
    
    if (profileError) {
      // Se houver erro, tentar remover o usuário criado
      await supabase.auth.admin.deleteUser(userId);
      throw new Error(`Erro ao atualizar perfil do usuário: ${profileError.message}`);
    }
    
    // 3. Criar a clínica
    const { data: clinicData, error: clinicError } = await supabase
      .from('clinics')
      .insert({
        name: data.clinic.name,
        city: data.clinic.city,
        address: data.clinic.address,
        phone: data.clinic.phone,
        email: data.clinic.email,
        created_by: userId,
        active: true
      })
      .select('id')
      .single();
    
    if (clinicError) {
      // Se houver erro, tentar remover o usuário criado
      await supabase.auth.admin.deleteUser(userId);
      throw new Error(`Erro ao criar clínica: ${clinicError.message}`);
    }
    
    // 4. Associar o usuário à clínica como administrador
    const { error: staffError } = await supabase
      .from('clinic_staff')
      .insert({
        clinic_id: clinicData.id,
        user_id: userId,
        role: 'clinic_admin',
        is_admin: true,
        active: true
      });
    
    if (staffError) {
      // Se houver erro, tentar remover a clínica e o usuário criados
      await supabase.from('clinics').delete().eq('id', clinicData.id);
      await supabase.auth.admin.deleteUser(userId);
      throw new Error(`Erro ao associar usuário à clínica: ${staffError.message}`);
    }
  } catch (error: any) {
    console.error('Erro no registro de clínica:', error);
    throw error;
  }
};
