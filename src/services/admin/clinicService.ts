
import { supabase } from '@/integrations/supabase/client';
import { AdminClinic, ClinicFilters, AdminData, ClinicData } from './types';

export const getAllClinics = async (filters?: ClinicFilters): Promise<AdminClinic[]> => {
  try {
    let query = supabase
      .from('clinics')
      .select('*');
    
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

export const registerClinic = async ({
  admin,
  clinic,
}: {
  admin: AdminData;
  clinic: ClinicData;
}): Promise<void> => {
  try {
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', admin.email)
      .maybeSingle();
    
    let userId: string;
    
    if (existingUser) {
      console.log('Usuário já existe, usando ID existente:', existingUser.id);
      userId = existingUser.id;
    } else {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: admin.email,
        password: admin.password,
        options: {
          data: {
            first_name: admin.firstName,
            last_name: admin.lastName,
            crm: admin.crm || '',
          },
        },
      });

      if (authError) {
        if (authError.status === 429) {
          throw new Error('Limite de cadastros excedido. Por favor, aguarde alguns segundos antes de tentar novamente.');
        }
        throw authError;
      }
      
      if (!authData.user) throw new Error('Falha ao criar usuário');
      userId = authData.user.id;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: admin.firstName,
        last_name: admin.lastName,
        crm: admin.crm || '',
        phone: admin.phone,
        role: admin.role
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    const { data: clinicData, error: clinicError } = await supabase
      .rpc('create_clinic', { 
        p_name: clinic.name,
        p_city: clinic.city,
        p_address: clinic.address,
        p_phone: clinic.phone,
        p_email: clinic.email,
        p_created_by: userId,
        p_trading_name: clinic.tradingName,
        p_cnpj: clinic.cnpj
      });

    if (clinicError) {
      console.error('Erro ao criar clínica:', clinicError);
      throw clinicError;
    }

    if (!clinicData) {
      throw new Error('A clínica não foi criada. Verifique se a função RPC está configurada corretamente.');
    }

    let clinicId: string;
    
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

export const deleteClinic = async (clinicId: string): Promise<void> => {
  try {
    console.log('Iniciando exclusão completa da clínica:', clinicId);
    
    // 1. Primeiro deletar todas as solicitações de angioplastia da clínica
    const { error: angioplastyError } = await supabase
      .from('angioplasty_requests')
      .delete()
      .eq('clinic_id', clinicId);
    
    if (angioplastyError) {
      console.error('Erro ao deletar solicitações de angioplastia:', angioplastyError);
      throw angioplastyError;
    }
    
    // 2. Depois deletar todos os pacientes da clínica
    const { error: patientsError } = await supabase
      .from('patients')
      .delete()
      .eq('clinic_id', clinicId);
    
    if (patientsError) {
      console.error('Erro ao deletar pacientes da clínica:', patientsError);
      throw patientsError;
    }
    
    // 3. Deletar todos os staff da clínica
    const { error: staffError } = await supabase
      .from('clinic_staff')
      .delete()
      .eq('clinic_id', clinicId);
    
    if (staffError) {
      console.error('Erro ao deletar staff da clínica:', staffError);
      throw staffError;
    }
    
    // 4. Deletar convênios da clínica
    const { error: insuranceError } = await supabase
      .from('insurance_companies')
      .delete()
      .eq('clinic_id', clinicId);
    
    if (insuranceError) {
      console.error('Erro ao deletar convênios da clínica:', insuranceError);
      throw insuranceError;
    }
    
    // 5. Por último, deletar a clínica
    const { error: clinicError } = await supabase
      .from('clinics')
      .delete()
      .eq('id', clinicId);
    
    if (clinicError) {
      console.error('Erro ao deletar clínica:', clinicError);
      throw clinicError;
    }
    
    console.log('Clínica deletada completamente com sucesso');
  } catch (error) {
    console.error('Erro ao excluir clínica:', error);
    throw error;
  }
};
