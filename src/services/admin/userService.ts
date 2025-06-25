
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { AdminUser, UserFilters } from './types';

export const getAllUsers = async (filters?: UserFilters): Promise<AdminUser[]> => {
  try {
    console.log('=== BUSCANDO TODOS OS USUÁRIOS ===');
    console.log('Filtros aplicados:', filters);
    
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (filters) {
      if (filters.role && filters.role !== '') {
        console.log('Aplicando filtro de role:', filters.role);
        query = query.eq('role', filters.role);
      }
      
      if (filters.createdAfter) {
        console.log('Aplicando filtro de data inicial:', filters.createdAfter);
        query = query.gte('created_at', filters.createdAfter);
      }
      
      if (filters.createdBefore) {
        console.log('Aplicando filtro de data final:', filters.createdBefore);
        query = query.lte('created_at', filters.createdBefore);
      }
      
      if (filters.name && filters.name.trim() !== '') {
        console.log('Aplicando filtro de nome:', filters.name);
        const searchTerm = `%${filters.name.trim()}%`;
        query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro na query de usuários:', error);
      throw error;
    }
    
    console.log('Usuários encontrados:', data?.length || 0);
    
    if (!data || data.length === 0) {
      console.log('Nenhum usuário encontrado');
      return [];
    }
    
    const users = data.map((user: any) => ({
      id: user.id,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email || '',
      phone: user.phone || null,
      crm: user.crm || '',
      title: user.title || '',
      bio: user.bio || '',
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    })) as AdminUser[];
    
    console.log('Usuários mapeados:', users.length);
    return users;
    
  } catch (error) {
    console.error('Erro ao buscar todos os usuários:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    console.log('Iniciando exclusão completa do usuário:', userId);
    
    // 1. Deletar relações com clínicas (staff)
    const { error: staffError } = await supabase
      .from('clinic_staff')
      .delete()
      .eq('user_id', userId);
    
    if (staffError) {
      console.error('Erro ao deletar relações de staff:', staffError);
      throw staffError;
    }
    
    // 2. Atualizar registros criados pelo usuário para não quebrar foreign keys
    // Aqui você pode decidir se quer transferir ownership ou apenas marcar como null
    const { error: clinicsError } = await supabase
      .from('clinics')
      .update({ created_by: null })
      .eq('created_by', userId);
    
    if (clinicsError) {
      console.error('Erro ao atualizar clínicas criadas pelo usuário:', clinicsError);
      // Não fazer throw aqui, pois pode não ter criado clínicas
    }
    
    // 3. Deletar o perfil do usuário
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('Erro ao deletar perfil do usuário:', profileError);
      throw profileError;
    }
    
    console.log('Usuário deletado completamente com sucesso');
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    throw error;
  }
};
